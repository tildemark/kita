"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, X, RefreshCw } from "lucide-react";
import { useStore } from "@/store";

interface Item {
    id: string;
    name: string;
    price: number;
    stock: number;
}

export default function ListaPage() {
    const router = useRouter();
    const { apiBaseUrl, token } = useStore();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", price: "", stock: "" });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchItems() {
        if (!token) { router.push("/login"); return; }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${apiBaseUrl}/api/lista/items`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) { router.push("/login"); return; }
            if (!res.ok) throw new Error("Failed to load items");
            setItems(await res.json());
        } catch (e: unknown) {
            if (e instanceof TypeError && e.message.includes('Failed to fetch')) {
                setError(`Connection refused. Could not load items from ${apiBaseUrl}`);
            } else {
                setError(e instanceof Error ? e.message : "Error loading items");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchItems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch(`${apiBaseUrl}/api/lista/items`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock, 10),
                }),
            });
            if (!res.ok) throw new Error("Failed to create item");
            setShowModal(false);
            setFormData({ name: "", price: "", stock: "" });
            fetchItems();
        } catch (e: unknown) {
            if (e instanceof TypeError && e.message.includes('Failed to fetch')) {
                setError(`Connection refused. Could not save item to ${apiBaseUrl}`);
            } else {
                setError(e instanceof Error ? e.message : "Error creating item");
            }
        } finally {
            setCreating(false);
        }
    }

    const filtered = items.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-950 p-8 dark:bg-zinc-950 dark:text-zinc-50">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">LISTA</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Inventory Management &amp; Sales Ledger</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/suki" className="text-sm font-medium hover:underline text-zinc-600 dark:text-zinc-300">
                            Go to SUKI (POS)
                        </Link>
                        <button
                            onClick={fetchItems}
                            className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-sm"
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition"
                        >
                            <Plus size={16} /> Add Item
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <main className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition"
                            />
                        </div>
                        <button className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                            <Filter size={16} /> Filter
                        </button>
                    </div>

                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Item Name</th>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Stock</th>
                                    <th className="px-6 py-3">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                                            Loading items...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                                            No items found. Add your first item!
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition">
                                            <td className="px-6 py-4 font-medium">{item.name}</td>
                                            <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{item.id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.stock < 10 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                                                    {item.stock} in stock
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">₱{item.price.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* Add Item Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-semibold">Add New Item</h2>
                            <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Coke 1.5L"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Price (₱)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="55.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        placeholder="100"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 transition"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                            >
                                {creating ? "Adding..." : "Add Item"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
