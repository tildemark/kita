"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { apiBaseUrl, setToken } = useStore();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Login failed");
            }

            const data = await res.json();
            setToken(data.token);
            router.push("/lista");
        } catch (err: unknown) {
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                setError(`Connection refused. Is the server running at ${apiBaseUrl}?`);
            } else {
                setError(err instanceof Error ? err.message : "Login failed");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-1">KITA</h1>
                    <p className="text-zinc-500 text-sm">Kiosk Inventory &amp; Transaction Assistant</p>
                </div>

                {/* Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl shadow-black/50">
                    <h2 className="text-lg font-semibold text-white mb-6">Sign in to your store</h2>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin"
                                required
                                autoFocus
                                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            <LogIn size={16} />
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-zinc-600 mt-6">
                    Default dev credentials: <span className="text-zinc-400">admin / admin123</span>
                </p>
            </div>
        </div>
    );
}
