import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        await connectDB();
        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ success: false, message: "User not found" });

        return NextResponse.json({ success: true, wishlist: user.wishlist || [] });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const { productId } = await request.json();
        if (!productId) return NextResponse.json({ success: false, message: "Product ID is required" });

        await connectDB();
        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ success: false, message: "User not found" });

        if (!user.wishlist) {
            user.wishlist = [];
        }

        const index = user.wishlist.indexOf(productId);
        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(productId);
        }

        user.markModified('wishlist');
        await user.save();

        return NextResponse.json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}