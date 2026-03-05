import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Storage } from "@google-cloud/storage";
import connectDB from "@/lib/db";
import QrCode from "@/models/QrCode";
import { v4 as uuidv4 } from "uuid";

// Configure Storage with credentials from Environment or File
// We assume the user will provide GOOGLE_APPLICATION_CREDENTIALS json content
const storage = new Storage({
    credentials: JSON.parse(process.env.GCS_CREDENTIALS || "{}"),
    projectId: process.env.GCS_PROJECT_ID,
});

const bucketName = process.env.GCS_BUCKET_NAME || "qr-code-images";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { url, imageData } = await req.json();

        if (!url || !imageData) {
            return NextResponse.json({ message: "Missing data" }, { status: 400 });
        }

        // Connect to DB to get User ID
        await connectDB();
        // Re-fetch user to get _id since session might not have it depending on callback
        // Or we can rely on our enriched session if we did that.
        // For safety, let's find user by email.
        const User = (await import("@/models/User")).default;
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Prepare GCS Upload
        const buffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const fileName = `qrcodes/${user._id}/${uuidv4()}.png`;
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        await file.save(buffer, {
            metadata: {
                contentType: "image/png",
            },
            public: true, // Make it public so we can view it. User might want private signed URLs instead.
        });

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

        // Save to Database
        const newQr = await QrCode.create({
            userId: user._id,
            originalUrl: url,
            gcsImageUrl: publicUrl,
            storagePath: fileName,
        });

        return NextResponse.json({
            message: "Saved successfully",
            qrCode: newQr
        }, { status: 201 });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: (error as Error).message }, { status: 500 });
    }
}
