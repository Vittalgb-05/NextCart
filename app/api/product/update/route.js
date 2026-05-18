import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Not authorized" });
        }

        const body = await request.json();
        const { productId, name, description, category, price, offerPrice, stock } = body;

        if (!productId) {
            return NextResponse.json({ success: false, message: "Product ID is required" });
        }

        await connectDB();

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) updateData.price = Number(price);
        if (offerPrice !== undefined) updateData.offerPrice = Number(offerPrice);
        if (stock !== undefined) updateData.stock = Number(stock);

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return NextResponse.json({ success: false, message: "Product not found" });
        }

        return NextResponse.json({ success: true, message: "Product updated successfully", product: updatedProduct });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
