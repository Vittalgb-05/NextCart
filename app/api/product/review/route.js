import connectDB from "@/config/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");

        if (!productId) return NextResponse.json({ success: false, message: "Product ID required" });

        await connectDB();
        const reviews = await Review.find({ productId }).sort({ date: -1 });

        return NextResponse.json({ success: true, reviews });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" });

        const clerkUser = await currentUser();
        const { productId, rating, comment } = await request.json();

        if (!productId || !rating || !comment) {
            return NextResponse.json({ success: false, message: "All fields are required" });
        }

        await connectDB();

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ userId, productId });
        if (existingReview) {
            return NextResponse.json({ success: false, message: "You have already reviewed this product" });
        }

        const userName = (clerkUser.firstName || '') + (clerkUser.lastName ? ' ' + clerkUser.lastName : '');

        const newReview = await Review.create({
            userId,
            productId,
            userName: userName || 'Anonymous',
            userImage: clerkUser.imageUrl,
            rating: Number(rating),
            comment
        });

        // Update Product average rating and count
        const reviews = await Review.find({ productId });
        const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
        const avgRating = totalRating / reviews.length;
        
        await Product.findByIdAndUpdate(productId, {
            averageRating: Math.round(avgRating * 10) / 10,
            reviewCount: reviews.length
        });

        return NextResponse.json({ success: true, message: "Review added successfully", review: newReview });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}