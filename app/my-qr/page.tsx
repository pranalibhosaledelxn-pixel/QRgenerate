"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, Plus, QrCode, ArrowRight, Download, Trash2, ExternalLink } from "lucide-react";

interface QrRecord { _id: string; originalUrl: string; gcsImageUrl: string; createdAt: string; }

export default function MyQrPage() {
    const { data: session } = useSession();
    const [qrs, setQrs] = useState<QrRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => { if (session) fetchQrs(); }, [session]);

    const fetchQrs = async () => {
        try {
            const res = await fetch("/api/my-qrs"); const data = await res.json();
            if (data.qrCodes) setQrs(data.qrCodes);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleDownload = (url: string, i: number) => {
        const link = document.createElement("a"); link.download = `qrcode-${i + 1}.png`; link.href = url;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this QR code?")) return;
        setDeletingId(id);
        try {
            const res = await fetch("/api/delete-qr", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
            if (res.ok) setQrs(prev => prev.filter(qr => qr._id !== id));
            else { const data = await res.json(); alert(data.message || "Failed to delete"); }
        } catch { alert("Failed to delete"); } finally { setDeletingId(null); }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center" style={{ background: "#f8f9fc" }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-slow" style={{ borderTopColor: "#6366f1", borderRightColor: "rgba(99,102,241,0.2)" }} />
                        <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.08)" }}>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#6366f1" }} />
                        </div>
                    </div>
                    <p className="text-sm" style={{ color: "#9ba3b8" }}>Loading your QR codes…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: "#f8f9fc" }}>
            <div className="relative z-10 space-y-8 animate-fade-up">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                            <QrCode className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
                            <span className="text-xs font-semibold" style={{ color: "#6366f1" }}>
                                {qrs.length} QR {qrs.length === 1 ? "Code" : "Codes"}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#1a1d2b" }}>My QR Codes</h1>
                        <p className="text-sm mt-1" style={{ color: "#5b6178" }}>Manage and download your generated QR codes</p>
                    </div>
                    <Link href="/" className="btn-primary shrink-0" style={{ textDecoration: "none", width: "fit-content" }}>
                        <Plus className="w-4 h-4" /> Create New QR
                    </Link>
                </div>

                {/* Empty state */}
                {qrs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 rounded-3xl text-center animate-scale-in"
                        style={{ background: "#ffffff", border: "1px dashed #e0e4ec", boxShadow: "var(--shadow-sm)" }}>
                        <div className="mb-5 w-16 h-16 rounded-3xl flex items-center justify-center"
                            style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                            <QrCode className="w-8 h-8" style={{ color: "#9ba3b8" }} />
                        </div>
                        <h3 className="text-lg font-bold" style={{ color: "#1a1d2b" }}>No QR codes yet</h3>
                        <p className="mt-1.5 mb-7 text-sm" style={{ color: "#5b6178" }}>Generate your first stunning QR code</p>
                        <Link href="/" className="flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-80"
                            style={{ color: "#6366f1", textDecoration: "none" }}>
                            Create your first QR <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger">
                        {qrs.map((qr, i) => (
                            <div key={qr._id}
                                className="group relative flex flex-col rounded-3xl overflow-hidden card-hover animate-fade-up"
                                style={{ background: "#ffffff", border: "1px solid #e8ebf0", boxShadow: "var(--shadow-sm)", animationDelay: `${i * 60}ms` }}>
                                <div className="p-4 pb-0">
                                    <div className="aspect-square w-full overflow-hidden rounded-2xl bg-white p-3 transition-all duration-300 group-hover:p-2"
                                        style={{ border: "1px solid #f0f1f5", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                        <img src={qr.gcsImageUrl} alt="QR Code" className="h-full w-full object-contain" />
                                    </div>
                                </div>
                                <div className="px-4 pt-3 pb-2">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <ExternalLink className="w-3 h-3 shrink-0" style={{ color: "#9ba3b8" }} />
                                        <p className="truncate text-sm font-semibold" style={{ color: "#1a1d2b" }} title={qr.originalUrl}>{qr.originalUrl}</p>
                                    </div>
                                    <p className="text-[11px] font-medium" style={{ color: "#9ba3b8" }}>
                                        {new Date(qr.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                <div className="p-3 pt-2 flex gap-2">
                                    <button onClick={() => handleDownload(qr.gcsImageUrl, i)}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                        style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", color: "#6366f1" }}>
                                        <Download className="w-3.5 h-3.5" /> Download
                                    </button>
                                    <button onClick={() => handleDelete(qr._id)} disabled={deletingId === qr._id}
                                        className="flex items-center justify-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                                        style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.12)", color: "#e11d48" }} title="Delete">
                                        {deletingId === qr._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
