import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";



export async function POST(request) {
    try {

        const { userId } = getAuth(request)
        const { address, items } = await request.json();

        if (!address || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid data' });
        }

        // calculate amount using items
        const amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return await acc + product.offerPrice * item.quantity;
        }, 0)

        // Save order directly to MongoDB for instant local development and absolute reliability
        await Order.create({
            userId,
            items,
            amount: amount + Math.floor(amount * 0.02),
            address,
            date: Date.now()
        })

        // Also send to Inngest for event trigger compatibility
        try {
            await inngest.send({
                name: 'order/created',
                data: {
                    userId,
                    address,
                    items,
                    amount: amount + Math.floor(amount * 0.02),
                    date: Date.now()
                }
            })
        } catch (inngestErr) {
            console.log("Inngest send skipped or not running:", inngestErr.message)
        }

        // clear user cart
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
        user.cartItems = {}
        await user.save()

        return NextResponse.json({ success: true, message: 'Order Placed' })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, message: error.message })
    }
}