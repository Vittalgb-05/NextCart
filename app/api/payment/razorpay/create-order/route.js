// POST /api/payment/razorpay/create-order
// Creates a Razorpay order and returns the order_id for the frontend to open the payment modal
import Razorpay from 'razorpay';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Product from '@/models/Product';

export async function POST(request) {
    try {
        console.log("--- START CREATE ORDER ---");
        
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Razorpay keys are missing from environment variables.");
            return NextResponse.json(
                { success: false, message: 'Razorpay keys are missing. Please configure them in .env.local and restart the server.' },
                { status: 400 }
            );
        }

        console.log("Initializing Razorpay with Key ID:", process.env.RAZORPAY_KEY_ID.substring(0, 8) + "...");
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        console.log("Checking authentication...");
        const { userId } = getAuth(request);
        if (!userId) {
            console.log("Auth failed: No userId");
            return NextResponse.json({ success: false, message: 'Unauthorized: Please login again' }, { status: 401 });
        }

        console.log("Parsing request body...");
        const { items } = await request.json();
        if (!items || items.length === 0) {
            console.log("Order failed: Empty items");
            return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 });
        }

        console.log("Connecting to Database...");
        await connectDB();

        console.log("Calculating subtotal...");
        let subtotal = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                console.log("Product not found:", item.product);
                return NextResponse.json({ success: false, message: `Product not found: ${item.product}` }, { status: 404 });
            }
            if ((product.stock ?? 0) < item.quantity) {
                console.log("Insufficient stock for:", product.name);
                return NextResponse.json({ success: false, message: `Insufficient stock for: ${product.name}` }, { status: 400 });
            }
            subtotal += product.offerPrice * item.quantity;
        }

        const tax = Math.floor(subtotal * 0.02);
        const totalInPaise = Math.round((subtotal + tax) * 100);

        try {
            const shortUserId = userId.slice(-10); // Clerk IDs are long, take only the last 10 chars
            const receiptId = `rcpt_${shortUserId}_${Date.now()}`;
            
            console.log("Calling Razorpay orders.create for amount:", totalInPaise, "Receipt:", receiptId);

            const razorpayOrder = await razorpay.orders.create({
                amount: totalInPaise,
                currency: 'INR',
                receipt: receiptId,
            });
            console.log("Razorpay order created:", razorpayOrder.id);

            return NextResponse.json({
                success: true,
                razorpayOrderId: razorpayOrder.id,
                amount: totalInPaise,
                currency: 'INR',
                keyId: process.env.RAZORPAY_KEY_ID,
            });
        } catch (rzpErr) {
            console.error("FULL RAZORPAY ERROR:", JSON.stringify(rzpErr, null, 2));
            const errorMessage = rzpErr.error?.description || rzpErr.description || rzpErr.message || "Unknown Razorpay Error";
            return NextResponse.json({ success: false, message: "Razorpay API Error: " + errorMessage }, { status: 500 });
        }

    } catch (error) {
        console.error("General API Error:", error);
        return NextResponse.json({ success: false, message: "General Error: " + error.message }, { status: 500 });
    }
}
