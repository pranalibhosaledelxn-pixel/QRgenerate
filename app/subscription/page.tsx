"use client";

import React, { useState } from "react";
import { Check, Zap, Shield, Crown, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";

const plans = [
    {
        name: "Free", price: "0", description: "Perfect for testing and small projects.",
        features: ["3 QR Codes", "Standard PNG Export", "Basic Analytics", "Community Support"],
        icon: Zap, iconGrad: "linear-gradient(135deg, #6366f1, #818cf8)", iconGlow: "rgba(99,102,241,0.25)",
        buttonText: "Current Plan", id: "free",
    },
    {
        name: "Starter", price: "99", description: "Great for individuals and small projects.",
        features: ["20 QR Codes", "High-Res PNG & SVG Export", "Basic Analytics Dashboard", "Ad-Free Experience", "Priority Support"],
        icon: Shield, iconGrad: "linear-gradient(135deg, #06b6d4, #6366f1)", iconGlow: "rgba(6,182,212,0.25)",
        buttonText: "Get Starter", popular: true, id: "starter",
    },
    {
        name: "Pro", price: "199", description: "For creators and businesses who need power.",
        features: ["Unlimited QR Codes", "Dynamic QR Codes", "Custom Branding", "Advanced Analytics", "No Watermark", "24/7 Email Support"],
        icon: Crown, iconGrad: "linear-gradient(135deg, #f59e0b, #f97316)", iconGlow: "rgba(245,158,11,0.25)",
        buttonText: "Get Pro", id: "pro",
    },
];

export default function SubscriptionPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const userPlan = (session?.user as any)?.plan || "Free";

    const handleUpgrade = async (plan: typeof plans[0]) => {
        if (status === "unauthenticated") { router.push("/login"); return; }
        if (plan.name === "Free" || plan.name === userPlan) return;
        setLoading(plan.id);
        try {
            const res = await fetch("/api/razorpay/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: parseFloat(plan.price), currency: "INR" }) });
            const order = await res.json(); if (order.error) throw new Error(order.error);
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(Number(plan.price) * 100 * 83), currency: "INR",
                name: "QR MakeIt", description: `Upgrade to ${plan.name} Plan`, order_id: order.id,
                handler: async function (response: any) {
                    try {
                        const v = await fetch("/api/razorpay/verify", {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, planName: plan.name })
                        });
                        const vd = await v.json();
                        if (vd.success) { await update(); alert("Payment successful!"); window.location.reload(); }
                        else alert("Payment verification failed.");
                    } catch (e: any) { alert("Error: " + e.message); }
                },
                prefill: { name: session?.user?.name, email: session?.user?.email, contact: "9999999999" },
                readonly: { contact: true, email: true }, theme: { color: "#6366f1" },
            };
            new (window as any).Razorpay(options).open();
        } catch (e: any) { alert(e.message || "Failed to initiate payment"); } finally { setLoading(null); }
    };

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: "#f8f9fc" }}>
            {/* Soft blobs */}
            <div className="glow-blob w-[400px] h-[400px] top-[-10%] left-[20%] opacity-30"
                style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
            <div className="glow-blob w-[350px] h-[350px] bottom-0 right-[-5%] opacity-25"
                style={{ background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)", animationDelay: "2s" }} />

            <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" crossOrigin="anonymous" />

            <div className="relative z-10 max-w-5xl mx-auto space-y-10 animate-fade-up">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2"
                        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                        <Sparkles className="w-3.5 h-3.5" style={{ color: "#6366f1" }} />
                        <span className="text-xs font-semibold" style={{ color: "#6366f1" }}>Pricing Plans</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "#1a1d2b" }}>
                        Choose Your <span className="text-grad">Plan</span>
                    </h1>
                    <p className="text-sm max-w-md mx-auto" style={{ color: "#5b6178" }}>
                        Unlock the full potential of QR generation with features tailored to your needs.
                    </p>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    {plans.map((plan, i) => {
                        const isCurrent = userPlan.toLowerCase() === plan.name.toLowerCase();
                        const Icon = plan.icon;
                        return (
                            <div key={plan.name}
                                className="relative flex flex-col rounded-3xl card-hover animate-fade-up"
                                style={{
                                    background: "#ffffff",
                                    border: plan.popular ? "1px solid rgba(99,102,241,0.3)" : "1px solid #e8ebf0",
                                    boxShadow: plan.popular ? "0 0 0 1px rgba(99,102,241,0.05), 0 12px 36px -8px rgba(99,102,241,0.15)" : "var(--shadow-sm)",
                                    animationDelay: `${i * 80}ms`,
                                }}>
                                {plan.popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white whitespace-nowrap"
                                        style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", boxShadow: "0 4px 14px -4px rgba(99,102,241,0.4)" }}>
                                        ✦ Most Popular
                                    </div>
                                )}
                                {plan.popular && (
                                    <div className="absolute inset-0 rounded-3xl pointer-events-none"
                                        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.04) 0%, transparent 60%)" }} />
                                )}
                                <div className="p-6 flex flex-col flex-1 relative z-10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                                            style={{ background: plan.iconGrad, boxShadow: `0 4px 14px -4px ${plan.iconGlow}` }}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold" style={{ color: "#1a1d2b" }}>{plan.name}</h3>
                                            {isCurrent && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>Current</span>}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black" style={{ color: "#1a1d2b" }}>₹{plan.price}</span>
                                            <span className="text-sm" style={{ color: "#9ba3b8" }}>/mo</span>
                                        </div>
                                        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#5b6178" }}>{plan.description}</p>
                                    </div>
                                    <div className="h-px mb-4" style={{ background: "#e8ebf0" }} />
                                    <ul className="space-y-2.5 flex-grow mb-6">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.08)" }}>
                                                    <Check className="w-3 h-3" style={{ color: "#10b981" }} />
                                                </div>
                                                <span className="text-xs font-medium" style={{ color: "#5b6178" }}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={() => handleUpgrade(plan)} disabled={loading === plan.id || isCurrent}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5"
                                        style={isCurrent ? { background: "#f4f5f9", border: "1px solid #e8ebf0", color: "#9ba3b8" }
                                            : { background: plan.iconGrad, color: "#fff", boxShadow: `0 4px 14px -4px ${plan.iconGlow}` }}>
                                        {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                            isCurrent ? "Current Plan" : <>{plan.buttonText} <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="text-center text-xs" style={{ color: "#9ba3b8" }}>
                    All prices in INR. Payments secured by Razorpay. Cancel anytime.
                </p>
            </div>
        </div>
    );
}
