"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const isAuthPage = pathname === "/login";
    const showSidebar = session && !isAuthPage;

    if (status === "loading" && !isAuthPage) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {showSidebar && <Sidebar />}
            <main className={`transition-all duration-300 ${showSidebar ? "pl-72" : ""}`}>
                <div className={showSidebar ? "p-8 max-w-7xl mx-auto" : ""}>
                    {children}
                </div>
            </main>
        </div>
    );
}
