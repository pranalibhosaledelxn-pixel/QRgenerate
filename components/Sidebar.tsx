"use client";

<<<<<<< HEAD
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    QrCode,
    History,
    CreditCard,
    LogOut,
    ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
    { name: "Generate QR", icon: QrCode, href: "/", iconBg: "linear-gradient(135deg, #2563EB, #06B6D4)", iconColor: "#67E8F9" },
    { name: "My QRs", icon: History, href: "/my-qr", iconBg: "linear-gradient(135deg, #2563EB, #06B6D4)", iconColor: "#67E8F9" },
    { name: "Subscription", icon: CreditCard, href: "/subscription", iconBg: "linear-gradient(135deg, #2563EB, #06B6D4)", iconColor: "#67E8F9" },
];

export default function Sidebar() {
=======
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
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
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

<<<<<<< HEAD
    return (
        <aside
            className="fixed left-0 top-0 h-screen w-72 flex flex-col z-50"
            style={{
                background: "#111113",
                borderRight: "1px solid rgba(255,255,255,0.07)",
            }}
        >
            {/* Logo */}
            <div className="px-6 pt-7 pb-5">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                        style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        <QrCode className="text-white w-5 h-5" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2" style={{ borderColor: "#111113" }} />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white tracking-tight">
                            QR MakeIt
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                            Dashboard
                        </p>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* Navigation */}
            <nav className="flex-grow px-4 space-y-1 mt-5">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${isActive
                                ? "text-white"
                                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                }`}
                            style={isActive ? { background: "rgba(255,255,255,0.08)" } : undefined}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                                    style={{
                                        background: isActive ? item.iconBg : "rgba(255,255,255,0.04)",
                                    }}
                                >
                                    <Icon
                                        className="w-4 h-4"
                                        style={{ color: isActive ? "#fff" : item.iconColor }}
                                    />
                                </div>
                                <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                                    {item.name}
                                </span>
                            </div>
                            <ChevronRight
                                className={`w-3.5 h-3.5 transition-all duration-200 ${isActive
                                    ? "opacity-60 text-slate-400"
                                    : "opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0"
                                    }`}
                            />
                        </Link>
                    );
                })}
            </nav>

            {/* Divider */}
            <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* Logout */}
            <div className="px-4 py-2">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="group w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"
                >
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-500/10 transition-all"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                        <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>

            {/* User Profile */}
            <div className="px-5 py-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3">
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt={userName}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
                        />
                    ) : (
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-white/10"
                            style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}
                        >
                            <span className="text-white text-xs font-bold">{initials}</span>
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{userName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                    </div>
                </div>
            </div>
        </aside>
=======
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
>>>>>>> 93c556d6c13c2a80d55b288315725df1c7a18707
    );
}
