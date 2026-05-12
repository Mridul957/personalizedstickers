import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroSticker1 from "@/assets/hero-sticker-1.png";
import heroSticker2 from "@/assets/hero-sticker-2.png";
import heroSticker3 from "@/assets/hero-sticker-3.png";

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl -z-10 mix-blend-multiply opacity-70" />
      
      {/* Floating Stickers */}
      <motion.img 
        src={heroSticker1} 
        alt="Sticker Mockup"
        initial={{ y: 50, opacity: 0, rotate: -15 }}
        animate={{ 
          y: [0, -20, 0],
          opacity: 1,
          rotate: [-15, -10, -15]
        }}
        transition={{ 
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 1 },
          rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute hidden md:block top-1/4 left-[15%] w-48 h-auto drop-shadow-2xl"
      />
      <motion.img 
        src={heroSticker2} 
        alt="Sticker Mockup"
        initial={{ y: 50, opacity: 0, rotate: 10 }}
        animate={{ 
          y: [0, 20, 0],
          opacity: 1,
          rotate: [10, 15, 10]
        }}
        transition={{ 
          y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 },
          opacity: { duration: 1, delay: 0.2 },
          rotate: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }
        }}
        className="absolute hidden md:block bottom-1/4 right-[15%] w-56 h-auto drop-shadow-2xl"
      />
      <motion.img 
        src={heroSticker3} 
        alt="Sticker Mockup"
        initial={{ y: 50, opacity: 0, rotate: 5 }}
        animate={{ 
          y: [0, -15, 0],
          opacity: 1,
          rotate: [5, -5, 5]
        }}
        transition={{ 
          y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 },
          opacity: { duration: 1, delay: 0.4 },
          rotate: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }
        }}
        className="absolute hidden md:block top-[20%] right-[25%] w-40 h-auto drop-shadow-xl blur-[2px]"
      />

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 text-center z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium mb-6 border border-secondary">
            The Ultimate Gift for Your Partner
          </span>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Turn Your Love <br/> Into Stickers 💖
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your favorite couple photo and create personalized romantic sticker sheets that feel truly yours.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto rounded-full bg-foreground text-background hover:bg-foreground/90 text-lg px-8 h-14">
              Select Your Stickers
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-lg px-8 h-14 border-foreground/20 hover:bg-secondary/20">
              View Samples
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
