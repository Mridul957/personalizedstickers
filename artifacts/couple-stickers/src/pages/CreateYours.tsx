import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

const MIN_SELECT = 7;
const MAX_SELECT = 14;

type Tag = "Romance" | "Cozy" | "Cute" | "Playful" | "Emotional" | "Classic" | "Trending" | "Soft Love";

interface Sticker {
  id: number;
  name: string;
  tag: Tag;
  emoji: string;
}

const ALL_STICKERS: Sticker[] = [
  { id: 1,  name: "The First Kiss",      tag: "Romance",   emoji: "💋" },
  { id: 2,  name: "Forever Hug",         tag: "Cozy",      emoji: "🤗" },
  { id: 3,  name: "Sleepy Together",     tag: "Soft Love", emoji: "😴" },
  { id: 4,  name: "Late Night Calls",    tag: "Emotional", emoji: "🌙" },
  { id: 5,  name: "Matching Hoodies",    tag: "Cute",      emoji: "👫" },
  { id: 6,  name: "Coffee Date",         tag: "Classic",   emoji: "☕" },
  { id: 7,  name: "Holding Hands",       tag: "Classic",   emoji: "🤝" },
  { id: 8,  name: "Movie Night",         tag: "Cozy",      emoji: "🎬" },
  { id: 9,  name: "Forever Yours",       tag: "Romance",   emoji: "💍" },
  { id: 10, name: "Cute Fight",          tag: "Playful",   emoji: "🥊" },
  { id: 11, name: "Rainy Walk",          tag: "Emotional", emoji: "☂️" },
  { id: 12, name: "Long Distance Love",  tag: "Emotional", emoji: "✈️" },
  { id: 13, name: "Soft Smile",          tag: "Soft Love", emoji: "🥰" },
  { id: 14, name: "Together Always",     tag: "Classic",   emoji: "♾️" },
  { id: 15, name: "Dance Together",      tag: "Playful",   emoji: "💃" },
  { id: 16, name: "Blushing Love",       tag: "Romance",   emoji: "😊" },
  { id: 17, name: "Lazy Sunday",         tag: "Cozy",      emoji: "🛋️" },
  { id: 18, name: "Heart Hands",         tag: "Cute",      emoji: "🫶" },
  { id: 19, name: "Ice Cream Date",      tag: "Cute",      emoji: "🍦" },
  { id: 20, name: "Cozy Moments",        tag: "Cozy",      emoji: "🧣" },
  { id: 21, name: "Stolen Glances",      tag: "Romance",   emoji: "👀" },
  { id: 22, name: "Good Morning Kiss",   tag: "Soft Love", emoji: "🌅" },
  { id: 23, name: "Stargazing Night",    tag: "Emotional", emoji: "🌟" },
  { id: 24, name: "Pinky Promise",       tag: "Cute",      emoji: "🤙" },
  { id: 25, name: "Reading Together",    tag: "Cozy",      emoji: "📖" },
  { id: 26, name: "Beach Walk",          tag: "Classic",   emoji: "🌊" },
  { id: 27, name: "Surprise Hug",        tag: "Playful",   emoji: "🎁" },
  { id: 28, name: "Matching Outfits",    tag: "Trending",  emoji: "👗" },
  { id: 29, name: "Selfie Time",         tag: "Trending",  emoji: "🤳" },
  { id: 30, name: "Forever & Always",    tag: "Emotional", emoji: "💞" },
];

const TAG_STYLES: Record<Tag, { bg: string; text: string; border: string }> = {
  Romance:   { bg: "rgba(232,87,58,0.15)",   text: "rgba(232,87,58,0.95)",   border: "rgba(232,87,58,0.3)"  },
  Cozy:      { bg: "rgba(240,147,106,0.15)", text: "rgba(240,147,106,0.95)", border: "rgba(240,147,106,0.3)"},
  Cute:      { bg: "rgba(232,196,90,0.15)",  text: "rgba(232,196,90,0.95)",  border: "rgba(232,196,90,0.3)" },
  Playful:   { bg: "rgba(43,170,143,0.15)",  text: "rgba(43,170,143,0.95)",  border: "rgba(43,170,143,0.3)" },
  Emotional: { bg: "rgba(139,92,246,0.15)",  text: "rgba(167,139,250,0.95)", border: "rgba(139,92,246,0.3)" },
  Classic:   { bg: "rgba(99,179,237,0.15)",  text: "rgba(147,210,255,0.95)", border: "rgba(99,179,237,0.3)" },
  Trending:  { bg: "rgba(236,72,153,0.15)",  text: "rgba(251,113,183,0.95)", border: "rgba(236,72,153,0.3)" },
  "Soft Love":{ bg:"rgba(248,113,113,0.15)", text:"rgba(252,165,165,0.95)",  border:"rgba(248,113,113,0.3)" },
};

export default function CreateYours() {
  const [selected, setSelected] = useState<number[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const filled = selected.length;
  const pct = (filled / MAX_SELECT) * 100;
  const atMin = filled >= MIN_SELECT;
  const atMax = filled >= MAX_SELECT;

  function toggle(id: number) {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((s) => s !== id));
    } else if (atMax) {
      setShakeId(id);
      setTimeout(() => setShakeId(null), 600);
    } else {
      setSelected((prev) => [...prev, id]);
    }
  }

  function handleOrder() {
    if (atMin) setShowSuccess(true);
  }

  return (
    <div className="min-h-screen pb-44" style={{ background: "hsl(204,46%,9%)" }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="blob-1 absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(43,170,143,0.6) 0%, transparent 70%)" }} />
        <div className="blob-2 absolute bottom-[5%] right-[-8%] w-[560px] h-[560px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(232,196,90,0.5) 0%, transparent 70%)" }} />
        <div className="blob-3 absolute top-[55%] left-[20%] w-[420px] h-[420px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(240,147,106,0.5) 0%, transparent 70%)" }} />
        <div className="blob-4 absolute top-[20%] right-[15%] w-[380px] h-[380px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
      </div>

      {/* Sticky top nav */}
      <div
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(12,28,38,0.82)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderBottom: "1px solid rgba(43,170,143,0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(43,170,143,0.10)",
        }}
      >
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
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

        {/* Counter pill */}
        <motion.div
          layout
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
          style={{
            background: atMax
              ? "rgba(43,170,143,0.2)"
              : atMin
                ? "rgba(43,170,143,0.12)"
                : "rgba(29,58,74,0.6)",
            border: atMin
              ? "1px solid rgba(43,170,143,0.4)"
              : "1px solid rgba(43,170,143,0.2)",
            color: atMax
              ? "rgba(43,170,143,1)"
              : atMin
                ? "rgba(43,170,143,0.85)"
                : "hsl(43,80%,75%)",
          }}
        >
          {atMax ? "✨ Pack Complete!" : `${filled} / ${MAX_SELECT} selected`}
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{
              background: "rgba(232,87,58,0.12)",
              border: "1px solid rgba(232,87,58,0.25)",
              color: "rgba(232,87,58,0.85)",
            }}
          >
            ✦ Personalized just for you
          </motion.div>

          <h1
            className="text-4xl md:text-6xl font-black mb-4 leading-tight"
            style={{
              color: "hsl(43,80%,92%)",
              textShadow: "0 0 80px rgba(43,170,143,0.35)",
              letterSpacing: "-0.02em",
            }}
          >
            Build Your Love<br />
            <span style={{
              background: "linear-gradient(135deg, rgba(232,196,90,0.95), rgba(240,147,106,0.9), rgba(232,87,58,0.85))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Sticker Pack ✨
            </span>
          </h1>

          <p className="text-base md:text-lg max-w-xl mx-auto mb-2" style={{ color: "rgba(232,196,90,0.5)" }}>
            Choose your favorite moments together and create a personalized sticker sheet made just for your relationship.
          </p>
          <p className="text-sm font-medium" style={{ color: "rgba(43,170,143,0.55)" }}>
            Minimum 7 selections required · Maximum 14 stickers
          </p>

          {/* Progress bar */}
          <div className="mt-7 max-w-md mx-auto">
            <div className="flex justify-between text-xs font-semibold mb-2" style={{ color: "rgba(43,170,143,0.6)" }}>
              <span>{filled} selected</span>
              <span>{MAX_SELECT} max</span>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden"
              style={{ background: "rgba(43,170,143,0.10)", border: "1px solid rgba(43,170,143,0.12)" }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                style={{
                  background: atMax
                    ? "linear-gradient(90deg, rgba(43,170,143,0.95), rgba(232,196,90,0.9), rgba(240,147,106,0.85))"
                    : atMin
                      ? "linear-gradient(90deg, rgba(43,170,143,0.85), rgba(232,196,90,0.7))"
                      : "linear-gradient(90deg, rgba(43,170,143,0.7), rgba(43,170,143,0.5))",
                  boxShadow: atMin ? "0 0 12px rgba(43,170,143,0.4)" : "none",
                }}
              />
            </div>
            {/* Milestone markers */}
            <div className="relative mt-1">
              <div className="absolute" style={{ left: `${(7 / 14) * 100}%`, transform: "translateX(-50%)" }}>
                <div className="w-0.5 h-2 mx-auto" style={{ background: "rgba(43,170,143,0.4)" }} />
                <span className="text-[10px] block text-center" style={{ color: "rgba(43,170,143,0.5)" }}>min</span>
              </div>
            </div>
          </div>

          {/* Encouragement message */}
          <AnimatePresence>
            {atMin && !atMax && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: "rgba(43,170,143,0.12)",
                  border: "1px solid rgba(43,170,143,0.28)",
                  color: "rgba(43,170,143,0.9)",
                  boxShadow: "0 0 20px rgba(43,170,143,0.15)",
                }}
              >
                💖 Want more cute moments? Add up to {MAX_SELECT - filled} more stickers!
              </motion.div>
            )}
            {atMax && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, rgba(43,170,143,0.2), rgba(232,196,90,0.15))",
                  border: "1px solid rgba(232,196,90,0.35)",
                  color: "rgba(232,196,90,0.9)",
                  boxShadow: "0 0 24px rgba(232,196,90,0.15)",
                }}
              >
                ✨ Your sticker pack is complete!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sticker grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {ALL_STICKERS.map((sticker, i) => {
            const isSelected = selected.includes(sticker.id);
            const selOrder = selected.indexOf(sticker.id) + 1;
            const tag = TAG_STYLES[sticker.tag];
            const isLocked = !isSelected && atMax;

            return (
              <motion.div
                key={sticker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  shakeId === sticker.id
                    ? { x: [-8, 8, -6, 6, -3, 3, 0], opacity: 1, y: 0 }
                    : { opacity: 1, y: 0, x: 0 }
                }
                transition={
                  shakeId === sticker.id
                    ? { duration: 0.5 }
                    : { delay: i * 0.03, duration: 0.45 }
                }
                whileHover={!isLocked ? { y: -8, scale: 1.04, transition: { duration: 0.18 } } : {}}
                onClick={() => toggle(sticker.id)}
                className="relative cursor-pointer rounded-2xl overflow-hidden group"
                style={{
                  background: isSelected
                    ? "rgba(43,170,143,0.13)"
                    : "rgba(16,36,50,0.7)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  border: isSelected
                    ? "2px solid rgba(43,170,143,0.65)"
                    : "1px solid rgba(43,170,143,0.13)",
                  boxShadow: isSelected
                    ? "0 0 28px rgba(43,170,143,0.3), 0 8px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(232,196,90,0.15)"
                    : "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(232,196,90,0.07)",
                  transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                }}
              >
                {/* Specular line */}
                <div
                  className="absolute top-0 left-[10%] right-[10%] h-px z-10"
                  style={{
                    background: isSelected
                      ? "linear-gradient(90deg, transparent, rgba(43,170,143,0.6), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(232,196,90,0.18), transparent)",
                  }}
                />

                {/* Hover glow */}
                {!isLocked && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at 50% 30%, rgba(43,170,143,0.12) 0%, transparent 70%)",
                    }}
                  />
                )}

                {/* Illustration area */}
                <div
                  className="aspect-square flex items-center justify-center relative"
                  style={{
                    background: isSelected
                      ? "rgba(43,170,143,0.08)"
                      : "rgba(29,58,74,0.35)",
                    margin: "10px 10px 0 10px",
                    borderRadius: "14px",
                  }}
                >
                  {/* Pulsing ring on selected */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-[14px]"
                      animate={{ opacity: [0.5, 0.15, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      style={{ border: "1px solid rgba(43,170,143,0.5)" }}
                    />
                  )}

                  <motion.span
                    className="text-4xl select-none"
                    animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={isSelected ? { duration: 0.4 } : {}}
                  >
                    {sticker.emoji}
                  </motion.span>
                </div>

                {/* Card footer */}
                <div className="px-3 py-3">
                  <p
                    className="text-xs font-bold mb-1.5 truncate"
                    style={{ color: isSelected ? "hsl(43,80%,96%)" : "hsl(43,80%,82%)" }}
                  >
                    {sticker.name}
                  </p>
                  <span
                    className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: tag.bg,
                      color: tag.text,
                      border: `1px solid ${tag.border}`,
                    }}
                  >
                    {sticker.tag}
                  </span>
                </div>

                {/* Selection badge */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black"
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

                {/* Locked overlay */}
                {isLocked && (
                  <div
                    className="absolute inset-0 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(8,20,28,0.6)", backdropFilter: "blur(2px)" }}
                  >
                    <span className="text-xl opacity-60">🔒</span>
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
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2"
          >
            <div
              className="max-w-2xl mx-auto rounded-2xl px-5 py-4"
              style={{
                background: "rgba(10,24,34,0.92)",
                backdropFilter: "blur(36px) saturate(200%)",
                WebkitBackdropFilter: "blur(36px) saturate(200%)",
                border: "1px solid rgba(43,170,143,0.3)",
                boxShadow: "0 -4px 40px rgba(0,0,0,0.5), 0 0 40px rgba(43,170,143,0.12), inset 0 1px 0 rgba(232,196,90,0.12)",
              }}
            >
              {/* Mini progress */}
              <div className="h-1 rounded-full mb-3 overflow-hidden" style={{ background: "rgba(43,170,143,0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  style={{
                    background: atMax
                      ? "linear-gradient(90deg, rgba(43,170,143,0.9), rgba(232,196,90,0.9))"
                      : "rgba(43,170,143,0.7)",
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Thumbnails */}
                <div className="flex -space-x-2 flex-1 min-w-0 overflow-hidden">
                  {selected.slice(0, 10).map((id) => {
                    const s = ALL_STICKERS.find((st) => st.id === id)!;
                    return (
                      <motion.div
                        key={id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-lg flex-shrink-0"
                        style={{
                          background: "rgba(29,58,74,0.8)",
                          borderColor: "rgba(43,170,143,0.5)",
                        }}
                      >
                        {s.emoji}
                      </motion.div>
                    );
                  })}
                  {filled > 10 && (
                    <div
                      className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        background: "rgba(29,58,74,0.8)",
                        borderColor: "rgba(43,170,143,0.35)",
                        color: "rgba(43,170,143,0.8)",
                      }}
                    >
                      +{filled - 10}
                    </div>
                  )}
                  {filled < MAX_SELECT && (
                    <div
                      className="w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                      style={{
                        borderColor: "rgba(43,170,143,0.25)",
                        color: "rgba(43,170,143,0.4)",
                      }}
                    >
                      {filled < MIN_SELECT ? `${MIN_SELECT - filled}↑` : `+${MAX_SELECT - filled}`}
                    </div>
                  )}
                </div>

                {/* CTA button */}
                <motion.button
                  onClick={handleOrder}
                  whileHover={atMin ? { scale: 1.05 } : {}}
                  whileTap={atMin ? { scale: 0.97 } : {}}
                  disabled={!atMin}
                  className="rounded-full px-7 h-11 text-sm font-bold cursor-pointer flex-shrink-0 transition-all duration-300"
                  style={
                    atMin
                      ? {
                          background: "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(232,196,90,0.85))",
                          border: "1px solid rgba(232,196,90,0.4)",
                          boxShadow: "0 0 28px rgba(43,170,143,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                          color: "hsl(204,46%,9%)",
                        }
                      : {
                          background: "rgba(43,170,143,0.1)",
                          border: "1px solid rgba(43,170,143,0.18)",
                          color: "rgba(43,170,143,0.35)",
                          cursor: "not-allowed",
                        }
                  }
                >
                  {atMin
                    ? "Order My Sheet →"
                    : `${MIN_SELECT - filled} more to go`}
                </motion.button>
              </div>
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
            style={{ background: "rgba(6,16,24,0.88)", backdropFilter: "blur(16px)" }}
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 32 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 32 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative text-center p-10 rounded-3xl max-w-sm w-full"
              style={{
                background: "rgba(16,36,50,0.98)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(43,170,143,0.3)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 60px rgba(43,170,143,0.2), inset 0 1px 0 rgba(232,196,90,0.18)",
              }}
            >
              <div
                className="absolute top-0 left-[15%] right-[15%] h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(232,196,90,0.5), transparent)" }}
              />
              <motion.div
                className="text-5xl mb-4"
                animate={{ rotate: [0, 15, -12, 8, -5, 0], scale: [1, 1.25, 1] }}
                transition={{ duration: 0.9 }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-black mb-2" style={{ color: "hsl(43,80%,92%)", letterSpacing: "-0.02em" }}>
                Amazing picks!
              </h2>
              <p className="text-sm mb-1" style={{ color: "rgba(232,196,90,0.55)" }}>
                {filled} sticker{filled > 1 ? "s" : ""} selected
              </p>
              <p className="text-xs mb-7" style={{ color: "rgba(43,170,143,0.5)" }}>
                Upload your photo to bring them to life.
              </p>

              {/* Selected emoji preview */}
              <div className="flex justify-center gap-2 mb-7 flex-wrap">
                {selected.map((id) => {
                  const s = ALL_STICKERS.find((st) => st.id === id)!;
                  return (
                    <motion.div
                      key={id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{
                        background: "rgba(43,170,143,0.12)",
                        border: "1px solid rgba(43,170,143,0.3)",
                      }}
                    >
                      {s.emoji}
                    </motion.div>
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
                  boxShadow: "0 0 32px rgba(43,170,143,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
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
                Edit selection
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
