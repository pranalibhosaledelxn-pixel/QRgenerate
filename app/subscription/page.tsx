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
        icon: <Shield className="w-6 h-6 text-purple-400" />,
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
                amount: order.amount,
                currency: order.currency,
                name: "QR Genius",
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
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
                crossOrigin="anonymous"
            />
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Choose Your Plan
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Unlock the full potential of high-quality QR generation with features
                        tailored to your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans
                        .map((plan) => {
                            const isCurrent = userPlan.toLowerCase() === plan.name.toLowerCase();
                            return (
                                <div
                                    key={plan.name}
                                    className={`relative flex flex-col p-6 rounded-3xl border transition-all duration-300 hover:scale-105 ${plan.popular
                                        ? "bg-slate-900/50 border-purple-500/50 shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)]"
                                        : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                                        } backdrop-blur-xl`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold uppercase tracking-wider">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-6 p-3 w-fit rounded-2xl bg-white/5 border border-white/10">
                                        {plan.icon}
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <h3 className="text-xl font-bold">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold">₹{plan.price}</span>
                                            <span className="text-slate-500 text-sm">/month</span>
                                        </div>
                                        <p className="text-slate-400 text-xs leading-relaxed">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-grow">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2 text-xs text-slate-300">
                                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleUpgrade(plan)}
                                        disabled={loading === plan.id || isCurrent}
                                        className={`w-full py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${isCurrent
                                            ? "bg-slate-800 text-slate-400 cursor-default"
                                            : plan.popular
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)] active:scale-95"
                                                : "bg-white text-slate-950 hover:bg-slate-200 active:scale-95"
                                            } ${loading === plan.id ? "opacity-70 cursor-wait" : ""}`}
                                    >
                                        {loading === plan.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isCurrent ? (
                                            "Current Plan"
                                        ) : (
                                            plan.buttonText
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
