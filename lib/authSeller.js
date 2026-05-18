import { NextResponse } from 'next/server';
import connectDB from "@/config/db";
import User from "@/models/User";

const authSeller = async (userId) => {
    try {
        await connectDB();
        const user = await User.findById(userId);

        if (user && (user.role === 'admin' || user.role === 'seller')) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

export default authSeller;