"use client";

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
    );
}
