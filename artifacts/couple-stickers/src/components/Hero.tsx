import { motion } from "framer-motion";
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

const glassBtn = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.22)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
  color: "white",
};

const glassOutlineBtn = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.8)",
};

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-12 px-4">

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5"
      >
        <span
          className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full text-sm font-medium tracking-wide text-white/80"
          style={{
            background: "rgba(147,51,234,0.18)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(147,51,234,0.35)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          ✦ The Ultimate Gift for Your Partner
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-white text-center leading-[1.05] max-w-3xl"
        style={{ textShadow: "0 0 80px rgba(147,51,234,0.4)" }}
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
              y: -22,
              rotate: card.rotate * 0.25,
              zIndex: 20,
              scale: 1.07,
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
            {/* Glass card frame */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                width: 160,
                height: 210,
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(12px) saturate(150%)",
                WebkitBackdropFilter: "blur(12px) saturate(150%)",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)",
                padding: "6px",
              }}
            >
              <img
                src={card.img}
                alt={card.label}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            {/* Specular top-edge shine */}
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-xl pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.65 }}
        className="text-base md:text-lg text-white/55 text-center max-w-md leading-relaxed mb-8"
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full text-base px-9 h-12 font-semibold cursor-pointer"
          style={glassBtn}
        >
          Select Your Stickers
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full text-base px-9 h-12 font-medium cursor-pointer"
          style={glassOutlineBtn}
        >
          View Samples
        </motion.button>
      </motion.div>
    </section>
  );
}
