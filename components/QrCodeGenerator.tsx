"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { signOut } from "next-auth/react";

export default function QrCodeGenerator() {
    const [url, setUrl] = useState<string>("");
    const [qrCodeData, setQrCodeData] = useState<string>("");
    const [error, setError] = useState<string>("");

    const generateQRCode = async (text: string) => {
        try {
            if (!text) {
                setQrCodeData("");
                return;
            }
            const data = await QRCode.toDataURL(text, {
                width: 400,
                margin: 2,
                color: {
                    dark: "#1f2937", // Gray-800
                    light: "#ffffff",
                },
            });
            setQrCodeData(data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to generate QR code");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            generateQRCode(url);
        }, 300);
        return () => clearTimeout(timer);
    }, [url]);

    const handleDownload = () => {
        if (!qrCodeData) return;
        const link = document.createElement("a");
        link.download = "qrcode.png";
        link.href = qrCodeData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans relative">
            <button
                onClick={() => signOut()}
                className="absolute top-4 right-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
                Sign Out
            </button>

            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5 transition-all">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        QR Code Generator
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Enter a URL below to generate your QR code instantly.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="url-input" className="sr-only">
                            URL
                        </label>
                        <input
                            id="url-input"
                            type="text"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-900 placeholder-gray-400 outline-none ring-offset-2 transition-all focus:border-black focus:bg-white focus:ring-2 focus:ring-black/5"
                        />
                    </div>

                    <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 transition-all">
                        {qrCodeData ? (
                            <div className="group relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 transition-all hover:scale-[1.02] hover:shadow-md">
                                <img
                                    src={qrCodeData}
                                    alt="Generated QR Code"
                                    className="h-64 w-64 object-contain"
                                    onClick={handleDownload}
                                />
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/5 group-hover:opacity-100"
                                    onClick={handleDownload}
                                    title="Download QR Code"
                                >
                                    <span className="sr-only">Download</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center text-gray-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="mb-3 h-12 w-12"
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
                                <p className="text-sm font-medium">No link entered yet</p>
                            </div>
                        )}
                    </div>

                    {qrCodeData && (
                        <button
                            onClick={handleDownload}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black active:scale-[0.98]"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 9.75l-4.5 4.5m0 0l4.5 4.5m-4.5-4.5h15"
                                />
                            </svg>
                            Download QR Code
                        </button>
                    )}

                    {error && (
                        <div className="rounded-lg bg-red-50 p-4 text-center">
                            <p className="text-sm font-medium text-red-600">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
