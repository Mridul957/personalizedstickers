import { motion } from "framer-motion";
import { Link } from "wouter";

const sparkles = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  top: `${10 + Math.random() * 80}%`,
  left: `${5 + Math.random() * 90}%`,
  delay: Math.random() * 4,
  duration: 2 + Math.random() * 3,
  size: 2 + Math.random() * 4,
  color: ["rgba(43,170,143,0.9)", "rgba(232,196,90,0.9)", "rgba(240,147,106,0.9)", "rgba(232,87,58,0.8)"][i % 4],
}));

export function CinematicConversion() {
  return (
    <section className="relative w-full py-40 overflow-hidden flex items-center justify-center">
      {/* Darkened glass overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "rgba(12,28,38,0.75)", backdropFilter: "blur(2px)" }}
      />
      {/* Warm glow center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle, rgba(43,170,143,0.28) 0%, rgba(232,196,90,0.10) 50%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle, rgba(240,147,106,0.2) 0%, transparent 70%)" }}
      />

      {/* Colored sparkles */}
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full pointer-events-none"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, background: s.color }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.8, 0.5] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, type: "spring", stiffness: 90 }}
        className="relative z-10 w-full max-w-xl px-6"
      >
        <motion.div
          whileHover={{ scale: 1.025, y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative group cursor-pointer"
        >
          {/* Animated gradient glow ring */}
          <motion.div
            className="absolute -inset-[2px] rounded-[2rem] opacity-55 group-hover:opacity-90 transition-opacity duration-500"
            animate={{ background: [
              "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(232,196,90,0.7), rgba(240,147,106,0.8))",
              "linear-gradient(225deg, rgba(232,87,58,0.8), rgba(43,170,143,0.9), rgba(232,196,90,0.7))",
              "linear-gradient(315deg, rgba(232,196,90,0.8), rgba(232,87,58,0.7), rgba(43,170,143,0.9))",
              "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(232,196,90,0.7), rgba(240,147,106,0.8))",
            ]}}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ filter: "blur(8px)", borderRadius: "2rem" }}
          />

          {/* Glass card */}
          <div
            className="relative flex flex-col items-center justify-center p-14 md:p-20 rounded-[2rem] text-center"
            style={{
              background: "rgba(18,40,55,0.7)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(43,170,143,0.22)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(232,196,90,0.22), inset 0 -1px 0 rgba(0,0,0,0.3)",
            }}
          >
            {/* Top specular */}
            <div
              className="absolute top-0 left-[10%] right-[10%] h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(232,196,90,0.5), transparent)" }}
            />

            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🎨
            </motion.div>

            <h2
              className="text-4xl md:text-6xl font-bold mb-3 tracking-tight"
              style={{
                color: "hsl(43,80%,92%)",
                textShadow: "0 0 60px rgba(43,170,143,0.5), 0 0 30px rgba(232,196,90,0.3)",
              }}
            >
              Select Your Stickers
            </h2>
            <p className="text-base md:text-lg mb-9" style={{ color: "rgba(232,196,90,0.55)" }}>
              Choose your favorite 7 sticker poses
            </p>

            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.07, y: -3 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-full text-lg px-10 h-14 font-bold cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, rgba(232,196,90,0.9), rgba(240,147,106,0.85))",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(232,196,90,0.4)",
                  boxShadow: "0 0 40px rgba(232,196,90,0.4), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
                  color: "hsl(204,46%,12%)",
                }}
              >
                Start Creating →
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
