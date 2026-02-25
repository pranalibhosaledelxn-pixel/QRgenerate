import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
    console.log(">>> VERIFICATION REQUEST RECEIVED <<<");
    try {
        const bodyData = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planName,
        } = bodyData;

        console.log("Verification Params:", bodyData);

        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            console.error("Unauthorized: No session or email");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        console.log("Signature Check:", {
            expected: expectedSignature,
            received: razorpay_signature,
            match: isAuthentic
        });

        if (isAuthentic) {
            await connectDB();

            // Update user in DB - Using email is safer than ID because Google users have numeric string IDs
            // This avoids the 'CastError' for invalid MongoDB ObjectIds
            const updatedUser = await User.findOneAndUpdate(
                { email: session.user.email },
                {
                    isPremium: true,
                    plan: planName || "Pro",
                    paymentId: razorpay_payment_id,
                },
                { new: true }
            );

            if (updatedUser) {
                console.log("User updated successfully:", updatedUser._id);
            } else {
                console.error("User not found by email during update:", session.user.email);
            }

            return NextResponse.json({
                message: "Payment verified successfully",
                success: true,
            });
        } else {
            console.error("Signature verification failed");
            return NextResponse.json(
                { message: "Invalid signature", success: false },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Razorpay Verification Error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
