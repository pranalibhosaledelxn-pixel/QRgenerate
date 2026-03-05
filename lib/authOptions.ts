import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("----------------------------------------------------------------");
                console.log("[DEBUG] Authorize called for email:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log("[DEBUG] Missing credentials inputs");
                    throw new Error("Invalid credentials");
                }

                await connectDB();
                console.log("[DEBUG] Database connected successfully");

                // 1. Find user by email
                const user = await User.findOne({ email: credentials.email }).select("+password");
                console.log("[DEBUG] User found in DB:", user ? "YES" : "NO");

                if (!user) {
                    console.log("[DEBUG] User does not exist, throwing Invalid credentials");
                    throw new Error("Invalid credentials");
                }

                if (!user.password) {
                    console.log("[DEBUG] User exists but has NO password (likely a Google-only account)");
                    throw new Error("Invalid credentials");
                }

                // 2. Compare password
                const isMatch = await bcrypt.compare(credentials.password, user.password);
                console.log("[DEBUG] Password match result:", isMatch);

                if (!isMatch) {
                    console.log("[DEBUG] Password provided does not match hash");
                    throw new Error("Invalid credentials");
                }

                // 3. Return user object
                console.log("[DEBUG] Credentials validated successfully. Returning user.");
                console.log("----------------------------------------------------------------");
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                console.log("[DEBUG] Google Sign-In attempt for:", user.email);
                try {
                    await connectDB();
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        console.log("[DEBUG] Creating new Google user");
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            googleId: account.providerAccountId,
                        });
                    } else {
                        console.log("[DEBUG] Google user already exists");
                    }
                    return true;
                } catch (error) {
                    console.error("[DEBUG] Error saving Google user to DB:", error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            console.log("[DEBUG] Session callback called. Token ID:", token?.id);
            if (token && session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).isPremium = token.isPremium as boolean;
                (session.user as any).plan = token.plan as string;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
            }

            // Always fetch fresh user data to ensure premium status is current
            if (token.email) {
                await connectDB();
                const dbUser = await User.findOne({ email: token.email });
                if (dbUser) {
                    token.isPremium = dbUser.isPremium;
                    token.plan = dbUser.plan;
                }
            }

            return token;
        }
    },
};
