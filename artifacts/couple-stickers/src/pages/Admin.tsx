import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useStickers, fileToSquareDataUrl, type Sticker, type Tag } from "@/hooks/useStickers";

type NavSection = "stickers" | "orders" | "reviews" | "inquiries" | "analytics" | "settings";

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
  // Password lock state
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("ours_admin_auth") === "true";
    } catch {
      return false;
    }
  });
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState(false);

  // Sticker hook
  const {
    stickers, addSticker, updateSticker, deleteSticker,
    reorder, toggleEnabled, toggleTrending, resetToDefaults,
  } = useStickers();

  // Navigation and managers state
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

  // Database models state
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [orders, setOrders]         = useState<any[]>([]);
  const [zoomPhoto, setZoomPhoto]   = useState<string | null>(null);
  const [orderTab, setOrderTab]     = useState<"all" | "completed" | "packed" | "shipped" | "delivered">("all");

  // Inquiries database states
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [callbacks, setCallbacks]     = useState<any[]>([]);
  const [callbackFilter, setCallbackFilter] = useState<"all" | "pending" | "resolved">("all");

  // Invoicing rules states
  const [adminStickerPrice, setAdminStickerPrice] = useState(40);
  const [adminBillDiscount, setAdminBillDiscount] = useState(0);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/orders/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": "8523"
      },
      body: JSON.stringify({
        stickerPrice: adminStickerPrice,
        billDiscount: adminBillDiscount
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save settings");
        return res.json();
      })
      .then(data => {
        setAdminStickerPrice(data.stickerPrice);
        setAdminBillDiscount(data.billDiscount);
        showToast("✅ Billing rules saved successfully");
      })
      .catch(err => {
        console.error("Error saving settings:", err);
        showToast("❌ Failed to save billing rules");
      });
  };

  // Search filtering for stickers
  const filteredStickers = stickers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.tag.toLowerCase().includes(search.toLowerCase())
  );

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  // Load and refresh reviews / orders
  const fetchAdminData = () => {
    if (!authenticated) return;
    
    // Fetch reviews
    fetch("/api/reviews/admin", {
      headers: { "x-admin-password": "8523" }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        const mapped = data.map((r: any) => ({
          ...r,
          photos: typeof r.photos === "string" ? JSON.parse(r.photos) : (r.photos || [])
        }));
        setAllReviews(mapped);
      })
      .catch(err => console.error("Failed to load reviews:", err));

    // Fetch orders
    fetch("/api/orders/admin", {
      headers: { "x-admin-password": "8523" }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        const mapped = data.map((o: any) => ({
          ...o,
          stickers: typeof o.stickers === "string" ? JSON.parse(o.stickers) : (o.stickers || []),
          photos: typeof o.photos === "string" ? JSON.parse(o.photos) : (o.photos || [])
        }));
        setOrders(mapped);
      })
      .catch(err => console.error("Failed to load orders:", err));

    // Fetch contact submissions
    fetch("/api/contacts/admin/submissions", {
      headers: { "x-admin-password": "8523" }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch contact submissions");
        return res.json();
      })
      .then(data => {
        setSubmissions(data);
      })
      .catch(err => console.error("Failed to load contact submissions:", err));

    // Fetch callback requests
    fetch("/api/contacts/admin/callbacks", {
      headers: { "x-admin-password": "8523" }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch callback requests");
        return res.json();
      })
      .then(data => {
        setCallbacks(data);
      })
      .catch(err => console.error("Failed to load callback requests:", err));

    // Fetch pricing and discount settings
    fetch("/api/orders/settings")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch settings");
        return res.json();
      })
      .then(data => {
        if (data) {
          setAdminStickerPrice(data.stickerPrice || 40);
          setAdminBillDiscount(data.billDiscount || 0);
        }
      })
      .catch(err => console.error("Failed to load pricing settings:", err));
  };

  const handleUpdateCallbackStatus = (id: number, nextStatus: string) => {
    fetch(`/api/contacts/admin/callbacks/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": "8523"
      },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update callback status");
        return res.json();
      })
      .then(updated => {
        setCallbacks(prev => prev.map(c => c.id === id ? { ...c, status: updated.status } : c));
        showToast(`Callback request updated to ${nextStatus === "resolved" ? "Called ✅" : "Pending ⏳"}`);
      })
      .catch(err => {
        console.error("Error updating callback status:", err);
        showToast("Error updating callback status");
      });
  };

  useEffect(() => {
    fetchAdminData();
  }, [authenticated]);

  // Auth unlock submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "8523") {
      sessionStorage.setItem("ours_admin_auth", "true");
      setAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasscode("");
      showToast("❌ Incorrect passcode");
    }
  };

  // Toggle review approval
  const handleToggleReview = (id: number, currentEnabled: boolean) => {
    fetch(`/api/reviews/admin/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": "8523"
      },
      body: JSON.stringify({ enabled: !currentEnabled })
    })
      .then(res => {
        if (!res.ok) throw new Error("Update failed");
        return res.json();
      })
      .then(updated => {
        setAllReviews(prev => prev.map(r => r.id === id ? { ...r, enabled: updated.enabled } : r));
        showToast(updated.enabled ? "Review approved ✅" : "Review disabled 🔒");
      })
      .catch(err => {
        console.error("Error updating review:", err);
        showToast("Error updating review");
      });
  };

  // Change review ranking rank
  const handleRankReview = (id: number, currentRank: number, direction: "up" | "down") => {
    const newRank = direction === "up" ? Math.max(0, currentRank - 1) : currentRank + 1;
    fetch(`/api/reviews/admin/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": "8523"
      },
      body: JSON.stringify({ rank: newRank })
    })
      .then(res => {
        if (!res.ok) throw new Error("Rank change failed");
        return res.json();
      })
      .then(() => {
        fetchAdminData(); // Refresh list to update sort
        showToast(`Review rank updated to ${newRank}`);
      })
      .catch(err => {
        console.error("Error updating rank:", err);
        showToast("Error updating rank");
      });
  };

  const handleUpdateStatus = (orderId: number, nextStatus: string) => {
    fetch(`/api/orders/admin/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": "8523"
      },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
      })
      .then(updated => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
        const labels: Record<string, string> = {
          completed: "Received 📥",
          packed: "Packed 📦",
          shipped: "Shipped 🚚",
          delivered: "Delivered ✅"
        };
        showToast(`Order #OURS-${orderId} status updated to ${labels[nextStatus] || nextStatus}`);
      })
      .catch(err => {
        console.error("Error updating status:", err);
        showToast("Error updating order status");
      });
  };

  const downloadSinglePhoto = (photoUrl: string, orderId: number, index: number) => {
    const link = document.createElement("a");
    link.href = photoUrl;
    link.download = `ours_order_${orderId}_photo_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllPhotos = (photos: string[], orderId: number) => {
    photos.forEach((photo, index) => {
      setTimeout(() => {
        downloadSinglePhoto(photo, orderId, index);
      }, index * 200);
    });
    showToast(`Downloading all ${photos.length} photos...`);
  };

  // Sticker helpers
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

  const totalStickers    = stickers.length;
  const enabledStickers  = stickers.filter((s) => s.enabled).length;
  const trendingStickers = stickers.filter((s) => s.trending).length;
  const previewSticker   = previewId != null ? stickers.find((s) => s.id === previewId) : null;

  // 🔒 Lock Screen Overlay
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "hsl(204,46%,9%)" }}>
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="blob-1 absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(43,170,143,0.5) 0%, transparent 70%)" }} />
          <div className="blob-3 absolute bottom-0 right-[-5%] w-[450px] h-[450px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, rgba(232,196,90,0.4) 0%, transparent 70%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl p-10 relative text-center"
          style={GLASS}>
          <div className="absolute top-0 left-[15%] right-[15%] h-px rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(43,170,143,0.4), transparent)" }} />
          
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-black mb-1" style={{ color: "hsl(43,80%,92%)" }}>Admin Dashboard</h1>
          <p className="text-xs mb-8 font-semibold" style={{ color: "rgba(43,170,143,0.5)" }}>Protected Administrator Panel</p>

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passcode (e.g. 8523)"
                className="w-full rounded-xl px-4 py-3 text-center text-sm outline-none transition-colors border bg-black/40"
                style={{ borderColor: authError ? "rgba(232,87,58,0.5)" : "rgba(43,170,143,0.25)", color: "white" }}
                autoFocus
              />
              {authError && <p className="text-red-400 text-xs font-semibold mt-2">Passcode incorrect. Try again.</p>}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full h-11 rounded-full font-bold text-sm cursor-pointer shadow-[0_0_24px_rgba(43,170,143,0.3)]"
              style={{
                background: "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(232,196,90,0.85))",
                color: "hsl(204,46%,9%)",
                border: "1px solid rgba(232,196,90,0.4)"
              }}>
              Unlock Panel
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "hsl(204,46%,9%)" }}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="blob-1 absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(43,170,143,0.5) 0%, transparent 70%)" }} />
        <div className="blob-3 absolute bottom-0 right-[-5%] w-[450px] h-[450px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)" }} />
      </div>

      {/* Toast notifications */}
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
          {([
            { id: "stickers", label: "Stickers Manager", icon: "🎨" },
            { id: "orders", label: "Orders Manager", icon: "📦" },
            { id: "reviews", label: "Reviews Manager", icon: "💬" },
            { id: "inquiries", label: "Inquiries 💌", icon: "✉️" },
            { id: "analytics", label: "Analytics", icon: "📊" },
            { id: "settings", label: "Settings", icon: "⚙️" },
          ] as const).map((s) => {
            const active = nav === s.id;
            return (
              <motion.button key={s.id} onClick={() => setNav(s.id)} whileHover={{ x: 3 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left w-full cursor-pointer transition-all duration-200"
                style={{
                  background: active ? "rgba(43,170,143,0.15)" : "transparent",
                  border: active ? "1px solid rgba(43,170,143,0.28)" : "1px solid transparent",
                  color: active ? "rgba(43,170,143,0.95)" : "rgba(232,196,90,0.5)",
                }}>
                <span>{s.icon}</span>{s.label}
              </motion.button>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-6 border-t" style={{ borderColor: "rgba(43,170,143,0.12)" }}>
          <div className="px-4 py-3 rounded-xl mb-3" style={{ background: "rgba(43,170,143,0.08)", border: "1px solid rgba(43,170,143,0.15)" }}>
            <p className="text-xs" style={{ color: "rgba(43,170,143,0.5)" }}>Active Stickers</p>
            <p className="text-3xl font-black mt-0.5" style={{ color: "hsl(43,80%,90%)" }}>{enabledStickers} / {totalStickers}</p>
          </div>
          <button onClick={() => { sessionStorage.removeItem("ours_admin_auth"); setAuthenticated(false); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold hover:opacity-80 transition-opacity w-full border"
            style={{ background: "rgba(232,87,58,0.08)", borderColor: "rgba(232,87,58,0.25)", color: "rgba(232,87,58,0.85)" }}>
            🔒 Log Out Admin
          </button>
        </div>
      </div>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 sticky top-0 z-30"
          style={{ borderBottom: "1px solid rgba(43,170,143,0.12)", background: "rgba(10,24,34,0.75)", backdropFilter: "blur(20px)" }}>
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "hsl(43,80%,92%)", letterSpacing: "-0.02em" }}>
              {{ 
                 stickers: "Stickers Manager", 
                 orders: "Orders Manager", 
                 reviews: "Reviews Manager", 
                 inquiries: "Inquiries & Callbacks",
                 analytics: "Analytics Overview", 
                 settings: "Settings" 
              }[nav]}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(232,196,90,0.4)" }}>
              {{ 
                 stickers: "Add, edit, reorder and manage your sticker library — changes appear on /create instantly",
                 orders: "Track checkout sheet transactions, buyer details, and retrieve uploaded photo files",
                 reviews: "Approve customer feedbacks, toggle home page visibility, and change rank priority",
                 inquiries: "Manage contact form messages and telephone callback request queues",
                 analytics: "Stickers library statistics", 
                 settings: "Configure default rules" 
              }[nav]}
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
          {(nav === "orders" || nav === "reviews" || nav === "inquiries") && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={fetchAdminData}
              className="rounded-xl px-5 h-9 text-xs font-bold cursor-pointer flex items-center gap-1.5 border"
              style={{
                background: "rgba(43,170,143,0.08)",
                borderColor: "rgba(43,170,143,0.25)",
                color: "rgba(43,170,143,0.85)"
              }}>
              🔄 Refresh List
            </motion.button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8">

          {/* ═══ STICKERS MANAGER ═══ */}
          {nav === "stickers" && (
            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label:"Total Stickers", value:totalStickers,    color:"rgba(43,170,143,0.9)",  icon:"🎨" },
                    { label:"Active",         value:enabledStickers,  color:"rgba(232,196,90,0.9)",  icon:"✅" },
                    { label:"Trending",       value:trendingStickers, color:"rgba(251,113,183,0.9)", icon:"🔥" },
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

                  {filteredStickers.length === 0 ? (
                    <div className="py-16 text-center" style={{ color:"rgba(43,170,143,0.35)" }}>
                      <p className="text-3xl mb-2">🔍</p>
                      <p className="text-sm">No stickers match "{search}"</p>
                    </div>
                  ) : (
                    <Reorder.Group axis="y" values={filteredStickers} onReorder={(items) => {
                      const ids = new Set(items.map((s) => s.id));
                      const rest = stickers.filter((s) => !ids.has(s.id));
                      reorder([...items, ...rest]);
                    }}>
                      {filteredStickers.map((sticker, i) => {
                        const tagColor = TAG_COLORS[sticker.tag];
                        const isConfirm = confirmDeleteId === sticker.id;
                        return (
                          <Reorder.Item key={sticker.id} value={sticker} as="div">
                            <motion.div layout
                              className="grid items-center px-5 py-3"
                              style={{
                                gridTemplateColumns:"3rem 1fr 7.5rem 6rem 6.5rem 7.5rem",
                                borderBottom: i < filteredStickers.length - 1 ? "1px solid rgba(43,170,143,0.06)" : "none",
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

          {/* ═══ ORDERS MANAGER ═══ */}
          {nav === "orders" && (
            <div className="space-y-6">
              {/* Order Status Tabs */}
              <div className="flex flex-wrap gap-2.5 pb-2 border-b" style={{ borderColor: "rgba(43,170,143,0.12)" }}>
                {([
                  { id: "all", label: "All Orders", icon: "📦" },
                  { id: "completed", label: "Received", icon: "📥" },
                  { id: "packed", label: "Packed", icon: "📦" },
                  { id: "shipped", label: "Shipped", icon: "🚚" },
                  { id: "delivered", label: "Delivered", icon: "✅" },
                ] as const).map((tab) => {
                  const active = orderTab === tab.id;
                  const count = tab.id === "all"
                    ? orders.length
                    : orders.filter(o => o.status === tab.id).length;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setOrderTab(tab.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-200"
                      style={{
                        background: active ? "rgba(43,170,143,0.15)" : "rgba(29,58,74,0.3)",
                        border: active ? "1px solid rgba(43,170,143,0.3)" : "1px solid rgba(43,170,143,0.12)",
                        color: active ? "rgba(43,170,143,0.95)" : "rgba(232,196,90,0.5)",
                      }}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                      <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                        style={{
                          background: active ? "rgba(43,170,143,0.25)" : "rgba(43,170,143,0.08)",
                          color: active ? "white" : "rgba(232,196,90,0.4)"
                        }}
                      >
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {orders.length === 0 ? (
                <div className="py-24 text-center rounded-2xl" style={GLASS}>
                  <p className="text-4xl mb-2">📦</p>
                  <p className="text-sm font-semibold" style={{ color: "rgba(43,170,143,0.5)" }}>No customer orders placed yet.</p>
                </div>
              ) : orders.filter(o => orderTab === "all" || o.status === orderTab).length === 0 ? (
                <div className="py-24 text-center rounded-2xl" style={GLASS}>
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="text-sm font-semibold" style={{ color: "rgba(43,170,143,0.5)" }}>
                    No orders in the "{
                      {
                        all: "All",
                        completed: "Received",
                        packed: "Packed",
                        shipped: "Shipped",
                        delivered: "Delivered"
                      }[orderTab]
                    }" category.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {orders
                    .filter(o => orderTab === "all" || o.status === orderTab)
                    .map((order) => {
                      const statusConfig = {
                        completed: { label: "Received", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", sidebarBg: "rgba(59,130,246,0.6)" },
                        packed: { label: "Packed", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", sidebarBg: "rgba(245,158,11,0.6)" },
                        shipped: { label: "Shipped", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)", sidebarBg: "rgba(167,139,250,0.6)" },
                        delivered: { label: "Delivered", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", sidebarBg: "rgba(16,185,129,0.6)" }
                      }[order.status as "completed" | "packed" | "shipped" | "delivered"] || { label: order.status, color: "#94a3b8", bg: "rgba(29,58,74,0.12)", border: "rgba(29,58,74,0.25)", sidebarBg: "rgba(43,170,143,0.7)" };

                      return (
                        <div key={order.id} className="rounded-2xl p-6 relative overflow-hidden" style={GLASS}>
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 transition-all duration-300" style={{ background: statusConfig.sidebarBg }} />
                          
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b" style={{ borderColor: "rgba(43,170,143,0.12)" }}>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                              <span className="font-black text-sm" style={{ color: statusConfig.color }}>#OURS-{order.id}</span>
                              <span className="text-[11px]" style={{ color: "rgba(232,196,90,0.4)" }}>
                                Ordered on {new Date(order.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              {/* Status Dropdown */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "rgba(43,170,143,0.5)" }}>Status:</span>
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                  className="rounded-lg px-2.5 py-1 text-xs font-bold outline-none cursor-pointer border"
                                  style={{
                                    background: "rgba(29,58,74,0.65)",
                                    borderColor: "rgba(43,170,143,0.25)",
                                    color: "hsl(43,80%,90%)"
                                  }}
                                >
                                  <option value="completed">Received</option>
                                  <option value="packed" disabled={!order.receiptPhoto}>
                                    Packed {!order.receiptPhoto ? "🔒 (Awaiting Receipt)" : ""}
                                  </option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                </select>
                              </div>

                              {/* Static status display */}
                              <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider transition-colors duration-300"
                                style={{ background: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}>
                                {statusConfig.label}
                              </span>

                              <span className="text-lg font-black" style={{ color: "hsl(43,80%,90%)" }}>₹{order.amount}</span>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-4 gap-6">
                            {/* Buyer Info */}
                            <div>
                              <h4 className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: "rgba(43,170,143,0.6)" }}>Customer Details</h4>
                              <p className="text-sm font-bold text-white/90">{order.buyerName}</p>
                              <a href={`mailto:${order.buyerEmail}`} className="text-xs hover:underline mt-1.5 block" style={{ color: "rgba(232,196,90,0.6)" }}>
                                📧 {order.buyerEmail}
                              </a>
                              {order.buyerMobile && (
                                <a href={`tel:${order.buyerMobile}`} className="text-xs hover:underline mt-1.5 block text-white/85">
                                  📞 {order.buyerMobile}
                                </a>
                              )}
                              {order.buyerAddress && (
                                <div className="text-xs mt-3 text-white/70 leading-relaxed bg-black/25 p-2.5 rounded-xl border border-white/5 whitespace-pre-wrap">
                                  📍 <span className="font-bold text-amber-300/90">Shipping Address:</span><br />
                                  {order.buyerAddress}
                                </div>
                              )}
                            </div>

                            {/* Selected Stickers */}
                            <div>
                              <h4 className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: "rgba(43,170,143,0.6)" }}>
                                Selected Stickers ({order.stickers.length})
                              </h4>
                              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                {order.stickers.map((sid: number, k: number) => {
                                  const s = stickers.find(st => st.id === sid);
                                  return (
                                    <div key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                                      style={{ background: "rgba(29,58,74,0.45)", border: "1px solid rgba(43,170,143,0.15)" }}>
                                      <span>{s?.emoji || "✨"}</span>
                                      <span className="text-white/80 font-medium truncate max-w-[80px]">{s?.name || `Sticker #${sid}`}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Uploaded High-Res Photos */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "rgba(43,170,143,0.6)" }}>
                                  Uploaded Photos ({order.photos.length})
                                </h4>
                                {order.photos && order.photos.length > 0 && (
                                  <button
                                    onClick={() => downloadAllPhotos(order.photos, order.id)}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 hover:bg-emerald-500/10 cursor-pointer"
                                    style={{
                                      background: "rgba(16,185,129,0.05)",
                                      borderColor: "rgba(16,185,129,0.25)",
                                      color: "#10b981"
                                    }}
                                  >
                                    📥 Download All
                                  </button>
                                )}
                              </div>
                              <div className="flex gap-2 overflow-x-auto pb-1.5">
                                {order.photos.map((photo: string, pIndex: number) => (
                                  <div key={pIndex} className="relative group flex-shrink-0">
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      onClick={() => setZoomPhoto(photo)}
                                      className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 cursor-zoom-in"
                                      style={{ borderColor: "rgba(43,170,143,0.3)" }}>
                                      <img src={photo} alt="Customer couple photo" className="w-full h-full object-cover" />
                                    </motion.div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadSinglePhoto(photo, order.id, pIndex);
                                      }}
                                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 text-white transition-all shadow-md cursor-pointer opacity-0 group-hover:opacity-100 z-10 text-[10px]"
                                      title="Download photo"
                                    >
                                      📥
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Payment Receipt */}
                            <div>
                              <h4 className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: "rgba(43,170,143,0.6)" }}>
                                Payment Receipt
                              </h4>
                              {order.receiptPhoto ? (
                                <div className="relative group flex-shrink-0 w-fit">
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setZoomPhoto(order.receiptPhoto)}
                                    className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 cursor-zoom-in bg-white/5 flex items-center justify-center"
                                    style={{ borderColor: "rgba(232,196,90,0.3)" }}>
                                    <img src={order.receiptPhoto} alt="Payment Receipt" className="w-full h-full object-cover" />
                                  </motion.div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadSinglePhoto(order.receiptPhoto, order.id, 99);
                                    }}
                                    className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white transition-all shadow-md cursor-pointer opacity-0 group-hover:opacity-100 z-10 text-[10px]"
                                    title="Download receipt"
                                  >
                                    📥
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-white/35 italic block py-4">No receipt uploaded</span>
                              )}
                            </div>
                          </div>

                          {/* Confirm & Pack Action Banner */}
                          {order.status === "completed" && (
                            <div className="mt-6 pt-5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: "rgba(43,170,143,0.12)" }}>
                              <div className="flex items-center gap-2">
                                {!order.receiptPhoto ? (
                                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                                    ⚠️ Awaiting customer payment receipt upload to unlock packing.
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                                    ✅ Payment receipt uploaded. Ready to confirm and pack order.
                                  </span>
                                )}
                              </div>
                              
                              <motion.button
                                whileHover={order.receiptPhoto ? { scale: 1.03 } : {}}
                                whileTap={order.receiptPhoto ? { scale: 0.97 } : {}}
                                disabled={!order.receiptPhoto}
                                onClick={() => handleUpdateStatus(order.id, "packed")}
                                className="px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer disabled:cursor-not-allowed"
                                style={{
                                  background: order.receiptPhoto
                                    ? "linear-gradient(135deg, rgba(16,185,129,0.9), rgba(43,170,143,0.85))"
                                    : "rgba(255,255,255,0.05)",
                                  border: order.receiptPhoto
                                    ? "1px solid rgba(232,196,90,0.3)"
                                    : "1px solid rgba(255,255,255,0.05)",
                                  color: order.receiptPhoto ? "hsl(204,46%,9%)" : "rgba(255,255,255,0.25)",
                                  boxShadow: order.receiptPhoto ? "0 4px 16px rgba(16,185,129,0.25)" : "none"
                                }}
                              >
                                {order.receiptPhoto ? (
                                  <>📦 Confirm & Pack Order</>
                                ) : (
                                  <>🔒 Confirm & Pack (Locked)</>
                                )}
                              </motion.button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ═══ REVIEWS MANAGER ═══ */}
          {nav === "reviews" && (
            <div className="space-y-6">
              {allReviews.length === 0 ? (
                <div className="py-24 text-center rounded-2xl" style={GLASS}>
                  <p className="text-4xl mb-2">💬</p>
                  <p className="text-sm font-semibold" style={{ color: "rgba(43,170,143,0.5)" }}>No customer reviews in the database.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {allReviews.map((rev) => (
                    <div key={rev.id} className="rounded-2xl p-5" style={GLASS}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        
                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">{rev.emoji}</span>
                            <span className="font-bold text-white/95" style={{ color: "hsl(43,80%,90%)" }}>{rev.name}</span>
                            <span className="text-xs" style={{ color: "rgba(232,196,90,0.4)" }}>{rev.handle}</span>
                            <span className="text-[10px]" style={{ color: "rgba(43,170,143,0.5)" }}>
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, j) => (
                              <svg key={j} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={j < rev.rating ? "currentColor" : "none"} stroke="currentColor" className="w-3.5 h-3.5" style={{ color: "rgba(232,196,90,0.9)" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                              </svg>
                            ))}
                          </div>

                          <p className="text-sm font-medium mb-3 italic leading-relaxed text-white/80">
                            "{rev.text}"
                          </p>

                          {rev.photos && rev.photos.length > 0 && (
                            <div className="flex gap-2">
                              {rev.photos.map((photo: string, k: number) => (
                                <motion.div
                                  key={k}
                                  whileHover={{ scale: 1.05 }}
                                  onClick={() => setZoomPhoto(photo)}
                                  className="w-12 h-12 rounded-lg overflow-hidden border cursor-zoom-in"
                                  style={{ borderColor: "rgba(232,196,90,0.2)" }}>
                                  <img src={photo} alt="Customer upload" className="w-full h-full object-cover" />
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex flex-row md:flex-col items-center justify-end gap-3 self-stretch flex-shrink-0">
                          {/* Approval Status Toggle */}
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(43,170,143,0.5)" }}>Approval</span>
                            <button onClick={() => handleToggleReview(rev.id, rev.enabled)}
                              className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer w-fit border px-3 py-1.5 rounded-full"
                              style={{
                                background: rev.enabled ? "rgba(16,185,129,0.12)" : "rgba(232,87,58,0.12)",
                                borderColor: rev.enabled ? "rgba(16,185,129,0.3)" : "rgba(232,87,58,0.3)",
                                color: rev.enabled ? "#10b981" : "#ef4444"
                              }}>
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: rev.enabled ? "#10b981" : "#ef4444" }} />
                              {rev.enabled ? "Visible" : "Moderated"}
                            </button>
                          </div>

                          {/* Ranking Rank Controls */}
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(43,170,143,0.5)" }}>Priority Rank</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleRankReview(rev.id, rev.rank, "up")}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border hover:bg-white/5 cursor-pointer"
                                style={{ borderColor: "rgba(43,170,143,0.25)", color: "rgba(43,170,143,0.85)" }}>
                                🔼
                              </button>
                              <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: "rgba(29,58,74,0.6)", color: "hsl(43,80%,85%)" }}>
                                {rev.rank}
                              </span>
                              <button onClick={() => handleRankReview(rev.id, rev.rank, "down")}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border hover:bg-white/5 cursor-pointer"
                                style={{ borderColor: "rgba(43,170,143,0.25)", color: "rgba(43,170,143,0.85)" }}>
                                🔽
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ INQUIRIES MANAGER ═══ */}
          {nav === "inquiries" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Total Messages ✉️", value: submissions.length, color: "rgba(43,170,143,0.9)" },
                  { label: "Pending Callbacks ⏳", value: callbacks.filter(c => c.status === "pending").length, color: "rgba(232,196,90,0.9)" },
                  { label: "Resolved Callbacks ✅", value: callbacks.filter(c => c.status === "resolved").length, color: "rgba(167,139,250,0.9)" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl p-5" style={GLASS}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "rgba(232,196,90,0.5)" }}>{stat.label}</p>
                    <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Split layout: Callbacks (Left) & Messages (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 📞 Callbacks Queue Card (Left - 5 cols) */}
                <div className="lg:col-span-5 rounded-2xl p-6 space-y-4" style={GLASS}>
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "rgba(43,170,143,0.15)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📞</span>
                      <h2 className="text-lg font-black" style={{ color: "hsl(43,80%,92%)" }}>Callback Queue</h2>
                    </div>
                    {/* Status Filter Group */}
                    <div className="flex gap-1 bg-black/30 p-1 rounded-lg border border-white/5">
                      {(["all", "pending", "resolved"] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setCallbackFilter(filter)}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-colors"
                          style={{
                            background: callbackFilter === filter ? "rgba(43,170,143,0.2)" : "transparent",
                            color: callbackFilter === filter ? "rgba(43,170,143,0.95)" : "rgba(232,196,90,0.4)",
                          }}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {callbacks.filter(c => callbackFilter === "all" || c.status === callbackFilter).length === 0 ? (
                      <div className="py-12 text-center" style={{ color: "rgba(43,170,143,0.35)" }}>
                        <p className="text-2xl mb-1">📞</p>
                        <p className="text-xs font-semibold">No callback requests found.</p>
                      </div>
                    ) : (
                      callbacks
                        .filter(c => callbackFilter === "all" || c.status === callbackFilter)
                        .map((c) => {
                          const isPending = c.status === "pending";
                          return (
                            <motion.div
                              key={c.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-xl relative overflow-hidden transition-all duration-300"
                              style={{
                                background: isPending ? "rgba(232,196,90,0.03)" : "rgba(43,170,143,0.02)",
                                border: isPending ? "1px solid rgba(232,196,90,0.2)" : "1px solid rgba(43,170,143,0.12)",
                              }}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <a href={`tel:${c.phone}`} className="text-base font-black tracking-wide hover:underline" style={{ color: isPending ? "hsl(43,80%,90%)" : "rgba(232,196,90,0.6)" }}>
                                    {c.phone}
                                  </a>
                                  <p className="text-[10px] mt-1" style={{ color: "rgba(232,196,90,0.35)" }}>
                                    Requested: {new Date(c.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                    style={{
                                      background: isPending ? "rgba(232,196,90,0.15)" : "rgba(43,170,143,0.15)",
                                      color: isPending ? "rgba(232,196,90,0.9)" : "rgba(43,170,143,0.9)",
                                      border: isPending ? "1px solid rgba(232,196,90,0.25)" : "1px solid rgba(43,170,143,0.25)"
                                    }}>
                                    {isPending ? "⏳ Pending" : "✅ Called"}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateCallbackStatus(c.id, isPending ? "resolved" : "pending")}
                                    className="p-1.5 rounded-lg border text-xs font-bold transition-all hover:scale-105 cursor-pointer"
                                    title={isPending ? "Mark as Called" : "Mark as Pending"}
                                    style={{
                                      background: isPending ? "rgba(43,170,143,0.1)" : "rgba(232,196,90,0.05)",
                                      borderColor: isPending ? "rgba(43,170,143,0.35)" : "rgba(232,196,90,0.25)",
                                      color: isPending ? "rgba(43,170,143,0.9)" : "rgba(232,196,90,0.7)"
                                    }}
                                  >
                                    {isPending ? "✓" : "↩"}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* ✉️ Contact Messages (Right - 7 cols) */}
                <div className="lg:col-span-7 rounded-2xl p-6 space-y-4" style={GLASS}>
                  <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "rgba(43,170,143,0.15)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✉️</span>
                      <h2 className="text-lg font-black" style={{ color: "hsl(43,80%,92%)" }}>Customer Messages</h2>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(43,170,143,0.1)", color: "rgba(43,170,143,0.85)" }}>
                      {submissions.length} Inboxes
                    </span>
                  </div>

                  {/* Messages Search */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "rgba(43,170,143,0.45)" }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Search messages by name, email, text or subject..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl pl-8 pr-8 py-2 text-xs outline-none"
                      style={{ background: "rgba(29,58,74,0.4)", border: "1px solid rgba(43,170,143,0.15)", color: "hsl(43,80%,90%)" }}
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] cursor-pointer"
                        style={{ color: "rgba(43,170,143,0.5)" }}>✕</button>
                    )}
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {submissions.filter(s => 
                      !search || 
                      s.name.toLowerCase().includes(search.toLowerCase()) || 
                      (s.email && s.email.toLowerCase().includes(search.toLowerCase())) || 
                      (s.phone && s.phone.includes(search)) || 
                      (s.subject && s.subject.toLowerCase().includes(search.toLowerCase())) || 
                      s.message.toLowerCase().includes(search.toLowerCase())
                    ).length === 0 ? (
                      <div className="py-16 text-center" style={{ color: "rgba(43,170,143,0.35)" }}>
                        <p className="text-3xl mb-1">✉️</p>
                        <p className="text-xs font-semibold">No messages found matching search criteria.</p>
                      </div>
                    ) : (
                      submissions
                        .filter(s => 
                          !search || 
                          s.name.toLowerCase().includes(search.toLowerCase()) || 
                          (s.email && s.email.toLowerCase().includes(search.toLowerCase())) || 
                          (s.phone && s.phone.includes(search)) || 
                          (s.subject && s.subject.toLowerCase().includes(search.toLowerCase())) || 
                          s.message.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((s) => (
                          <motion.div
                            key={s.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-5 rounded-xl border relative space-y-3"
                            style={{
                              background: "rgba(12,28,38,0.45)",
                              borderColor: "rgba(43,170,143,0.15)",
                            }}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h3 className="font-extrabold text-sm" style={{ color: "hsl(43,80%,90%)" }}>{s.name}</h3>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px]" style={{ color: "rgba(232,196,90,0.4)" }}>
                                  {s.email && (
                                    <a href={`mailto:${s.email}`} className="hover:underline flex items-center gap-1">
                                      📧 {s.email}
                                    </a>
                                  )}
                                  {s.phone && (
                                    <a href={`tel:${s.phone}`} className="hover:underline flex items-center gap-1">
                                      📞 {s.phone}
                                    </a>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px]" style={{ color: "rgba(232,196,90,0.3)" }}>
                                {new Date(s.createdAt).toLocaleString()}
                              </span>
                            </div>

                            {s.subject && (
                              <p className="text-xs font-extrabold" style={{ color: "rgba(43,170,143,0.9)" }}>
                                Subject: <span className="font-medium" style={{ color: "hsl(43,80%,85%)" }}>{s.subject}</span>
                              </p>
                            )}

                            <div className="p-3.5 rounded-lg text-xs leading-relaxed"
                              style={{ background: "rgba(16,36,50,0.5)", border: "1px solid rgba(43,170,143,0.08)", color: "hsl(43,80%,95%)" }}>
                              {s.message}
                            </div>
                          </motion.div>
                        ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {nav === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label:"Total Stickers", value:totalStickers,          icon:"🎨", color:"rgba(43,170,143,0.9)"  },
                  { label:"Active",         value:enabledStickers,        icon:"✅", color:"rgba(232,196,90,0.9)"  },
                  { label:"Disabled",       value:totalStickers-enabledStickers,  icon:"🔒", color:"rgba(232,87,58,0.8)"   },
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
                  const pct = totalStickers > 0 ? (count / totalStickers) * 100 : 0;
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
              {/* Billing Config Form */}
              <div className="rounded-2xl p-6" style={GLASS}>
                <h3 className="font-bold text-sm mb-5" style={{ color:"hsl(43,80%,85%)" }}>Billing & Invoicing Config</h3>
                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(43,170,143,0.7)" }}>
                      Base Price per Sticker (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={adminStickerPrice}
                      onChange={(e) => setAdminStickerPrice(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-black/40 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors border"
                      style={{ 
                        borderColor: "rgba(43,170,143,0.2)", 
                        background: "rgba(10,24,34,0.4)",
                        color: "white" 
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(43,170,143,0.7)" }}>
                      Global Bill Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={adminBillDiscount}
                      onChange={(e) => setAdminBillDiscount(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-black/40 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors border"
                      style={{ 
                        borderColor: "rgba(43,170,143,0.2)", 
                        background: "rgba(10,24,34,0.4)",
                        color: "white" 
                      }}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs transition-all duration-300 cursor-pointer shadow-[0_0_16px_rgba(43,170,143,0.2)] flex items-center justify-center gap-1.5"
                    style={{
                      background: "linear-gradient(135deg, rgba(43,170,143,0.9), rgba(232,196,90,0.85))",
                      border: "1px solid rgba(232,196,90,0.4)",
                      color: "hsl(204,46%,9%)"
                    }}
                  >
                    💾 Save Billing Rules
                  </motion.button>
                </form>
              </div>

              <div className="rounded-2xl p-6" style={GLASS}>
                <h3 className="font-bold text-sm mb-5" style={{ color:"hsl(43,80%,85%)" }}>Selection Rules</h3>
                {[
                  { label:"Minimum selections", value:"9 stickers"    },
                  { label:"Maximum selections", value:"14 stickers"   },
                  { label:"Image format",        value:"1:1 square"   },
                  { label:"Image output size",   value:"600 × 600 px" },
                  { label:"Database Backend",    value: "Postgres/JSON Hybrid" },
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
                <p className="text-xs mb-5" style={{ color:"rgba(232,196,90,0.4)" }}>Sticker configurations are saved to the browser's local storage.</p>
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

      {/* ─── Zoom Photo Modal ─── */}
      <AnimatePresence>
        {zoomPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setZoomPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-12 bg-black/90 cursor-zoom-out">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img src={zoomPhoto} alt="Customer upload high-res" className="w-full h-full object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
