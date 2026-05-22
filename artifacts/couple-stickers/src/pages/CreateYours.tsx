import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useStickers, type Tag } from "@/hooks/useStickers";

const MIN_SELECT = 9;

const TAG_STYLES: Record<Tag, { bg: string; text: string; border: string }> = {
  Romance:     { bg:"rgba(232,87,58,0.15)",   text:"rgba(232,87,58,0.95)",   border:"rgba(232,87,58,0.3)"   },
  Cozy:        { bg:"rgba(240,147,106,0.15)", text:"rgba(240,147,106,0.95)", border:"rgba(240,147,106,0.3)" },
  Cute:        { bg:"rgba(232,196,90,0.15)",  text:"rgba(232,196,90,0.95)",  border:"rgba(232,196,90,0.3)"  },
  Playful:     { bg:"rgba(43,170,143,0.15)",  text:"rgba(43,170,143,0.95)",  border:"rgba(43,170,143,0.3)"  },
  Emotional:   { bg:"rgba(139,92,246,0.15)",  text:"rgba(167,139,250,0.95)", border:"rgba(139,92,246,0.3)"  },
  Classic:     { bg:"rgba(99,179,237,0.15)",  text:"rgba(147,210,255,0.95)", border:"rgba(99,179,237,0.3)"  },
  Trending:    { bg:"rgba(236,72,153,0.15)",  text:"rgba(251,113,183,0.95)", border:"rgba(236,72,153,0.3)"  },
  "Soft Love": { bg:"rgba(248,113,113,0.15)", text:"rgba(252,165,165,0.95)", border:"rgba(248,113,113,0.3)" },
};

export default function CreateYours() {
  const [, setLocation] = useLocation();
  const { stickers }  = useStickers();
  const visible       = stickers.filter((s) => s.enabled);

  const [selected,    setSelected]    = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem("ours_selected_stickers");
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem("ours_selected_stickers", JSON.stringify(selected));
  }, [selected]);
  const [showSuccess, setShowSuccess] = useState(false);

  const filled = selected.length;
  const pct    = Math.min(100, (filled / MIN_SELECT) * 100);
  const atMin  = filled >= MIN_SELECT;

  function toggle(id: number) {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((s) => s !== id));
    } else {
      setSelected((prev) => [...prev, id]);
    }
  }

  return (
    <div className="min-h-screen pb-44" style={{ background:"hsl(204,46%,9%)" }}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="blob-1 absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-25"
          style={{ background:"radial-gradient(circle, rgba(43,170,143,0.6) 0%, transparent 70%)" }} />
        <div className="blob-2 absolute bottom-[5%] right-[-8%] w-[560px] h-[560px] rounded-full opacity-20"
          style={{ background:"radial-gradient(circle, rgba(232,196,90,0.5) 0%, transparent 70%)" }} />
        <div className="blob-3 absolute top-[55%] left-[20%] w-[420px] h-[420px] rounded-full opacity-15"
          style={{ background:"radial-gradient(circle, rgba(240,147,106,0.5) 0%, transparent 70%)" }} />
        <div className="blob-4 absolute top-[20%] right-[15%] w-[380px] h-[380px] rounded-full opacity-15"
          style={{ background:"radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
      </div>

      {/* Sticky nav */}
      <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background:"rgba(12,28,38,0.82)", backdropFilter:"blur(28px) saturate(180%)", WebkitBackdropFilter:"blur(28px) saturate(180%)", borderBottom:"1px solid rgba(43,170,143,0.15)", boxShadow:"0 4px 24px rgba(0,0,0,0.4)" }}>
        <Link href="/">
          <motion.button type="button" whileHover={{ scale:1.05, x:-2 }} whileTap={{ scale:0.95 }}
            className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color:"rgba(43,170,143,0.8)" }}>
            ← Back
          </motion.button>
        </Link>
        <span className="text-xl font-bold tracking-tighter" style={{ color:"hsl(43,80%,92%)" }}>Ours. 💖</span>
        <motion.div layout className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
          style={{
            background: atMin ? "rgba(43,170,143,0.12)" : "rgba(29,58,74,0.6)",
            border: atMin ? "1px solid rgba(43,170,143,0.4)" : "1px solid rgba(43,170,143,0.2)",
            color: atMin ? "rgba(43,170,143,0.85)" : "hsl(43,80%,75%)",
          }}>
          {filled} selected
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="text-center mb-12">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background:"rgba(232,87,58,0.12)", border:"1px solid rgba(232,87,58,0.25)", color:"rgba(232,87,58,0.85)" }}>
            ✦ Personalized just for you
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight"
            style={{ color:"hsl(43,80%,92%)", textShadow:"0 0 80px rgba(43,170,143,0.35)", letterSpacing:"-0.02em" }}>
            Build Your Love<br />
            <span style={{ background:"linear-gradient(135deg, rgba(232,196,90,0.95), rgba(240,147,106,0.9), rgba(232,87,58,0.85))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              Sticker Pack ✨
            </span>
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-2" style={{ color:"rgba(232,196,90,0.5)" }}>
            Choose your favorite moments together and create a personalized sticker sheet made just for your relationship.
          </p>
          <p className="text-sm font-medium" style={{ color:"rgba(43,170,143,0.55)" }}>
            Minimum 9 selections required
          </p>

          <AnimatePresence>
            {atMin && (
              <motion.div key="done" initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8 }}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
                style={{ background:"linear-gradient(135deg,rgba(43,170,143,0.2),rgba(232,196,90,0.15))", border:"1px solid rgba(232,196,90,0.35)", color:"rgba(232,196,90,0.9)" }}>
                ✨ Awesome! You can keep adding more if you'd like.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl mb-3">🎨</p>
            <p className="text-sm" style={{ color:"rgba(43,170,143,0.4)" }}>No stickers available yet.</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {visible.map((sticker, i) => {
            const isSelected = selected.includes(sticker.id);
            const selOrder   = selected.indexOf(sticker.id) + 1;
            const tag        = TAG_STYLES[sticker.tag];
            const hasPhoto   = !!sticker.image;

            return (
              <motion.div key={sticker.id}
                initial={{ opacity:0, y:20 }}
                animate={{ opacity:1, y:0, x:0 }}
                transition={{ delay:i * 0.025, duration:0.4 }}
                whileHover={{ y:-8, scale:1.04, transition:{ duration:0.18 } }}
                onClick={() => toggle(sticker.id)}
                className="relative cursor-pointer rounded-2xl overflow-hidden group"
                style={{
                  background: isSelected ? "rgba(43,170,143,0.13)" : "rgba(16,36,50,0.7)",
                  backdropFilter:"blur(20px) saturate(180%)",
                  WebkitBackdropFilter:"blur(20px) saturate(180%)",
                  border: isSelected ? "2px solid rgba(43,170,143,0.65)" : "1px solid rgba(43,170,143,0.13)",
                  boxShadow: isSelected ? "0 0 28px rgba(43,170,143,0.3),0 8px 28px rgba(0,0,0,0.4),inset 0 1px 0 rgba(232,196,90,0.15)" : "0 4px 20px rgba(0,0,0,0.3),inset 0 1px 0 rgba(232,196,90,0.07)",
                  transition:"border-color 0.2s, box-shadow 0.2s, background 0.2s",
                }}>
                {/* Specular */}
                <div className="absolute top-0 left-[10%] right-[10%] h-px z-10"
                  style={{ background:isSelected ? "linear-gradient(90deg,transparent,rgba(43,170,143,0.6),transparent)" : "linear-gradient(90deg,transparent,rgba(232,196,90,0.18),transparent)" }} />

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background:"radial-gradient(circle at 50% 30%, rgba(43,170,143,0.12) 0%, transparent 70%)" }} />

                {/* Art area — 1:1 square */}
                <div className="relative overflow-hidden" style={{ margin:"10px 10px 0 10px", borderRadius:"14px", aspectRatio:"1/1" }}>
                  {/* Pulsing ring on selected */}
                  {isSelected && (
                    <motion.div className="absolute inset-0 rounded-[14px] z-10"
                      animate={{ opacity:[0.5,0.15,0.5] }} transition={{ repeat:Infinity, duration:2.5 }}
                      style={{ border:"1px solid rgba(43,170,143,0.5)" }} />
                  )}

                  {hasPhoto ? (
                    /* Uploaded photo — always 1:1 object-cover */
                    <img src={sticker.image} alt={sticker.name}
                      className="w-full h-full object-cover"
                      style={{ display:"block" }} />
                  ) : (
                    /* Emoji fallback */
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background:isSelected ? "rgba(43,170,143,0.08)" : "rgba(29,58,74,0.35)" }}>
                      <motion.span className="text-4xl select-none"
                        animate={isSelected ? { scale:[1,1.15,1] } : { scale:1 }}
                        transition={isSelected ? { duration:0.4 } : {}}>
                        {sticker.emoji}
                      </motion.span>
                    </div>
                  )}

                  {/* Trending badge (top-left inside art) */}
                  {sticker.trending && (
                    <div className="absolute top-1.5 left-1.5 z-20 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background:"rgba(251,113,183,0.85)", color:"white", backdropFilter:"blur(8px)" }}>
                      🔥
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-3 py-3">
                  <p className="text-xs font-bold mb-1.5 truncate" style={{ color:isSelected ? "hsl(43,80%,96%)" : "hsl(43,80%,82%)" }}>
                    {sticker.name}
                  </p>
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background:tag.bg, color:tag.text, border:`1px solid ${tag.border}` }}>
                    {sticker.tag}
                  </span>
                </div>

                {/* Selection number badge */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{ opacity:0, scale:0.4, rotate:-20 }} animate={{ opacity:1, scale:1, rotate:0 }} exit={{ opacity:0, scale:0.4 }}
                      transition={{ type:"spring", stiffness:400, damping:20 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black z-20"
                      style={{ background:"rgba(43,170,143,0.95)", boxShadow:"0 2px 12px rgba(43,170,143,0.5)", color:"hsl(204,46%,9%)" }}>
                      {selOrder}
                    </motion.div>
                  )}
                </AnimatePresence>


              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <AnimatePresence>
        {filled > 0 && (
          <motion.div initial={{ y:100, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:100, opacity:0 }}
            transition={{ type:"spring", stiffness:300, damping:28 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
            <div className="max-w-2xl mx-auto rounded-2xl px-5 py-4"
              style={{ background:"rgba(10,24,34,0.92)", backdropFilter:"blur(36px) saturate(200%)", WebkitBackdropFilter:"blur(36px) saturate(200%)", border:"1px solid rgba(43,170,143,0.3)", boxShadow:"0 -4px 40px rgba(0,0,0,0.5),0 0 40px rgba(43,170,143,0.12),inset 0 1px 0 rgba(232,196,90,0.12)" }}>
              {/* Mini bar */}
              <div className="h-1 rounded-full mb-3 overflow-hidden" style={{ background:"rgba(43,170,143,0.1)" }}>
                <motion.div className="h-full rounded-full" animate={{ width:`${pct}%` }} transition={{ type:"spring", stiffness:200, damping:22 }}
                  style={{ background:"rgba(43,170,143,0.7)" }} />
              </div>
              <div className="flex items-center gap-3">
                {/* Thumbnails */}
                <div className="flex -space-x-2 flex-1 min-w-0 overflow-hidden">
                  {selected.slice(0, 10).map((id) => {
                    const s = visible.find((st) => st.id === id);
                    if (!s) return null;
                    return (
                      <motion.div key={id} initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
                        className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden"
                        style={{ background:"rgba(29,58,74,0.8)", borderColor:"rgba(43,170,143,0.5)" }}>
                        {s.image
                          ? <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                          : s.emoji
                        }
                      </motion.div>
                    );
                  })}
                  {filled > 10 && (
                    <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background:"rgba(29,58,74,0.8)", borderColor:"rgba(43,170,143,0.35)", color:"rgba(43,170,143,0.8)" }}>
                      +{filled - 10}
                    </div>
                  )}
                  {filled < MIN_SELECT && (
                    <div className="w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                      style={{ borderColor:"rgba(43,170,143,0.25)", color:"rgba(43,170,143,0.4)" }}>
                      {`${MIN_SELECT - filled}↑`}
                    </div>
                  )}
                </div>
                {/* CTA */}
                <motion.button type="button" onClick={() => atMin && setShowSuccess(true)}
                  whileHover={atMin ? { scale:1.05 } : {}} whileTap={atMin ? { scale:0.97 } : {}} disabled={!atMin}
                  className="rounded-full px-7 h-11 text-sm font-bold flex-shrink-0 transition-all duration-300"
                  style={atMin ? { background:"linear-gradient(135deg,rgba(43,170,143,0.9),rgba(232,196,90,0.85))", border:"1px solid rgba(232,196,90,0.4)", boxShadow:"0 0 28px rgba(43,170,143,0.4),inset 0 1px 0 rgba(255,255,255,0.2)", color:"hsl(204,46%,9%)", cursor:"pointer" } : { background:"rgba(43,170,143,0.1)", border:"1px solid rgba(43,170,143,0.18)", color:"rgba(43,170,143,0.35)", cursor:"not-allowed" }}>
                  {atMin ? "Order My Sheet →" : `${MIN_SELECT - filled} more to go`}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background:"rgba(6,16,24,0.88)", backdropFilter:"blur(16px)" }}
            onClick={() => setShowSuccess(false)}>
            <motion.div initial={{ scale:0.8, y:32 }} animate={{ scale:1, y:0 }} exit={{ scale:0.8, y:32 }}
              transition={{ type:"spring", stiffness:300, damping:24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative text-center p-10 rounded-3xl max-w-sm w-full"
              style={{ background:"rgba(16,36,50,0.98)", backdropFilter:"blur(40px)", border:"1px solid rgba(43,170,143,0.3)", boxShadow:"0 32px 80px rgba(0,0,0,0.65),0 0 60px rgba(43,170,143,0.2),inset 0 1px 0 rgba(232,196,90,0.18)" }}>
              <div className="absolute top-0 left-[15%] right-[15%] h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(232,196,90,0.5),transparent)" }} />
              <motion.div className="text-5xl mb-4" animate={{ rotate:[0,15,-12,8,-5,0], scale:[1,1.25,1] }} transition={{ duration:0.9 }}>🎉</motion.div>
              <h2 className="text-2xl font-black mb-2" style={{ color:"hsl(43,80%,92%)", letterSpacing:"-0.02em" }}>Amazing picks!</h2>
              <p className="text-sm mb-1" style={{ color:"rgba(232,196,90,0.55)" }}>{filled} sticker{filled > 1 ? "s" : ""} selected</p>
              <p className="text-xs mb-7" style={{ color:"rgba(43,170,143,0.5)" }}>Upload your photo to bring them to life.</p>
              <div className="flex justify-center gap-2 mb-7 flex-wrap">
                {selected.map((id) => {
                  const s = visible.find((st) => st.id === id);
                  if (!s) return null;
                  return (
                    <motion.div key={id} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", stiffness:400 }}
                      className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center"
                      style={{ background:"rgba(43,170,143,0.12)", border:"1px solid rgba(43,170,143,0.3)" }}>
                      {s.image
                        ? <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        : <span className="text-xl">{s.emoji}</span>
                      }
                    </motion.div>
                  );
                })}
              </div>
              <motion.button type="button" whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
                onClick={() => setLocation("/upload")}
                className="w-full rounded-full h-12 font-bold text-base cursor-pointer"
                style={{ background:"linear-gradient(135deg,rgba(43,170,143,0.9),rgba(232,196,90,0.85))", border:"1px solid rgba(232,196,90,0.35)", boxShadow:"0 0 32px rgba(43,170,143,0.35),inset 0 1px 0 rgba(255,255,255,0.2)", color:"hsl(204,46%,9%)" }}>
                Upload My Photo →
              </motion.button>
              <button type="button" onClick={() => setShowSuccess(false)}
                className="mt-3 text-sm cursor-pointer hover:opacity-80 transition-opacity" style={{ color:"rgba(232,196,90,0.4)" }}>
                Edit selection
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
