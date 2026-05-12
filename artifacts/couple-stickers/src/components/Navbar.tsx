import { motion } from "framer-motion";
import { Link } from "wouter";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 mx-4 mt-4 rounded-full"
      style={{
        background: "rgba(29,58,74,0.55)",
        backdropFilter: "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
        border: "1px solid rgba(43,170,143,0.25)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(232,196,90,0.2)",
      }}
    >
      <Link href="/" className="text-2xl font-bold tracking-tighter" style={{ color: "hsl(43,80%,92%)" }}>
        Ours.
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "rgba(232,196,90,0.6)" }}>
        <a href="#how-it-works" className="hover:text-[hsl(43,80%,92%)] transition-colors duration-200">How It Works</a>
        <a href="#gallery" className="hover:text-[hsl(43,80%,92%)] transition-colors duration-200">Gallery</a>
        <a href="#reviews" className="hover:text-[hsl(43,80%,92%)] transition-colors duration-200">Reviews</a>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="rounded-full font-bold px-6 text-sm h-9 cursor-pointer"
        style={{
          background: "linear-gradient(135deg, rgba(43,170,143,0.7), rgba(29,58,74,0.8))",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(43,170,143,0.45)",
          boxShadow: "inset 0 1px 0 rgba(232,196,90,0.25), 0 4px 16px rgba(43,170,143,0.25)",
          color: "hsl(43,80%,92%)",
        }}
      >
        Create Yours ✦
      </motion.button>
    </motion.nav>
  );
}
