"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, Plus, QrCode, ArrowRight, Download } from "lucide-react";

interface QrRecord {
    _id: string;
    originalUrl: string;
    gcsImageUrl: string;
    createdAt: string;
}

export default function MyQrPage() {
    const { data: session } = useSession();
    const [qrs, setQrs] = useState<QrRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchQrs();
        }
    }, [session]);

    const fetchQrs = async () => {
        try {
            const res = await fetch("/api/my-qrs");
            const data = await res.json();
            if (data.qrCodes) {
                setQrs(data.qrCodes);
            }
        } catch (error) {
            console.error("Failed to fetch QRs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (url: string) => {
        const link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 font-sans relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />

            <div className="mx-auto max-w-7xl relative z-10 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            My QR Vault
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                            Manage and track your generated high-performance QR codes.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="w-fit flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-950 shadow-xl transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" />
                        Create New QR
                    </Link>
                </div>

                {qrs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 rounded-[2.5rem] bg-slate-900/30 border border-slate-800 backdrop-blur-xl text-center">
                        <div className="mb-6 rounded-2xl bg-slate-950/50 p-6">
                            <QrCode className="w-12 h-12 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300">No QR codes found</h3>
                        <p className="mt-2 mb-8 text-slate-500 text-sm">You haven't generated any QR codes yet.</p>
                        <Link href="/" className="mt-4 text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2 transition-colors">
                            Go create one now <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {qrs.map((qr) => (
                            <div
                                key={qr._id}
                                className="group relative flex flex-col p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-slate-700 hover:shadow-2xl hover:shadow-purple-900/10"
                            >
                                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-white p-4 transition-all group-hover:p-2">
                                    <img
                                        src={qr.gcsImageUrl}
                                        alt="QR Code"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div className="mt-6 space-y-1">
                                    <p className="truncate text-sm font-bold text-white group-hover:text-purple-300 transition-colors" title={qr.originalUrl}>
                                        {qr.originalUrl}
                                    </p>
                                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
                                        Generated on {new Date(qr.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => handleDownload(qr.gcsImageUrl)}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-950/50 border border-slate-800 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98]"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

