"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AddStorePage() {
    const router = useRouter();
    const { data: session } = useSession();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedQr, setGeneratedQr] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setGeneratedQr("");

        try {
            const res = await fetch("/api/stores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, address }),
            });

            const data = await res.json();

            if (res.ok) {
                // Success! Show QR Code
                setGeneratedQr(data.store.qrCode);
            } else {
                setError(data.message || "Failed to create store");
            }
        } catch (err) {
            setError("An error occurred while creating the store.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (generatedQr) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl text-center">
                    <h1 className="text-2xl font-bold text-green-600 mb-4">Store Created!</h1>
                    <p className="text-gray-600 mb-6">Here is the QR Code for <strong>{name}</strong></p>

                    <div className="flex justify-center mb-6">
                        <img src={generatedQr} alt="Store QR Code" className="w-64 h-64 border rounded-xl" />
                    </div>

                    <button
                        onClick={() => {
                            setGeneratedQr("");
                            setName("");
                            setDescription("");
                            setAddress("");
                        }}
                        className="w-full rounded-xl bg-black px-4 py-3 text-white font-semibold hover:bg-gray-800 transition-all"
                    >
                        Add Another Store
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="mt-3 w-full text-sm text-gray-500 hover:text-black"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Add New Store</h1>
                    <p className="text-sm text-gray-500">Enter store details to generate a QR Code</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                            placeholder="My Awesome Store"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                            placeholder="Best place for..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                            placeholder="123 Main St, City"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-all mt-4"
                    >
                        {loading ? "Creating..." : "Create Store & Generate QR"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="w-full text-center text-sm text-gray-500 hover:text-black mt-2"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
