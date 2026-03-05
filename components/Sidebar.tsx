"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
    QrCode,
    LayoutGrid,
    CreditCard,
    LogOut,
    Search,
    ChevronUp,
    Sparkles,
    X,
} from "lucide-react";

const menuItems = [
    { name: "Generate QR", icon: QrCode, href: "/" },
    { name: "My QR Codes", icon: LayoutGrid, href: "/my-qr" },
    { name: "Subscription", icon: CreditCard, href: "/subscription" },
];

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const userName = session?.user?.name || "User";
    const userEmail = session?.user?.email || "";
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        if (onClose) onClose();
    }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {/* Backdrop overlay for mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 h-screen w-[260px] flex flex-col z-50
                    transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
                style={{
                    background: "#ffffff",
                    borderRight: "1px solid #e8ebf0",
                }}
            >
                {/* ── Brand Header ─────────────────────────────── */}
                <div
                    className="px-5 py-5 flex items-center justify-between"
                    style={{ borderBottom: "1px solid #e8ebf0" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                                background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                                boxShadow: "0 2px 10px -2px rgba(99,102,241,0.35)",
                            }}
                        >
                            <QrCode className="w-[18px] h-[18px] text-white" strokeWidth={2} />
                        </div>
                        <div className="leading-tight">
                            <p className="text-[14px] font-semibold tracking-tight" style={{ color: "#1a1d2b" }}>
                                QR MakeIt
                            </p>
                            <p className="text-[11px]" style={{ color: "#9ba3b8" }}>Dashboard</p>
                        </div>
                    </div>

                    {/* Close button on mobile, chevron on desktop */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 rounded-lg transition-colors hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" style={{ color: "#9ba3b8" }} />
                    </button>
                    <ChevronUp
                        className="w-4 h-4 shrink-0 cursor-pointer hover:opacity-70 transition-opacity hidden lg:block"
                        style={{ color: "#9ba3b8" }}
                    />
                </div>

                {/* ── Search ────────────────────────────────────── */}
                <div className="px-4 pt-4 pb-2">
                    <div
                        className="flex items-center gap-2.5 px-3 py-[9px] rounded-xl transition-colors cursor-pointer"
                        style={{
                            background: "#f4f5f9",
                            border: "1px solid #e8ebf0",
                        }}
                    >
                        <Search className="w-[15px] h-[15px] shrink-0" style={{ color: "#9ba3b8" }} />
                        <span className="text-[13px] flex-1" style={{ color: "#9ba3b8" }}>Search…</span>
                        <kbd
                            className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold leading-none hidden sm:inline"
                            style={{
                                background: "#ffffff",
                                color: "#9ba3b8",
                                border: "1px solid #e8ebf0",
                            }}
                        >
                            ⌘ K
                        </kbd>
                    </div>
                </div>

                {/* ── Navigation ────────────────────────────────── */}
                <nav className="flex-1 px-3 pt-3 overflow-y-auto">
                    <p
                        className="text-[10px] uppercase tracking-[0.1em] font-semibold px-3 mb-2.5"
                        style={{ color: "#9ba3b8" }}
                    >
                        Navigation
                    </p>

                    <div className="space-y-0.5">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center gap-3 px-3 py-[10px] rounded-xl transition-all duration-150"
                                    style={{
                                        background: isActive ? "rgba(99,102,241,0.08)" : "transparent",
                                        color: isActive ? "#6366f1" : "#5b6178",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget as HTMLElement).style.background = "#f4f5f9";
                                            (e.currentTarget as HTMLElement).style.color = "#1a1d2b";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            (e.currentTarget as HTMLElement).style.background = "transparent";
                                            (e.currentTarget as HTMLElement).style.color = "#5b6178";
                                        }
                                    }}
                                >
                                    <Icon
                                        className="w-[18px] h-[18px] shrink-0"
                                        strokeWidth={isActive ? 2 : 1.6}
                                    />
                                    <span className={`text-[13px] ${isActive ? "font-semibold" : "font-medium"}`}>
                                        {item.name}
                                    </span>
                                    {isActive && (
                                        <div
                                            className="ml-auto w-1.5 h-1.5 rounded-full"
                                            style={{ background: "#6366f1" }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Upgrade card ───────────────────────────── */}
                    <div className="mt-6 mb-2">
                        <p
                            className="text-[10px] uppercase tracking-[0.1em] font-semibold px-3 mb-2.5"
                            style={{ color: "#9ba3b8" }}
                        >
                            Upgrade
                        </p>
                        <Link
                            href="/subscription"
                            className="block rounded-xl px-4 py-3.5 transition-all duration-150 hover:shadow-md"
                            style={{
                                background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(6,182,212,0.04))",
                                border: "1px solid rgba(99,102,241,0.15)",
                                textDecoration: "none",
                            }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                                <span className="text-xs font-bold" style={{ color: "#1a1d2b" }}>Go Pro</span>
                            </div>
                            <p className="text-[11px] leading-relaxed" style={{ color: "#5b6178" }}>
                                Unlimited QRs & custom branding
                            </p>
                        </Link>
                    </div>
                </nav>

                {/* ── Sign Out ──────────────────────────────────── */}
                <div className="px-3 py-2" style={{ borderTop: "1px solid #e8ebf0" }}>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="group w-full flex items-center gap-3 px-3 py-[10px] rounded-xl transition-all duration-150"
                        style={{ color: "#5b6178" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(244,63,94,0.06)";
                            (e.currentTarget as HTMLElement).style.color = "#f43f5e";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#5b6178";
                        }}
                    >
                        <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.6} />
                        <span className="text-[13px] font-medium">Sign Out</span>
                    </button>
                </div>

                {/* ── User Profile ──────────────────────────────── */}
                <div
                    className="px-4 py-4"
                    style={{ borderTop: "1px solid #e8ebf0", background: "#fafbfd" }}
                >
                    <div className="flex items-center gap-3">
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt={userName}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                                style={{ boxShadow: "0 0 0 2px rgba(99,102,241,0.2)" }}
                            />
                        ) : (
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    boxShadow: "0 0 0 2px rgba(99,102,241,0.2)",
                                }}
                            >
                                <span className="text-white text-[11px] font-bold">{initials}</span>
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold truncate" style={{ color: "#1a1d2b" }}>{userName}</p>
                            <p className="text-[11px] truncate" style={{ color: "#9ba3b8" }}>{userEmail}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
