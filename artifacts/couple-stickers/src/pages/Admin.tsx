import { useState, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useStickers, fileToSquareDataUrl, type Sticker, type Tag } from "@/hooks/useStickers";

type NavSection = "stickers" | "analytics" | "settings";

const ALL_TAGS: Tag[] = [
  "Romance", "Cozy", "Cute", "Playful", "Emotional", "Classic", "Trending", "Soft Love",
];

const TAG_COLORS: Record<Tag, string> = {
  Romance:     "rgba(232,87,58,0.9)",
  Cozy:        "rgba(240,147,106,0.9)",
  Cute:        "rgba(232,196,90,0.9)",
  Playful:     "rgba(43,170,143,0.9)",
  Emotional:   "rgba(167,139,250,0.9)",
  Classic:     "rgba(147,210,255,0.9)",
  Trending:    "rgba(251,113,183,0.9)",
  "Soft Love": "rgba(252,165,165,0.9)",
};

const EMOJIS = [
  "💋","🤗","😴","🌙","👫","☕","🤝","🎬","💍","🥊",
  "☂️","✈️","🥰","♾️","💃","😊","🛋️","🫶","🍦","🧣",
  "👀","🌅","🌟","🤙","📖","🌊","🎁","👗","🤳","💞",
  "🌸","🍓","🎀","🌈","🏡","🌻","🫂","💌","🎶","🍰",
];

const GLASS = {
  background: "rgba(16,36,50,0.75)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(43,170,143,0.15)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(232,196,90,0.07)",
} as const;

const EMPTY_FORM = {
  name: "", tag: "Romance" as Tag, emoji: "💋", image: undefined as string | undefined,
  enabled: true, trending: false,
};

export default function Admin() {
  const {
    stickers, addSticker, updateSticker, deleteSticker,
    reorder, toggleEnabled, toggleTrending, resetToDefaults,
  } = useStickers();

  const [nav, setNav]               = useState<NavSection>("stickers");
  const [search, setSearch]         = useState("");
  const [previewId, setPreviewId]   = useState<number | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState<number | null>(null);
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [saved, setSaved]           = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [toast, setToast]           = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const toastTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = stickers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.tag.toLowerCase().includes(search.toLowerCase())
  );

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setSaved(false);
    setShowModal(true);
  }

  function openEdit(s: Sticker) {
    setEditId(s.id);
    setForm({ name: s.name, tag: s.tag, emoji: s.emoji, image: s.image, enabled: s.enabled, trending: s.trending });
    setSaved(false);
    setShowModal(true);
  }

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith("image/")) { showToast("Please upload an image file"); return; }
    setImageUploading(true);
    try {
      const dataUrl = await fileToSquareDataUrl(file, 600);
      setForm((f) => ({ ...f, image: dataUrl }));
    } catch {
      showToast("Failed to process image. Try another file.");
    } finally {
      setImageUploading(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const data = { ...form, name: form.name.trim() };
    if (editId !== null) {
      updateSticker(editId, data);
      showToast("✅ Sticker updated");
    } else {
      addSticker(data);
      showToast("✅ New sticker added");
    }
    setSaved(true);
    setTimeout(() => setShowModal(false), 500);
  }

  function handleDelete(id: number) {
    if (confirmDeleteId === id) {
      deleteSticker(id);
      if (previewId === id) setPreviewId(null);
      setConfirmDeleteId(null);
      showToast("🗑️ Sticker deleted");
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 2500);
    }
  }

  const total    = stickers.length;
  const enabled  = stickers.filter((s) => s.enabled).length;
  const trending = stickers.filter((s) => s.trending).length;
  const previewSticker = previewId != null ? stickers.find((s) => s.id === previewId) : null;

  return (
    <div className="flex min-h-screen" style={{ background: "hsl(204,46%,9%)" }}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="blob-1 absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(43,170,143,0.5) 0%, transparent 70%)" }} />
        <div className="blob-3 absolute bottom-0 right-[-5%] w-[450px] h-[450px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 z-[100] -translate-x-1/2 px-6 py-3 rounded-full text-sm font-bold pointer-events-none"
            style={{ background: "rgba(43,170,143,0.95)", color: "hsl(204,46%,9%)", boxShadow: "0 8px 32px rgba(43,170,143,0.4)" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Sidebar ─── */}
      <div className="w-60 flex-shrink-0 flex flex-col py-6 px-4 sticky top-0 h-screen overflow-y-auto"
        style={{ background: "rgba(10,24,34,0.95)", borderRight: "1px solid rgba(43,170,143,0.15)", backdropFilter: "blur(28px)" }}>
        <div className="mb-8 px-2">
          <a href="/"><span className="text-xl font-black tracking-tighter" style={{ color: "hsl(43,80%,92%)" }}>Ours.</span></a>
          <span className="block text-xs font-semibold mt-0.5" style={{ color: "rgba(43,170,143,0.6)" }}>Admin Dashboard</span>
        </div>
        <nav className="flex flex-col gap-1.5">
          {(["stickers","analytics","settings"] as NavSection[]).map((s) => {
            const icons:  Record<NavSection,string> = { stickers:"🎨", analytics:"📊", settings:"⚙️" };
            const labels: Record<NavSection,string> = { stickers:"Sticker Manager", analytics:"Analytics", settings:"Settings" };
            const active = nav === s;
            return (
              <motion.button key={s} onClick={() => setNav(s)} whileHover={{ x: 3 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left w-full cursor-pointer transition-all duration-200"
                style={{
                  background: active ? "rgba(43,170,143,0.15)" : "transparent",
                  border: active ? "1px solid rgba(43,170,143,0.28)" : "1px solid transparent",
                  color: active ? "rgba(43,170,143,0.95)" : "rgba(232,196,90,0.5)",
                }}>
                <span>{icons[s]}</span>{labels[s]}
              </motion.button>
            );
          })}
        </nav>
        <div className="mt-auto pt-6 border-t" style={{ borderColor: "rgba(43,170,143,0.12)" }}>
          <div className="px-4 py-3 rounded-xl mb-3" style={{ background: "rgba(43,170,143,0.08)", border: "1px solid rgba(43,170,143,0.15)" }}>
            <p className="text-xs" style={{ color: "rgba(43,170,143,0.5)" }}>Total Stickers</p>
            <p className="text-3xl font-black mt-0.5" style={{ color: "hsl(43,80%,90%)" }}>{total}</p>
          </div>
          <a href="/create" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(43,170,143,0.08)", border: "1px solid rgba(43,170,143,0.15)", color: "rgba(43,170,143,0.75)" }}>
            👁 Preview /create
          </a>
        </div>
      </div>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 sticky top-0 z-30"
          style={{ borderBottom: "1px solid rgba(43,170,143,0.12)", background: "rgba(10,24,34,0.75)", backdropFilter: "blur(20px)" }}>
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "hsl(43,80%,92%)", letterSpacing: "-0.02em" }}>
              {{ stickers:"Sticker Manager", analytics:"Analytics", settings:"Settings" }[nav]}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(232,196,90,0.4)" }}>
              {{ stickers:"Add, edit, reorder and manage your sticker library — changes appear on /create instantly",
                 analytics:"Overview of your sticker catalogue", settings:"Configure selection rules" }[nav]}
            </p>
          </div>
          {nav === "stickers" && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={openAdd}
              className="rounded-full px-6 h-10 text-sm font-bold cursor-pointer flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(43,170,143,0.6))",
                border: "1px solid rgba(43,170,143,0.45)",
                boxShadow: "0 0 24px rgba(43,170,143,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                color: "hsl(204,46%,9%)",
              }}>
              + Add Sticker
            </motion.button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8">

          {/* ═══ STICKER MANAGER ═══ */}
          {nav === "stickers" && (
            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label:"Total",    value:total,    color:"rgba(43,170,143,0.9)",  icon:"🎨" },
                    { label:"Active",   value:enabled,  color:"rgba(232,196,90,0.9)",  icon:"✅" },
                    { label:"Trending", value:trending, color:"rgba(251,113,183,0.9)", icon:"🔥" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl p-5" style={GLASS}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold" style={{ color:"rgba(232,196,90,0.5)" }}>{stat.label}</span>
                        <span>{stat.icon}</span>
                      </div>
                      <p className="text-3xl font-black" style={{ color:stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Search */}
                <div className="mb-4 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color:"rgba(43,170,143,0.45)" }}>🔍</span>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or category…"
                    className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none"
                    style={{ background:"rgba(29,58,74,0.5)", border:"1px solid rgba(43,170,143,0.2)", color:"hsl(43,80%,90%)" }} />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
                      style={{ color:"rgba(43,170,143,0.5)" }}>✕</button>
                  )}
                </div>

                {/* Table */}
                <div className="rounded-2xl overflow-hidden" style={GLASS}>
                  <div className="grid text-xs font-semibold px-5 py-3"
                    style={{ gridTemplateColumns:"3rem 1fr 7.5rem 6rem 6.5rem 7.5rem", color:"rgba(43,170,143,0.5)", borderBottom:"1px solid rgba(43,170,143,0.1)" }}>
                    <span>Art</span><span>Sticker</span><span>Category</span>
                    <span>Status</span><span>Trending</span><span className="text-right">Actions</span>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="py-16 text-center" style={{ color:"rgba(43,170,143,0.35)" }}>
                      <p className="text-3xl mb-2">🔍</p>
                      <p className="text-sm">No stickers match "{search}"</p>
                    </div>
                  ) : (
                    <Reorder.Group axis="y" values={filtered} onReorder={(items) => {
                      const ids = new Set(items.map((s) => s.id));
                      const rest = stickers.filter((s) => !ids.has(s.id));
                      reorder([...items, ...rest]);
                    }}>
                      {filtered.map((sticker, i) => {
                        const tagColor = TAG_COLORS[sticker.tag];
                        const isConfirm = confirmDeleteId === sticker.id;
                        return (
                          <Reorder.Item key={sticker.id} value={sticker} as="div">
                            <motion.div layout
                              className="grid items-center px-5 py-3"
                              style={{
                                gridTemplateColumns:"3rem 1fr 7.5rem 6rem 6.5rem 7.5rem",
                                borderBottom: i < filtered.length - 1 ? "1px solid rgba(43,170,143,0.06)" : "none",
                                cursor:"grab",
                              }}
                              whileHover={{ background:"rgba(43,170,143,0.04)" }}>

                              {/* Thumbnail */}
                              <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
                                style={{ background:"rgba(29,58,74,0.6)", border:"1px solid rgba(43,170,143,0.2)" }}>
                                {sticker.image
                                  ? <img src={sticker.image} alt={sticker.name} className="w-full h-full object-cover" />
                                  : <span className="text-xl">{sticker.emoji}</span>
                                }
                              </div>

                              {/* Name */}
                              <div className="min-w-0 px-3">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold truncate" style={{ color:"hsl(43,80%,88%)" }}>{sticker.name}</p>
                                  {sticker.trending && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                      style={{ background:"rgba(251,113,183,0.15)", color:"rgba(251,113,183,0.9)", border:"1px solid rgba(251,113,183,0.25)" }}>🔥</span>
                                  )}
                                </div>
                                <p className="text-[11px] mt-0.5" style={{ color:"rgba(43,170,143,0.4)" }}>#{sticker.id} · {sticker.image ? "📷 Photo" : "emoji"}</p>
                              </div>

                              {/* Tag */}
                              <span className="inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full w-fit"
                                style={{ background:`${tagColor.replace("0.9","0.12")}`, color:tagColor, border:`1px solid ${tagColor.replace("0.9","0.25")}` }}>
                                {sticker.tag}
                              </span>

                              {/* Enabled toggle */}
                              <button onClick={() => { toggleEnabled(sticker.id); showToast(sticker.enabled ? "Sticker disabled" : "Sticker enabled"); }}
                                className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer w-fit"
                                style={{ color:sticker.enabled ? "rgba(43,170,143,0.85)" : "rgba(232,196,90,0.35)" }}>
                                <div className="w-9 h-5 rounded-full relative transition-all duration-200"
                                  style={{ background:sticker.enabled ? "rgba(43,170,143,0.7)" : "rgba(43,170,143,0.15)" }}>
                                  <motion.div animate={{ left:sticker.enabled ? "calc(100% - 18px)" : "2px" }}
                                    transition={{ type:"spring", stiffness:500, damping:30 }}
                                    className="absolute top-[3px] w-3.5 h-3.5 rounded-full"
                                    style={{ background:sticker.enabled ? "white" : "rgba(43,170,143,0.4)" }} />
                                </div>
                                {sticker.enabled ? "On" : "Off"}
                              </button>

                              {/* Trending */}
                              <button onClick={() => { toggleTrending(sticker.id); showToast(sticker.trending ? "Removed from trending" : "Marked trending 🔥"); }}
                                className="text-xs font-semibold cursor-pointer hover:scale-105 transition-transform"
                                style={{ color:sticker.trending ? "rgba(251,113,183,0.9)" : "rgba(232,196,90,0.3)" }}>
                                {sticker.trending ? "🔥 Trending" : "— —"}
                              </button>

                              {/* Actions */}
                              <div className="flex items-center justify-end gap-1.5">
                                <motion.button whileHover={{ scale:1.12 }} whileTap={{ scale:0.92 }}
                                  onClick={() => setPreviewId(previewId === sticker.id ? null : sticker.id)} title="Preview"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm cursor-pointer"
                                  style={{ background:previewId === sticker.id ? "rgba(43,170,143,0.25)" : "rgba(43,170,143,0.08)", border:`1px solid ${previewId === sticker.id ? "rgba(43,170,143,0.5)" : "rgba(43,170,143,0.2)"}` }}>
                                  👁
                                </motion.button>
                                <motion.button whileHover={{ scale:1.12 }} whileTap={{ scale:0.92 }}
                                  onClick={() => openEdit(sticker)} title="Edit"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm cursor-pointer"
                                  style={{ background:"rgba(232,196,90,0.08)", border:"1px solid rgba(232,196,90,0.2)" }}>
                                  ✏️
                                </motion.button>
                                <motion.button whileHover={{ scale:1.12 }} whileTap={{ scale:0.92 }}
                                  onClick={() => handleDelete(sticker.id)} title={isConfirm ? "Confirm?" : "Delete"}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all"
                                  style={{ background:isConfirm ? "rgba(232,87,58,0.25)" : "rgba(232,87,58,0.08)", border:`1px solid ${isConfirm ? "rgba(232,87,58,0.6)" : "rgba(232,87,58,0.2)"}`, boxShadow:isConfirm ? "0 0 12px rgba(232,87,58,0.25)" : "none" }}>
                                  {isConfirm ? "⚠️" : "🗑"}
                                </motion.button>
                              </div>
                            </motion.div>
                          </Reorder.Item>
                        );
                      })}
                    </Reorder.Group>
                  )}
                </div>

                <div className="mt-4 text-right">
                  <button onClick={() => { resetToDefaults(); showToast("Reset to default stickers"); }}
                    className="text-xs cursor-pointer hover:opacity-80 transition-opacity" style={{ color:"rgba(232,196,90,0.3)" }}>
                    Reset to defaults
                  </button>
                </div>
              </div>

              {/* ─── Preview Panel ─── */}
              <AnimatePresence>
                {previewSticker && (
                  <motion.div key="preview" initial={{ opacity:0, x:20, width:0 }} animate={{ opacity:1, x:0, width:240 }} exit={{ opacity:0, x:20, width:0 }} className="flex-shrink-0 overflow-hidden">
                    <div className="w-60 sticky top-8">
                      <div className="rounded-2xl p-5" style={GLASS}>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-xs font-semibold" style={{ color:"rgba(43,170,143,0.6)" }}>Card Preview</p>
                          <button onClick={() => setPreviewId(null)} className="text-xs cursor-pointer hover:opacity-70" style={{ color:"rgba(232,196,90,0.4)" }}>✕</button>
                        </div>
                        {/* Sticker card mockup */}
                        <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(43,170,143,0.1)", border:"2px solid rgba(43,170,143,0.5)", boxShadow:"0 0 24px rgba(43,170,143,0.2)" }}>
                          <div className="aspect-square m-2.5 rounded-xl overflow-hidden flex items-center justify-center"
                            style={{ background:"rgba(43,170,143,0.08)" }}>
                            {previewSticker.image
                              ? <img src={previewSticker.image} alt={previewSticker.name} className="w-full h-full object-cover" />
                              : <motion.span className="text-6xl" animate={{ scale:[1,1.08,1] }} transition={{ repeat:Infinity, duration:2.5 }}>{previewSticker.emoji}</motion.span>
                            }
                          </div>
                          <div className="px-3 pb-3">
                            <p className="text-sm font-bold mb-1.5 truncate" style={{ color:"hsl(43,80%,92%)" }}>{previewSticker.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background:`${TAG_COLORS[previewSticker.tag].replace("0.9","0.15")}`, color:TAG_COLORS[previewSticker.tag], border:`1px solid ${TAG_COLORS[previewSticker.tag].replace("0.9","0.3")}` }}>
                                {previewSticker.tag}
                              </span>
                              {previewSticker.trending && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background:"rgba(251,113,183,0.15)", color:"rgba(251,113,183,0.9)", border:"1px solid rgba(251,113,183,0.25)" }}>🔥 Trending</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2 text-xs">
                          {[
                            { label:"ID",      value:`#${previewSticker.id}` },
                            { label:"Art",     value:previewSticker.image ? "📷 Photo uploaded" : "🎨 Emoji",
                              valueColor:previewSticker.image ? "rgba(43,170,143,0.9)" : "rgba(232,196,90,0.5)" },
                            { label:"Status",  value:previewSticker.enabled ? "Active" : "Disabled",
                              valueColor:previewSticker.enabled ? "rgba(43,170,143,0.9)" : "rgba(232,87,58,0.7)" },
                            { label:"Trending",value:previewSticker.trending ? "Yes" : "No",
                              valueColor:previewSticker.trending ? "rgba(251,113,183,0.9)" : "rgba(232,196,90,0.4)" },
                          ].map((row) => (
                            <div key={row.label} className="flex justify-between" style={{ borderBottom:"1px solid rgba(43,170,143,0.07)", paddingBottom:"6px" }}>
                              <span style={{ color:"rgba(43,170,143,0.5)" }}>{row.label}</span>
                              <span style={{ color:row.valueColor ?? "rgba(232,196,90,0.6)", fontWeight:600 }}>{row.value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => openEdit(previewSticker)}
                            className="flex-1 rounded-xl h-8 text-xs font-bold cursor-pointer"
                            style={{ background:"rgba(232,196,90,0.12)", border:"1px solid rgba(232,196,90,0.25)", color:"rgba(232,196,90,0.85)" }}>
                            Edit
                          </motion.button>
                          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => handleDelete(previewSticker.id)}
                            className="flex-1 rounded-xl h-8 text-xs font-bold cursor-pointer"
                            style={{ background:"rgba(232,87,58,0.1)", border:"1px solid rgba(232,87,58,0.2)", color:"rgba(232,87,58,0.8)" }}>
                            {confirmDeleteId === previewSticker.id ? "Confirm?" : "Delete"}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {nav === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label:"Total Stickers", value:total,          icon:"🎨", color:"rgba(43,170,143,0.9)"  },
                  { label:"Active",         value:enabled,        icon:"✅", color:"rgba(232,196,90,0.9)"  },
                  { label:"Disabled",       value:total-enabled,  icon:"🔒", color:"rgba(232,87,58,0.8)"   },
                  { label:"With Photos",    value:stickers.filter(s=>!!s.image).length, icon:"📷", color:"rgba(147,210,255,0.9)" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl p-6" style={GLASS}>
                    <span className="text-2xl">{s.icon}</span>
                    <p className="text-3xl font-black mt-3 mb-1" style={{ color:s.color }}>{s.value}</p>
                    <p className="text-xs font-semibold" style={{ color:"rgba(232,196,90,0.4)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-6" style={GLASS}>
                <h3 className="font-bold mb-5 text-sm" style={{ color:"hsl(43,80%,85%)" }}>Category Distribution</h3>
                {ALL_TAGS.map((tag) => {
                  const count = stickers.filter((s) => s.tag === tag).length;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={tag} className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color:TAG_COLORS[tag] }}>{tag}</span>
                        <span style={{ color:"rgba(232,196,90,0.5)" }}>{count}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(43,170,143,0.08)" }}>
                        <motion.div className="h-full rounded-full" initial={{ width:0 }} animate={{ width:`${pct}%` }}
                          transition={{ duration:0.8, ease:"easeOut" }} style={{ background:TAG_COLORS[tag] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {nav === "settings" && (
            <div className="max-w-lg space-y-4">
              <div className="rounded-2xl p-6" style={GLASS}>
                <h3 className="font-bold text-sm mb-5" style={{ color:"hsl(43,80%,85%)" }}>Selection Rules</h3>
                {[
                  { label:"Minimum selections", value:"7 stickers"    },
                  { label:"Maximum selections", value:"14 stickers"   },
                  { label:"Image format",        value:"1:1 square"   },
                  { label:"Image output size",   value:"600 × 600 px" },
                  { label:"Storage",             value:"localStorage" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid rgba(43,170,143,0.08)" }}>
                    <span className="text-sm" style={{ color:"rgba(232,196,90,0.55)" }}>{row.label}</span>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ background:"rgba(43,170,143,0.1)", color:"hsl(43,80%,85%)", border:"1px solid rgba(43,170,143,0.15)" }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-6" style={GLASS}>
                <h3 className="font-bold text-sm mb-2" style={{ color:"hsl(43,80%,85%)" }}>Data Management</h3>
                <p className="text-xs mb-5" style={{ color:"rgba(232,196,90,0.4)" }}>Sticker data (including photos) is stored in your browser's local storage.</p>
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={() => { resetToDefaults(); showToast("Reset to 30 default stickers"); }}
                  className="rounded-xl px-5 h-9 text-sm font-bold cursor-pointer"
                  style={{ background:"rgba(232,87,58,0.12)", border:"1px solid rgba(232,87,58,0.25)", color:"rgba(232,87,58,0.8)" }}>
                  Reset to defaults
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add / Edit Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background:"rgba(6,16,24,0.90)", backdropFilter:"blur(16px)" }}
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale:0.85, y:24 }} animate={{ scale:1, y:0 }} exit={{ scale:0.85, y:24 }}
              transition={{ type:"spring", stiffness:300, damping:26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl p-8 relative"
              style={{
                background:"rgba(16,36,50,0.98)", backdropFilter:"blur(40px)",
                border:"1px solid rgba(43,170,143,0.3)",
                boxShadow:"0 32px 80px rgba(0,0,0,0.65), 0 0 60px rgba(43,170,143,0.15), inset 0 1px 0 rgba(232,196,90,0.15)",
                maxHeight:"92vh", overflowY:"auto",
              }}>
              <div className="absolute top-0 left-[15%] right-[15%] h-px rounded-full"
                style={{ background:"linear-gradient(90deg, transparent, rgba(232,196,90,0.4), transparent)" }} />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black" style={{ color:"hsl(43,80%,92%)", letterSpacing:"-0.02em" }}>
                  {editId !== null ? "Edit Sticker" : "Add New Sticker"}
                </h2>
                <button onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer hover:opacity-70"
                  style={{ background:"rgba(43,170,143,0.1)", color:"rgba(43,170,143,0.7)" }}>✕</button>
              </div>

              <div className="space-y-5">
                {/* ── IMAGE UPLOAD ── */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color:"rgba(43,170,143,0.7)" }}>
                    Sticker Photo <span style={{ color:"rgba(232,196,90,0.45)" }}>(1:1 square, auto-cropped)</span>
                  </label>

                  {/* Hidden file input */}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />

                  {form.image ? (
                    /* Uploaded image preview */
                    <div className="relative">
                      <div className="rounded-2xl overflow-hidden" style={{ aspectRatio:"1/1", maxWidth:"180px" }}>
                        <img src={form.image} alt="Sticker preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-2 mt-2" style={{ maxWidth:"180px" }}>
                        <motion.button whileHover={{ scale:1.03 }} onClick={() => fileInputRef.current?.click()}
                          className="flex-1 rounded-xl h-8 text-xs font-bold cursor-pointer"
                          style={{ background:"rgba(43,170,143,0.12)", border:"1px solid rgba(43,170,143,0.25)", color:"rgba(43,170,143,0.8)" }}>
                          Change Photo
                        </motion.button>
                        <motion.button whileHover={{ scale:1.03 }} onClick={() => setForm((f) => ({ ...f, image:undefined }))}
                          className="rounded-xl h-8 px-3 text-xs font-bold cursor-pointer"
                          style={{ background:"rgba(232,87,58,0.1)", border:"1px solid rgba(232,87,58,0.2)", color:"rgba(232,87,58,0.8)" }}>
                          Remove
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    /* Drop zone */
                    <motion.div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      whileHover={{ scale:1.01 }}
                      className="rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-200"
                      style={{
                        aspectRatio:"1/1", maxWidth:"180px",
                        border:`2px dashed ${dragOver ? "rgba(43,170,143,0.7)" : "rgba(43,170,143,0.25)"}`,
                        background:dragOver ? "rgba(43,170,143,0.1)" : "rgba(29,58,74,0.35)",
                      }}>
                      {imageUploading ? (
                        <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:"linear" }}
                          className="w-8 h-8 rounded-full border-2 border-t-transparent"
                          style={{ borderColor:"rgba(43,170,143,0.6)", borderTopColor:"transparent" }} />
                      ) : (
                        <>
                          <span className="text-3xl">📷</span>
                          <div className="text-center px-4">
                            <p className="text-xs font-semibold" style={{ color:"rgba(43,170,143,0.7)" }}>
                              {dragOver ? "Drop to upload" : "Click or drag & drop"}
                            </p>
                            <p className="text-[10px] mt-1" style={{ color:"rgba(232,196,90,0.35)" }}>JPG, PNG, WEBP · 1:1 crop</p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Fallback note */}
                  <p className="text-[10px] mt-2" style={{ color:"rgba(43,170,143,0.35)" }}>
                    If no photo is uploaded, the emoji icon will be shown instead.
                  </p>
                </div>

                {/* ── NAME ── */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color:"rgba(43,170,143,0.7)" }}>Sticker Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name:e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    placeholder="e.g. Midnight Cuddles" autoFocus
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background:"rgba(29,58,74,0.6)", border:`1px solid ${form.name.trim() ? "rgba(43,170,143,0.4)" : "rgba(43,170,143,0.2)"}`, color:"hsl(43,80%,90%)" }} />
                </div>

                {/* ── CATEGORY ── */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color:"rgba(43,170,143,0.7)" }}>Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_TAGS.map((tag) => (
                      <button key={tag} onClick={() => setForm((f) => ({ ...f, tag }))}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-150"
                        style={{
                          background: form.tag === tag ? `${TAG_COLORS[tag].replace("0.9","0.2")}` : "rgba(29,58,74,0.4)",
                          border:`1px solid ${form.tag === tag ? TAG_COLORS[tag] : "rgba(43,170,143,0.15)"}`,
                          color: form.tag === tag ? TAG_COLORS[tag] : "rgba(232,196,90,0.45)",
                        }}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── EMOJI (fallback) ── */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color:"rgba(43,170,143,0.7)" }}>
                    Emoji Icon <span style={{ color:"rgba(232,196,90,0.35)" }}>(shown when no photo)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1"
                    style={{ scrollbarWidth:"thin", scrollbarColor:"rgba(43,170,143,0.2) transparent" }}>
                    {EMOJIS.map((e) => (
                      <button key={e} onClick={() => setForm((f) => ({ ...f, emoji:e }))}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xl cursor-pointer transition-all duration-150"
                        style={{
                          background: form.emoji === e ? "rgba(43,170,143,0.25)" : "rgba(29,58,74,0.4)",
                          border:`1px solid ${form.emoji === e ? "rgba(43,170,143,0.6)" : "rgba(43,170,143,0.12)"}`,
                          transform: form.emoji === e ? "scale(1.1)" : "scale(1)",
                        }}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live mini-preview */}
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background:"rgba(29,58,74,0.35)", border:"1px solid rgba(43,170,143,0.12)" }}>
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ background:"rgba(43,170,143,0.1)", border:"1px solid rgba(43,170,143,0.25)" }}>
                    {form.image
                      ? <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      : <span className="text-2xl">{form.emoji}</span>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color:"hsl(43,80%,88%)" }}>{form.name || "Sticker name"}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background:`${TAG_COLORS[form.tag].replace("0.9","0.12")}`, color:TAG_COLORS[form.tag], border:`1px solid ${TAG_COLORS[form.tag].replace("0.9","0.2")}` }}>
                      {form.tag}
                    </span>
                  </div>
                  <div className="ml-auto text-xs" style={{ color:"rgba(43,170,143,0.5)" }}>
                    {form.image ? "📷 Photo" : "🎨 Emoji"}
                  </div>
                </div>

                {/* ── TOGGLES ── */}
                <div className="flex gap-6">
                  {[
                    { key:"enabled" as const,  label:"Active",      onColor:"rgba(43,170,143,0.8)",  offColor:"rgba(43,170,143,0.2)" },
                    { key:"trending" as const, label:"🔥 Trending",  onColor:"rgba(251,113,183,0.8)", offColor:"rgba(251,113,183,0.2)" },
                  ].map(({ key, label, onColor, offColor }) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                      <div onClick={() => setForm((f) => ({ ...f, [key]:!f[key] }))}
                        className="w-9 h-5 rounded-full relative transition-all duration-200 cursor-pointer"
                        style={{ background:form[key] ? onColor : offColor }}>
                        <motion.div animate={{ left:form[key] ? "calc(100% - 18px)" : "2px" }}
                          transition={{ type:"spring", stiffness:500, damping:30 }}
                          className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white" />
                      </div>
                      <span className="text-sm font-semibold" style={{ color:form[key] ? "hsl(43,80%,85%)" : "rgba(232,196,90,0.4)" }}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-3 mt-7">
                <motion.button
                  whileHover={form.name.trim() ? { scale:1.04 } : {}}
                  whileTap={form.name.trim() ? { scale:0.97 } : {}}
                  onClick={handleSave}
                  disabled={!form.name.trim() || saved}
                  className="flex-1 rounded-full h-11 font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    background: saved ? "rgba(43,170,143,0.5)" : form.name.trim()
                      ? "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(232,196,90,0.85))"
                      : "rgba(43,170,143,0.12)",
                    border:"1px solid rgba(43,170,143,0.3)",
                    color: form.name.trim() ? "hsl(204,46%,9%)" : "rgba(43,170,143,0.3)",
                    boxShadow: form.name.trim() ? "0 0 20px rgba(43,170,143,0.3)" : "none",
                    cursor: form.name.trim() && !saved ? "pointer" : "not-allowed",
                  }}>
                  {saved ? "✓ Saved!" : editId !== null ? "Save Changes" : "Add Sticker"}
                </motion.button>
                <button onClick={() => setShowModal(false)}
                  className="px-6 rounded-full h-11 text-sm font-semibold cursor-pointer hover:opacity-80"
                  style={{ background:"rgba(29,58,74,0.5)", border:"1px solid rgba(43,170,143,0.15)", color:"rgba(232,196,90,0.5)" }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
