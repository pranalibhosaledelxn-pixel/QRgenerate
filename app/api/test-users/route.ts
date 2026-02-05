import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        await connectDB();
        const users = await User.find({}).select("+password"); // Select field to see if password exists (hashed)

        return NextResponse.json({
            count: users.length,
            database: process.env.MONGO_URI?.split("/").pop() || "unknown", // Show which DB we are using
            users: users.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                hasPassword: !!u.password, // Don't send hash, just boolean
                googleId: u.googleId,
                createdAt: u.createdAt
            }))
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
