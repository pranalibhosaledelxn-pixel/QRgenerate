import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import Store from "@/models/Store";
import QRCode from "qrcode";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, description, address } = await req.json();

        if (!name || !address) {
            return NextResponse.json({ message: "Name and Address are required" }, { status: 400 });
        }

        await connectDB();

        // Find user
        const userData = await User.findOne({ email: session.user.email });
        if (!userData) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Generate QR Code content
        // For now, let's just encode the store details or a hypothetical deep link
        // In a real app, this would be a URL to the store's page
        const qrContent = JSON.stringify({
            name,
            address,
            description,
            owner: session.user.name
        });

        const qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
            width: 400,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#ffffff",
            },
        });

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(qrCodeDataUrl, {
            folder: "store-qrcodes",
        });

        // Create Store
        const newStore = await Store.create({
            name,
            description,
            address,
            ownerId: userData._id,
            qrCode: uploadResponse.secure_url
        });

        return NextResponse.json({
            message: "Store created successfully",
            store: newStore
        }, { status: 201 });

    } catch (error) {
        console.error("Store creation error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: (error as Error).message }, { status: 500 });
    }
}
