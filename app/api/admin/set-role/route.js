import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// POST /api/admin/set-role
// Body: { targetUserId, role } where role is 'admin' | 'user'
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Not authorized" });
        }

        const { targetUserId, role } = await request.json();

        if (!targetUserId || !role) {
            return NextResponse.json({ success: false, message: "targetUserId and role are required" });
        }

        if (!['admin', 'user', 'seller'].includes(role)) {
            return NextResponse.json({ success: false, message: "Invalid role. Must be admin, seller, or user." });
        }

        await connectDB();

        const updatedUser = await User.findByIdAndUpdate(
            targetUserId,
            { $set: { role } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "User not found" });
        }

        return NextResponse.json({
            success: true,
            message: `User role updated to '${role}' successfully`,
            user: { _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
