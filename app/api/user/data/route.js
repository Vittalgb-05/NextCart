import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET(request) {
    
    try {
        
        const { userId } = getAuth(request)

        await connectDB()
        let user = await User.findById(userId)

        if (!user) {
            const clerkUser = await currentUser()
            if (clerkUser) {
                user = await User.create({
                    _id: clerkUser.id,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    name: (clerkUser.firstName || '') + ' ' + (clerkUser.lastName || ''),
                    imageUrl: clerkUser.imageUrl,
                    cartItems: {}
                })
            } else {
                return NextResponse.json({ success: false, message: "User Not Found" })
            }
        }

        return NextResponse.json({success:true, user})

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }

}