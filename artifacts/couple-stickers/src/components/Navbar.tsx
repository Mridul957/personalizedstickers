import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mx-4 mt-4 bg-white/80 dark:bg-background/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-sm"
    >
      <Link href="/" className="text-2xl font-bold tracking-tighter text-foreground">
        Ours.
      </Link>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
        <a href="#gallery" className="hover:text-foreground transition-colors">Gallery</a>
        <a href="#reviews" className="hover:text-foreground transition-colors">Reviews</a>
      </div>

      <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold px-6">
        Create Yours
      </Button>
    </motion.nav>
  );
}
