"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { Download, Zap, Image as ImageIcon, Layers, Link as LinkIcon, Sparkles, Crown } from "lucide-react";

const FRAMES = [
    { id: "none", name: "Clean", src: "" },
    { id: "envelope", name: "Envelope", src: "/frames/envelope.svg" },
    { id: "easter-egg", name: "Easter Egg", src: "/frames/easter-egg.svg" },
    { id: "floral-wreath", name: "Floral", src: "/frames/floral-wreath.svg" },
    { id: "geometric", name: "Geometric", src: "/frames/geometric.svg" },
    { id: "modern-card", name: "Modern", src: "/frames/modern-card.svg" },
];

const CANVAS_SIZE = 800;
const PREVIEW_SIZE = 200;
const SAMPLE_URL = "https://example.com";

function isFinderZone(row: number, col: number, totalModules: number): boolean {
    const size = 8;
    if (row < size && col < size) return true;
    if (row < size && col >= totalModules - size) return true;
    if (row >= totalModules - size && col < size) return true;
    return false;
}

function isAlignmentZone(row: number, col: number, moduleCount: number): boolean {
    const alignPos = getAlignmentPositions(moduleCount);
    for (const ar of alignPos) {
        for (const ac of alignPos) {
            if (ar < 9 && ac < 9) continue;
            if (ar < 9 && ac > moduleCount - 9) continue;
            if (ar > moduleCount - 9 && ac < 9) continue;
            if (Math.abs(row - ar) <= 2 && Math.abs(col - ac) <= 2) return true;
        }
    }
    return false;
}

function getAlignmentPositions(moduleCount: number): number[] {
    const version = (moduleCount - 17) / 4;
    if (version < 2) return [];
    const table: Record<number, number[]> = {
        2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
        6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46],
        10: [6, 28, 50], 11: [6, 30, 54], 12: [6, 32, 58],
    };
    return table[version] || [];
}

function drawFinderCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, darkColor: string) {
    ctx.beginPath(); ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fillStyle = darkColor; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, radius * 0.74, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, radius * 0.52, 0, Math.PI * 2); ctx.fillStyle = darkColor; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fill();
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function drawAlignmentPattern(ctx: CanvasRenderingContext2D, cx: number, cy: number, moduleSize: number, darkColor: string) {
    const r = moduleSize * 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2); ctx.fillStyle = darkColor; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2); ctx.fillStyle = darkColor; ctx.fill();
}

export default function QrCodeGenerator() {
    const [url, setUrl] = useState<string>("");
    const [qrCodeData, setQrCodeData] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [limitReached, setLimitReached] = useState(false);
    const [qrCount, setQrCount] = useState<number>(0);
    const [checkingLimit, setCheckingLimit] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [qrLimit, setQrLimit] = useState(3);
    const [selectedFrame, setSelectedFrame] = useState<string>("none");
    const [compositeUrl, setCompositeUrl] = useState<string>("");
    const [designPreviews, setDesignPreviews] = useState<Record<string, string>>({});
    const [uploadedImage, setUploadedImage] = useState<string>("");
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [mode, setMode] = useState<"frame" | "image">("frame");
    const [generating, setGenerating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/my-qrs");
                const data = await res.json();
                if (res.ok) {
                    setQrCount(data.count || 0);
                    setIsPremium(data.isPremium);
                    setQrLimit(data.qrLimit ?? 3);
                    if (data.count >= (data.qrLimit ?? 3)) setLimitReached(true);
                }
            } catch (err) { console.error(err); }
            finally { setCheckingLimit(false); }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const sampleSvg = await QRCode.toString(SAMPLE_URL, { type: "svg", margin: 2, color: { dark: "#1a1a2e", light: "#ffffff" } });
                const sampleB64 = `data:image/svg+xml;base64,${btoa(sampleSvg)}`;
                const previews: Record<string, string> = {};
                for (const frame of FRAMES) { previews[frame.id] = await generateFramePreview(sampleB64, frame); }
                setDesignPreviews(previews);
            } catch (err) { console.error(err); }
        })();
    }, []);

    const generateFramePreview = (qrDataUrl: string, frame: typeof FRAMES[0]): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement("canvas"); canvas.width = PREVIEW_SIZE; canvas.height = PREVIEW_SIZE;
            const ctx = canvas.getContext("2d")!;
            const qrImg = new Image(); qrImg.crossOrigin = "anonymous";
            qrImg.onload = () => {
                if (frame.id === "none") {
                    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
                    ctx.drawImage(qrImg, 10, 10, PREVIEW_SIZE - 20, PREVIEW_SIZE - 20);
                    resolve(canvas.toDataURL("image/png"));
                } else {
                    const frameImg = new Image(); frameImg.crossOrigin = "anonymous";
                    frameImg.onload = () => {
                        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
                        ctx.drawImage(frameImg, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
                        const p = PREVIEW_SIZE * 0.17; ctx.drawImage(qrImg, p, p, PREVIEW_SIZE - p * 2, PREVIEW_SIZE - p * 2);
                        resolve(canvas.toDataURL("image/png"));
                    };
                    frameImg.src = frame.src;
                }
            };
            qrImg.src = qrDataUrl;
        });
    };

    const compositeWithFrame = useCallback((qrDataUrl: string, frameId: string): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = canvasRef.current; if (!canvas) { resolve(qrDataUrl); return; }
            const ctx = canvas.getContext("2d"); if (!ctx) { resolve(qrDataUrl); return; }
            canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE; ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            const frame = FRAMES.find(f => f.id === frameId); const hasFrame = frame && frame.id !== "none" && frame.src;
            const qrImg = new Image(); qrImg.crossOrigin = "anonymous";
            qrImg.onload = () => {
                if (!hasFrame) {
                    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                    ctx.drawImage(qrImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
                    const r = canvas.toDataURL("image/png"); setCompositeUrl(r); resolve(r);
                } else {
                    const frameImg = new Image(); frameImg.crossOrigin = "anonymous";
                    frameImg.onload = () => {
                        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                        ctx.drawImage(frameImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
                        const p = CANVAS_SIZE * 0.17; ctx.drawImage(qrImg, p, p, CANVAS_SIZE - p * 2, CANVAS_SIZE - p * 2);
                        const r = canvas.toDataURL("image/png"); setCompositeUrl(r); resolve(r);
                    };
                    frameImg.src = frame!.src;
                }
            };
            qrImg.src = qrDataUrl;
        });
    }, []);

    const compositeWithImage = useCallback((imageDataUrl: string, targetUrl: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                const canvas = canvasRef.current; if (!canvas) { reject("No canvas"); return; }
                const ctx = canvas.getContext("2d"); if (!ctx) { reject("No context"); return; }
                canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE;
                const qrData = QRCode.create(targetUrl, { errorCorrectionLevel: "H" });
                const modules = qrData.modules; const moduleCount = modules.size; const moduleData = modules.data;
                const bgImg = new Image(); bgImg.crossOrigin = "anonymous";
                bgImg.onload = () => {
                    const imgAspect = bgImg.width / bgImg.height;
                    let drawW = CANVAS_SIZE, drawH = CANVAS_SIZE, drawX = 0, drawY = 0;
                    if (imgAspect > 1) { drawW = CANVAS_SIZE * imgAspect; drawX = -(drawW - CANVAS_SIZE) / 2; }
                    else { drawH = CANVAS_SIZE / imgAspect; drawY = -(drawH - CANVAS_SIZE) / 2; }
                    ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
                    ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                    const margin = 2; const totalMod = moduleCount + margin * 2;
                    const ms = CANVAS_SIZE / totalMod; const off = margin * ms;
                    const ds = ms * 0.85; const dr = ds * 0.25; const dc = "#0a0a0a";
                    for (let row = 0; row < moduleCount; row++) {
                        for (let col = 0; col < moduleCount; col++) {
                            if (isFinderZone(row, col, moduleCount) || isAlignmentZone(row, col, moduleCount)) continue;
                            const idx = row * moduleCount + col; const isDark = moduleData[idx];
                            const cx = off + col * ms + ms / 2; const cy = off + row * ms + ms / 2;
                            const x = cx - ds / 2; const y = cy - ds / 2;
                            if (isDark) {
                                ctx.fillStyle = "rgba(255,255,255,0.55)"; roundedRect(ctx, x - 1, y - 1, ds + 2, ds + 2, dr + 1); ctx.fill();
                                ctx.fillStyle = dc; roundedRect(ctx, x, y, ds, ds, dr); ctx.fill();
                            } else {
                                ctx.fillStyle = "rgba(255,255,255,0.25)"; roundedRect(ctx, x, y, ds, ds, dr); ctx.fill();
                            }
                        }
                    }
                    const fr = (7 * ms) / 2;
                    [{ r: 3.5, c: 3.5 }, { r: 3.5, c: moduleCount - 3.5 }, { r: moduleCount - 3.5, c: 3.5 }].forEach(({ r, c }) => {
                        drawFinderCircle(ctx, off + c * ms, off + r * ms, fr, dc);
                    });
                    const aPos = getAlignmentPositions(moduleCount);
                    for (const ar of aPos) for (const ac of aPos) {
                        if ((ar < 9 && ac < 9) || (ar < 9 && ac > moduleCount - 9) || (ar > moduleCount - 9 && ac < 9)) continue;
                        drawAlignmentPattern(ctx, off + ac * ms + ms / 2, off + ar * ms + ms / 2, ms, dc);
                    }
                    const g = ctx.createRadialGradient(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE * 0.3, CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE * 0.55);
                    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(255,255,255,0.12)");
                    ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                    const result = canvas.toDataURL("image/png"); setCompositeUrl(result); resolve(result);
                };
                bgImg.src = imageDataUrl;
            } catch (err) { reject(err); }
        });
    }, []);

    useEffect(() => { if (qrCodeData && mode === "frame") compositeWithFrame(qrCodeData, selectedFrame); }, [selectedFrame, qrCodeData, compositeWithFrame, mode]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploadedFileName(file.name);
        const reader = new FileReader(); reader.onload = () => setUploadedImage(reader.result as string); reader.readAsDataURL(file);
    };

    const generateQRCode = async (text: string) => {
        try {
            if (!text) { setQrCodeData(""); setCompositeUrl(""); return; }
            if (mode === "image" && !uploadedImage) { setError("Please upload an image first"); return; }
            setLimitReached(false); setError(""); setGenerating(true);
            if (mode === "image") {
                const designed = await compositeWithImage(uploadedImage, text); setQrCodeData(text);
                const saveRes = await fetch("/api/save-qr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: text, qrCodeDataUrl: designed }) });
                const saveData = await saveRes.json();
                if (saveRes.status === 403 && saveData.limitReached) { setCompositeUrl(""); setLimitReached(true); return; }
                if (saveRes.ok) { setQrCount(p => p + 1); if (qrCount + 1 >= qrLimit) setLimitReached(true); }
                return;
            }
            const genRes = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: text }) });
            const genData = await genRes.json();
            if (!genRes.ok) { setError(genData.message || "Failed to generate QR code"); return; }
            const qrImage = genData.qrCode; setQrCodeData(qrImage); setError("");
            const designed = await compositeWithFrame(qrImage, selectedFrame);
            const saveRes = await fetch("/api/save-qr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: text, qrCodeDataUrl: designed }) });
            const saveData = await saveRes.json();
            if (saveRes.status === 403 && saveData.limitReached) { setQrCodeData(""); setCompositeUrl(""); setLimitReached(true); return; }
            if (!saveRes.ok) console.error("Failed to save QR:", saveData.message);
            else { setQrCount(p => p + 1); if (qrCount + 1 >= qrLimit) setLimitReached(true); }
        } catch (err) { console.error(err); setError("Failed to generate QR code"); } finally { setGenerating(false); }
    };

    const handleDownload = () => {
        if (!compositeUrl) return;
        const link = document.createElement("a");
        link.download = mode === "image" ? "qrcode-artistic.png" : selectedFrame !== "none" ? "qrcode-designed.png" : "qrcode.png";
        link.href = compositeUrl; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    return (
        <div className="relative flex min-h-screen items-start justify-center pt-4 sm:pt-8 pb-12 px-3 sm:px-4 overflow-x-hidden" style={{ background: "#f8f9fc" }}>
            {/* Soft blobs */}
            <div className="glow-blob w-[400px] h-[400px] top-0 right-[-5%] opacity-30"
                style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />
            <div className="glow-blob w-[300px] h-[300px] bottom-10 left-[-5%] opacity-20"
                style={{ background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)", animationDelay: "3s" }} />

            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <div className="mb-7 text-center animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                        <Sparkles className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
                        <span className="text-xs font-semibold" style={{ color: "#6366f1" }}>QR Studio</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "#1a1d2b" }}>
                        Create Your <span className="text-grad">QR Code</span>
                    </h1>
                    <p className="text-sm" style={{ color: "#5b6178" }}>Design stunning QR codes with custom frames or embedded images</p>
                    {!checkingLimit && (
                        <div className="mt-3 inline-flex items-center gap-2">
                            <div className="flex gap-1">
                                {Array.from({ length: qrLimit }).map((_, i) => (
                                    <div key={i} className="w-5 h-1.5 rounded-full" style={{ background: i < qrCount ? "linear-gradient(90deg, #6366f1, #06b6d4)" : "#e8ebf0" }} />
                                ))}
                            </div>
                            <span className="text-xs" style={{ color: "#9ba3b8" }}>{qrCount}/{qrLimit} used</span>
                        </div>
                    )}
                </div>

                {/* Main card */}
                <div className="rounded-3xl overflow-hidden animate-fade-up"
                    style={{ background: "#ffffff", border: "1px solid #e8ebf0", boxShadow: "0 8px 32px -8px rgba(0,0,0,0.08)", animationDelay: "60ms" }}>

                    {/* Tabs */}
                    <div className="flex gap-0" style={{ borderBottom: "1px solid #e8ebf0" }}>
                        {[{ id: "frame", label: "Frame Designs", icon: Layers }, { id: "image", label: "QR Inside Image", icon: ImageIcon }].map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => { setMode(id as "frame" | "image"); setCompositeUrl(""); setQrCodeData(""); }}
                                className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all relative"
                                style={{ color: mode === id ? "#6366f1" : "#9ba3b8", background: mode === id ? "rgba(99,102,241,0.04)" : "transparent" }}>
                                <Icon className="w-4 h-4" />
                                {label}
                                {mode === id && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, #6366f1, #06b6d4)" }} />}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 sm:p-6 space-y-5">
                        {/* Frame mode */}
                        {mode === "frame" && (
                            <div className="animate-fade-up">
                                <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9ba3b8" }}>Choose Design</label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                    {FRAMES.map((frame) => (
                                        <button key={frame.id} onClick={() => setSelectedFrame(frame.id)}
                                            className="group relative rounded-2xl overflow-hidden transition-all duration-200"
                                            style={{
                                                border: selectedFrame === frame.id ? "2px solid #6366f1" : "2px solid #e8ebf0",
                                                transform: selectedFrame === frame.id ? "scale(1.05)" : undefined,
                                                boxShadow: selectedFrame === frame.id ? "0 4px 16px -4px rgba(99,102,241,0.3)" : "none",
                                            }}>
                                            <div className="aspect-square bg-white p-1">
                                                {designPreviews[frame.id] ? (
                                                    <img src={designPreviews[frame.id]} alt={frame.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center py-1.5 text-[10px] font-bold" style={{
                                                background: selectedFrame === frame.id ? "#6366f1" : "#f4f5f9",
                                                color: selectedFrame === frame.id ? "#fff" : "#9ba3b8"
                                            }}>{frame.name}</div>
                                            {selectedFrame === frame.id && (
                                                <div className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#6366f1" }}>
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Image mode */}
                        {mode === "image" && (
                            <div className="animate-fade-up">
                                <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9ba3b8" }}>Upload Image</label>
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer rounded-2xl border-2 border-dashed transition-all p-8 text-center hover:shadow-md"
                                    style={{
                                        borderColor: uploadedImage ? "rgba(99,102,241,0.4)" : "#e8ebf0",
                                        background: uploadedImage ? "rgba(99,102,241,0.03)" : "#fafbfd",
                                    }}>
                                    {uploadedImage ? (
                                        <div className="flex items-center gap-4">
                                            <img src={uploadedImage} alt="Uploaded" className="w-14 h-14 rounded-xl object-cover" style={{ border: "1px solid #e8ebf0" }} />
                                            <div className="text-left flex-1">
                                                <p className="text-sm font-bold truncate" style={{ color: "#1a1d2b" }}>{uploadedFileName}</p>
                                                <p className="text-xs mt-1" style={{ color: "#9ba3b8" }}>Click to change</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}>
                                                <ImageIcon className="w-7 h-7" style={{ color: "#6366f1" }} />
                                            </div>
                                            <p className="text-sm font-semibold" style={{ color: "#1a1d2b" }}>Click to upload or drag & drop</p>
                                            <p className="text-xs" style={{ color: "#9ba3b8" }}>PNG, JPG — your QR will embed inside</p>
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </div>
                            </div>
                        )}

                        {/* URL */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#9ba3b8" }}>Destination URL</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><LinkIcon className="w-4 h-4" style={{ color: "#9ba3b8" }} /></div>
                                <input type="text" placeholder="https://your-link.com" value={url} onChange={(e) => setUrl(e.target.value)}
                                    className="input-field" style={{ paddingLeft: "44px" }} onKeyDown={(e) => e.key === "Enter" && generateQRCode(url)} />
                            </div>
                        </div>

                        {/* Generate */}
                        <button onClick={() => limitReached && url ? router.push("/subscription") : generateQRCode(url)}
                            className="btn-primary w-full" style={{ padding: "14px", borderRadius: "16px", fontSize: "15px" }}
                            disabled={!url || (mode === "image" && !uploadedImage) || checkingLimit || generating}>
                            {generating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</> :
                                limitReached && url ? <><Crown className="w-4 h-4" /> Upgrade Plan</> :
                                    checkingLimit ? "Loading…" : <><Zap className="w-4 h-4" /> {mode === "image" ? "Generate QR Inside Image" : "Generate QR Code"}</>}
                        </button>

                        {/* Preview */}
                        <div className="relative flex min-h-[220px] sm:min-h-[280px] w-full items-center justify-center rounded-3xl overflow-hidden"
                            style={{ background: "#fafbfd", border: "1px dashed #e0e4ec" }}>
                            <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />
                            {limitReached && url && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20"
                                    style={{ background: "rgba(248,249,252,0.95)", backdropFilter: "blur(8px)" }}>
                                    <div className="mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
                                        style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 6px 20px -4px rgba(245,158,11,0.35)" }}>
                                        <Crown className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2" style={{ color: "#1a1d2b" }}>QR Limit Reached</h3>
                                    <p className="text-sm mb-6" style={{ color: "#5b6178" }}>Upgrade your plan to create more.</p>
                                    <button onClick={() => router.push("/subscription")} className="btn-primary"
                                        style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 4px 16px -4px rgba(245,158,11,0.35)" }}>
                                        Upgrade to Pro
                                    </button>
                                </div>
                            )}
                            {compositeUrl && !limitReached ? (
                                <div className="relative cursor-pointer rounded-2xl overflow-hidden p-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
                                    style={{ background: "#fff", boxShadow: "0 8px 32px -8px rgba(0,0,0,0.12)", border: "1px solid #e8ebf0" }}
                                    onClick={handleDownload} title="Click to download">
                                    <img src={compositeUrl} alt="Generated QR Code" className="h-40 w-40 sm:h-56 sm:w-56 object-contain" />
                                </div>
                            ) : !limitReached ? (
                                <div className="flex flex-col items-center text-center relative z-10">
                                    <div className="mb-4 w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8" style={{ color: "#9ba3b8" }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold" style={{ color: "#1a1d2b" }}>Your QR will appear here</p>
                                    <p className="text-xs mt-1.5 max-w-[200px] leading-relaxed" style={{ color: "#9ba3b8" }}>
                                        {mode === "image" ? "Upload an image and enter a URL" : "Select a design, enter URL, and generate"}
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <canvas ref={canvasRef} className="hidden" />

                        {compositeUrl && (
                            <button onClick={handleDownload}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                style={{ background: "#f4f5f9", border: "1px solid #e8ebf0", color: "#1a1d2b" }}>
                                <Download className="w-4 h-4" /> Download High-Res QR Code
                            </button>
                        )}

                        {error && (
                            <div className="rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-2"
                                style={{ background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.15)", color: "#e11d48" }}>
                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#e11d48" }} /> {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
