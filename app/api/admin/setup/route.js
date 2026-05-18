import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

// One-time setup route to promote a user to admin using a secret key.
// Usage: POST /api/admin/setup
// Body: { "secret": "YOUR_ADMIN_SETUP_SECRET", "email": "your@email.com" }
export async function POST(request) {
    try {
        const { secret, email } = await request.json();

        const configuredSecret = process.env.ADMIN_SETUP_SECRET;

        if (!configuredSecret) {
            return NextResponse.json({ success: false, message: "ADMIN_SETUP_SECRET is not configured in .env" });
        }

        if (secret !== configuredSecret) {
            return NextResponse.json({ success: false, message: "Invalid secret key" });
        }

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" });
        }

        await connectDB();

        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            { $set: { role: 'admin' } },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({
                success: false,
                message: `No user found with email: ${email}. Make sure you have logged in to the app at least once.`
            });
        }

        return NextResponse.json({
            success: true,
            message: `✅ ${user.name} (${user.email}) has been promoted to admin! Refresh the app to see the Admin Dashboard button.`,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
