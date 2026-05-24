import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useStickers } from "@/hooks/useStickers";
import paymentQr from "@/assets/payment-qr.png";

const compressImage = (base64Str: string, maxW = 600, maxH = 600): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
      } else {
        if (height > maxH) {
          width = Math.round((width * maxH) / height);
          height = maxH;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

type CheckoutStep = "details" | "review" | "payment";

export default function Payment() {
  const { stickers } = useStickers();
  const [step, setStep] = useState<CheckoutStep>("details");
  
  // Buyer state
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerMobile, setBuyerMobile] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  
  // UPI states
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [receiptUploading, setReceiptUploading] = useState(false);

  // Page submit status
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  // Cart state
  const [selectedStickerIds, setSelectedStickerIds] = useState<number[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Configured pricing states
  const [stickerPrice, setStickerPrice] = useState(40);
  const [billDiscount, setBillDiscount] = useState(0);

  // Coupon states
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    try {
      const stickersRaw = localStorage.getItem("ours_selected_stickers");
      const photosRaw = localStorage.getItem("ours_uploaded_photos");
      if (stickersRaw) setSelectedStickerIds(JSON.parse(stickersRaw));
      if (photosRaw) setUploadedPhotos(JSON.parse(photosRaw));
    } catch (e) {
      console.error("Failed to load checkout data from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    fetch("/api/orders/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.stickerPrice === "number") {
          setStickerPrice(data.stickerPrice);
        }
        if (data && typeof data.billDiscount === "number") {
          setBillDiscount(data.billDiscount);
        }
      })
      .catch((err) => console.error("Failed to fetch order settings:", err));
  }, []);

  // Map selected sticker IDs to actual sticker data
  const selectedStickersData = selectedStickerIds
    .map(id => stickers.find(s => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s);

  const baseAmount = selectedStickersData.length * stickerPrice;
  const discountFromCoupon = appliedCoupon ? Math.round((baseAmount * appliedCoupon.discountPct) / 100) : 0;
  const totalAmount = Math.max(0, baseAmount - billDiscount - discountFromCoupon);

  // Validation checks
  const isNameValid = buyerName.trim().length > 0;
  const isEmailValid = buyerEmail.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  const isMobileValid = buyerMobile.trim().match(/^\d{10}$/); // Exactly 10 digits
  const isAddressValid = buyerAddress.trim().length > 0;
  const isDetailsValid = isNameValid && isEmailValid && isMobileValid && isAddressValid;

  const isUpiValid = !!receiptPhoto;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    const code = couponInput.trim();
    if (!code) return;

    setCouponLoading(true);
    try {
      const response = await fetch(`/api/coupons/validate/${code}`);
      const data = await response.json();
      if (response.ok && data.valid) {
        setAppliedCoupon({ code: data.code, discountPct: data.discountPct });
        setCouponSuccess(`Coupon code applied! You got a ${data.discountPct}% discount.`);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || "Invalid coupon code.");
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError("Failed to validate coupon code. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    setCouponSuccess("");
  };

  const handleNextToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDetailsValid) {
      alert("Please ensure all fields are filled correctly. Mobile must be exactly 10 digits.");
      return;
    }
    setStep("review");
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDetailsValid) {
      setStep("details");
      alert("Please correct your details first.");
      return;
    }

    if (selectedStickerIds.length === 0) {
      alert("Your sticker selection is empty! Please go back and select stickers.");
      return;
    }

    if (!isUpiValid) {
      alert("Please upload a payment receipt screenshot first.");
      return;
    }

    setStatus("processing");
    setErrorMsg("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerMobile: buyerMobile.trim(),
          buyerAddress: buyerAddress.trim(),
          stickers: selectedStickerIds,
          photos: uploadedPhotos,
          amount: totalAmount,
          receiptPhoto: receiptPhoto,
          appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
          discountAmount: discountFromCoupon,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to process payment");
      }

      const order = await response.json();
      setOrderId(order.id);
      setStatus("success");
      
      // Clear selections so they can place a new order next time
      localStorage.removeItem("ours_selected_stickers");
      localStorage.removeItem("ours_uploaded_photos");
    } catch (err: any) {
      console.error("Payment error:", err);
      setStatus("error");
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  // Stepper Header Component
  const renderStepperHeader = () => {
    const steps = [
      { id: "details", label: "Your Info", icon: "👤" },
      { id: "review", label: "Review Order", icon: "📋" },
      { id: "payment", label: "UPI Pay", icon: "📱" }
    ] as const;

    return (
      <div className="flex justify-between items-center max-w-md mx-auto mb-10 px-2">
        {steps.map((s, idx) => {
          const isActive = step === s.id;
          const isCompleted = 
            (s.id === "details" && (step === "review" || step === "payment")) ||
            (s.id === "review" && step === "payment");

          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center relative z-10">
                <motion.button
                  type="button"
                  onClick={() => {
                    if (s.id === "details" || (s.id === "review" && isDetailsValid)) {
                      setStep(s.id);
                    }
                  }}
                  disabled={s.id === "payment" && !isDetailsValid}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-300 shadow-md cursor-pointer"
                  style={{
                    background: isCompleted
                      ? "rgba(43,170,143,0.95)"
                      : isActive
                      ? "linear-gradient(135deg,rgba(232,196,90,0.95),rgba(43,170,143,0.9))"
                      : "rgba(16,36,50,0.8)",
                    borderColor: isCompleted
                      ? "rgba(43,170,143,0.9)"
                      : isActive
                      ? "rgba(232,196,90,0.8)"
                      : "rgba(255,255,255,0.1)",
                    color: isCompleted || isActive ? "hsl(204,46%,9%)" : "rgba(255,255,255,0.4)"
                  }}
                >
                  {isCompleted ? "✓" : s.icon}
                </motion.button>
                <span 
                  className="text-[10px] font-extrabold uppercase mt-2 tracking-wider"
                  style={{ color: isActive ? "hsl(43,80%,90%)" : "rgba(255,255,255,0.3)" }}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 -mt-5 relative bg-white/5 overflow-hidden rounded-full">
                  <motion.div 
                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-emerald-400 to-amber-300"
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: isCompleted ? "100%" : (isActive && step === "review" ? "50%" : "0%")
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (status === "success") {
    return (
      <div className="min-h-screen pb-44" style={{ background:"hsl(204,46%,9%)" }}>
        <div className="max-w-xl mx-auto px-4 pt-20">
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="text-center p-12 rounded-3xl border shadow-2xl backdrop-blur-xl"
            style={{ background:"rgba(16,36,50,0.75)", borderColor:"rgba(43,170,143,0.45)" }}>
            
            <motion.div className="text-6xl mb-6 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1], rotate: [0, 360, 360] }}
              transition={{ duration: 0.8, ease: "easeOut" }}>
              🎉
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-black mb-4"
              style={{ color:"hsl(43,80%,92%)", textShadow:"0 0 60px rgba(43,170,143,0.35)" }}>
              Order Confirmed!
            </h1>
            
            <p className="text-base mb-6" style={{ color:"rgba(43,170,143,0.9)" }}>
              Thank you, <strong style={{ color: "white" }}>{buyerName}</strong>! Your order has been placed successfully.
            </p>

            <div className="bg-black/30 p-6 rounded-2xl border border-white/5 text-left mb-8 space-y-3.5">
              <div className="flex justify-between text-xs pb-2 border-b border-white/5">
                <span className="text-white/40">Order ID:</span>
                <span className="text-emerald-400 font-bold">#MMS-{orderId}</span>
              </div>
              <div className="flex justify-between text-xs pb-2 border-b border-white/5">
                <span className="text-white/40">Total Paid:</span>
                <span className="text-white/80 font-bold">₹{totalAmount} (via UPI)</span>
              </div>
              <div className="flex justify-between text-xs pb-2 border-b border-white/5">
                <span className="text-white/40">Email Address:</span>
                <span className="text-white/80 font-semibold">{buyerEmail}</span>
              </div>
              <div className="flex justify-between text-xs pb-2 border-b border-white/5">
                <span className="text-white/40">Mobile Number:</span>
                <span className="text-white/80 font-semibold">{buyerMobile}</span>
              </div>
              <div className="flex flex-col text-xs space-y-1 pb-2 border-b border-white/5">
                <span className="text-white/40">Shipping Address:</span>
                <span className="text-white/85 bg-black/20 p-3 rounded-xl border border-white/5 font-semibold whitespace-pre-wrap leading-relaxed">{buyerAddress}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Estimated Delivery:</span>
                <span className="text-amber-300 font-semibold">5 - 7 Business Days</span>
              </div>
            </div>

            <p className="text-xs mb-8" style={{ color: "rgba(232,196,90,0.4)" }}>
              A confirmation email was sent to {buyerEmail}. We are beginning processing and custom illustration printing right away!
            </p>

            <Link href="/">
              <motion.button type="button" whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
                className="px-10 py-4 rounded-full font-bold text-lg cursor-pointer"
                style={{ 
                  background:"linear-gradient(135deg,rgba(43,170,143,0.9),rgba(43,170,143,0.6))", 
                  border:"1px solid rgba(43,170,143,0.3)", 
                  color:"hsl(204,46%,9%)" 
                }}>
                Back to Home
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-44" style={{ background:"hsl(204,46%,9%)" }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background:"rgba(12,28,38,0.82)", backdropFilter:"blur(28px) saturate(180%)", WebkitBackdropFilter:"blur(28px) saturate(180%)", borderBottom:"1px solid rgba(43,170,143,0.15)", boxShadow:"0 4px 24px rgba(0,0,0,0.4)" }}>
        <Link href="/upload">
          <motion.button type="button" whileHover={{ scale:1.05, x:-2 }} whileTap={{ scale:0.95 }}
            className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color:"rgba(43,170,143,0.8)" }}>
            ← Back to Photos
          </motion.button>
        </Link>
        <span className="text-xl font-bold tracking-tighter" style={{ color:"hsl(43,80%,92%)" }}>Match Stickers 💖</span>
        <div className="w-20"></div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-12 pb-6">
        
        {/* Stepper Progress Bar */}
        {renderStepperHeader()}

        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} 
          className="p-8 md:p-10 rounded-3xl border shadow-2xl backdrop-blur-xl"
          style={{ background:"rgba(16,36,50,0.6)", borderColor:"rgba(232,196,90,0.3)" }}>
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: DETAILS */}
            {step === "details" && (
              <motion.div
                key="details-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-black mb-2 text-center"
                  style={{ color:"hsl(43,80%,92%)", textShadow:"0 0 60px rgba(232,196,90,0.35)" }}>
                  Billing & Shipping Details
                </h1>
                <p className="text-xs mb-8 text-center" style={{ color:"rgba(232,196,90,0.5)" }}>
                  Provide your delivery coordinates so we can ship your gorgeous sticker sheet!
                </p>

                <form onSubmit={handleNextToReview} className="space-y-5">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color:"rgba(43,170,143,0.8)" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-black/40 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors border"
                      style={{ 
                        borderColor: isNameValid ? "rgba(43,170,143,0.4)" : "rgba(43,170,143,0.18)",
                        color: "white" 
                      }}
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color:"rgba(43,170,143,0.8)" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full bg-black/40 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors border"
                      style={{ 
                        borderColor: isEmailValid ? "rgba(43,170,143,0.4)" : buyerEmail ? "rgba(239,68,68,0.4)" : "rgba(43,170,143,0.18)",
                        color: "white" 
                      }}
                      placeholder="e.g. john@example.com"
                    />
                    {buyerEmail && !isEmailValid && (
                      <span className="text-[10px] text-red-400 font-semibold mt-1.5 block">Please enter a valid email address.</span>
                    )}
                  </div>

                  {/* Mobile Input */}
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color:"rgba(43,170,143,0.8)" }}>
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={buyerMobile}
                      onChange={(e) => {
                        // Allow digits only
                        const val = e.target.value.replace(/\D/g, "");
                        setBuyerMobile(val);
                      }}
                      className="w-full bg-black/40 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors border"
                      style={{ 
                        borderColor: isMobileValid ? "rgba(43,170,143,0.4)" : buyerMobile ? "rgba(239,68,68,0.4)" : "rgba(43,170,143,0.18)",
                        color: "white" 
                      }}
                      placeholder="10-digit mobile number (e.g., 9876543210)"
                    />
                    {buyerMobile && !isMobileValid && (
                      <span className="text-[10px] text-red-400 font-semibold mt-1.5 block">Mobile number must be exactly 10 numeric digits.</span>
                    )}
                  </div>

                  {/* Shipping Address Input */}
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color:"rgba(43,170,143,0.8)" }}>
                      Complete Shipping Address
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full bg-black/40 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors border resize-none leading-relaxed"
                      style={{ 
                        borderColor: isAddressValid ? "rgba(43,170,143,0.4)" : "rgba(43,170,143,0.18)",
                        color: "white" 
                      }}
                      placeholder="House No, Street name, City, State, ZIP Code"
                    />
                  </div>

                  {/* Continue Button */}
                  <motion.button
                    type="submit"
                    disabled={!isDetailsValid}
                    whileHover={isDetailsValid ? { scale: 1.02 } : {}}
                    whileTap={isDetailsValid ? { scale: 0.98 } : {}}
                    className="w-full py-4 rounded-full font-bold text-base transition-all duration-300 mt-6 flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      background: isDetailsValid 
                        ? "linear-gradient(135deg,rgba(43,170,143,0.9),rgba(232,196,90,0.85))"
                        : "rgba(43,170,143,0.08)",
                      border: isDetailsValid ? "1px solid rgba(232,196,90,0.4)" : "1px solid rgba(255,255,255,0.05)",
                      color: isDetailsValid ? "hsl(204,46%,9%)" : "rgba(255,255,255,0.25)",
                      boxShadow: isDetailsValid ? "0 0 28px rgba(43,170,143,0.25)" : "none"
                    }}
                  >
                    Proceed to Review →
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: REVIEW */}
            {step === "review" && (
              <motion.div
                key="review-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-black mb-2"
                    style={{ color:"hsl(43,80%,92%)", textShadow:"0 0 60px rgba(232,196,90,0.35)" }}>
                    Recheck Your Order
                  </h1>
                  <p className="text-xs" style={{ color:"rgba(232,196,90,0.5)" }}>
                    Review all shipping coordinates and selected stickers before paying.
                  </p>
                </div>

                {/* 1. Buyer details review */}
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Shipping & Buyer Details</h3>
                    <button 
                      type="button" 
                      onClick={() => setStep("details")}
                      className="text-[10px] font-bold text-amber-300 hover:underline cursor-pointer"
                    >
                      ✏️ Edit Details
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-white/45 block">Name</span>
                      <span className="font-semibold text-white/90">{buyerName}</span>
                    </div>
                    <div>
                      <span className="text-white/45 block">Email</span>
                      <span className="font-semibold text-white/90">{buyerEmail}</span>
                    </div>
                    <div>
                      <span className="text-white/45 block">Mobile Number</span>
                      <span className="font-semibold text-white/90">{buyerMobile}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-white/45 block mb-1">Shipping Address</span>
                      <div className="bg-black/25 p-2.5 rounded-lg border border-white/5 font-semibold text-white/80 whitespace-pre-wrap leading-relaxed">
                        {buyerAddress}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Selected Stickers display */}
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">Selected Stickers ({selectedStickerIds.length})</h3>
                    <Link href="/create">
                      <span className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer">🎨 Adjust Cart</span>
                    </Link>
                  </div>

                  {selectedStickersData.length === 0 ? (
                    <p className="text-xs text-white/40 text-center py-4">No stickers in your selection sheet.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {selectedStickersData.map((sticker, k) => (
                        <div key={k} className="flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/5">
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 flex-shrink-0">
                            {sticker.image 
                              ? <img src={sticker.image} alt={sticker.name} className="w-full h-full object-cover" />
                              : <span className="text-lg">{sticker.emoji}</span>
                            }
                          </div>
                          <span className="text-[11px] font-semibold text-white/80 truncate">{sticker.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Coupon Code Input */}
                <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3" style={{ background: "rgba(16,36,50,0.5)" }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">Apply Promo Coupon</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. LOVE20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon}
                      className="flex-1 bg-black/40 rounded-xl px-4 py-2.5 text-xs outline-none transition-colors border"
                      style={{
                        borderColor: appliedCoupon ? "rgba(16,185,129,0.3)" : "rgba(43,170,143,0.18)",
                        color: "white"
                      }}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-teal-950 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        style={{
                          background: "linear-gradient(135deg,rgba(43,170,143,0.95),rgba(232,196,90,0.9))",
                          boxShadow: "0 2px 10px rgba(43,170,143,0.2)"
                        }}
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-[10px] text-red-400 font-bold block mt-1">❌ {couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-[10px] text-emerald-400 font-bold block mt-1">🎉 {couponSuccess}</p>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="space-y-2.5 border-t border-white/5 pt-4">
                  <div className="flex justify-between text-xs">
                    <span style={{ color:"rgba(232,196,90,0.55)" }}>Selected Stickers Count</span>
                    <span className="font-semibold text-white/90">{selectedStickersData.length} Stickers</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color:"rgba(232,196,90,0.55)" }}>Rate per Sticker</span>
                    <span className="font-semibold text-white/90">₹{stickerPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color:"rgba(232,196,90,0.55)" }}>Base Amount</span>
                    <span className="font-semibold text-white/90">₹{baseAmount}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color:"rgba(43,170,143,0.85)" }}>Coupon ({appliedCoupon.code} - {appliedCoupon.discountPct}%)</span>
                      <span className="font-semibold text-emerald-400">-₹{discountFromCoupon}</span>
                    </div>
                  )}
                  {billDiscount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color:"rgba(43,170,143,0.85)" }}>Coupon Discount</span>
                      <span className="font-semibold text-emerald-400">-₹{billDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span style={{ color:"rgba(232,196,90,0.55)" }}>Custom Photo Caricature Design Fee</span>
                    <span className="font-semibold text-emerald-400">FREE</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color:"rgba(232,196,90,0.55)" }}>Shipping & Handling</span>
                    <span className="font-semibold text-emerald-400">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-black pt-2 border-t border-white/5" style={{ color: "hsl(43,80%,90%)" }}>
                    <span>Total Amount</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>

                {/* Continue to Payment button */}
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setStep("details")}
                    className="flex-1 py-3.5 rounded-full font-bold text-sm bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("payment")}
                    className="flex-[2] py-3.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_24px_rgba(43,170,143,0.2)]"
                    style={{
                      background: "linear-gradient(135deg,rgba(43,170,143,0.9),rgba(232,196,90,0.85))",
                      border: "1px solid rgba(232,196,90,0.4)",
                      color: "hsl(204,46%,9%)"
                    }}
                  >
                    Continue to Payment →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === "payment" && (
              <motion.div
                key="payment-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl md:text-3xl font-black mb-2 text-center"
                  style={{ color:"hsl(43,80%,92%)", textShadow:"0 0 60px rgba(232,196,90,0.35)" }}>
                  Pay via UPI
                </h1>
                <p className="text-xs mb-6 text-center" style={{ color:"rgba(232,196,90,0.5)" }}>
                  Scan the dynamic secure QR code or enter your virtual payment address to pay.
                </p>

                <form onSubmit={handlePay} className="space-y-6">
                  
                  {/* Modern Animated QR Code Showcase */}
                  <div className="flex justify-center my-6">
                    <div className="relative p-6 rounded-3xl border backdrop-blur-md shadow-2xl flex flex-col items-center justify-center max-w-[240px]"
                      style={{ 
                        background: "rgba(10,24,34,0.7)", 
                        borderColor: "rgba(43,170,143,0.3)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
                      }}
                    >
                      <div className="text-[10px] font-black text-white/50 tracking-widest uppercase mb-3">UPI QR CODE</div>
                      
                      <div className="relative w-36 h-36 bg-white p-3 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-emerald-400/20">
                        {/* Interactive Scan Line moving vertically */}
                        <motion.div 
                          className="absolute left-0 right-0 h-[2px] bg-emerald-500 shadow-[0_0_8px_#10b981] z-10"
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                        />

                        {/* Static QR Code Image */}
                        <img src={paymentQr} alt="UPI Payment QR Code" className="w-full h-full object-contain" />
                      </div>

                      <div className="mt-3.5 flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400">Total: ₹{totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Upload Receipt Section */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wide" style={{ color: "rgba(43,170,143,0.8)" }}>
                      Upload Payment Receipt *
                    </label>

                    {receiptPhoto ? (
                      <div className="relative p-4 rounded-2xl border bg-black/30 flex items-center justify-between gap-4"
                        style={{ borderColor: "rgba(43,170,143,0.4)" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                            <img src={receiptPhoto} alt="Payment Receipt" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-emerald-400 block">Receipt Uploaded ✅</span>
                            <span className="text-[10px] text-white/40 block">Ready to confirm order</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReceiptPhoto(null)}
                          className="px-3.5 py-1.5 rounded-full text-[10px] font-extrabold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div
                        className="relative p-6 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:bg-white/5"
                        style={{
                          background: "rgba(16,36,50,0.3)",
                          borderColor: "rgba(232,196,90,0.25)"
                        }}
                        onClick={() => document.getElementById("receipt-upload")?.click()}
                      >
                        <input
                          type="file"
                          id="receipt-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setReceiptUploading(true);
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              try {
                                const compressed = await compressImage(reader.result as string, 600, 600);
                                setReceiptPhoto(compressed);
                              } catch {
                                setReceiptPhoto(reader.result as string);
                              } finally {
                                setReceiptUploading(false);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        {receiptUploading ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="w-6 h-6 rounded-full border-2 border-t-transparent border-amber-400" />
                            <span className="text-[11px] font-bold text-amber-400">Processing image...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl">📸</span>
                            <span className="text-xs font-bold text-white/70">Click to upload payment screenshot / receipt</span>
                            <span className="text-[9px] text-white/35">Supports JPG, PNG (Max 5MB)</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    {!receiptPhoto && !receiptUploading && (
                      <span className="text-[10px] text-amber-300/80 font-bold block mt-1.5 animate-pulse">
                        ⚠️ Payment Receipt is required to unlock "Confirm & Pay Now".
                      </span>
                    )}
                  </div>


                  {/* Error Notification */}
                  {status === "error" && (
                    <p className="text-xs text-red-400 font-semibold mt-2">{errorMsg}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setStep("review")}
                      disabled={status === "processing"}
                      className="flex-1 py-3.5 rounded-full font-bold text-sm bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      ← Back
                    </button>
                    
                    <motion.button
                      type="submit"
                      disabled={status === "processing" || !isUpiValid}
                      whileHover={status !== "processing" && isUpiValid ? { scale: 1.02 } : {}} 
                      whileTap={status !== "processing" && isUpiValid ? { scale: 0.98 } : {}} 
                      className="flex-[2] py-4 rounded-full font-bold text-base transition-all duration-300 shadow-[0_0_32px_rgba(43,170,143,0.35)] flex items-center justify-center gap-3 cursor-pointer"
                      style={{ 
                        background: status === "processing" ? "rgba(43,170,143,0.3)" : "linear-gradient(135deg,rgba(43,170,143,0.9),rgba(232,196,90,0.85))", 
                        border:"1px solid rgba(232,196,90,0.4)", 
                        color: status === "processing" ? "rgba(255,255,255,0.4)" : "hsl(204,46%,9%)"
                      }}
                    >
                      {status === "processing" ? (
                        <>
                          <motion.div animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:"linear" }}
                            className="w-5 h-5 rounded-full border-2 border-t-transparent border-white" />
                          Processing UPI Payment...
                        </>
                      ) : "Confirm & Pay Now"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
