import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative py-14 mt-4 overflow-hidden">
      {/* Glass bar */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
        }}
      />
      <div className="container max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <motion.span
            className="text-2xl font-bold tracking-tighter text-white"
            whileHover={{ opacity: 0.8 }}
          >
            Ours.
          </motion.span>
          <p className="text-white/35 mt-1 text-sm">Premium couple stickers.</p>
        </div>
        <div className="flex gap-6 text-white/40 text-sm">
          <a href="#" className="hover:text-white/80 transition-colors">Instagram</a>
          <a href="#" className="hover:text-white/80 transition-colors">TikTok</a>
          <a href="#" className="hover:text-white/80 transition-colors">Support</a>
        </div>
        <p className="text-white/25 text-xs">© 2026 Ours. All rights reserved.</p>
      </div>
    </footer>
  );
}
