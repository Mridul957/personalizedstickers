import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CinematicConversion() {
  return (
    <section className="relative w-full py-32 bg-[#0a0a1a] overflow-hidden flex items-center justify-center">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-[#0a0a1a] to-[#0a0a1a]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Particles/Sparkles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random(),
            scale: Math.random() * 2,
          }}
          animate={{
            y: [null, Math.random() * -100],
            opacity: [null, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 w-full max-w-2xl px-6"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative group cursor-pointer"
        >
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent via-primary to-secondary rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative flex flex-col items-center justify-center p-12 md:p-20 bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Select Your Stickers
            </h2>
            <p className="text-white/60 text-lg md:text-xl mb-8">
              Choose your favorite 7 sticker poses
            </p>
            <Button className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-10 h-14 font-semibold shadow-[0_0_40px_rgba(180,255,50,0.3)]">
              Start Creating
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
