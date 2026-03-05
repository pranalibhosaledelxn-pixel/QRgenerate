"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, QrCode } from "lucide-react";
import Sidebar from "./Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isAuthPage = pathname === "/login";
    const showSidebar = session && !isAuthPage;

    if (status === "loading" && !isAuthPage) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f9fc" }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                        <div
                            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-slow"
                            style={{ borderTopColor: "#6366f1", borderRightColor: "rgba(99,102,241,0.2)" }}
                        />
                        <div
                            className="absolute inset-2 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(99,102,241,0.08)" }}
                        >
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#6366f1" }} />
                        </div>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#9ba3b8" }}>Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "#f8f9fc" }}>
            {showSidebar && (
                <>
                    <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                    {/* Mobile top bar */}
                    <header
                        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden"
                        style={{
                            background: "rgba(248,249,252,0.9)",
                            backdropFilter: "blur(12px)",
                            borderBottom: "1px solid #e8ebf0",
                        }}
                    >
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-xl transition-colors hover:bg-gray-100"
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5" style={{ color: "#1a1d2b" }} />
                        </button>

                        <div className="flex items-center gap-2">
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}
                            >
                                <QrCode className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                            </div>
                            <span className="text-sm font-semibold" style={{ color: "#1a1d2b" }}>
                                QR MakeIt
                            </span>
                        </div>

                        {/* Spacer to balance hamburger */}
                        <div className="w-9" />
                    </header>
                </>
            )}

            <main
                className="transition-all duration-300"
                style={{ paddingLeft: showSidebar ? undefined : "0" }}
            >
                {/* On desktop: offset for sidebar. On mobile: offset for top bar */}
                <div
                    className={
                        showSidebar
                            ? "lg:pl-[260px] pt-[60px] lg:pt-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
                            : ""
                    }
                >
                    {children}
                </div>
            </main>
        </div>
    );
}
