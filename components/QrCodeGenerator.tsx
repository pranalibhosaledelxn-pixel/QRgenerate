"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";

export default function QrCodeGenerator() {
    const [url, setUrl] = useState<string>("");
    const [qrCodeData, setQrCodeData] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [limitReached, setLimitReached] = useState(false);
    const [qrCount, setQrCount] = useState<number>(0);
    const [checkingLimit, setCheckingLimit] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [qrLimit, setQrLimit] = useState(3);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch("/api/my-qrs");
                const data = await res.json();
                if (res.ok) {
                    setQrCount(data.count || 0);
                    setIsPremium(data.isPremium);
                    setQrLimit(data.qrLimit ?? 3);
                    // Only enforce limit if count exceeds plan limit
                    if (data.count >= (data.qrLimit ?? 3)) {
                        setLimitReached(true);
                    }
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            } finally {
                setCheckingLimit(false);
            }
        };
        fetchUserData();
    }, []);

    const generateQRCode = async (text: string) => {
        try {
            if (!text) {
                setQrCodeData("");
                return;
            }

            setLimitReached(false);
            setError("");

            // 1. Call Backend API to Generate (returns base64)
            const genRes = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: text }),
            });
            const genData = await genRes.json();

            if (!genRes.ok) {
                setError(genData.message || "Failed to generate QR code");
                return;
            }

            const qrImage = genData.qrCode;
            setQrCodeData(qrImage);
            setError("");

            // 2. Call Save API (uploads to Cloudinary & saves to DB)
            const saveRes = await fetch("/api/save-qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: text, qrCodeDataUrl: qrImage }),
            });

            const saveData = await saveRes.json();

            if (saveRes.status === 403 && saveData.limitReached) {
                setQrCodeData("");
                setLimitReached(true);
                return;
            }

            if (!saveRes.ok) {
                console.error("Failed to save QR:", saveData.message);
            } else {
                console.log("QR Saved:", saveData);
                setQrCount(prev => prev + 1);

                // Proactively check limit based on plan
                if (qrCount + 1 >= qrLimit) {
                    setLimitReached(true);
                }
            }

        } catch (err) {
            console.error(err);
            setError("Failed to generate QR code");
        }
    };

    const handleDownload = () => {
        if (!qrCodeData) return;
        const link = document.createElement("a");
        const isSvg = qrCodeData.startsWith("data:image/svg+xml");
        link.download = isSvg ? "qrcode.svg" : "qrcode.png";
        link.href = qrCodeData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

            <div className="w-full max-w-md rounded-[2.5rem] bg-slate-900/40 p-8 border border-slate-800 backdrop-blur-2xl shadow-2xl transition-all relative z-10">
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        QR Generator
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Create stunning QR codes instantly.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <input
                                id="url-input"
                                type="text"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-5 py-4 text-white placeholder-slate-500 outline-none transition-all focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10"
                            />
                        </div>
                        <button
                            onClick={() => generateQRCode(url)}
                            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02] hover:shadow-purple-500/25 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                            disabled={!url || (limitReached && !!url) || checkingLimit}
                        >
                            {limitReached && url ? "Upgrade Plan" : checkingLimit ? "Checking..." : "Generate QR Code"}
                        </button>
                    </div>

                    <div className="flex min-h-[300px] w-full items-center justify-center rounded-3xl border-2 border-dashed border-slate-800 bg-slate-950/30 p-6 transition-all relative overflow-hidden group">
                        {limitReached && url ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-8 text-center backdrop-blur-md z-20 animate-in fade-in duration-500">
                                <div className="mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 p-4 text-white shadow-lg shadow-amber-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-7 w-7">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">Limit Reached</h3>
                                <p className="mt-2 mb-8 text-slate-400 text-sm leading-relaxed">
                                    You've used all {qrLimit > 1000 ? "Unlimited" : qrLimit} QR codes in your plan. Upgrade to generate more.
                                </p>
                                <button
                                    onClick={() => router.push("/subscription")}
                                    className="w-full rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-950 shadow-xl transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Upgrade Plan
                                </button>
                            </div>
                        ) : null}

                        {qrCodeData && !limitReached ? (
                            <div className="relative cursor-pointer overflow-hidden rounded-2xl bg-white p-4 shadow-2xl transition-all hover:scale-[1.02]">
                                <img
                                    src={qrCodeData}
                                    alt="Generated QR Code"
                                    className="h-60 w-60 object-contain"
                                    onClick={handleDownload}
                                />
                            </div>
                        ) : (
                            !limitReached && (
                                <div className="flex flex-col items-center text-center text-slate-600">
                                    <div className="mb-4 rounded-2xl bg-slate-900/50 p-4">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-10 w-10"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-400">Ready to Generate</p>
                                    <p className="text-xs text-slate-500 mt-1">Enter a URL to see the magic</p>
                                </div>
                            )
                        )}
                    </div>

                    {qrCodeData && (
                        <button
                            onClick={handleDownload}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-950 shadow-xl transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 9.75l-4.5 4.5m0 0l4.5 4.5m-4.5-4.5h15"
                                />
                            </svg>
                            Download High-Res QR
                        </button>
                    )}

                    {error && (
                        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-center">
                            <p className="text-sm font-bold text-red-500">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
