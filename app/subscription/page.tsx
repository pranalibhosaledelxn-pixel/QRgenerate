"use client";

import React, { useState } from "react";
import { Check, Zap, Shield, Crown, Gem, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";

const plans = [
    {
        name: "Free",
        price: "0",
        description: "Perfect for testing and small projects.",
        features: [
            "3 Single QR Codes",
            "Standard SVG/PNG Export",
            "Basic Analytics",
            "Community Support",
        ],
        icon: <Zap className="w-6 h-6 text-blue-400" />,
        buttonText: "Current Plan",
        id: "free",
    },
    {
        name: "Starter",
        price: "99",
        description: "Great for individuals and small projects.",
        features: [
            "20 QR Codes",
            "High-Res PNG & SVG Export",
            "Basic Analytics Dashboard",
            "Ad-Free Experience",
            "QrEats Watermark",
        ],
        icon: <Shield className="w-6 h-6 text-cyan-400" />,
        buttonText: "Upgrade to Starter",
        popular: true,
        id: "starter",
    },
    // {
    //     name: "Premium",
    //     price: "1000",
    //     description: "Advanced tools for high-end creators.",
    //     features: [
    //         "Everything in Pro",
    //         "4K High-Res Exports",
    //         "Advanced Customization",
    //         "Bulk Style Editor",
    //         "24/7 Email Support",
    //     ],
    //     icon: <Gem className="w-6 h-6 text-pink-400" />,
    //     buttonText: "Upgrade to Premium",
    //     id: "premium",
    // },
    {
        name: "Pro",
        price: "199",
        description: "For creators and businesses who need more power.",
        features: [
            "Unlimited QR Codes",
            "Dynamic QR Codes",
            "Custom Branding",
            "Advanced Analytics",
            "No Watermark",
        ],
        icon: <Crown className="w-6 h-6 text-yellow-400" />,
        buttonText: "Upgrade to Pro",
        id: "pro",
    },
];

export default function SubscriptionPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const userPlan = (session?.user as any)?.plan || "Free";

    const handleUpgrade = async (plan: typeof plans[0]) => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (plan.name === "Free" || plan.name === userPlan) return;

        setLoading(plan.id);

        try {
            // 1. Create Order
            const res = await fetch("/api/razorpay/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(plan.price),
                    currency: "INR",
                }),
            });

            const order = await res.json();

            if (order.error) throw new Error(order.error);

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(Number(plan.price) * 100 * 83), // Convert USD to INR precisely at 83 conversion
                currency: "INR",
                name: "QR MakeIt",
                description: `Upgrade to ${plan.name} Plan`,
                order_id: order.id,
                handler: async function (response: any) {
                    console.log("[RAZORPAY] Handler triggered. Response:", response);

                    try {
                        console.log("[RAZORPAY] Initiating verification API call...");
                        // 3. Verify Payment
                        const verifyRes = await fetch("/api/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planName: plan.name,
                            }),
                        });

                        console.log("[RAZORPAY] Verify API status:", verifyRes.status);
                        const verifyData = await verifyRes.json();
                        console.log("[RAZORPAY] Verify API data:", verifyData);

                        if (verifyData.success) {
                            await update(); // Update session
                            alert("Payment successful! Your plan has been upgraded.");
                            window.location.reload(); // Refresh session properly
                        } else {
                            alert("Payment verification failed.");
                        }
                    } catch (handlerErr: any) {
                        console.error("[RAZORPAY] Error in handler logic:", handlerErr);
                        alert("An error occurred after payment: " + handlerErr.message);
                    }
                },
                prefill: {
                    name: session?.user?.name,
                    email: session?.user?.email,
                    contact: "9999999999", // Mandatory to bypass the contact info screen
                },
                readonly: {
                    contact: true,
                    email: true,
                },
                theme: {
                    color: "#a855f7",
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (error: any) {
            console.error("Upgrade Error:", error);
            alert(error.message || "Failed to initiate payment");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen text-white p-8 relative overflow-hidden" style={{ background: "#09090b" }}>
            {/* Animated ambient glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30 animate-blob pointer-events-none" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(0,0,0,0) 70%)", filter: "blur(60px)" }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 animate-blob pointer-events-none" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(0,0,0,0) 70%)", filter: "blur(60px)", animationDelay: "2s" }} />

            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
                crossOrigin="anonymous"
            />
            <div className="max-w-5xl mx-auto space-y-10 relative z-10">
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
                        Choose Your Plan
                    </h1>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                        Unlock the full potential of high-quality QR generation with features tailored to your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {plans
                        .map((plan) => {
                            const isCurrent = userPlan.toLowerCase() === plan.name.toLowerCase();
                            return (
                                <div
                                    key={plan.name}
                                    className="relative flex flex-col rounded-3xl transition-all duration-300 glass-panel border border-slate-800/80 hover:-translate-y-1 hover:border-cyan-500/30 hover:z-10 hover:shadow-[0_10px_30px_-10px_rgba(6,182,212,0.15)]"
                                    style={{
                                        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.3)",
                                    }}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap shadow-lg shadow-cyan-500/20"
                                            style={{ background: "linear-gradient(135deg, #06B6D4, #3B82F6)" }}
                                        >
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                                                {plan.icon}
                                            </div>
                                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-extrabold text-white">₹{plan.price}</span>
                                                <span className="text-slate-600 text-sm">/month</span>
                                            </div>
                                            <p className="text-slate-500 text-xs mt-1.5">{plan.description}</p>
                                        </div>

                                        <div className="h-px my-2" style={{ background: "rgba(255,255,255,0.06)" }} />

                                        <ul className="space-y-3 my-4 flex-grow">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-center gap-3 text-xs text-slate-400">
                                                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(52,211,153,0.1)" }}>
                                                        <Check className="w-3 h-3 text-emerald-400" />
                                                    </div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleUpgrade(plan)}
                                            disabled={loading === plan.id || isCurrent}
                                            className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${isCurrent
                                                ? "text-slate-500 cursor-default"
                                                : "text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                                } ${loading === plan.id ? "opacity-70 cursor-wait" : ""}`}
                                            style={{
                                                background: isCurrent
                                                    ? "rgba(255,255,255,0.04)"
                                                    : plan.popular ? "linear-gradient(135deg, #06B6D4, #3B82F6)" : "linear-gradient(135deg, #2563EB, #06B6D4)",
                                                border: isCurrent
                                                    ? "1px solid rgba(255,255,255,0.06)"
                                                    : "none",
                                            }}
                                        >
                                            {!isCurrent && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />}
                                            <span className="relative z-10 flex items-center gap-2">
                                                {loading === plan.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : isCurrent ? (
                                                    "Current Plan"
                                                ) : (
                                                    plan.buttonText
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
