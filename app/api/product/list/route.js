import connectDB from '@/config/db'
import Product from '@/models/Product'
import { NextResponse } from 'next/server'

export async function GET(request) {
    try {

        await connectDB()

        const products = await Product.find({})
        
        // Ensure all products have averageRating and reviewCount for the new system
        const sanitizedProducts = products.map(product => {
            const p = product.toObject();
            return {
                ...p,
                averageRating: p.averageRating || 0,
                reviewCount: p.reviewCount || 0
            }
        });

        return NextResponse.json({ success:true, products: sanitizedProducts })

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
}