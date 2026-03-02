// Dummy Landing Page mimicking kita.sanchez.ph
import Link from "next/link";
import { ArrowRight, Github, MonitorPlay } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 flex flex-col selection:bg-primary selection:text-primary-foreground">
      {/* Navbar Outline */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-bold tracking-tighter">KITA</div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
          <Link href="#features" className="hover:text-white transition">Features</Link>
          <Link href="#lista" className="hover:text-white transition">LISTA</Link>
          <Link href="#suki" className="hover:text-white transition">SUKI</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-24 md:py-32 relative overflow-hidden">
        {/* Abstract Background details */}
        <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 blur-[100px] opacity-20 pointer-events-none">
          <div className="w-[800px] h-[600px] bg-gradient-to-tr from-blue-600 to-purple-800 rounded-full" />
        </div>

        <div className="inline-block px-3 py-1 mb-8 text-sm text-zinc-300 font-medium bg-zinc-900 border border-zinc-800 rounded-full shadow-sm">
          Introducing KITA version 0.1.0
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 mb-6">
          The Modern Toolkit for <br className="hidden md:block" /> Independent Stores.
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          KITA (Kiosk Inventory & Transaction Assistant) perfectly blends your point-of-sale operations with seamless full-stack inventory tracking.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/suki"
            className="flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full font-semibold hover:bg-zinc-200 transition focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-black"
          >
            Live Demo <ArrowRight size={18} />
          </Link>
          <a shrink-0
            href="https://github.com/your-username/kita" target="_blank" rel="noopener"
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-8 py-3.5 rounded-full font-medium hover:bg-zinc-800 transition"
          >
            <Github size={18} /> View Source
          </a>
          <a
            href="/download"
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-8 py-3.5 rounded-full font-medium hover:bg-zinc-800 transition"
          >
            <MonitorPlay size={18} /> Download for Windows
          </a>
        </div>
      </main>
    </div>
  );
}
