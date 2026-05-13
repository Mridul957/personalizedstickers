import { motion } from "framer-motion";
import { Link } from "wouter";
import heroSticker1 from "@/assets/hero-sticker-1.png";
import heroSticker2 from "@/assets/hero-sticker-2.png";
import heroSticker3 from "@/assets/hero-sticker-3.png";
import heroSticker4 from "@/assets/hero-sticker-4.png";

const cards = [
  { img: heroSticker4, rotate: -22, translateY: 28, zIndex: 1, glowColor: "rgba(232,87,58,0.5)" },
  { img: heroSticker2, rotate: -11, translateY: 10, zIndex: 2, glowColor: "rgba(240,147,106,0.5)" },
  { img: heroSticker1, rotate: 0,   translateY: 0,  zIndex: 5, glowColor: "rgba(43,170,143,0.6)" },
  { img: heroSticker3, rotate: 11,  translateY: 10, zIndex: 2, glowColor: "rgba(232,196,90,0.5)" },
  { img: heroSticker4, rotate: 22,  translateY: 28, zIndex: 1, glowColor: "rgba(232,87,58,0.4)" },
];

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-12 px-4">

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5"
      >
        <span
          className="inline-flex items-center gap-2 py-2 px-5 rounded-full text-sm font-bold tracking-wide"
          style={{
            background: "rgba(43,170,143,0.18)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(43,170,143,0.4)",
            boxShadow: "inset 0 1px 0 rgba(232,196,90,0.2), 0 4px 16px rgba(43,170,143,0.2)",
            color: "hsl(43,75%,80%)",
          }}
        >
          🎉 The Ultimate Gift for Your Partner
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-center leading-[1.05] max-w-3xl"
        style={{
          color: "hsl(43,80%,92%)",
          textShadow: "0 0 80px rgba(43,170,143,0.5), 0 0 160px rgba(232,196,90,0.2)",
        }}
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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              y: -24,
              rotate: card.rotate * 0.2,
              zIndex: 20,
              scale: 1.08,
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
            {/* Glass card frame with per-card color glow */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                width: 160,
                height: 210,
                background: "rgba(29,58,74,0.55)",
                backdropFilter: "blur(12px) saturate(180%)",
                WebkitBackdropFilter: "blur(12px) saturate(180%)",
                border: "1px solid rgba(43,170,143,0.30)",
                boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${card.glowColor}, inset 0 1px 0 rgba(232,196,90,0.25)`,
                padding: "5px",
              }}
            >
              <img src={card.img} alt="Sticker" className="w-full h-full object-cover rounded-lg" />
            </div>
            {/* Specular top shine */}
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-xl pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(232,196,90,0.5), transparent)" }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.65 }}
        className="text-base md:text-lg text-center max-w-md leading-relaxed mb-8"
        style={{ color: "rgba(232,196,90,0.55)" }}
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
        <Link href="/create">
          <motion.button
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full text-base px-9 h-12 font-bold cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(43,170,143,0.8), rgba(43,170,143,0.5))",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(43,170,143,0.5)",
              boxShadow: "0 0 30px rgba(43,170,143,0.4), 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(232,196,90,0.3)",
              color: "hsl(43,80%,96%)",
            }}
          >
            Select Your Stickers 🎨
          </motion.button>
        </Link>
        <Link href="/create">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full text-base px-9 h-12 font-semibold cursor-pointer"
            style={{
              background: "rgba(29,58,74,0.45)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(232,196,90,0.25)",
              boxShadow: "inset 0 1px 0 rgba(232,196,90,0.15)",
              color: "rgba(232,196,90,0.8)",
            }}
          >
            View Samples
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}
