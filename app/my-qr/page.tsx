"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, Plus, QrCode, ArrowRight, Download, Trash2 } from "lucide-react";

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

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this QR code?")) return;

        try {
            const res = await fetch("/api/delete-qr", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                setQrs(prev => prev.filter(qr => qr._id !== id));
            } else {
                const data = await res.json();
                alert(data.message || "Failed to delete QR code");
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete QR code");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white p-8 font-sans relative overflow-hidden"
            style={{ background: "#09090b" }}
        >
            {/* Animated ambient glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30 animate-blob pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(0,0,0,0) 70%)", filter: "blur(60px)" }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 animate-blob pointer-events-none" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(0,0,0,0) 70%)", filter: "blur(60px)", animationDelay: "2s" }} />

            <div className="mx-auto max-w-7xl relative z-10 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
                            My QR Codes
                        </h1>
                        <p className="text-slate-500 text-sm max-w-2xl">
                            Manage and track your generated high-performance QR codes.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="w-fit flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                        style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative z-10 flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create New QR
                        </span>
                    </Link>
                </div>

                {qrs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 rounded-2xl text-center glass-panel w-full">
                        <div className="mb-6 rounded-2xl bg-slate-950/50 p-6">
                            <QrCode className="w-12 h-12 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-300">No QR codes found</h3>
                        <p className="mt-2 mb-8 text-slate-500 text-sm">You haven't generated any QR codes yet.</p>
                        <Link href="/" className="mt-4 text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors">
                            Go create one now <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {qrs.map((qr) => (
                            <div
                                key={qr._id}
                                className="group relative flex flex-col rounded-2xl transition-all duration-300 hover:translate-y-[-4px] glass-panel hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]"
                            >
                                <div className="p-4 pb-0">
                                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-white p-3 transition-all group-hover:p-2">
                                        <img
                                            src={qr.gcsImageUrl}
                                            alt="QR Code"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                </div>
                                <div className="px-4 pt-3 pb-2 space-y-1">
                                    <p className="truncate text-sm font-semibold text-white" title={qr.originalUrl}>
                                        {qr.originalUrl}
                                    </p>
                                    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                                        {new Date(qr.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                <div className="p-4 pt-2 flex gap-2">
                                    <button
                                        onClick={() => handleDownload(qr.gcsImageUrl)}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-all active:scale-[0.98]"
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(qr._id)}
                                        className="flex items-center justify-center rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-red-400 transition-all active:scale-[0.98]"
                                        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)" }}
                                        title="Delete QR Code"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
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

