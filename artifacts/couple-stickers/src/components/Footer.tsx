import { motion } from "framer-motion";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="relative py-14 mt-4 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(12,28,38,0.8)",
          backdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(43,170,143,0.15)",
          boxShadow: "inset 0 1px 0 rgba(232,196,90,0.10)",
        }}
      />
      <div className="container max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <motion.span
            className="text-2xl font-bold tracking-tighter cursor-pointer"
            style={{ color: "hsl(43,80%,92%)" }}
            whileHover={{ opacity: 0.75 }}
          >
            <Link href="/">Ours. 💖</Link>
          </motion.span>
          <p className="mt-1 text-sm" style={{ color: "rgba(232,196,90,0.35)" }}>Premium couple stickers.</p>
        </div>
        <div className="flex gap-6 text-sm" style={{ color: "rgba(43,170,143,0.5)" }}>
          <a href="#" className="hover:text-[rgba(43,170,143,0.9)] transition-colors">Instagram</a>
          <a href="#" className="hover:text-[rgba(43,170,143,0.9)] transition-colors">TikTok</a>
          <Link href="/contact" className="hover:text-[rgba(43,170,143,0.9)] transition-colors cursor-pointer">Support</Link>
        </div>
        <p className="text-xs" style={{ color: "rgba(232,196,90,0.25)" }}>© 2026 Ours. All rights reserved.</p>
      </div>
    </footer>
  );
}
