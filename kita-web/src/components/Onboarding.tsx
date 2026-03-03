"use client";

import { useStore } from "@/store";
import { useRouter } from "next/navigation";
import { Server, MonitorSmartphone, ArrowRight } from "lucide-react";

export default function Onboarding() {
    const { setMode, isOfflineMode } = useStore();
    const router = useRouter();

    const handleSelect = (offline: boolean) => {
        setMode(offline);
        router.push("/login");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-3xl w-full flex flex-col items-center space-y-8">

                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-white">
                        KITA Setup
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-lg">
                        Choose how you want to connect your KITA workspace. This defines where your inventory and sales data is stored and retrieved.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <button
                        onClick={() => handleSelect(true)}
                        className={`group p-8 rounded-2xl border transition-all text-left flex flex-col gap-4 relative overflow-hidden ${isOfflineMode ? 'border-primary bg-zinc-900' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'}`}
                    >
                        <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 group-hover:scale-110 transition-transform">
                            <MonitorSmartphone size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Run KITA Locally</h2>
                            <p className="text-sm text-zinc-400">Perfect for single-store offline setups. Connects to embedded database (RocksDB).</p>
                        </div>
                        <ArrowRight className="absolute bottom-8 right-8 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>

                    <button
                        onClick={() => handleSelect(false)}
                        className={`group p-8 rounded-2xl border transition-all text-left flex flex-col gap-4 relative overflow-hidden ${!isOfflineMode ? 'border-primary bg-zinc-900' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'}`}
                    >
                        <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 group-hover:scale-110 transition-transform">
                            <Server size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Connect to Cloud SaaS</h2>
                            <p className="text-sm text-zinc-400">Best for multi-branch or remote team workspaces. Syncs data securely across devices.</p>
                        </div>
                        <ArrowRight className="absolute bottom-8 right-8 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>
                </div>
            </div>
        </div>
    );
}
