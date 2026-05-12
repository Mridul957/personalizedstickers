import { motion } from "framer-motion";

const sparkles = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 3,
  duration: 2 + Math.random() * 3,
  size: 2 + Math.random() * 3,
}));

export function CinematicConversion() {
  return (
    <section className="relative w-full py-36 overflow-hidden flex items-center justify-center">
      {/* Dark glass layer */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "rgba(10,6,30,0.7)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Extra deep glow behind card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle, rgba(147,51,234,0.35) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)" }}
      />

      {/* Sparkles */}
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: "rgba(255,255,255,0.9)",
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, type: "spring", stiffness: 100 }}
        className="relative z-10 w-full max-w-xl px-6"
      >
        <motion.div
          whileHover={{ scale: 1.025, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative group cursor-pointer"
        >
          {/* Outer glow ring */}
          <div
            className="absolute -inset-[2px] rounded-[2rem] opacity-60 group-hover:opacity-90 transition-opacity duration-500"
            style={{
              background: "linear-gradient(135deg, rgba(147,51,234,0.8), rgba(236,72,153,0.6), rgba(163,230,53,0.5))",
              filter: "blur(8px)",
            }}
          />

          {/* Glass card */}
          <div
            className="relative flex flex-col items-center justify-center p-14 md:p-20 rounded-[2rem] text-center"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(40px) saturate(200%)",
              WebkitBackdropFilter: "blur(40px) saturate(200%)",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.3)",
            }}
          >
            {/* Specular top highlight */}
            <div
              className="absolute top-0 left-[10%] right-[10%] h-px rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
            />

            <h2
              className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight"
              style={{ textShadow: "0 0 60px rgba(147,51,234,0.6)" }}
            >
              Select Your Stickers
            </h2>
            <p className="text-white/50 text-base md:text-lg mb-9">
              Choose your favorite 7 sticker poses
            </p>

            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full text-lg px-10 h-14 font-semibold cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(163,230,53,0.9), rgba(163,230,53,0.7))",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(163,230,53,0.5)",
                boxShadow: "0 0 40px rgba(163,230,53,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                color: "hsl(252,30%,6%)",
              }}
            >
              Start Creating
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
