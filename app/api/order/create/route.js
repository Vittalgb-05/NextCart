import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import Address from "@/models/Address";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { address: addressId, items } = await request.json();

        if (!addressId || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid data' });
        }

        await connectDB();

        // Build item snapshots + validate stock
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) return NextResponse.json({ success: false, message: `Product not found` });
            if ((product.stock ?? 0) < item.quantity) {
                return NextResponse.json({ success: false, message: `Insufficient stock for: ${product.name}` });
            }
            subtotal += product.offerPrice * item.quantity;
            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.image[0],
                price: product.offerPrice,
                quantity: item.quantity,
            });
        }

        const tax = Math.floor(subtotal * 0.02);
        const totalAmount = subtotal + tax;

        const newOrder = await Order.create({
            userId,
            items: orderItems,
            amount: totalAmount,
            address: addressId,
            paymentMethod: 'COD',
            paymentStatus: 'pending',
            status: 'pending',
            statusHistory: [{ status: 'pending', note: 'Order placed via COD' }],
            date: Date.now(),
        });

        // Deduct stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }

        // Clear cart
        let user = await User.findById(userId);
        if (!user) {
            const clerkUser = await currentUser();
            if (clerkUser) {
                user = await User.create({
                    _id: clerkUser.id,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`,
                    imageUrl: clerkUser.imageUrl,
                    cartItems: {}
                });
            }
        }
        if (user) { user.cartItems = {}; await user.save(); }

        // Send email
        try {
            const address = await Address.findById(addressId);
            if (user && address) {
                await sendOrderConfirmationEmail({
                    to: user.email,
                    name: user.name,
                    orderId: newOrder._id.toString(),
                    items: orderItems,
                    amount: totalAmount,
                    address,
                });
            }
        } catch (emailErr) {
            console.warn('Email send failed (non-fatal):', emailErr.message);
        }

        return NextResponse.json({ success: true, message: 'Order Placed', orderId: newOrder._id });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}