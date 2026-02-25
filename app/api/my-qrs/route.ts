import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import QrCode from "@/models/QrCode";
import User from "@/models/User";
import { getQrLimit } from "@/lib/planLimits";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const plan = user.plan || "Free";
        const qrLimit = getQrLimit(plan);

        // Fetch all QR codes for this user, sorted by newest first
        const qrCodes = await QrCode.find({ userId: user._id }).sort({ createdAt: -1 });

        return NextResponse.json({
            count: qrCodes.length,
            qrCodes: qrCodes,
            isPremium: user.isPremium,
            plan: plan,
            qrLimit: qrLimit
        });

    } catch (error) {
        console.error("Fetch QRs error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: (error as Error).message }, { status: 500 });
    }
}
