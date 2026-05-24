import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useStickers, fileToSquareDataUrl, type Sticker, type Tag } from "@/hooks/useStickers";

type NavSection = "stickers" | "orders" | "reviews" | "inquiries" | "analytics" | "settings" | "coupons";

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
      return sessionStorage.getItem("matchstickers_admin_auth") === "true";
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
  const [reviewFilter, setReviewFilter] = useState<"all" | "visible" | "moderated">("all");
  const [orders, setOrders]         = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [zoomPhoto, setZoomPhoto]   = useState<string | null>(null);
  const [orderTab, setOrderTab]     = useState<"all" | "completed" | "packed" | "shipped" | "delivered">("all");

  // Inquiries database states
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [callbacks, setCallbacks]     = useState<any[]>([]);
  const [callbackFilter, setCallbackFilter] = useState<"all" | "pending" | "resolved">("all");

  // Invoicing rules states
  const [adminStickerPrice, setAdminStickerPrice] = useState(40);
  const [adminBillDiscount, setAdminBillDiscount] = useState(0);
  const [adminAnnouncementEnabled, setAdminAnnouncementEnabled] = useState(false);
  const [adminAnnouncementText, setAdminAnnouncementText] = useState("");

  // Coupons states
  const [coupons, setCoupons]                   = useState<any[]>([]);
  const [couponCodeForm, setCouponCodeForm]     = useState("");
  const [couponDiscountForm, setCouponDiscountForm] = useState<number>(10);

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
        billDiscount: adminBillDiscount,
        announcementEnabled: adminAnnouncementEnabled,
        announcementText: adminAnnouncementText
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save settings");
        return res.json();
      })
      .then(data => {
        setAdminStickerPrice(data.stickerPrice);
        setAdminBillDiscount(data.billDiscount);
        setAdminAnnouncementEnabled(data.announcementEnabled || false);
        setAdminAnnouncementText(data.announcementText || "");
        showToast("✅ Global settings saved successfully");
      })
      .catch(err => {
        console.error("Error saving settings:", err);
        showToast("❌ Failed to save global settings");
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
        const mapped = data.map((r: any) => {
          let parsedPhotos = [];
          if (Array.isArray(r.photos)) {
            parsedPhotos = r.photos;
          } else if (typeof r.photos === "string") {
            try {
              const parsed = JSON.parse(r.photos);
              parsedPhotos = Array.isArray(parsed) ? parsed : (typeof parsed === "string" ? JSON.parse(parsed) : []);
            } catch {
              parsedPhotos = [];
            }
          }
          return {
            ...r,
            photos: parsedPhotos
          };
        });
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
        const mapped = data.map((o: any) => {
          let parsedStickers = [];
          if (Array.isArray(o.stickers)) {
            parsedStickers = o.stickers;
          } else if (typeof o.stickers === "string") {
            try {
              const parsed = JSON.parse(o.stickers);
              parsedStickers = Array.isArray(parsed) ? parsed : (typeof parsed === "string" ? JSON.parse(parsed) : []);
            } catch {
              parsedStickers = [];
            }
          }

          let parsedPhotos = [];
          if (Array.isArray(o.photos)) {
            parsedPhotos = o.photos;
          } else if (typeof o.photos === "string") {
            try {
              const parsed = JSON.parse(o.photos);
              parsedPhotos = Array.isArray(parsed) ? parsed : (typeof parsed === "string" ? JSON.parse(parsed) : []);
            } catch {
              parsedPhotos = [];
            }
          }

          return {
            ...o,
            stickers: parsedStickers,
            photos: parsedPhotos
          };
        });
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
          setAdminAnnouncementEnabled(data.announcementEnabled || false);
          setAdminAnnouncementText(data.announcementText || "");
        }
      })
      .catch(err => console.error("Failed to load pricing settings:", err));

    // Fetch coupons
    fetch("/api/coupons/admin", {
      headers: { "x-admin-password": "8523" }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch coupons");
        return res.json();
      })
      .then(data => {
        setCoupons(data);
      })
      .catch(err => console.error("Failed to load coupons:", err));
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

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeForm.trim()) return;
    const code = couponCodeForm.toUpperCase().trim();
    const discountPct = Number(couponDiscountForm);
    if (isNaN(discountPct) || discountPct < 1 || discountPct > 100) {
      showToast("❌ Discount percentage must be between 1 and 100");
      return;
    }

    fetch("/api/coupons/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": "8523"
      },
      body: JSON.stringify({ code, discountPct, active: true })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || "Failed to create coupon"); });
        }
        return res.json();
      })
      .then(newCoupon => {
        setCoupons(prev => [newCoupon, ...prev]);
        setCouponCodeForm("");
        setCouponDiscountForm(10);
        showToast(`🎟️ Coupon ${code} created successfully`);
      })
      .catch(err => {
        console.error("Error creating coupon:", err);
        showToast(`❌ ${err.message || "Failed to create coupon"}`);
      });
  };

  const handleToggleCoupon = (id: number, currentActive: boolean) => {
    fetch(`/api/coupons/admin/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": "8523"
      },
      body: JSON.stringify({ active: !currentActive })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update coupon status");
        return res.json();
      })
      .then(updated => {
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: updated.active } : c));
        showToast(updated.active ? "🎟️ Coupon activated ✅" : "🎟️ Coupon deactivated 🔒");
      })
      .catch(err => {
        console.error("Error updating coupon:", err);
        showToast("❌ Error updating coupon status");
      });
  };

  const handleDeleteCoupon = (id: number) => {
    fetch(`/api/coupons/admin/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": "8523" }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete coupon");
        setCoupons(prev => prev.filter(c => c.id !== id));
        showToast("🗑️ Coupon deleted successfully");
      })
      .catch(err => {
        console.error("Error deleting coupon:", err);
        showToast("❌ Error deleting coupon");
      });
  };

  useEffect(() => {
    fetchAdminData();
  }, [authenticated]);

  // Auth unlock submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "8523") {
      sessionStorage.setItem("matchstickers_admin_auth", "true");
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
        showToast(`Order #MMS-${orderId} status updated to ${labels[nextStatus] || nextStatus}`);
      })
      .catch(err => {
        console.error("Error updating status:", err);
        showToast("Error updating order status");
      });
  };

  const downloadSinglePhoto = (photoUrl: string, orderId: number, index: number) => {
    const link = document.createElement("a");
    link.href = photoUrl;
    link.download = `matchstickers_order_${orderId}_photo_${index + 1}.png`;
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
          <a href="/"><span className="text-xl font-black tracking-tighter" style={{ color: "hsl(43,80%,92%)" }}>Match Stickers</span></a>
          <span className="block text-xs font-semibold mt-0.5" style={{ color: "rgba(43,170,143,0.6)" }}>Admin Dashboard</span>
        </div>
        
        <nav className="flex flex-col gap-1.5">
          {([
            { id: "stickers", label: "Stickers Manager", icon: "🎨" },
            { id: "orders", label: "Orders Manager", icon: "📦" },
            { id: "coupons", label: "Coupons Manager", icon: "🎟️" },
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
          <button onClick={() => { sessionStorage.removeItem("matchstickers_admin_auth"); setAuthenticated(false); }}
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
                 coupons: "Coupons Manager",
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
                 coupons: "Create and manage promotional discount codes to boost conversions and campaigns",
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
          {(nav === "orders" || nav === "reviews" || nav === "inquiries" || nav === "coupons") && (
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

              {/* Table Search & Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(43,170,143,0.45)" }}>🔍</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by customer name, email, or shipping address..."
                    className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(29,58,74,0.5)", border: "1px solid rgba(43,170,143,0.2)", color: "hsl(43,80%,90%)" }}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
                      style={{ color: "rgba(43,170,143,0.5)" }}>✕</button>
                  )}
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="py-24 text-center rounded-2xl" style={GLASS}>
                  <p className="text-4xl mb-2">📦</p>
                  <p className="text-sm font-semibold" style={{ color: "rgba(43,170,143,0.5)" }}>No customer orders placed yet.</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(43,170,143,0.15)", ...GLASS }}>
                  {/* Table Header */}
                  <div className="grid items-center text-xs font-semibold px-6 py-4 select-none"
                    style={{
                      gridTemplateColumns: "6.5rem 10.5rem 1fr 6rem 5.5rem 4.5rem 8rem",
                      color: "rgba(43,170,143,0.6)",
                      borderBottom: "1px solid rgba(43,170,143,0.15)",
                      background: "rgba(10,24,34,0.5)"
                    }}>
                    <span>Order ID</span>
                    <span>Date & Time</span>
                    <span>Customer Details</span>
                    <span>Stickers</span>
                    <span>Total</span>
                    <span>Receipt</span>
                    <span className="text-center">Status</span>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-white/5">
                    {orders
                      .filter(o => orderTab === "all" || o.status === orderTab)
                      .filter(o => 
                        !search ||
                        o.buyerName.toLowerCase().includes(search.toLowerCase()) ||
                        o.buyerEmail.toLowerCase().includes(search.toLowerCase()) ||
                        (o.buyerMobile && o.buyerMobile.includes(search)) ||
                        (o.buyerAddress && o.buyerAddress.toLowerCase().includes(search.toLowerCase()))
                      )
                      .map((order, i) => {
                        const isExpanded = expandedOrderId === order.id;
                        const statusConfig = {
                          completed: { label: "Received", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", sidebarBg: "rgba(59,130,246,0.6)" },
                          packed: { label: "Packed", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", sidebarBg: "rgba(245,158,11,0.6)" },
                          shipped: { label: "Shipped", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.25)", sidebarBg: "rgba(167,139,250,0.6)" },
                          delivered: { label: "Delivered", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", sidebarBg: "rgba(16,185,129,0.6)" }
                        }[order.status as "completed" | "packed" | "shipped" | "delivered"] || { label: order.status, color: "#94a3b8", bg: "rgba(29,58,74,0.12)", border: "rgba(29,58,74,0.25)", sidebarBg: "rgba(43,170,143,0.7)" };

                        return (
                          <div key={order.id} className="transition-colors duration-150" style={{ background: isExpanded ? "rgba(43,170,143,0.02)" : "transparent" }}>
                            {/* Expandable Primary Row */}
                            <div
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="grid items-center px-6 py-4.5 cursor-pointer hover:bg-white/5 transition-colors"
                              style={{
                                gridTemplateColumns: "6.5rem 10.5rem 1fr 6rem 5.5rem 4.5rem 8rem",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-teal-400/50">{isExpanded ? "▼" : "▶"}</span>
                                 <span className="font-extrabold text-sm" style={{ color: statusConfig.color }}>#MMS-{order.id}</span>
                              </div>
                              <span className="text-xs text-white/60">
                                {new Date(order.createdAt).toLocaleString()}
                              </span>
                              <div className="min-w-0 pr-4">
                                <p className="text-sm font-bold text-white/95 truncate">{order.buyerName}</p>
                                <p className="text-[11px] truncate" style={{ color: "rgba(232,196,90,0.45)" }}>{order.buyerEmail}</p>
                              </div>
                              <span className="text-xs font-semibold text-white/80">
                                {order.stickers.length} Stickers
                              </span>
                              <div className="flex flex-col items-start justify-center">
                                {order.discountAmount > 0 && (
                                  <span className="text-[10px] line-through text-white/35 font-normal">
                                    ₹{order.amount + order.discountAmount}
                                  </span>
                                )}
                                <span className="text-sm font-black text-amber-300">
                                  ₹{order.amount}
                                </span>
                              </div>
                              <div>
                                {order.receiptPhoto ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold" title="Receipt Uploaded">🧾</span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-white/5 border border-white/10 text-white/20 text-xs italic" title="No Receipt Uploaded">—</span>
                                )}
                              </div>
                              <div className="flex justify-center">
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-center"
                                  style={{ background: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}>
                                  {statusConfig.label}
                                </span>
                              </div>
                            </div>

                            {/* Row Expanded Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden bg-black/20"
                                >
                                  <div className="px-10 py-6 border-t border-b border-white/5 grid md:grid-cols-4 gap-6 text-left">
                                    {/* Shipping & Contact info */}
                                    <div className="space-y-3">
                                      <h4 className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "rgba(43,170,143,0.6)" }}>Customer Details</h4>
                                      <div>
                                        <p className="text-sm font-extrabold text-white">{order.buyerName}</p>
                                        <a href={`mailto:${order.buyerEmail}`} className="text-xs hover:underline mt-1 block" style={{ color: "rgba(232,196,90,0.6)" }}>
                                          📧 {order.buyerEmail}
                                        </a>
                                        {order.buyerMobile && (
                                          <a href={`tel:${order.buyerMobile}`} className="text-xs hover:underline mt-1 block text-white/80">
                                            📞 {order.buyerMobile}
                                          </a>
                                        )}
                                      </div>
                                      {order.buyerAddress && (
                                        <div className="text-xs text-white/70 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                                          📍 <span className="font-bold text-amber-300">Shipping Address:</span><br />
                                          {order.buyerAddress}
                                        </div>
                                      )}
                                      {order.appliedCoupon && (
                                        <div className="text-xs text-white/75 leading-relaxed bg-teal-500/10 p-3 rounded-xl border border-teal-500/20 mt-2 space-y-1.5">
                                          <div className="flex justify-between" style={{ borderBottom: "1px dashed rgba(43,170,143,0.15)", paddingBottom: "4px" }}>
                                            <span style={{ color: "rgba(43,170,143,0.6)" }}>Original Total:</span>
                                            <span className="font-bold text-white/90">₹{order.amount + order.discountAmount}</span>
                                          </div>
                                          <div className="flex justify-between" style={{ borderBottom: "1px dashed rgba(43,170,143,0.15)", paddingBottom: "4px" }}>
                                            <span style={{ color: "rgba(43,170,143,0.6)" }}>Coupon Used:</span>
                                            <span className="font-mono text-white font-extrabold bg-teal-500/20 px-1.5 py-0.2 rounded text-[10px]">{order.appliedCoupon}</span>
                                          </div>
                                          <div className="flex justify-between" style={{ borderBottom: "1px dashed rgba(43,170,143,0.15)", paddingBottom: "4px" }}>
                                            <span style={{ color: "rgba(43,170,143,0.6)" }}>Discount Applied:</span>
                                            <span className="text-emerald-400 font-extrabold">-₹{order.discountAmount}</span>
                                          </div>
                                          <div className="flex justify-between pt-1">
                                            <span className="font-bold text-teal-400">Final Charged:</span>
                                            <span className="text-amber-300 font-black">₹{order.amount}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Sticker Selection list */}
                                    <div>
                                      <h4 className="text-[10px] uppercase font-bold tracking-wider mb-2.5" style={{ color: "rgba(43,170,143,0.6)" }}>
                                        Selected Stickers ({order.stickers.length})
                                      </h4>
                                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                                        {order.stickers.map((sid: number, k: number) => {
                                          const s = stickers.find(st => st.id === sid);
                                          return (
                                            <div key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                                              style={{ background: "rgba(29,58,74,0.45)", border: "1px solid rgba(43,170,143,0.15)" }}>
                                              <span>{s?.emoji || "✨"}</span>
                                              <span className="text-white/80 font-medium truncate max-w-[90px]">{s?.name || `Sticker #${sid}`}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Uploaded High-Res Photos list */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2.5">
                                        <h4 className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "rgba(43,170,143,0.6)" }}>
                                          Customer Photos ({order.photos.length})
                                        </h4>
                                        {order.photos && order.photos.length > 0 && (
                                          <button
                                            onClick={() => downloadAllPhotos(order.photos, order.id)}
                                            className="text-[9px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 hover:bg-emerald-500/10 cursor-pointer"
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
                                      <div className="flex flex-wrap gap-2">
                                        {order.photos.map((photo: string, pIndex: number) => (
                                          <div key={pIndex} className="relative group">
                                            <div
                                              onClick={() => setZoomPhoto(photo)}
                                              className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 cursor-zoom-in bg-black/40 hover:brightness-110 transition-all"
                                              style={{ borderColor: "rgba(43,170,143,0.3)" }}>
                                              <img src={photo} alt="Customer uploads" className="w-full h-full object-cover" />
                                            </div>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                downloadSinglePhoto(photo, order.id, pIndex);
                                              }}
                                              className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 text-white transition-all shadow-md cursor-pointer opacity-0 group-hover:opacity-100 z-10 text-[9px]"
                                              title="Download high-res photo"
                                            >
                                              📥
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Receipt preview and inline Action */}
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: "rgba(43,170,143,0.6)" }}>
                                          Payment Receipt
                                        </h4>
                                        {order.receiptPhoto ? (
                                          <div className="relative group w-fit">
                                            <div
                                              onClick={() => setZoomPhoto(order.receiptPhoto)}
                                              className="w-14 h-14 rounded-lg overflow-hidden border cursor-zoom-in bg-white/5 flex items-center justify-center hover:brightness-110 transition-all"
                                              style={{ borderColor: "rgba(232,196,90,0.3)" }}>
                                              <img src={order.receiptPhoto} alt="Payment Receipt" className="w-full h-full object-cover" />
                                            </div>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                downloadSinglePhoto(order.receiptPhoto, order.id, 99);
                                              }}
                                              className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white transition-all shadow-md cursor-pointer opacity-0 group-hover:opacity-100 z-10 text-[9px]"
                                              title="Download receipt image"
                                            >
                                              📥
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="text-xs text-white/30 italic">No receipt uploaded yet</span>
                                        )}
                                      </div>

                                      {/* Status modifier dropdown */}
                                      <div className="pt-2">
                                        <span className="block text-[9px] uppercase font-bold tracking-wider mb-1.5" style={{ color: "rgba(43,170,143,0.5)" }}>Update Status:</span>
                                        <select
                                          value={order.status}
                                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                          className="rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer border w-full sm:w-40"
                                          style={{
                                            background: "rgba(29,58,74,0.65)",
                                            borderColor: "rgba(43,170,143,0.25)",
                                            color: "hsl(43,80%,90%)"
                                          }}
                                        >
                                          <option value="completed">Received</option>
                                          <option value="packed" disabled={!order.receiptPhoto}>
                                            Packed {!order.receiptPhoto ? "🔒 (Awaiting Payment)" : ""}
                                          </option>
                                          <option value="shipped">Shipped</option>
                                          <option value="delivered">Delivered</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Packing confirmation row */}
                                  {order.status === "completed" && (
                                    <div className="px-10 py-4 bg-black/10 flex flex-wrap items-center justify-between gap-4">
                                      <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: order.receiptPhoto ? "hsl(168, 58%, 50%)" : "hsl(43, 75%, 55%)" }}>
                                        {order.receiptPhoto ? "✅ Receipt uploaded. Ready to confirm and pack order." : "⚠️ Awaiting customer payment receipt upload to unlock packing."}
                                      </span>
                                      <motion.button
                                        whileHover={order.receiptPhoto ? { scale: 1.03 } : {}}
                                        whileTap={order.receiptPhoto ? { scale: 0.97 } : {}}
                                        disabled={!order.receiptPhoto}
                                        onClick={() => handleUpdateStatus(order.id, "packed")}
                                        className="px-4.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed transition-all shadow-md"
                                        style={{
                                          background: order.receiptPhoto
                                            ? "linear-gradient(135deg, rgba(16,185,129,0.9), rgba(43,170,143,0.85))"
                                            : "rgba(255,255,255,0.05)",
                                          border: order.receiptPhoto
                                            ? "1px solid rgba(232,196,90,0.3)"
                                            : "1px solid rgba(255,255,255,0.05)",
                                          color: order.receiptPhoto ? "hsl(204,46%,9%)" : "rgba(255,255,255,0.25)",
                                          boxShadow: order.receiptPhoto ? "0 4px 12px rgba(16,185,129,0.2)" : "none"
                                        }}
                                      >
                                        {order.receiptPhoto ? "📦 Confirm & Pack Order" : "🔒 Confirm & Pack (Locked)"}
                                      </motion.button>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ REVIEWS MANAGER ═══ */}
          {nav === "reviews" && (
            <div className="space-y-6">
              {/* Approval status filter bar */}
              <div className="flex flex-wrap gap-2.5 pb-2 border-b" style={{ borderColor: "rgba(43,170,143,0.12)" }}>
                {([
                  { id: "all", label: "All Reviews", icon: "💬" },
                  { id: "visible", label: "Visible / Approved", icon: "✅" },
                  { id: "moderated", label: "Moderated / Pending", icon: "⏳" },
                ] as const).map((tab) => {
                  const active = reviewFilter === tab.id;
                  const count = tab.id === "all"
                    ? allReviews.length
                    : tab.id === "visible"
                      ? allReviews.filter(r => r.enabled).length
                      : allReviews.filter(r => !r.enabled).length;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setReviewFilter(tab.id)}
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

              {/* Table search & sort */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(43,170,143,0.45)" }}>🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reviews by customer name, handle, or comment..."
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(29,58,74,0.5)", border: "1px solid rgba(43,170,143,0.2)", color: "hsl(43,80%,90%)" }}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
                    style={{ color: "rgba(43,170,143,0.5)" }}>✕</button>
                )}
              </div>

              {allReviews.length === 0 ? (
                <div className="py-24 text-center rounded-2xl" style={GLASS}>
                  <p className="text-4xl mb-2">💬</p>
                  <p className="text-sm font-semibold" style={{ color: "rgba(43,170,143,0.5)" }}>No customer reviews in the database.</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(43,170,143,0.15)", ...GLASS }}>
                  {/* Table Header */}
                  <div className="grid items-center text-xs font-semibold px-6 py-4 select-none"
                    style={{
                      gridTemplateColumns: "1.5rem 10.5rem 5.5rem 1fr 6rem 8.5rem 8.5rem 3.5rem",
                      color: "rgba(43,170,143,0.6)",
                      borderBottom: "1px solid rgba(43,170,143,0.15)",
                      background: "rgba(10,24,34,0.5)"
                    }}>
                    <span></span>
                    <span>Reviewer</span>
                    <span>Rating</span>
                    <span>Review Message</span>
                    <span>Photos</span>
                    <span className="text-center">Priority Rank</span>
                    <span className="text-center">Visibility Status</span>
                    <span></span>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-white/5">
                    {allReviews
                      .filter(r => reviewFilter === "all" || (reviewFilter === "visible" && r.enabled) || (reviewFilter === "moderated" && !r.enabled))
                      .filter(r => 
                        !search ||
                        r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.handle.toLowerCase().includes(search.toLowerCase()) ||
                        r.text.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((rev) => {
                        const isConfirm = confirmDeleteId === rev.id;
                        return (
                          <div
                            key={rev.id}
                            className="grid items-center px-6 py-4 hover:bg-white/5 transition-colors duration-150"
                            style={{
                              gridTemplateColumns: "1.5rem 10.5rem 5.5rem 1fr 6rem 8.5rem 8.5rem 3.5rem",
                            }}
                          >
                            <span className="text-sm">{rev.emoji}</span>
                            <div className="min-w-0 pr-4">
                              <p className="text-sm font-bold text-white/95 truncate">{rev.name}</p>
                              <p className="text-[11px] truncate" style={{ color: "rgba(232,196,90,0.45)" }}>{rev.handle}</p>
                              <p className="text-[9px] text-white/30 mt-0.5">{new Date(rev.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, j) => (
                                <svg key={j} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={j < rev.rating ? "currentColor" : "none"} stroke="currentColor" className="w-3 h-3" style={{ color: "rgba(232,196,90,0.9)" }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                </svg>
                              ))}
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed pr-6 italic max-h-16 overflow-y-auto pr-1 whitespace-pre-wrap">
                              "{rev.text}"
                            </p>
                            <div className="flex gap-1.5 overflow-x-auto py-0.5">
                              {Array.isArray(rev.photos) && rev.photos.length > 0 ? (
                                rev.photos.map((photo: string, k: number) => (
                                  <div
                                    key={k}
                                    onClick={() => setZoomPhoto(photo)}
                                    className="w-10 h-10 rounded border cursor-zoom-in overflow-hidden hover:scale-105 transition-transform"
                                    style={{ borderColor: "rgba(232,196,90,0.2)" }}
                                  >
                                    <img src={photo} alt="Reviews customer uploads" className="w-full h-full object-cover" />
                                  </div>
                                ))
                              ) : (
                                <span className="text-[10px] text-white/20 italic">—</span>
                              )}
                            </div>

                            {/* Rank Adjusters */}
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => handleRankReview(rev.id, rev.rank, "up")}
                                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold border hover:bg-white/5 cursor-pointer transition-colors"
                                style={{ borderColor: "rgba(43,170,143,0.25)", color: "rgba(43,170,143,0.85)" }}>
                                🔼
                              </button>
                              <span className="text-xs font-bold px-2 py-0.5 rounded text-center min-w-8" style={{ background: "rgba(29,58,74,0.6)", color: "hsl(43,80%,85%)" }}>
                                {rev.rank}
                              </span>
                              <button onClick={() => handleRankReview(rev.id, rev.rank, "down")}
                                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold border hover:bg-white/5 cursor-pointer transition-colors"
                                style={{ borderColor: "rgba(43,170,143,0.25)", color: "rgba(43,170,143,0.85)" }}>
                                🔽
                              </button>
                            </div>

                            {/* Visibility approvals */}
                            <div className="flex justify-center">
                              <button onClick={() => handleToggleReview(rev.id, rev.enabled)}
                                className="flex items-center gap-1.5 text-[10px] font-bold uppercase cursor-pointer border px-2.5 py-1 rounded-full tracking-wider w-24 justify-center hover:brightness-110 transition-all"
                                style={{
                                  background: rev.enabled ? "rgba(16,185,129,0.08)" : "rgba(232,87,58,0.08)",
                                  borderColor: rev.enabled ? "rgba(16,185,129,0.25)" : "rgba(232,87,58,0.25)",
                                  color: rev.enabled ? "#10b981" : "#ef4444"
                                }}>
                                <div className="w-2 h-2 rounded-full" style={{ background: rev.enabled ? "#10b981" : "#ef4444" }} />
                                {rev.enabled ? "Visible" : "Pending"}
                              </button>
                            </div>

                            {/* Delete Review */}
                            <div className="flex justify-end">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  if (isConfirm) {
                                    fetch(`/api/reviews/admin/${rev.id}`, {
                                      method: "DELETE",
                                      headers: { "x-admin-password": "8523" }
                                    })
                                      .then(res => {
                                        if (!res.ok) throw new Error("Delete failed");
                                        setAllReviews(prev => prev.filter(r => r.id !== rev.id));
                                        showToast("🗑️ Review deleted successfully");
                                      })
                                      .catch(err => {
                                        console.error("Error deleting review:", err);
                                        showToast("Error deleting review");
                                      });
                                    setConfirmDeleteId(null);
                                  } else {
                                    setConfirmDeleteId(rev.id);
                                    setTimeout(() => setConfirmDeleteId(null), 3000);
                                  }
                                }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer border transition-all"
                                style={{
                                  background: isConfirm ? "rgba(232,87,58,0.2)" : "rgba(232,87,58,0.05)",
                                  borderColor: isConfirm ? "rgba(232,87,58,0.5)" : "rgba(232,87,58,0.2)",
                                  color: "#ef4444"
                                }}
                                title={isConfirm ? "Click again to confirm delete" : "Delete Review"}
                              >
                                {isConfirm ? "⚠️" : "🗑️"}
                              </motion.button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
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

              {/* Sub Navigation Tabs for Inquiries */}
              <div className="flex gap-4 border-b pb-2" style={{ borderColor: "rgba(43,170,143,0.12)" }}>
                <button
                  onClick={() => { setOrderTab("all"); setSearch(""); }}
                  className="px-4 py-2 font-bold text-sm border-b-2 cursor-pointer transition-colors"
                  style={{
                    borderColor: orderTab === "all" ? "rgba(43,170,143,0.8)" : "transparent",
                    color: orderTab === "all" ? "hsl(43,80%,92%)" : "rgba(232,196,90,0.4)"
                  }}
                >
                  📞 Callbacks Queue ({callbacks.length})
                </button>
                <button
                  onClick={() => { setOrderTab("completed"); setSearch(""); }}
                  className="px-4 py-2 font-bold text-sm border-b-2 cursor-pointer transition-colors"
                  style={{
                    borderColor: orderTab === "completed" ? "rgba(43,170,143,0.8)" : "transparent",
                    color: orderTab === "completed" ? "hsl(43,80%,92%)" : "rgba(232,196,90,0.4)"
                  }}
                >
                  ✉️ Customer Messages ({submissions.length})
                </button>
              </div>

              {/* Sub-tab 1: Callbacks Queue Table */}
              {orderTab === "all" && (
                <div className="space-y-4">
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(43,170,143,0.45)" }}>🔍</span>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search callback queue by phone number..."
                        className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none"
                        style={{ background: "rgba(29,58,74,0.5)", border: "1px solid rgba(43,170,143,0.2)", color: "hsl(43,80%,90%)" }}
                      />
                      {search && (
                        <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
                          style={{ color: "rgba(43,170,143,0.5)" }}>✕</button>
                      )}
                    </div>
                    {/* Status Filters */}
                    <div className="flex gap-1.5 bg-black/25 p-1 rounded-xl border border-white/5 w-fit">
                      {(["all", "pending", "resolved"] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setCallbackFilter(filter)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer"
                          style={{
                            background: callbackFilter === filter ? "rgba(43,170,143,0.15)" : "transparent",
                            color: callbackFilter === filter ? "rgba(43,170,143,0.95)" : "rgba(232,196,90,0.4)",
                          }}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {callbacks.length === 0 ? (
                    <div className="py-20 text-center rounded-2xl" style={GLASS}>
                      <p className="text-4xl mb-2">📞</p>
                      <p className="text-sm font-semibold" style={{ color: "rgba(43,170,143,0.5)" }}>No telephone callback requests yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(43,170,143,0.15)", ...GLASS }}>
                      {/* Table Header */}
                      <div className="grid items-center text-xs font-semibold px-6 py-4 select-none"
                        style={{
                          gridTemplateColumns: "5rem 12.5rem 1fr 8.5rem 6.5rem",
                          color: "rgba(43,170,143,0.6)",
                          borderBottom: "1px solid rgba(43,170,143,0.15)",
                          background: "rgba(10,24,34,0.5)"
                        }}>
                        <span>ID</span>
                        <span>Requested Time</span>
                        <span>Phone Number</span>
                        <span className="text-center">Status</span>
                        <span className="text-right">Actions</span>
                      </div>

                      {/* Table Body */}
                      <div className="divide-y divide-white/5">
                        {callbacks
                          .filter(c => callbackFilter === "all" || c.status === callbackFilter)
                          .filter(c => !search || c.phone.includes(search))
                          .map((c) => {
                            const isPending = c.status === "pending";
                            return (
                              <div
                                key={c.id}
                                className="grid items-center px-6 py-3.5 hover:bg-white/5 transition-colors duration-150"
                                style={{
                                  gridTemplateColumns: "5rem 12.5rem 1fr 8.5rem 6.5rem",
                                }}
                              >
                                <span className="text-xs font-bold text-teal-400">#CALL-{c.id}</span>
                                <span className="text-xs text-white/50">{new Date(c.createdAt).toLocaleString()}</span>
                                <a href={`tel:${c.phone}`} className="text-sm font-extrabold text-white/90 hover:underline hover:text-teal-400 w-fit">
                                  📞 {c.phone}
                                </a>
                                <div className="flex justify-center">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border text-center"
                                    style={{
                                      background: isPending ? "rgba(232,196,90,0.08)" : "rgba(16,185,129,0.08)",
                                      color: isPending ? "rgba(232,196,90,0.85)" : "#10b981",
                                      borderColor: isPending ? "rgba(232,196,90,0.25)" : "rgba(16,185,129,0.25)"
                                    }}>
                                    {isPending ? "Pending ⏳" : "Resolved ✅"}
                                  </span>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleUpdateCallbackStatus(c.id, isPending ? "resolved" : "pending")}
                                    className="px-3 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-colors hover:brightness-110"
                                    style={{
                                      background: isPending ? "rgba(43,170,143,0.1)" : "rgba(232,196,90,0.05)",
                                      borderColor: isPending ? "rgba(43,170,143,0.3)" : "rgba(232,196,90,0.25)",
                                      color: isPending ? "rgba(43,170,143,0.95)" : "rgba(232,196,90,0.7)"
                                    }}
                                    title={isPending ? "Mark as Called / Resolved" : "Revert status to Pending"}
                                  >
                                    {isPending ? "Resolve ✓" : "Reopen ↩"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Customer Messages Table */}
              {orderTab === "completed" && (
                <div className="space-y-4">
                  {/* Search message */}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(43,170,143,0.45)" }}>🔍</span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search messages by name, email, subject, or contents..."
                      className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none"
                      style={{ background: "rgba(29,58,74,0.5)", border: "1px solid rgba(43,170,143,0.2)", color: "hsl(43,80%,90%)" }}
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs cursor-pointer"
                        style={{ color: "rgba(43,170,143,0.5)" }}>✕</button>
                    )}
                  </div>

                  {submissions.length === 0 ? (
                    <div className="py-20 text-center rounded-2xl" style={GLASS}>
                      <p className="text-4xl mb-2">✉️</p>
                      <p className="text-sm font-semibold" style={{ color: "rgba(43,170,143,0.5)" }}>No customer contact messages received yet.</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(43,170,143,0.15)", ...GLASS }}>
                      {/* Table Header */}
                      <div className="grid items-center text-xs font-semibold px-6 py-4 select-none"
                        style={{
                          gridTemplateColumns: "1.5rem 10.5rem 13.5rem 8.5rem 1fr 4.5rem",
                          color: "rgba(43,170,143,0.6)",
                          borderBottom: "1px solid rgba(43,170,143,0.15)",
                          background: "rgba(10,24,34,0.5)"
                        }}>
                        <span></span>
                        <span>Date Received</span>
                        <span>Sender Name</span>
                        <span>Contact Method</span>
                        <span>Message Contents</span>
                        <span></span>
                      </div>

                      {/* Table Body */}
                      <div className="divide-y divide-white/5">
                        {submissions
                          .filter(s => 
                            !search || 
                            s.name.toLowerCase().includes(search.toLowerCase()) || 
                            (s.email && s.email.toLowerCase().includes(search.toLowerCase())) || 
                            (s.phone && s.phone.includes(search)) || 
                            (s.subject && s.subject.toLowerCase().includes(search.toLowerCase())) || 
                            s.message.toLowerCase().includes(search.toLowerCase())
                          )
                          .map((s) => {
                            const isMessageExpanded = expandedOrderId === s.id + 100000; // Offset ID to avoid conflicts with orders
                            return (
                              <div
                                key={s.id}
                                className="transition-colors duration-150"
                                style={{ background: isMessageExpanded ? "rgba(43,170,143,0.02)" : "transparent" }}
                              >
                                {/* Primary Row */}
                                <div
                                  onClick={() => setExpandedOrderId(isMessageExpanded ? null : s.id + 100000)}
                                  className="grid items-center px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors"
                                  style={{
                                    gridTemplateColumns: "1.5rem 10.5rem 13.5rem 8.5rem 1fr 4.5rem",
                                  }}
                                >
                                  <span className="text-[10px] text-teal-400/50">{isMessageExpanded ? "▼" : "▶"}</span>
                                  <span className="text-xs text-white/50">{new Date(s.createdAt).toLocaleString()}</span>
                                  <span className="text-sm font-extrabold text-white">{s.name}</span>
                                  <div className="text-xs pr-4 truncate space-y-0.5">
                                    {s.email && <div className="text-white/80 font-medium">📧 {s.email}</div>}
                                    {s.phone && <div className="text-white/50 font-medium">📞 {s.phone}</div>}
                                  </div>
                                  <div className="pr-6 truncate">
                                    {s.subject && <span className="font-extrabold text-teal-400 mr-2">[{s.subject}]</span>}
                                    <span className="text-xs text-white/60 italic">"{s.message}"</span>
                                  </div>
                                  <div className="flex justify-end">
                                    {s.email && (
                                      <a
                                        href={`mailto:${s.email}?subject=RE: ${encodeURIComponent(s.subject || "Your inquiry with Match Stickers")}`}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border hover:bg-white/10 cursor-pointer transition-colors"
                                        style={{ borderColor: "rgba(43,170,143,0.25)", color: "rgba(43,170,143,0.85)" }}
                                        title="Reply by Email"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        ✉️
                                      </a>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded detailed message */}
                                <AnimatePresence>
                                  {isMessageExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden bg-black/20 border-t border-b border-white/5"
                                    >
                                      <div className="px-10 py-6 text-left space-y-4">
                                        <div className="flex items-center justify-between gap-4">
                                          <div>
                                            <h4 className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "rgba(43,170,143,0.6)" }}>Full Subject</h4>
                                            <p className="text-sm font-bold text-white mt-1">{s.subject || "(No Subject)"}</p>
                                          </div>
                                          {s.email && (
                                            <a
                                              href={`mailto:${s.email}?subject=RE: ${encodeURIComponent(s.subject || "Your Inquiry")}`}
                                              className="px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-teal-500/30 hover:bg-teal-500/10 cursor-pointer text-teal-400 transition-colors shadow-sm"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              ✉️ Send Email Reply
                                            </a>
                                          )}
                                        </div>
                                        <div>
                                          <h4 className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: "rgba(43,170,143,0.6)" }}>Sender Message</h4>
                                          <div className="p-4 rounded-xl text-xs leading-relaxed text-white whitespace-pre-wrap"
                                            style={{ background: "rgba(16,36,50,0.6)", border: "1px solid rgba(43,170,143,0.1)" }}>
                                            {s.message}
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
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

                  {/* Announcement Bar Toggle & Text */}
                  <div className="pt-3 border-t border-white/5 space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-teal-400">Sale Announcement Banner</h4>
                    
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <div onClick={() => setAdminAnnouncementEnabled(!adminAnnouncementEnabled)}
                        className="w-9 h-5 rounded-full relative transition-all duration-200 cursor-pointer"
                        style={{ background: adminAnnouncementEnabled ? "rgba(43,170,143,0.8)" : "rgba(43,170,143,0.2)" }}>
                        <motion.div animate={{ left: adminAnnouncementEnabled ? "calc(100% - 18px)" : "2px" }}
                          transition={{ type:"spring", stiffness:500, damping:30 }}
                          className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white" />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: adminAnnouncementEnabled ? "hsl(43,80%,85%)" : "rgba(232,196,90,0.4)" }}>
                        {adminAnnouncementEnabled ? "Banner Active (Visible)" : "Banner Disabled (Hidden)"}
                      </span>
                    </label>

                    {adminAnnouncementEnabled && (
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(43,170,143,0.7)" }}>
                          Announcement Text
                        </label>
                        <input
                          type="text"
                          required
                          value={adminAnnouncementText}
                          onChange={(e) => setAdminAnnouncementText(e.target.value)}
                          placeholder="e.g. 🎉 FLASH SALE: Get 20% off all stickers with code LOVE20!"
                          className="w-full bg-black/40 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors border"
                          style={{ 
                            borderColor: "rgba(43,170,143,0.2)", 
                            background: "rgba(10,24,34,0.4)",
                            color: "white" 
                          }}
                        />
                      </div>
                    )}
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
                    💾 Save Settings
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

          {/* ═══ COUPONS MANAGER ═══ */}
          {nav === "coupons" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Total Coupons 🎟️", value: coupons.length, color: "rgba(43,170,143,0.9)" },
                  { label: "Active Coupons 🟢", value: coupons.filter(c => c.active).length, color: "rgba(16,185,129,0.9)" },
                  { label: "Average Discount 📈", value: coupons.length > 0 ? `${Math.round(coupons.reduce((sum, c) => sum + c.discountPct, 0) / coupons.length)}%` : "0%", color: "rgba(232,196,90,0.9)" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl p-5" style={GLASS}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "rgba(232,196,90,0.5)" }}>{stat.label}</p>
                    <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Main Panel Content (Two Columns Layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left side: List Coupons (span 2) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(43,170,143,0.15)", ...GLASS }}>
                    {/* Table Header */}
                    <div className="grid items-center text-xs font-semibold px-6 py-4 select-none"
                      style={{
                        gridTemplateColumns: "1.5rem 1fr 6.5rem 8.5rem 8.5rem 3.5rem",
                        color: "rgba(43,170,143,0.6)",
                        borderBottom: "1px solid rgba(43,170,143,0.15)",
                        background: "rgba(10,24,34,0.5)"
                      }}>
                      <span></span>
                      <span>Promo Code</span>
                      <span>Discount</span>
                      <span className="text-center">Created Date</span>
                      <span className="text-center">Status</span>
                      <span></span>
                    </div>

                    {/* Table Body */}
                    {coupons.length === 0 ? (
                      <div className="py-20 text-center" style={{ color: "rgba(43,170,143,0.35)" }}>
                        <p className="text-4xl mb-2">🎟️</p>
                        <p className="text-sm font-semibold">No promotional coupons available yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {coupons.map((c) => {
                          const isConfirm = confirmDeleteId === c.id;
                          return (
                            <div
                              key={c.id}
                              className="grid items-center px-6 py-4 hover:bg-white/5 transition-colors duration-150"
                              style={{
                                gridTemplateColumns: "1.5rem 1fr 6.5rem 8.5rem 8.5rem 3.5rem",
                              }}
                            >
                              <span className="text-sm">🏷️</span>
                              <span className="font-mono text-sm font-black text-white">{c.code}</span>
                              <span className="text-sm font-extrabold text-emerald-400">{c.discountPct}% OFF</span>
                              <span className="text-xs text-white/50 text-center">
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Local"}
                              </span>

                              {/* Toggle Status */}
                              <div className="flex justify-center">
                                <button onClick={() => handleToggleCoupon(c.id, c.active)}
                                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase cursor-pointer border px-2.5 py-1 rounded-full tracking-wider w-24 justify-center hover:brightness-110 transition-all"
                                  style={{
                                    background: c.active ? "rgba(16,185,129,0.08)" : "rgba(232,87,58,0.08)",
                                    borderColor: c.active ? "rgba(16,185,129,0.25)" : "rgba(232,87,58,0.25)",
                                    color: c.active ? "#10b981" : "#ef4444"
                                  }}>
                                  <div className="w-2 h-2 rounded-full" style={{ background: c.active ? "#10b981" : "#ef4444" }} />
                                  {c.active ? "Active" : "Disabled"}
                                </button>
                              </div>

                              {/* Delete Button */}
                              <div className="flex justify-end">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    if (isConfirm) {
                                      handleDeleteCoupon(c.id);
                                      setConfirmDeleteId(null);
                                    } else {
                                      setConfirmDeleteId(c.id);
                                      setTimeout(() => setConfirmDeleteId(null), 3000);
                                    }
                                  }}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer border transition-all"
                                  style={{
                                    background: isConfirm ? "rgba(232,87,58,0.2)" : "rgba(232,87,58,0.05)",
                                    borderColor: isConfirm ? "rgba(232,87,58,0.5)" : "rgba(232,87,58,0.2)",
                                    color: "#ef4444"
                                  }}
                                  title={isConfirm ? "Click again to confirm delete" : "Delete Coupon"}
                                >
                                  {isConfirm ? "⚠️" : "🗑️"}
                                </motion.button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Add Coupon Form */}
                <div className="space-y-4">
                  <div className="rounded-2xl p-6" style={GLASS}>
                    <h3 className="font-bold text-sm mb-5" style={{ color: "hsl(43,80%,85%)" }}>Add New Coupon</h3>
                    <form onSubmit={handleCreateCoupon} className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(43,170,143,0.7)" }}>
                          Promo Code (e.g. LOVE20)
                        </label>
                        <input
                          type="text"
                          required
                          value={couponCodeForm}
                          onChange={(e) => setCouponCodeForm(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          placeholder="ENTER CODE"
                          className="w-full bg-black/40 rounded-xl px-4 py-2.5 text-sm font-mono outline-none transition-colors border"
                          style={{
                            borderColor: "rgba(43,170,143,0.2)",
                            background: "rgba(10,24,34,0.4)",
                            color: "white"
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(43,170,143,0.7)" }}>
                          Discount Percentage (%)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          required
                          value={couponDiscountForm}
                          onChange={(e) => setCouponDiscountForm(Math.min(100, Math.max(1, Number(e.target.value))))}
                          className="w-full bg-black/40 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors border font-bold"
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
                        🎟️ Create Promo Coupon
                      </motion.button>
                    </form>
                  </div>
                </div>

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
