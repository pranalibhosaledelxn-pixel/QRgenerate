"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    QrCode,
    History,
    CreditCard,
    LogOut,
    ChevronRight
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
    { name: "Generate QR", icon: QrCode, href: "/" },
    { name: "My QRs", icon: History, href: "/my-qr" },
    { name: "Subscription", icon: CreditCard, href: "/subscription" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-950 border-r border-slate-800 flex flex-col z-50">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <QrCode className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            QR Genius
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                            Dashboard
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-grow px-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${isActive
                                ? "bg-white/10 text-white"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "group-hover:text-blue-400"}`} />
                                <span className="font-medium">{item.name}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-slate-900 bg-slate-950/50">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
