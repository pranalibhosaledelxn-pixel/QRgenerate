"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";

// Frame definitions
const FRAMES = [
    { id: "none", name: "No Frame", src: "" },
    { id: "envelope", name: "Envelope", src: "/frames/envelope.svg" },
    { id: "easter-egg", name: "Easter Egg", src: "/frames/easter-egg.svg" },
    { id: "floral-wreath", name: "Floral Wreath", src: "/frames/floral-wreath.svg" },
    { id: "geometric", name: "Geometric", src: "/frames/geometric.svg" },
    { id: "modern-card", name: "Modern Card", src: "/frames/modern-card.svg" },
];

const CANVAS_SIZE = 800; // Hi-res for download quality
const PREVIEW_SIZE = 200;
const SAMPLE_URL = "https://example.com";

// Check if a module is inside a finder pattern area (including 1-module separator)
function isFinderZone(row: number, col: number, totalModules: number): boolean {
    const size = 8; // 7 finder + 1 separator
    // Top-left
    if (row < size && col < size) return true;
    // Top-right
    if (row < size && col >= totalModules - size) return true;
    // Bottom-left
    if (row >= totalModules - size && col < size) return true;
    return false;
}

// Check alignment pattern area (5×5 centered on alignment coords)
function isAlignmentZone(row: number, col: number, moduleCount: number): boolean {
    // Alignment pattern positions depend on QR version
    // For simplicity, check the standard position for common versions
    const alignPos = getAlignmentPositions(moduleCount);
    for (const ar of alignPos) {
        for (const ac of alignPos) {
            // Skip if overlapping with finder
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
    // Standard alignment positions per version (simplified lookup)
    const table: Record<number, number[]> = {
        2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
        6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46],
        10: [6, 28, 50], 11: [6, 30, 54], 12: [6, 32, 58],
    };
    return table[version] || [];
}

// Draw a polished concentric-circle finder pattern
function drawFinderCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, darkColor: string) {
    // White halo behind
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
    // Outer dark ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = darkColor;
    ctx.fill();
    // White ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.74, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    // Inner dark ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.52, 0, Math.PI * 2);
    ctx.fillStyle = darkColor;
    ctx.fill();
    // Center highlight
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();
}

// Draw a rounded rectangle
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// Draw alignment pattern as concentric circles
function drawAlignmentPattern(ctx: CanvasRenderingContext2D, cx: number, cy: number, moduleSize: number, darkColor: string) {
    const r = moduleSize * 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = darkColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = darkColor;
    ctx.fill();
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

    // Image QR state
    const [uploadedImage, setUploadedImage] = useState<string>("");
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [mode, setMode] = useState<"frame" | "image">("frame");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    // Generate design previews for frame mode
    useEffect(() => {
        const generatePreviews = async () => {
            try {
                const sampleSvg = await QRCode.toString(SAMPLE_URL, {
                    type: "svg", margin: 2, color: { dark: "#1a1a2e", light: "#ffffff" },
                });
                const sampleB64 = `data:image/svg+xml;base64,${btoa(sampleSvg)}`;

                const previews: Record<string, string> = {};
                for (const frame of FRAMES) {
                    const preview = await generateFramePreview(sampleB64, frame);
                    previews[frame.id] = preview;
                }
                setDesignPreviews(previews);
            } catch (err) {
                console.error("Error generating previews:", err);
            }
        };
        generatePreviews();
    }, []);

    const generateFramePreview = (qrDataUrl: string, frame: typeof FRAMES[0]): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            canvas.width = PREVIEW_SIZE;
            canvas.height = PREVIEW_SIZE;
            const ctx = canvas.getContext("2d")!;
            const qrImg = new Image();
            qrImg.crossOrigin = "anonymous";
            qrImg.onload = () => {
                if (frame.id === "none") {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
                    ctx.drawImage(qrImg, 10, 10, PREVIEW_SIZE - 20, PREVIEW_SIZE - 20);
                    resolve(canvas.toDataURL("image/png"));
                } else {
                    const frameImg = new Image();
                    frameImg.crossOrigin = "anonymous";
                    frameImg.onload = () => {
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
                        ctx.drawImage(frameImg, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
                        const padding = PREVIEW_SIZE * 0.17;
                        const qrSize = PREVIEW_SIZE - padding * 2;
                        ctx.drawImage(qrImg, padding, padding, qrSize, qrSize);
                        resolve(canvas.toDataURL("image/png"));
                    };
                    frameImg.src = frame.src;
                }
            };
            qrImg.src = qrDataUrl;
        });
    };

    // Composite QR + frame on canvas
    const compositeWithFrame = useCallback((qrDataUrl: string, frameId: string): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = canvasRef.current;
            if (!canvas) { resolve(qrDataUrl); return; }
            const ctx = canvas.getContext("2d");
            if (!ctx) { resolve(qrDataUrl); return; }

            canvas.width = CANVAS_SIZE;
            canvas.height = CANVAS_SIZE;
            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const frame = FRAMES.find(f => f.id === frameId);
            const hasFrame = frame && frame.id !== "none" && frame.src;

            const qrImg = new Image();
            qrImg.crossOrigin = "anonymous";
            qrImg.onload = () => {
                if (!hasFrame) {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                    ctx.drawImage(qrImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
                    const result = canvas.toDataURL("image/png");
                    setCompositeUrl(result);
                    resolve(result);
                } else {
                    const frameImg = new Image();
                    frameImg.crossOrigin = "anonymous";
                    frameImg.onload = () => {
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                        ctx.drawImage(frameImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
                        const padding = CANVAS_SIZE * 0.17;
                        const qrSize = CANVAS_SIZE - padding * 2;
                        ctx.drawImage(qrImg, padding, padding, qrSize, qrSize);
                        const result = canvas.toDataURL("image/png");
                        setCompositeUrl(result);
                        resolve(result);
                    };
                    frameImg.src = frame!.src;
                }
            };
            qrImg.src = qrDataUrl;
        });
    }, []);

    // Generate QR inside uploaded image — high quality artistic rendering
    const compositeWithImage = useCallback((imageDataUrl: string, targetUrl: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                const canvas = canvasRef.current;
                if (!canvas) { reject("No canvas"); return; }
                const ctx = canvas.getContext("2d");
                if (!ctx) { reject("No context"); return; }

                canvas.width = CANVAS_SIZE;
                canvas.height = CANVAS_SIZE;

                // Generate QR matrix data
                const qrData = QRCode.create(targetUrl, { errorCorrectionLevel: "H" });
                const modules = qrData.modules;
                const moduleCount = modules.size;
                const moduleData = modules.data;

                const bgImg = new Image();
                bgImg.crossOrigin = "anonymous";
                bgImg.onload = () => {
                    // === 1. Draw background image (cover mode) ===
                    const imgAspect = bgImg.width / bgImg.height;
                    let drawW = CANVAS_SIZE, drawH = CANVAS_SIZE;
                    let drawX = 0, drawY = 0;
                    if (imgAspect > 1) {
                        drawW = CANVAS_SIZE * imgAspect;
                        drawX = -(drawW - CANVAS_SIZE) / 2;
                    } else {
                        drawH = CANVAS_SIZE / imgAspect;
                        drawY = -(drawH - CANVAS_SIZE) / 2;
                    }
                    ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);

                    // === 2. Semi-transparent white overlay for scannability ===
                    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
                    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

                    // === 3. Calculate module sizing ===
                    const margin = 2;
                    const totalModules = moduleCount + margin * 2;
                    const moduleSize = CANVAS_SIZE / totalModules;
                    const offset = margin * moduleSize;
                    const dotSize = moduleSize * 0.85;
                    const dotR = dotSize * 0.25; // corner radius for rounded rects
                    const darkColor = "#0a0a0a";

                    // === 4. Draw data modules (rounded rects with white halos) ===
                    for (let row = 0; row < moduleCount; row++) {
                        for (let col = 0; col < moduleCount; col++) {
                            // Skip finder and alignment zones (drawn separately)
                            if (isFinderZone(row, col, moduleCount)) continue;
                            if (isAlignmentZone(row, col, moduleCount)) continue;

                            const idx = row * moduleCount + col;
                            const isDark = moduleData[idx];
                            const cx = offset + col * moduleSize + moduleSize / 2;
                            const cy = offset + row * moduleSize + moduleSize / 2;
                            const x = cx - dotSize / 2;
                            const y = cy - dotSize / 2;

                            if (isDark) {
                                // White halo behind dark module
                                ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
                                roundedRect(ctx, x - 1, y - 1, dotSize + 2, dotSize + 2, dotR + 1);
                                ctx.fill();
                                // Dark module
                                ctx.fillStyle = darkColor;
                                roundedRect(ctx, x, y, dotSize, dotSize, dotR);
                                ctx.fill();
                            } else {
                                // Light module: subtle white backing
                                ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
                                roundedRect(ctx, x, y, dotSize, dotSize, dotR);
                                ctx.fill();
                            }
                        }
                    }

                    // === 5. Draw polished circular finder patterns ===
                    const finderRadius = (7 * moduleSize) / 2;
                    const finderCenters = [
                        { r: 3.5, c: 3.5 },
                        { r: 3.5, c: moduleCount - 3.5 },
                        { r: moduleCount - 3.5, c: 3.5 },
                    ];
                    finderCenters.forEach(({ r, c }) => {
                        const cx = offset + c * moduleSize;
                        const cy = offset + r * moduleSize;
                        drawFinderCircle(ctx, cx, cy, finderRadius, darkColor);
                    });

                    // === 6. Draw alignment patterns as concentric circles ===
                    const alignPos = getAlignmentPositions(moduleCount);
                    for (const ar of alignPos) {
                        for (const ac of alignPos) {
                            if (ar < 9 && ac < 9) continue;
                            if (ar < 9 && ac > moduleCount - 9) continue;
                            if (ar > moduleCount - 9 && ac < 9) continue;
                            const cx = offset + ac * moduleSize + moduleSize / 2;
                            const cy = offset + ar * moduleSize + moduleSize / 2;
                            drawAlignmentPattern(ctx, cx, cy, moduleSize, darkColor);
                        }
                    }

                    // === 7. Subtle radial vignette to blend edges ===
                    const gradient = ctx.createRadialGradient(
                        CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE * 0.3,
                        CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE * 0.55
                    );
                    gradient.addColorStop(0, "rgba(255,255,255,0)");
                    gradient.addColorStop(1, "rgba(255,255,255,0.12)");
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

                    const result = canvas.toDataURL("image/png");
                    setCompositeUrl(result);
                    resolve(result);
                };
                bgImg.src = imageDataUrl;
            } catch (err) {
                reject(err);
            }
        });
    }, []);

    // Re-composite when frame changes (frame mode only)
    useEffect(() => {
        if (qrCodeData && mode === "frame") {
            compositeWithFrame(qrCodeData, selectedFrame);
        }
    }, [selectedFrame, qrCodeData, compositeWithFrame, mode]);

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
            setUploadedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const generateQRCode = async (text: string) => {
        try {
            if (!text) {
                setQrCodeData("");
                setCompositeUrl("");
                return;
            }

            if (mode === "image" && !uploadedImage) {
                setError("Please upload an image first");
                return;
            }

            setLimitReached(false);
            setError("");

            // For "image" mode, we generate QR client-side and composite with the image
            if (mode === "image") {
                const designedQR = await compositeWithImage(uploadedImage, text);
                setQrCodeData(text); // store URL reference

                // Save the designed QR
                const saveRes = await fetch("/api/save-qr", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: text, qrCodeDataUrl: designedQR }),
                });
                const saveData = await saveRes.json();

                if (saveRes.status === 403 && saveData.limitReached) {
                    setCompositeUrl("");
                    setLimitReached(true);
                    return;
                }

                if (saveRes.ok) {
                    setQrCount(prev => prev + 1);
                    if (qrCount + 1 >= qrLimit) setLimitReached(true);
                }
                return;
            }

            // Frame mode: use server API
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

            const designedQR = await compositeWithFrame(qrImage, selectedFrame);

            const saveRes = await fetch("/api/save-qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: text, qrCodeDataUrl: designedQR }),
            });

            const saveData = await saveRes.json();

            if (saveRes.status === 403 && saveData.limitReached) {
                setQrCodeData("");
                setCompositeUrl("");
                setLimitReached(true);
                return;
            }

            if (!saveRes.ok) {
                console.error("Failed to save QR:", saveData.message);
            } else {
                setQrCount(prev => prev + 1);
                if (qrCount + 1 >= qrLimit) setLimitReached(true);
            }

        } catch (err) {
            console.error(err);
            setError("Failed to generate QR code");
        }
    };

    const handleDownload = () => {
        const downloadUrl = compositeUrl;
        if (!downloadUrl) return;
        const link = document.createElement("a");
        link.download = mode === "image" ? "qrcode-artistic.png" : selectedFrame !== "none" ? "qrcode-designed.png" : "qrcode.png";
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 font-sans relative overflow-hidden"
            style={{ background: "#09090b" }}
        >
            {/* Animated ambient glow */}
            <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 animate-blob pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(0,0,0,0) 70%)", filter: "blur(80px)" }} />
            <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30 animate-blob pointer-events-none" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(0,0,0,0) 70%)", filter: "blur(80px)", animationDelay: "2s" }} />

            <div className="w-full max-w-2xl rounded-[2rem] p-8 transition-all duration-500 relative z-10 glass-panel hover:shadow-[0_0_25px_-10px_rgba(6,182,212,0.15)]">
                <div className="mb-8 text-center space-y-3">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
                        QR Generator
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Create stunning QR codes with designs or your own image.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Mode Tabs */}
                    <div className="flex rounded-xl p-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <button
                            onClick={() => { setMode("frame"); setCompositeUrl(""); setQrCodeData(""); }}
                            className={`flex-1 rounded-lg py-3 text-xs font-bold transition-all ${mode === "frame"
                                ? "text-white shadow-md"
                                : "text-slate-400 hover:text-white"
                                }`}
                            style={mode === "frame" ? { background: "linear-gradient(135deg, #2563EB, #06B6D4)" } : undefined}
                        >
                            🖼️ Frame Designs
                        </button>
                        <button
                            onClick={() => { setMode("image"); setCompositeUrl(""); setQrCodeData(""); }}
                            className={`flex-1 rounded-lg py-3 text-xs font-bold transition-all ${mode === "image"
                                ? "text-white shadow-md"
                                : "text-slate-400 hover:text-white"
                                }`}
                            style={mode === "image" ? { background: "linear-gradient(135deg, #2563EB, #06B6D4)" } : undefined}
                        >
                            📸 QR Inside Image
                        </button>
                    </div>

                    {/* Frame Mode: Design Gallery */}
                    {mode === "frame" && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Choose Your Design</label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {FRAMES.map((frame) => (
                                    <button
                                        key={frame.id}
                                        onClick={() => setSelectedFrame(frame.id)}
                                        className={`group relative rounded-2xl overflow-hidden transition-all duration-200 border-2 hover:scale-105 hover:shadow-lg ${selectedFrame === frame.id
                                            ? "border-cyan-500 shadow-lg shadow-cyan-500/20 scale-105"
                                            : "border-slate-700/50 hover:border-slate-500"
                                            }`}
                                    >
                                        <div className="aspect-square bg-white p-1">
                                            {designPreviews[frame.id] ? (
                                                <img src={designPreviews[frame.id]} alt={frame.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-cyan-500 rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`text-center py-1.5 text-[10px] font-semibold transition-colors ${selectedFrame === frame.id ? "bg-cyan-500 text-white" : "bg-slate-800 text-slate-400"
                                            }`}>
                                            {frame.name}
                                        </div>
                                        {selectedFrame === frame.id && (
                                            <div className="absolute top-1 right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center shadow-md">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Image Mode: Upload */}
                    {mode === "image" && (
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upload Your Image</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all p-8 text-center overlow-hidden group ${uploadedImage
                                    ? "border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_-10px_rgba(6,182,212,0.1)]"
                                    : "border-slate-700 bg-slate-900/40 hover:border-cyan-500/50 hover:bg-slate-900/60"
                                    }`}
                            >
                                {uploadedImage ? (
                                    <div className="flex items-center gap-4">
                                        <img src={uploadedImage} alt="Uploaded" className="w-16 h-16 rounded-xl object-cover border border-slate-700" />
                                        <div className="text-left flex-1">
                                            <p className="text-sm font-bold text-white truncate">{uploadedFileName}</p>
                                            <p className="text-xs text-slate-500 mt-1">Click to change image</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 relative z-10">
                                        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800/80 shadow-inner border border-slate-700/50 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-500/30 transition-all duration-300 relative">
                                            <div className="absolute inset-0 rounded-3xl bg-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <svg className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">Click to browse or drag image here</p>
                                            <p className="text-xs text-slate-500 mt-1">High quality PNG, JPG — your QR will be inside it</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    )}

                    {/* URL Input + Generate */}
                    <div className="space-y-3">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                </svg>
                            </div>
                            <input
                                id="url-input"
                                type="text"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full rounded-2xl pl-12 pr-5 py-4 text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                            />
                        </div>
                        <button
                            onClick={() => generateQRCode(url)}
                            className="w-full rounded-xl px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 relative overflow-hidden group"
                            style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}
                            disabled={!url || (mode === "image" && !uploadedImage) || (limitReached && !!url) || checkingLimit}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="relative z-10">
                                {limitReached && url ? "Upgrade Plan" : checkingLimit ? "Checking..." : mode === "image" ? "Generate QR Inside Image" : "Generate QR Code"}
                            </span>
                        </button>
                    </div>

                    {/* Result Area */}
                    <div className="flex min-h-[320px] w-full items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-700/50 bg-slate-900/40 p-6 transition-all relative overflow-hidden group-hover:border-slate-600">
                        {/* Subtle inner grid pattern for empty state */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                        {limitReached && url ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-8 text-center backdrop-blur-md z-20">
                                <div className="mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 p-4 text-white shadow-lg shadow-amber-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-7 w-7">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">Limit Reached</h3>
                                <p className="mt-2 mb-6 text-slate-400 text-sm">Upgrade for more QR codes.</p>
                                <button
                                    onClick={() => router.push("/subscription")}
                                    className="w-full max-w-xs rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-xl transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Upgrade Plan
                                </button>
                            </div>
                        ) : null}

                        {compositeUrl && !limitReached ? (
                            <div className="relative cursor-pointer overflow-hidden rounded-2xl bg-white p-3 shadow-2xl transition-all hover:scale-[1.02]">
                                <img
                                    src={compositeUrl}
                                    alt="Generated QR Code"
                                    className="h-56 w-56 object-contain"
                                    onClick={handleDownload}
                                />
                            </div>
                        ) : (
                            !limitReached && (
                                <div className="flex flex-col items-center text-center relative z-10">
                                    <div className="mb-6 rounded-3xl bg-slate-800/50 p-5 shadow-inner border border-slate-700/50 group-hover:border-cyan-500/30 transition-colors relative">
                                        <div className="absolute inset-0 rounded-3xl bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12 text-slate-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                                        </svg>
                                    </div>
                                    <p className="text-base font-bold text-white tracking-wide">Your QR Will Appear Here</p>
                                    <p className="text-sm text-slate-400 mt-2 max-w-[200px] leading-relaxed">
                                        {mode === "image" ? "Upload an image and enter a URL to craft your code" : "Select a frame, enter a destination, and hit generate"}
                                    </p>
                                </div>
                            )
                        )}
                    </div>

                    {/* Hidden canvas */}
                    <canvas ref={canvasRef} className="hidden" />

                    {compositeUrl && (
                        <button
                            onClick={handleDownload}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-950 shadow-xl transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 9.75l-4.5 4.5m0 0l4.5 4.5m-4.5-4.5h15" />
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
