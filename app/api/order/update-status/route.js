// PUT /api/order/update-status
// Admin-only: update order status + send email notification
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Order from "@/models/Order";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendStatusUpdateEmail } from "@/lib/mailer";

const VALID_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);
        if (!isSeller) return NextResponse.json({ success: false, message: 'Not authorized' });

        const { orderId, status, note } = await request.json();
        if (!orderId || !status) return NextResponse.json({ success: false, message: 'orderId and status required' });
        if (!VALID_STATUSES.includes(status)) return NextResponse.json({ success: false, message: 'Invalid status' });

        await connectDB();
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: { status },
                $push: { statusHistory: { status, note: note || '', updatedAt: new Date() } }
            },
            { new: true }
        );
        if (!order) return NextResponse.json({ success: false, message: 'Order not found' });

        // Send status update email
        try {
            const user = await User.findById(order.userId);
            if (user) {
                await sendStatusUpdateEmail({
                    to: user.email,
                    name: user.name,
                    orderId: order._id.toString(),
                    status,
                });
            }
        } catch (emailErr) {
            console.warn('Status email failed (non-fatal):', emailErr.message);
        }

        return NextResponse.json({ success: true, message: `Order status updated to "${status}"`, order });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
