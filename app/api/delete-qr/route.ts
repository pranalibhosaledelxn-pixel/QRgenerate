import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import QrCode from "@/models/QrCode";
import User from "@/models/User";

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: "QR Code ID is required" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Only delete if the QR belongs to this user
        const qrCode = await QrCode.findOne({ _id: id, userId: user._id });
        if (!qrCode) {
            return NextResponse.json({ message: "QR Code not found" }, { status: 404 });
        }

        await QrCode.deleteOne({ _id: id, userId: user._id });

        return NextResponse.json({ message: "QR Code deleted successfully" });

    } catch (error) {
        console.error("Delete QR error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: (error as Error).message }, { status: 500 });
    }
}
