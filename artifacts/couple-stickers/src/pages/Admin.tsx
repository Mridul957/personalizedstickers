import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

type Tag = "Romance" | "Cozy" | "Cute" | "Playful" | "Emotional" | "Classic" | "Trending" | "Soft Love";
type NavSection = "stickers" | "analytics" | "settings";

interface StickerItem {
  id: number;
  name: string;
  tag: Tag;
  emoji: string;
  enabled: boolean;
  trending: boolean;
}

const INITIAL_STICKERS: StickerItem[] = [
  { id: 1,  name: "The First Kiss",     tag: "Romance",   emoji: "💋", enabled: true,  trending: true  },
  { id: 2,  name: "Forever Hug",        tag: "Cozy",      emoji: "🤗", enabled: true,  trending: false },
  { id: 3,  name: "Sleepy Together",    tag: "Soft Love", emoji: "😴", enabled: true,  trending: false },
  { id: 4,  name: "Late Night Calls",   tag: "Emotional", emoji: "🌙", enabled: true,  trending: true  },
  { id: 5,  name: "Matching Hoodies",   tag: "Cute",      emoji: "👫", enabled: true,  trending: false },
  { id: 6,  name: "Coffee Date",        tag: "Classic",   emoji: "☕", enabled: true,  trending: false },
  { id: 7,  name: "Holding Hands",      tag: "Classic",   emoji: "🤝", enabled: true,  trending: false },
  { id: 8,  name: "Movie Night",        tag: "Cozy",      emoji: "🎬", enabled: false, trending: false },
  { id: 9,  name: "Forever Yours",      tag: "Romance",   emoji: "💍", enabled: true,  trending: true  },
  { id: 10, name: "Cute Fight",         tag: "Playful",   emoji: "🥊", enabled: true,  trending: false },
];

const ALL_TAGS: Tag[] = ["Romance", "Cozy", "Cute", "Playful", "Emotional", "Classic", "Trending", "Soft Love"];

const TAG_COLORS: Record<Tag, string> = {
  Romance:   "rgba(232,87,58,0.9)",
  Cozy:      "rgba(240,147,106,0.9)",
  Cute:      "rgba(232,196,90,0.9)",
  Playful:   "rgba(43,170,143,0.9)",
  Emotional: "rgba(167,139,250,0.9)",
  Classic:   "rgba(147,210,255,0.9)",
  Trending:  "rgba(251,113,183,0.9)",
  "Soft Love": "rgba(252,165,165,0.9)",
};

const GLASS = {
  background: "rgba(16,36,50,0.7)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(43,170,143,0.15)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(232,196,90,0.07)",
};

const EMOJIS = ["💋","🤗","😴","🌙","👫","☕","🤝","🎬","💍","🥊","☂️","✈️","🥰","♾️","💃","😊","🛋️","🫶","🍦","🧣","👀","🌅","🌟","🤙","📖","🌊","🎁","👗","🤳","💞"];

export default function Admin() {
  const [nav, setNav] = useState<NavSection>("stickers");
  const [stickers, setStickers] = useState<StickerItem[]>(INITIAL_STICKERS);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<StickerItem | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formTag, setFormTag] = useState<Tag>("Romance");
  const [formEmoji, setFormEmoji] = useState("💋");
  const [formEnabled, setFormEnabled] = useState(true);
  const [formTrending, setFormTrending] = useState(false);

  const filtered = stickers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditTarget(null);
    setFormName("");
    setFormTag("Romance");
    setFormEmoji("💋");
    setFormEnabled(true);
    setFormTrending(false);
    setShowModal(true);
  }

  function openEdit(s: StickerItem) {
    setEditTarget(s);
    setFormName(s.name);
    setFormTag(s.tag);
    setFormEmoji(s.emoji);
    setFormEnabled(s.enabled);
    setFormTrending(s.trending);
    setShowModal(true);
  }

  function saveSticker() {
    if (!formName.trim()) return;
    if (editTarget) {
      setStickers((prev) =>
        prev.map((s) =>
          s.id === editTarget.id
            ? { ...s, name: formName, tag: formTag, emoji: formEmoji, enabled: formEnabled, trending: formTrending }
            : s
        )
      );
    } else {
      const newId = Math.max(0, ...stickers.map((s) => s.id)) + 1;
      setStickers((prev) => [
        ...prev,
        { id: newId, name: formName, tag: formTag, emoji: formEmoji, enabled: formEnabled, trending: formTrending },
      ]);
    }
    setShowModal(false);
  }

  function deleteSticker(id: number) {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (previewId === id) setPreviewId(null);
  }

  function toggleEnabled(id: number) {
    setStickers((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }

  function toggleTrending(id: number) {
    setStickers((prev) => prev.map((s) => s.id === id ? { ...s, trending: !s.trending } : s));
  }

  const total = stickers.length;
  const enabled = stickers.filter((s) => s.enabled).length;
  const trending = stickers.filter((s) => s.trending).length;
  const previewSticker = previewId !== null ? stickers.find((s) => s.id === previewId) : null;

  return (
    <div className="flex min-h-screen" style={{ background: "hsl(204,46%,9%)" }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(43,170,143,0.5) 0%, transparent 70%)", animation: "blob-anim 18s infinite" }} />
        <div className="absolute bottom-0 right-[-5%] w-[450px] h-[450px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)", animation: "blob-anim 22s infinite 3s" }} />
      </div>

      {/* Sidebar */}
      <div
        className="w-60 flex-shrink-0 flex flex-col py-6 px-4"
        style={{
          background: "rgba(10,24,34,0.92)",
          borderRight: "1px solid rgba(43,170,143,0.15)",
          backdropFilter: "blur(28px)",
        }}
      >
        <div className="mb-8 px-2">
          <span className="text-xl font-black tracking-tighter" style={{ color: "hsl(43,80%,92%)" }}>Ours.</span>
          <span
            className="block text-xs font-semibold mt-0.5"
            style={{ color: "rgba(43,170,143,0.6)" }}
          >
            Admin Dashboard
          </span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {(["stickers", "analytics", "settings"] as NavSection[]).map((section) => {
            const icons: Record<NavSection, string> = { stickers: "🎨", analytics: "📊", settings: "⚙️" };
            const labels: Record<NavSection, string> = { stickers: "Sticker Manager", analytics: "Analytics", settings: "Settings" };
            const active = nav === section;
            return (
              <motion.button
                key={section}
                onClick={() => setNav(section)}
                whileHover={{ x: 3 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left w-full cursor-pointer transition-all duration-200"
                style={{
                  background: active ? "rgba(43,170,143,0.15)" : "transparent",
                  border: active ? "1px solid rgba(43,170,143,0.28)" : "1px solid transparent",
                  color: active ? "rgba(43,170,143,0.95)" : "rgba(232,196,90,0.5)",
                  boxShadow: active ? "0 0 16px rgba(43,170,143,0.12)" : "none",
                }}
              >
                <span>{icons[section]}</span>
                {labels[section]}
              </motion.button>
            );
          })}
        </nav>

        {/* Sticker count stat */}
        <div className="mt-auto pt-6 border-t" style={{ borderColor: "rgba(43,170,143,0.12)" }}>
          <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(43,170,143,0.08)", border: "1px solid rgba(43,170,143,0.15)" }}>
            <p className="text-xs" style={{ color: "rgba(43,170,143,0.5)" }}>Total Stickers</p>
            <p className="text-3xl font-black mt-0.5" style={{ color: "hsl(43,80%,90%)" }}>{total}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{
            borderBottom: "1px solid rgba(43,170,143,0.12)",
            background: "rgba(10,24,34,0.5)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "hsl(43,80%,92%)", letterSpacing: "-0.02em" }}>
              {nav === "stickers" ? "Sticker Manager" : nav === "analytics" ? "Analytics" : "Settings"}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(232,196,90,0.45)" }}>
              {nav === "stickers" ? "Manage, add, and organize your sticker library" : nav === "analytics" ? "Overview of your sticker performance" : "Configure your preferences"}
            </p>
          </div>
          {nav === "stickers" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={openAdd}
              className="rounded-full px-6 h-10 text-sm font-bold cursor-pointer flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, rgba(43,170,143,0.85), rgba(43,170,143,0.6))",
                border: "1px solid rgba(43,170,143,0.45)",
                boxShadow: "0 0 24px rgba(43,170,143,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                color: "hsl(204,46%,9%)",
              }}
            >
              + Add Sticker
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {nav === "stickers" && (
            <div className="flex gap-6">
              {/* Left: table */}
              <div className="flex-1 min-w-0">
                {/* Analytics row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Total", value: total, color: "rgba(43,170,143,0.9)", icon: "🎨" },
                    { label: "Active", value: enabled, color: "rgba(232,196,90,0.9)", icon: "✅" },
                    { label: "Trending", value: trending, color: "rgba(251,113,183,0.9)", icon: "🔥" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl p-5" style={GLASS}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold" style={{ color: "rgba(232,196,90,0.5)" }}>{stat.label}</span>
                        <span>{stat.icon}</span>
                      </div>
                      <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Search */}
                <div className="mb-4">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search stickers..."
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(29,58,74,0.5)",
                      border: "1px solid rgba(43,170,143,0.2)",
                      color: "hsl(43,80%,90%)",
                    }}
                  />
                </div>

                {/* Drag-to-reorder list */}
                <div className="rounded-2xl overflow-hidden" style={GLASS}>
                  <div
                    className="grid text-xs font-semibold px-5 py-3"
                    style={{
                      gridTemplateColumns: "2rem 1fr 7rem 5.5rem 5.5rem 7rem",
                      color: "rgba(43,170,143,0.55)",
                      borderBottom: "1px solid rgba(43,170,143,0.1)",
                    }}
                  >
                    <span>#</span>
                    <span>Sticker</span>
                    <span>Category</span>
                    <span>Status</span>
                    <span>Trending</span>
                    <span className="text-right">Actions</span>
                  </div>

                  <Reorder.Group axis="y" values={filtered} onReorder={(items) => {
                    const ids = new Set(items.map((s) => s.id));
                    setStickers((prev) => {
                      const unchanged = prev.filter((s) => !ids.has(s.id));
                      return [...items, ...unchanged];
                    });
                  }}>
                    {filtered.map((sticker, i) => (
                      <Reorder.Item key={sticker.id} value={sticker}>
                        <motion.div
                          className="grid items-center px-5 py-3.5 cursor-grab active:cursor-grabbing"
                          style={{
                            gridTemplateColumns: "2rem 1fr 7rem 5.5rem 5.5rem 7rem",
                            borderBottom: i < filtered.length - 1 ? "1px solid rgba(43,170,143,0.06)" : "none",
                          }}
                          whileHover={{ background: "rgba(43,170,143,0.04)" }}
                        >
                          {/* Emoji + name */}
                          <span className="text-lg">{sticker.emoji}</span>
                          <div className="min-w-0 pr-4">
                            <p className="text-sm font-semibold truncate" style={{ color: "hsl(43,80%,88%)" }}>{sticker.name}</p>
                          </div>

                          {/* Tag */}
                          <span
                            className="inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full w-fit"
                            style={{
                              background: `${TAG_COLORS[sticker.tag].replace("0.9", "0.12")}`,
                              color: TAG_COLORS[sticker.tag],
                              border: `1px solid ${TAG_COLORS[sticker.tag].replace("0.9", "0.25")}`,
                            }}
                          >
                            {sticker.tag}
                          </span>

                          {/* Enabled toggle */}
                          <button
                            onClick={() => toggleEnabled(sticker.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                            style={{ color: sticker.enabled ? "rgba(43,170,143,0.8)" : "rgba(232,196,90,0.35)" }}
                          >
                            <div
                              className="w-8 h-4 rounded-full relative transition-all duration-200"
                              style={{ background: sticker.enabled ? "rgba(43,170,143,0.7)" : "rgba(43,170,143,0.15)" }}
                            >
                              <div
                                className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                                style={{
                                  background: sticker.enabled ? "white" : "rgba(43,170,143,0.4)",
                                  left: sticker.enabled ? "calc(100% - 14px)" : "2px",
                                }}
                              />
                            </div>
                            {sticker.enabled ? "On" : "Off"}
                          </button>

                          {/* Trending toggle */}
                          <button
                            onClick={() => toggleTrending(sticker.id)}
                            className="text-xs font-semibold cursor-pointer transition-all"
                            style={{ color: sticker.trending ? "rgba(251,113,183,0.9)" : "rgba(232,196,90,0.3)" }}
                          >
                            {sticker.trending ? "🔥 Trending" : "— —"}
                          </button>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setPreviewId(previewId === sticker.id ? null : sticker.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-pointer"
                              style={{
                                background: previewId === sticker.id ? "rgba(43,170,143,0.2)" : "rgba(43,170,143,0.08)",
                                border: "1px solid rgba(43,170,143,0.2)",
                              }}
                              title="Preview"
                            >
                              👁
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openEdit(sticker)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-pointer"
                              style={{ background: "rgba(232,196,90,0.08)", border: "1px solid rgba(232,196,90,0.2)" }}
                              title="Edit"
                            >
                              ✏️
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteSticker(sticker.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-pointer"
                              style={{ background: "rgba(232,87,58,0.08)", border: "1px solid rgba(232,87,58,0.2)" }}
                              title="Delete"
                            >
                              🗑
                            </motion.button>
                          </div>
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              </div>

              {/* Right: Preview panel */}
              <AnimatePresence>
                {previewSticker && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 240 }}
                    exit={{ opacity: 0, x: 20, width: 0 }}
                    className="flex-shrink-0 overflow-hidden"
                  >
                    <div className="w-60 rounded-2xl p-5 sticky top-0" style={GLASS}>
                      <p className="text-xs font-semibold mb-4" style={{ color: "rgba(43,170,143,0.6)" }}>Preview</p>

                      {/* Sticker card preview */}
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: "rgba(43,170,143,0.1)",
                          border: "2px solid rgba(43,170,143,0.5)",
                          boxShadow: "0 0 24px rgba(43,170,143,0.2)",
                        }}
                      >
                        <div
                          className="aspect-square flex items-center justify-center text-6xl m-2.5 rounded-xl"
                          style={{ background: "rgba(43,170,143,0.08)" }}
                        >
                          {previewSticker.emoji}
                        </div>
                        <div className="px-3 pb-3">
                          <p className="text-sm font-bold mb-1.5 truncate" style={{ color: "hsl(43,80%,92%)" }}>
                            {previewSticker.name}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: `${TAG_COLORS[previewSticker.tag].replace("0.9", "0.15")}`,
                                color: TAG_COLORS[previewSticker.tag],
                                border: `1px solid ${TAG_COLORS[previewSticker.tag].replace("0.9", "0.3")}`,
                              }}
                            >
                              {previewSticker.tag}
                            </span>
                            {previewSticker.trending && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(251,113,183,0.15)", color: "rgba(251,113,183,0.9)", border: "1px solid rgba(251,113,183,0.25)" }}
                              >
                                🔥 Trending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs" style={{ color: "rgba(43,170,143,0.55)" }}>
                          <span>Status</span>
                          <span style={{ color: previewSticker.enabled ? "rgba(43,170,143,0.9)" : "rgba(232,196,90,0.5)" }}>
                            {previewSticker.enabled ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs" style={{ color: "rgba(43,170,143,0.55)" }}>
                          <span>ID</span>
                          <span style={{ color: "rgba(232,196,90,0.6)" }}>#{previewSticker.id}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {nav === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Stickers", value: total,   icon: "🎨", color: "rgba(43,170,143,0.9)"  },
                  { label: "Active",         value: enabled, icon: "✅", color: "rgba(232,196,90,0.9)"  },
                  { label: "Disabled",       value: total - enabled, icon: "🔒", color: "rgba(232,87,58,0.8)" },
                  { label: "Trending",       value: trending, icon: "🔥", color: "rgba(251,113,183,0.9)" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl p-6" style={GLASS}>
                    <span className="text-2xl">{s.icon}</span>
                    <p className="text-3xl font-black mt-3 mb-1" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs font-semibold" style={{ color: "rgba(232,196,90,0.4)" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-6" style={GLASS}>
                <h3 className="font-bold mb-4 text-sm" style={{ color: "hsl(43,80%,85%)" }}>Category Distribution</h3>
                {ALL_TAGS.map((tag) => {
                  const count = stickers.filter((s) => s.tag === tag).length;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={tag} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: TAG_COLORS[tag] }}>{tag}</span>
                        <span style={{ color: "rgba(232,196,90,0.5)" }}>{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(43,170,143,0.1)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ background: TAG_COLORS[tag] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {nav === "settings" && (
            <div className="max-w-lg">
              <div className="rounded-2xl p-6 space-y-5" style={GLASS}>
                <h3 className="font-bold text-sm" style={{ color: "hsl(43,80%,85%)" }}>General Settings</h3>
                {[
                  { label: "Minimum selection", value: "7 stickers" },
                  { label: "Maximum selection", value: "14 stickers" },
                  { label: "Allow duplicates", value: "Disabled" },
                  { label: "Trending badge", value: "Auto-rotate" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(43,170,143,0.08)" }}>
                    <span className="text-sm" style={{ color: "rgba(232,196,90,0.55)" }}>{row.label}</span>
                    <span className="text-sm font-semibold" style={{ color: "hsl(43,80%,85%)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(6,16,24,0.88)", backdropFilter: "blur(16px)" }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-8"
              style={{
                background: "rgba(16,36,50,0.98)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(43,170,143,0.3)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 60px rgba(43,170,143,0.15), inset 0 1px 0 rgba(232,196,90,0.15)",
              }}
            >
              <div className="absolute top-0 left-[15%] right-[15%] h-px rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(232,196,90,0.4), transparent)" }} />

              <h2 className="text-xl font-black mb-6" style={{ color: "hsl(43,80%,92%)", letterSpacing: "-0.02em" }}>
                {editTarget ? "Edit Sticker" : "Add New Sticker"}
              </h2>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(43,170,143,0.7)" }}>
                    Sticker Name
                  </label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Late Night Calls"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(29,58,74,0.5)",
                      border: "1px solid rgba(43,170,143,0.2)",
                      color: "hsl(43,80%,90%)",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(43,170,143,0.7)" }}>Category</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setFormTag(tag)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-150"
                        style={{
                          background: formTag === tag ? `${TAG_COLORS[tag].replace("0.9", "0.2")}` : "rgba(29,58,74,0.4)",
                          border: `1px solid ${formTag === tag ? TAG_COLORS[tag] : "rgba(43,170,143,0.15)"}`,
                          color: formTag === tag ? TAG_COLORS[tag] : "rgba(232,196,90,0.45)",
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(43,170,143,0.7)" }}>Emoji / Icon</label>
                  <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setFormEmoji(e)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xl cursor-pointer transition-all duration-150"
                        style={{
                          background: formEmoji === e ? "rgba(43,170,143,0.25)" : "rgba(29,58,74,0.4)",
                          border: `1px solid ${formEmoji === e ? "rgba(43,170,143,0.6)" : "rgba(43,170,143,0.12)"}`,
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "rgba(232,196,90,0.65)" }}>
                    <input
                      type="checkbox"
                      checked={formEnabled}
                      onChange={(e) => setFormEnabled(e.target.checked)}
                      className="accent-teal-500"
                    />
                    Enabled
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "rgba(251,113,183,0.65)" }}>
                    <input
                      type="checkbox"
                      checked={formTrending}
                      onChange={(e) => setFormTrending(e.target.checked)}
                      className="accent-pink-400"
                    />
                    🔥 Trending
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-7">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={saveSticker}
                  disabled={!formName.trim()}
                  className="flex-1 rounded-full h-11 font-bold text-sm cursor-pointer"
                  style={{
                    background: formName.trim()
                      ? "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(232,196,90,0.85))"
                      : "rgba(43,170,143,0.15)",
                    border: "1px solid rgba(43,170,143,0.3)",
                    color: formName.trim() ? "hsl(204,46%,9%)" : "rgba(43,170,143,0.35)",
                    boxShadow: formName.trim() ? "0 0 20px rgba(43,170,143,0.3)" : "none",
                    cursor: formName.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  {editTarget ? "Save Changes" : "Add Sticker"}
                </motion.button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 rounded-full h-11 text-sm font-semibold cursor-pointer"
                  style={{
                    background: "rgba(29,58,74,0.5)",
                    border: "1px solid rgba(43,170,143,0.15)",
                    color: "rgba(232,196,90,0.5)",
                  }}
                >
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
