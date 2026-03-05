import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/db";
import User from "@/models/User";
import QrCode from "@/models/QrCode";

import { getQrLimit } from "@/lib/planLimits";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ message: "URL is required" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Plan-based Limit Check
        const qrLimit = getQrLimit(user.plan || "Free");
        const qrCount = await QrCode.countDocuments({ userId: user._id });
        if (qrCount >= qrLimit) {
            return NextResponse.json({
                message: `Plan limit reached. Your ${user.plan || "Free"} plan allows ${qrLimit} QR codes.`,
                limitReached: true
            }, { status: 403 });
        }

        const userPlan = (user.plan || "Free").toLowerCase();

        // 1. If Free or Starter, generate SVG with repeated diagonal 'QrEats' watermark
        if (userPlan === "free" || userPlan === "starter") {
            const svgString = await QRCode.toString(url, {
                type: "svg",
                margin: 2,
                errorCorrectionLevel: "H",
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            });

            // Parse viewBox to find dimensions
            const viewBoxMatch = svgString.match(/viewBox="0 0 (\d+) (\d+)"/);
            const size = viewBoxMatch ? parseInt(viewBoxMatch[1]) : 33;

            // Define a repeated diagonal watermark pattern
            const watermarkPattern = `
                <defs>
                    <pattern id="qreats-pattern" x="0" y="0" width="${size / 3}" height="${size / 3}" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                        <text x="0" y="${size / 6}" fill="rgba(0,0,0,0.12)" font-family="Arial, sans-serif" font-weight="bold" font-size="${size / 15}">QrEats</text>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#qreats-pattern)" />
            `;
            const modifiedSvg = svgString.replace("</svg>", `${watermarkPattern}</svg>`);

            // Add dimensions for frontend consistency
            const finalSvg = modifiedSvg.replace('<svg ', '<svg width="400" height="400" ');
            const base64 = Buffer.from(finalSvg).toString("base64");
            const dataUrl = `data:image/svg+xml;base64,${base64}`;

            return NextResponse.json({
                message: "QR Code Generated",
                qrCode: dataUrl,
            });
        }

        // 2. Pro plan: Standard clean SVG (better compatibility on Windows)
        // Switch from PNG to SVG to avoid native canvas library failures
        const svgString = await QRCode.toString(url, {
            type: "svg",
            margin: 2,
            color: {
                dark: "#000000",
                light: "#ffffff",
            },
        });

        const finalSvg = svgString.replace('<svg ', '<svg width="400" height="400" ');
        const base64 = Buffer.from(finalSvg).toString("base64");
        const dataUrl = `data:image/svg+xml;base64,${base64}`;

        return NextResponse.json({
            message: "QR Code Generated",
            qrCode: dataUrl,
        });

    } catch (error) {
        console.error("Generation error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: (error as Error).message }, { status: 500 });
    }
}
