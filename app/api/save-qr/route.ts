import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import QrCode from "@/models/QrCode";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";

import { getQrLimit } from "@/lib/planLimits";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        console.log("----------------------------------------------------------------");
        console.log("[DEBUG] Save QR API Called");

        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            console.log("[DEBUG] Unauthorized access attempt");
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { url, qrCodeDataUrl } = await req.json();

        if (!url || !qrCodeDataUrl) {
            console.log("[DEBUG] Missing URL or QR Data");
            return NextResponse.json({ message: "URL and QR Data are required" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            console.log("[DEBUG] User not found for email:", session.user.email);
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Plan-based Limit Check
        const qrLimit = getQrLimit(user.plan || "Free");
        const qrCount = await QrCode.countDocuments({ userId: user._id });
        console.log(`[DEBUG] Current QR Count: ${qrCount}, Plan: ${user.plan}, Limit: ${qrLimit}`);

        if (qrCount >= qrLimit) {
            console.log("[DEBUG] Plan Limit Reached");
            return NextResponse.json({
                message: `Plan limit reached. Your ${user.plan || "Free"} plan allows ${qrLimit} QR codes.`,
                limitReached: true
            }, { status: 403 });
        }

        // Upload to Cloudinary
        console.log("[DEBUG] Uploading to Cloudinary...");
        const uploadResponse = await cloudinary.uploader.upload(qrCodeDataUrl, {
            folder: "qrcodes",
        });
        console.log("[DEBUG] Cloudinary Upload Success. URL:", uploadResponse.secure_url);

        // Update User Profile with QR Code Image
        console.log("[DEBUG] Updating User Profile...");
        await User.findByIdAndUpdate(user._id, { qrImage: uploadResponse.secure_url });
        console.log("[DEBUG] User Profile Updated with QR Image");

        // Save to DB with Cloudinary URL
        console.log("[DEBUG] Creating History Record...");
        const newQr = await QrCode.create({
            userId: user._id,
            originalUrl: url,
            gcsImageUrl: uploadResponse.secure_url,
            storagePath: uploadResponse.public_id,
        });
        console.log("[DEBUG] History Record Created:", newQr._id);
        console.log("----------------------------------------------------------------");

        return NextResponse.json({
            message: "QR Code Saved to Cloudinary & User Profile Updated",
            qrCode: uploadResponse.secure_url,
            record: newQr,
            userUpdated: true
        });

    } catch (error) {
        console.error("[DEBUG] Save error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: (error as Error).message }, { status: 500 });
    }
}
