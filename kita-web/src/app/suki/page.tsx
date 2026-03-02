"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, CreditCard, Trash2, Plus, Minus } from "lucide-react";
import { useStore } from "@/store";

interface Item {
    id: string;
    name: string;
    price: number;
    stock: number;
}

interface CartLine {
    item: Item;
    qty: number;
}

export default function SukiPage() {
    const router = useRouter();
    const { apiBaseUrl, token } = useStore();

    const [items, setItems] = useState<Item[]>([]);
    const [cart, setCart] = useState<CartLine[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
    const [receipt, setReceipt] = useState<{ transaction_id: string; total_amount: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        if (!token) { router.push("/login"); return; }
        setLoading(true);
        try {
            const res = await fetch(`${apiBaseUrl}/api/lista/items`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) { router.push("/login"); return; }
            setItems(await res.json());
        } catch {
            setError("Failed to load items");
        } finally {
            setLoading(false);
        }
    }, [apiBaseUrl, token, router]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    function addToCart(item: Item) {
        setCart((prev) => {
            const existing = prev.find((l) => l.item.id === item.id);
            if (existing) {
                return prev.map((l) =>
                    l.item.id === item.id && l.qty < item.stock
                        ? { ...l, qty: l.qty + 1 }
                        : l
                );
            }
            return [...prev, { item, qty: 1 }];
        });
    }

    function updateQty(itemId: string, delta: number) {
        setCart((prev) =>
            prev
                .map((l) => l.item.id === itemId ? { ...l, qty: l.qty + delta } : l)
                .filter((l) => l.qty > 0)
        );
    }

    const total = cart.reduce((sum, l) => sum + l.item.price * l.qty, 0);
    const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

    async function handleCheckout() {
        if (cart.length === 0) return;
        setCheckingOut(true);
        setError(null);
        try {
            const res = await fetch(`${apiBaseUrl}/api/suki/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cart.map((l) => ({ id: l.item.id, qty: l.qty })),
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setReceipt(data);
            setCart([]);
            fetchItems(); // refresh stock
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Checkout failed");
        } finally {
            setCheckingOut(false);
        }
    }

    return (
        <div className="flex h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans">

            {/* Left Pane: Items Grid */}
            <section className="flex-[2] flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e]">

                <header className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black tracking-tight">SUKI</h1>
                        <span className="text-xs font-semibold px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded text-zinc-500">POS</span>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-300 dark:border-zinc-800 rounded-md bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition shadow-sm"
                        />
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4">
                    {error && (
                        <div className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-zinc-400">Loading items...</div>
                    ) : (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filtered.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    disabled={item.stock === 0}
                                    className="aspect-square flex flex-col justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-400 hover:ring-1 hover:ring-zinc-900 dark:hover:ring-zinc-400 transition shadow-sm text-left group active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <div className="flex-1 flex flex-col justify-end">
                                        <div className="text-sm font-bold leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2">
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1">{item.stock} in stock</div>
                                    </div>
                                    <div className="text-sm font-black mt-2 bg-zinc-100 dark:bg-zinc-950 inline-block px-2 py-1 rounded w-fit">
                                        ₱{item.price.toFixed(2)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </main>
            </section>

            {/* Right Pane: Cart */}
            <section className="flex-1 flex flex-col bg-zinc-50 dark:bg-[#111113] min-w-[340px]">

                <header className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-medium">
                        <ShoppingCart size={18} />
                        <span>Current Order</span>
                        {cart.length > 0 && (
                            <span className="bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                {cart.reduce((s, l) => s + l.qty, 0)}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setCart([])}
                        className="text-xs text-zinc-500 hover:text-red-500 transition font-medium"
                    >
                        Clear All
                    </button>
                </header>

                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {receipt && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm">
                            <div className="font-bold text-green-700 dark:text-green-400 mb-1">✓ Transaction complete!</div>
                            <div className="text-zinc-500 text-xs">ID: {receipt.transaction_id}</div>
                            <div className="text-zinc-500 text-xs">Total: ₱{receipt.total_amount.toFixed(2)}</div>
                            <button onClick={() => setReceipt(null)} className="mt-2 text-xs text-zinc-400 hover:text-zinc-600 underline">
                                Dismiss
                            </button>
                        </div>
                    )}

                    {cart.length === 0 && !receipt ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-sm">
                            <ShoppingCart size={32} className="mb-3 opacity-30" />
                            <p>Cart is empty</p>
                            <p className="text-xs mt-1">Tap items to add them</p>
                        </div>
                    ) : (
                        cart.map((line) => (
                            <div
                                key={line.item.id}
                                className="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate">{line.item.name}</div>
                                    <div className="text-xs text-zinc-500">₱{line.item.price.toFixed(2)} each</div>
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                    <button
                                        onClick={() => updateQty(line.item.id, -1)}
                                        className="w-7 h-7 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="text-sm font-bold w-6 text-center">{line.qty}</span>
                                    <button
                                        onClick={() => updateQty(line.item.id, 1)}
                                        disabled={line.qty >= line.item.stock}
                                        className="w-7 h-7 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40"
                                    >
                                        <Plus size={12} />
                                    </button>
                                    <button
                                        onClick={() => setCart((p) => p.filter((l) => l.item.id !== line.item.id))}
                                        className="ml-1 text-zinc-400 hover:text-red-500 transition"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="font-bold font-mono ml-4 text-sm">
                                    ₱{(line.item.price * line.qty).toFixed(2)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <footer className="p-4 bg-white dark:bg-[#0c0c0e] border-t border-zinc-200 dark:border-zinc-800">
                    <div className="space-y-2 mb-6 text-sm">
                        <div className="flex justify-between text-zinc-500">
                            <span>Subtotal</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-500">
                            <span>Tax (0%)</span>
                            <span>₱0.00</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <span>Total</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || checkingOut}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CreditCard size={20} />
                        {checkingOut ? "Processing..." : `Charge ₱${total.toFixed(2)}`}
                    </button>
                </footer>
            </section>
        </div>
    );
}
