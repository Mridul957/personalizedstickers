import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 mx-4 mt-4 rounded-full"
      style={{
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(32px) saturate(200%)",
        WebkitBackdropFilter: "blur(32px) saturate(200%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
        Ours.
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
        <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How It Works</a>
        <a href="#gallery" className="hover:text-white transition-colors duration-200">Gallery</a>
        <a href="#reviews" className="hover:text-white transition-colors duration-200">Reviews</a>
      </div>

      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
        <Button
          className="rounded-full font-semibold px-6 text-sm h-9"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px rgba(0,0,0,0.3)",
            color: "white",
          }}
        >
          Create Yours
        </Button>
      </motion.div>
    </motion.nav>
  );
}
