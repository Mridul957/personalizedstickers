import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import heroSticker1 from "@/assets/hero-sticker-1.png";
import heroSticker2 from "@/assets/hero-sticker-2.png";
import heroSticker3 from "@/assets/hero-sticker-3.png";
import heroSticker4 from "@/assets/hero-sticker-4.png";
import sticker5 from "@/assets/sticker-5.png";
import sticker6 from "@/assets/sticker-6.png";
import gallery1 from "@/assets/gallery-1.png";
import gallery2 from "@/assets/gallery-2.png";

const MAX_SELECT = 7;

const ALL_STICKERS = [
  { id: 1, img: heroSticker1, name: "The Kiss",        tag: "Romance" },
  { id: 2, img: heroSticker2, name: "Hand in Hand",    tag: "Classic" },
  { id: 3, img: heroSticker3, name: "Warm Hug",        tag: "Cozy" },
  { id: 4, img: heroSticker4, name: "Sweet Smile",     tag: "Cute" },
  { id: 5, img: sticker5,     name: "Dance Together",  tag: "Playful" },
  { id: 6, img: sticker6,     name: "Rainy Day",       tag: "Cozy" },
  { id: 7, img: gallery1,     name: "Love Story",      tag: "Romantic" },
  { id: 8, img: gallery2,     name: "Together Always", tag: "Classic" },
];

const tagColors: Record<string, { bg: string; text: string; border: string }> = {
  Romance:  { bg: "rgba(232,87,58,0.15)",   text: "rgba(232,87,58,0.9)",   border: "rgba(232,87,58,0.3)"  },
  Classic:  { bg: "rgba(43,170,143,0.15)",  text: "rgba(43,170,143,0.9)",  border: "rgba(43,170,143,0.3)" },
  Cozy:     { bg: "rgba(240,147,106,0.15)", text: "rgba(240,147,106,0.9)", border: "rgba(240,147,106,0.3)"},
  Cute:     { bg: "rgba(232,196,90,0.15)",  text: "rgba(232,196,90,0.9)",  border: "rgba(232,196,90,0.3)" },
  Playful:  { bg: "rgba(43,170,143,0.15)",  text: "rgba(43,170,143,0.9)",  border: "rgba(43,170,143,0.3)" },
  Romantic: { bg: "rgba(232,87,58,0.15)",   text: "rgba(232,87,58,0.9)",   border: "rgba(232,87,58,0.3)"  },
};

export default function CreateYours() {
  const [selected, setSelected] = useState<number[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  function toggle(id: number) {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((s) => s !== id));
    } else if (selected.length >= MAX_SELECT) {
      setShakeId(id);
      setTimeout(() => setShakeId(null), 600);
    } else {
      setSelected((prev) => [...prev, id]);
    }
  }

  function handleOrder() {
    if (selected.length === MAX_SELECT) setShowSuccess(true);
  }

  const filled = selected.length;
  const pct = (filled / MAX_SELECT) * 100;

  return (
    <div
      className="min-h-screen pb-40"
      style={{ background: "hsl(204,46%,9%)" }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="blob-1 absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(43,170,143,0.6) 0%, transparent 70%)" }} />
        <div className="blob-2 absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(232,196,90,0.5) 0%, transparent 70%)" }} />
        <div className="blob-3 absolute top-[50%] right-[20%] w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(240,147,106,0.5) 0%, transparent 70%)" }} />
      </div>

      {/* Top nav */}
      <div
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(12,28,38,0.80)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderBottom: "1px solid rgba(43,170,143,0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(43,170,143,0.10)",
        }}
      >
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-sm font-semibold cursor-pointer"
            style={{ color: "rgba(43,170,143,0.8)" }}
          >
            ← Back
          </motion.button>
        </Link>

        <span className="text-xl font-bold tracking-tighter" style={{ color: "hsl(43,80%,92%)" }}>
          Ours. 💖
        </span>

        {/* Progress pill */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
          style={{
            background: "rgba(29,58,74,0.6)",
            border: "1px solid rgba(43,170,143,0.25)",
            color: filled === MAX_SELECT ? "rgba(43,170,143,0.9)" : "hsl(43,80%,85%)",
          }}
        >
          {filled === MAX_SELECT ? "✓ All 7 Selected!" : `${filled} / ${MAX_SELECT} selected`}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1
            className="text-3xl md:text-5xl font-bold mb-3"
            style={{
              color: "hsl(43,80%,92%)",
              textShadow: "0 0 60px rgba(43,170,143,0.4)",
            }}
          >
            Pick Your 7 Poses 🎨
          </h1>
          <p className="text-base" style={{ color: "rgba(232,196,90,0.55)" }}>
            Choose exactly 7 sticker illustrations for your personalized sheet.
          </p>

          {/* Progress bar */}
          <div className="mt-6 max-w-sm mx-auto">
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(43,170,143,0.12)", border: "1px solid rgba(43,170,143,0.15)" }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{
                  background: pct === 100
                    ? "linear-gradient(90deg, rgba(43,170,143,0.9), rgba(232,196,90,0.9))"
                    : "linear-gradient(90deg, rgba(43,170,143,0.7), rgba(43,170,143,0.5))",
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs" style={{ color: "rgba(43,170,143,0.5)" }}>
              <span>0</span>
              <span>7</span>
            </div>
          </div>
        </motion.div>

        {/* Sticker grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ALL_STICKERS.map((sticker, i) => {
            const isSelected = selected.includes(sticker.id);
            const selOrder = selected.indexOf(sticker.id) + 1;
            const tag = tagColors[sticker.tag] ?? tagColors["Classic"];

            return (
              <motion.div
                key={sticker.id}
                initial={{ opacity: 0, y: 24 }}
                animate={
                  shakeId === sticker.id
                    ? { x: [-8, 8, -6, 6, -3, 3, 0], opacity: 1 }
                    : { opacity: 1, y: 0, x: 0 }
                }
                transition={
                  shakeId === sticker.id
                    ? { duration: 0.5, ease: "easeInOut" }
                    : { delay: i * 0.06, duration: 0.5 }
                }
                whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.2 } }}
                onClick={() => toggle(sticker.id)}
                className="relative cursor-pointer rounded-2xl overflow-hidden"
                style={{
                  background: isSelected ? "rgba(43,170,143,0.14)" : "rgba(18,40,55,0.65)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  border: isSelected
                    ? "2px solid rgba(43,170,143,0.6)"
                    : "1px solid rgba(43,170,143,0.15)",
                  boxShadow: isSelected
                    ? "0 0 30px rgba(43,170,143,0.25), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(232,196,90,0.15)"
                    : "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(232,196,90,0.08)",
                }}
              >
                {/* Specular top */}
                <div
                  className="absolute top-0 left-[10%] right-[10%] h-px z-10"
                  style={{
                    background: isSelected
                      ? "linear-gradient(90deg, transparent, rgba(43,170,143,0.5), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(232,196,90,0.2), transparent)",
                  }}
                />

                {/* Image */}
                <div className="aspect-square p-3">
                  <img
                    src={sticker.img}
                    alt={sticker.name}
                    className="w-full h-full object-cover rounded-xl"
                    draggable={false}
                  />
                </div>

                {/* Card footer */}
                <div className="px-3 pb-3">
                  <p
                    className="text-sm font-bold mb-1.5 truncate"
                    style={{ color: "hsl(43,80%,90%)" }}
                  >
                    {sticker.name}
                  </p>
                  <span
                    className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: tag.bg,
                      color: tag.text,
                      border: `1px solid ${tag.border}`,
                    }}
                  >
                    {sticker.tag}
                  </span>
                </div>

                {/* Selection overlay + badge */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                      style={{
                        background: "rgba(43,170,143,0.95)",
                        boxShadow: "0 2px 12px rgba(43,170,143,0.5)",
                        color: "hsl(204,46%,9%)",
                      }}
                    >
                      {selOrder}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Locked overlay when max reached and not selected */}
                {!isSelected && filled >= MAX_SELECT && (
                  <div
                    className="absolute inset-0 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(12,28,38,0.55)" }}
                  >
                    <span className="text-2xl">🔒</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <AnimatePresence>
        {filled > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4"
          >
            <div
              className="max-w-2xl mx-auto rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{
                background: "rgba(12,28,38,0.88)",
                backdropFilter: "blur(32px) saturate(180%)",
                WebkitBackdropFilter: "blur(32px) saturate(180%)",
                border: "1px solid rgba(43,170,143,0.28)",
                boxShadow: "0 -4px 40px rgba(0,0,0,0.5), 0 0 30px rgba(43,170,143,0.12), inset 0 1px 0 rgba(232,196,90,0.12)",
              }}
            >
              {/* Selected thumbnails */}
              <div className="flex -space-x-2 flex-1 min-w-0">
                {selected.map((id) => {
                  const s = ALL_STICKERS.find((st) => st.id === id)!;
                  return (
                    <motion.img
                      key={id}
                      layoutId={`thumb-${id}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      src={s.img}
                      alt={s.name}
                      className="w-10 h-10 rounded-full border-2 object-cover flex-shrink-0"
                      style={{ borderColor: "rgba(43,170,143,0.6)" }}
                    />
                  );
                })}
                {filled < MAX_SELECT && (
                  <div
                    className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center text-xs flex-shrink-0"
                    style={{ borderColor: "rgba(43,170,143,0.3)", color: "rgba(43,170,143,0.5)" }}
                  >
                    +{MAX_SELECT - filled}
                  </div>
                )}
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleOrder}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                disabled={filled < MAX_SELECT}
                className="rounded-full px-7 h-11 text-sm font-bold cursor-pointer flex-shrink-0 transition-all duration-300"
                style={
                  filled === MAX_SELECT
                    ? {
                        background: "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(232,196,90,0.85))",
                        border: "1px solid rgba(232,196,90,0.4)",
                        boxShadow: "0 0 30px rgba(43,170,143,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                        color: "hsl(204,46%,9%)",
                      }
                    : {
                        background: "rgba(43,170,143,0.12)",
                        border: "1px solid rgba(43,170,143,0.2)",
                        color: "rgba(43,170,143,0.45)",
                        cursor: "not-allowed",
                      }
                }
              >
                {filled === MAX_SELECT ? "Order My Sheet →" : `Pick ${MAX_SELECT - filled} more`}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(8,20,28,0.85)", backdropFilter: "blur(12px)" }}
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative text-center p-10 rounded-3xl max-w-sm w-full"
              style={{
                background: "rgba(18,40,55,0.95)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(43,170,143,0.3)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(43,170,143,0.2), inset 0 1px 0 rgba(232,196,90,0.2)",
              }}
            >
              <div
                className="absolute top-0 left-[15%] right-[15%] h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(232,196,90,0.5), transparent)" }}
              />
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}
              >
                🎉
              </motion.div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: "hsl(43,80%,92%)" }}
              >
                Amazing picks!
              </h2>
              <p className="text-sm mb-7" style={{ color: "rgba(232,196,90,0.55)" }}>
                Your 7 sticker poses are selected. Upload your photo to get started.
              </p>

              {/* Selected thumbnails in modal */}
              <div className="flex justify-center gap-2 mb-7 flex-wrap">
                {selected.map((id) => {
                  const s = ALL_STICKERS.find((st) => st.id === id)!;
                  return (
                    <img
                      key={id}
                      src={s.img}
                      alt={s.name}
                      className="w-12 h-12 rounded-xl object-cover border-2"
                      style={{ borderColor: "rgba(43,170,143,0.5)" }}
                    />
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-full h-12 font-bold text-base cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(232,196,90,0.85))",
                  border: "1px solid rgba(232,196,90,0.35)",
                  boxShadow: "0 0 30px rgba(43,170,143,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                  color: "hsl(204,46%,9%)",
                }}
              >
                Upload My Photo →
              </motion.button>
              <button
                onClick={() => setShowSuccess(false)}
                className="mt-3 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: "rgba(232,196,90,0.4)" }}
              >
                Change selection
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
