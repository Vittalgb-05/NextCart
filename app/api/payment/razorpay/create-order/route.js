// POST /api/payment/razorpay/create-order
// Creates a Razorpay order and returns the order_id for the frontend to open the payment modal
import Razorpay from 'razorpay';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Product from '@/models/Product';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: 'Unauthorized' });

        const { items } = await request.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Cart is empty' });
        }

        await connectDB();

        // Calculate amount server-side (never trust client-side totals)
        let subtotal = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) return NextResponse.json({ success: false, message: `Product not found: ${item.product}` });
            if ((product.stock ?? 0) < item.quantity) {
                return NextResponse.json({ success: false, message: `Insufficient stock for: ${product.name}` });
            }
            subtotal += product.offerPrice * item.quantity;
        }

        const tax = Math.floor(subtotal * 0.02);
        const totalInPaise = Math.round((subtotal + tax) * 100); // Razorpay works in smallest currency unit

        const razorpayOrder = await razorpay.orders.create({
            amount: totalInPaise,
            currency: 'INR',
            receipt: `receipt_${userId}_${Date.now()}`,
        });

        return NextResponse.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: totalInPaise,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
