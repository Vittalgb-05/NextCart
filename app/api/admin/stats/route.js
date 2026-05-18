import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Not authorized" });
        }

        await connectDB();

        const [totalProducts, totalUsers, totalOrders, orders] = await Promise.all([
            Product.countDocuments({}),
            User.countDocuments({}),
            Order.countDocuments({}),
            Order.find({}).select('amount')
        ]);

        const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

        // Low stock products (stock <= 5)
        const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
            .select('name stock category')
            .limit(5);

        return NextResponse.json({
            success: true,
            stats: {
                totalProducts,
                totalUsers,
                totalOrders,
                totalRevenue: Math.floor(totalRevenue * 100) / 100,
                lowStockProducts
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
