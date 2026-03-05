"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isLogin) {
                const res = await signIn("credentials", { email, password, redirect: false });
                if (res?.error) setError("Invalid email or password.");
                else { router.push("/"); router.refresh(); }
            } else {
                const res = await fetch("/api/auth/register", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: name || email.split("@")[0], email, password }),
                });
                const data = await res.json();
                if (res.ok) {
                    const loginRes = await signIn("credentials", { email, password, redirect: false });
                    if (loginRes?.error) { setError("Account created! Please sign in."); setIsLogin(true); }
                    else { router.push("/"); router.refresh(); }
                } else setError(data.message || "Registration failed.");
            }
        } catch (err: unknown) { setError(`Error: ${(err as Error).message}`); }
        finally { setLoading(false); }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden"
            style={{ background: "linear-gradient(145deg, #f0f4ff 0%, #f8f9fc 40%, #eef2ff 100%)" }}>
            {/* Soft ambient shapes */}
            <div className="glow-blob w-[500px] h-[500px] top-[-15%] left-[-10%]"
                style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
            <div className="glow-blob w-[400px] h-[400px] bottom-[-10%] right-[-5%]"
                style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)", animationDelay: "2s" }} />
            <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md animate-scale-in"
                style={{
                    background: "#ffffff",
                    border: "1px solid #e8ebf0",
                    borderRadius: "28px",
                    boxShadow: "0 20px 60px -16px rgba(99,102,241,0.12), 0 0 0 1px rgba(99,102,241,0.04)",
                }}>
                {/* Top accent */}
                <div className="h-1 w-full rounded-t-[28px]" style={{ background: "linear-gradient(90deg, #6366f1, #06b6d4)" }} />

                <div className="px-8 pt-8 pb-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", boxShadow: "0 6px 20px -4px rgba(99,102,241,0.4)" }}>
                            <QrCode className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-2xl font-bold mb-1" style={{ color: "#1a1d2b" }}>
                            {isLogin ? "Welcome back" : "Create account"}
                        </h1>
                        <p className="text-sm" style={{ color: "#5b6178" }}>
                            {isLogin ? "Sign in to access QR MakeIt" : "Get started with QR MakeIt for free"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2"
                            style={{ background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.15)", color: "#e11d48" }}>
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#e11d48" }} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ba3b8" }}>Full Name</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <User className="w-4 h-4" style={{ color: "#9ba3b8" }} />
                                    </div>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin}
                                        autoComplete="off" className="input-field pl-11" placeholder="John Doe" />
                                </div>
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ba3b8" }}>Email Address</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Mail className="w-4 h-4" style={{ color: "#9ba3b8" }} />
                                </div>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                    autoComplete="off" className="input-field pl-11" placeholder="you@example.com" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ba3b8" }}>Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Lock className="w-4 h-4" style={{ color: "#9ba3b8" }} />
                                </div>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                                    autoComplete="new-password" className="input-field pl-11" placeholder="••••••••••" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2"
                            style={{ padding: "14px 24px", borderRadius: "14px", fontSize: "15px" }}>
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> :
                                <>{isLogin ? "Sign In" : "Create Account"} <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6 flex items-center">
                        <div className="flex-1 h-px" style={{ background: "#e8ebf0" }} />
                        <span className="mx-4 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#9ba3b8" }}>or</span>
                        <div className="flex-1 h-px" style={{ background: "#e8ebf0" }} />
                    </div>

                    {/* Google */}
                    <button onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        style={{ background: "#f8f9fc", border: "1px solid #e8ebf0", color: "#1a1d2b" }}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="mt-6 text-center text-sm" style={{ color: "#9ba3b8" }}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button onClick={() => { setIsLogin(!isLogin); setError(""); }}
                            className="font-bold transition-colors hover:opacity-80" style={{ color: "#6366f1" }}>
                            {isLogin ? "Sign up free" : "Sign in"}
                        </button>
                    </p>
                </div>
            </div>

            {/* Bottom badge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full animate-fade-in"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid #e8ebf0", backdropFilter: "blur(12px)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                <span className="text-xs font-medium" style={{ color: "#5b6178" }}>Generate stunning QR codes in seconds</span>
            </div>
        </div>
    );
}
