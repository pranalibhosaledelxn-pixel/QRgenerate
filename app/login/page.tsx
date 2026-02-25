"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
                const res = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (res?.error) {
                    setError("Invalid email or password");
                } else {
                    router.push("/");
                    router.refresh();
                }
            } else {
                // Registration Logic
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name || email.split("@")[0], // Fallback name if missing
                        email,
                        password
                    }),
                });

                const data = await res.json();

                if (res.ok) {
                    // Auto login after success
                    const loginRes = await signIn("credentials", {
                        email,
                        password,
                        redirect: false,
                    });

                    if (loginRes?.error) {
                        setError("Registration successful! Please sign in.");
                        setIsLogin(true); // Switch to login view
                    } else {
                        router.push("/");
                        router.refresh();
                    }
                } else {
                    setError(data.message || "Registration failed");
                }
            }
        } catch (err: unknown) {
            setError(`An error occurred: ${(err as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

            <div className="w-full max-w-sm rounded-[2.5rem] bg-slate-900/40 p-8 border border-slate-800 backdrop-blur-2xl shadow-2xl transition-all relative z-10 text-center">
                <h1 className="mb-2 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="mb-8 text-sm font-medium text-slate-400">
                    {isLogin
                        ? "Sign in to access the QR Genius"
                        : "Sign up to start generating premium QR codes"}
                </p>

                {error && (
                    <div className="mb-4 p-3 text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mb-6 space-y-4 text-left" autoComplete="off">
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin}
                                autoComplete="off"
                                className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10"
                                placeholder="John Doe"
                            />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                            className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] hover:shadow-purple-500/25 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                    >
                        {loading
                            ? "Processing..."
                            : isLogin ? "Sign In" : "Sign Up"
                        }
                    </button>
                </form>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="bg-slate-900/40 px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm font-bold text-slate-300 shadow-sm hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </button>

                <p className="mt-8 text-center text-sm text-slate-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                        className="font-bold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
