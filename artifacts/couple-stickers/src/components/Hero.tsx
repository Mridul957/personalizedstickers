import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroSticker1 from "@/assets/hero-sticker-1.png";
import heroSticker2 from "@/assets/hero-sticker-2.png";
import heroSticker3 from "@/assets/hero-sticker-3.png";
import heroSticker4 from "@/assets/hero-sticker-4.png";

const cards = [
  { img: heroSticker4, rotate: -22, translateY: 28, zIndex: 1, label: "Cuddle" },
  { img: heroSticker2, rotate: -11, translateY: 10, zIndex: 2, label: "Hug" },
  { img: heroSticker1, rotate: 0,   translateY: 0,  zIndex: 5, label: "Kiss" },
  { img: heroSticker3, rotate: 11,  translateY: 10, zIndex: 2, label: "Love" },
  { img: heroSticker4, rotate: 22,  translateY: 28, zIndex: 1, label: "Together" },
];

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-12 px-4">
      {/* Soft background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(168,139,250,0.07),transparent)] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_85%_85%,rgba(163,230,53,0.06),transparent)] pointer-events-none -z-10" />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5"
      >
        <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 tracking-wide">
          ✦ The Ultimate Gift for Your Partner
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-foreground text-center leading-[1.05] max-w-3xl"
      >
        Turn Your Love<br />Into Stickers 💖
      </motion.h1>

      {/* Card Fan */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex items-end justify-center w-full max-w-2xl mx-auto mt-10 mb-8"
        style={{ height: 260 }}
      >
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              y: -20,
              rotate: card.rotate * 0.3,
              zIndex: 20,
              scale: 1.06,
              transition: { duration: 0.25, ease: "easeOut" },
            }}
            style={{
              rotate: card.rotate,
              y: card.translateY,
              zIndex: card.zIndex,
              marginLeft: i === 0 ? 0 : -52,
              position: "relative",
              transformOrigin: "bottom center",
            }}
            className="cursor-pointer flex-shrink-0"
          >
            <div
              className="rounded-xl overflow-hidden shadow-2xl border-[3px] border-white bg-white"
              style={{ width: 160, height: 210 }}
            >
              <img
                src={card.img}
                alt={card.label}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Shine */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        ))}
      </motion.div>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.65 }}
        className="text-base md:text-lg text-muted-foreground text-center max-w-md leading-relaxed mb-8"
      >
        Upload your favorite couple photo and create personalized romantic sticker sheets that feel truly yours.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="lg"
            className="rounded-full bg-foreground text-background hover:bg-foreground/85 text-base px-9 h-12 shadow-lg"
          >
            Select Your Stickers
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full text-base px-9 h-12 border-foreground/20 hover:bg-secondary/20"
          >
            View Samples
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
