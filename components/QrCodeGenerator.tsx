"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
<<<<<<< HEAD

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
=======
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
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
    if (row >= totalModules - size && col < size) return true;
    return false;
}

<<<<<<< HEAD
// Check alignment pattern area (5×5 centered on alignment coords)
function isAlignmentZone(row: number, col: number, moduleCount: number): boolean {
    // Alignment pattern positions depend on QR version
    // For simplicity, check the standard position for common versions
    const alignPos = getAlignmentPositions(moduleCount);
    for (const ar of alignPos) {
        for (const ac of alignPos) {
            // Skip if overlapping with finder
=======
function isAlignmentZone(row: number, col: number, moduleCount: number): boolean {
    const alignPos = getAlignmentPositions(moduleCount);
    for (const ar of alignPos) {
        for (const ac of alignPos) {
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
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
<<<<<<< HEAD
    // Standard alignment positions per version (simplified lookup)
=======
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
    const table: Record<number, number[]> = {
        2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
        6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46],
        10: [6, 28, 50], 11: [6, 30, 54], 12: [6, 32, 58],
    };
    return table[version] || [];
}

<<<<<<< HEAD
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
=======
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
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
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
<<<<<<< HEAD

    // Image QR state
    const [uploadedImage, setUploadedImage] = useState<string>("");
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [mode, setMode] = useState<"frame" | "image">("frame");

=======
    const [uploadedImage, setUploadedImage] = useState<string>("");
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [mode, setMode] = useState<"frame" | "image">("frame");
    const [generating, setGenerating] = useState(false);
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
<<<<<<< HEAD
        const fetchUserData = async () => {
=======
        (async () => {
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
            try {
                const res = await fetch("/api/my-qrs");
                const data = await res.json();
                if (res.ok) {
                    setQrCount(data.count || 0);
                    setIsPremium(data.isPremium);
                    setQrLimit(data.qrLimit ?? 3);
<<<<<<< HEAD
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
=======
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
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
    }, []);

    const generateFramePreview = (qrDataUrl: string, frame: typeof FRAMES[0]): Promise<string> => {
        return new Promise((resolve) => {
<<<<<<< HEAD
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
=======
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
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
                        resolve(canvas.toDataURL("image/png"));
                    };
                    frameImg.src = frame.src;
                }
            };
            qrImg.src = qrDataUrl;
        });
    };

<<<<<<< HEAD
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
=======
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
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
                    };
                    frameImg.src = frame!.src;
                }
            };
            qrImg.src = qrDataUrl;
        });
    }, []);

<<<<<<< HEAD
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
=======
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
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
    };

    const generateQRCode = async (text: string) => {
        try {
<<<<<<< HEAD
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
=======
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
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                                        </svg>
                                    </div>
<<<<<<< HEAD
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
=======
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
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
                </div>
            </div>
        </div>
    );
}
