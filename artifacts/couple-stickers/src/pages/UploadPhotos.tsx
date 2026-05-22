import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";

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

export default function UploadPhotos() {
  const [, setLocation] = useLocation();
  const [photos, setPhotos] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("ours_uploaded_photos");
      if (raw) return JSON.parse(raw);
    } catch { }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("ours_uploaded_photos", JSON.stringify(photos));
  }, [photos]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const readers = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const compressed = await compressImage(reader.result as string, 600, 600);
            resolve(compressed);
          } catch {
            resolve(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(images => {
      setPhotos(prev => [...prev, ...images]);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const hasEnoughPhotos = photos.length >= 3;

  return (
    <div className="min-h-screen pb-44" style={{ background: "hsl(204,46%,9%)" }}>
      {/* Sticky nav */}
      <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(12,28,38,0.82)", backdropFilter: "blur(28px) saturate(180%)", WebkitBackdropFilter: "blur(28px) saturate(180%)", borderBottom: "1px solid rgba(43,170,143,0.15)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
        <Link href="/create">
          <motion.button type="button" whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: "rgba(43,170,143,0.8)" }}>
            ← Back to Selection
          </motion.button>
        </Link>
        <span className="text-xl font-bold tracking-tighter" style={{ color: "hsl(43,80%,92%)" }}>Ours. 💖</span>
        <div className="w-20"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10 pb-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight"
            style={{ color: "hsl(43,80%,92%)", textShadow: "0 0 80px rgba(43,170,143,0.35)", letterSpacing: "-0.02em" }}>
            Bring Them <span style={{ background: "linear-gradient(135deg, rgba(232,196,90,0.95), rgba(240,147,106,0.9), rgba(232,87,58,0.85))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>To Life ✨</span>
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-2" style={{ color: "rgba(232,196,90,0.5)" }}>
            Upload the photos you want to turn into beautiful stickers.
          </p>
          <p className="text-sm font-medium" style={{ color: hasEnoughPhotos ? "rgba(43,170,143,0.8)" : "rgba(232,87,58,0.8)" }}>
            Minimum 3 photos required
          </p>
        </motion.div>

        <div className="bg-black/20 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <AnimatePresence>
              {photos.map((photo, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square rounded-2xl overflow-hidden border-2" style={{ borderColor: "rgba(43,170,143,0.4)" }}>
                  <img src={photo} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors backdrop-blur-md">
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <label className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group"
              style={{ borderColor: "rgba(43,170,143,0.3)" }}>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ color: "rgba(43,170,143,0.8)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-sm font-medium" style={{ color: "rgba(43,170,143,0.6)" }}>Add Photos</span>
            </label>
          </div>

          <div className="text-center pt-8 border-t border-white/5">
            <motion.button type="button"
              onClick={() => hasEnoughPhotos && setLocation("/payment")}
              whileHover={hasEnoughPhotos ? { scale: 1.05 } : {}}
              whileTap={hasEnoughPhotos ? { scale: 0.97 } : {}}
              disabled={!hasEnoughPhotos}
              className={`px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 ${!hasEnoughPhotos ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              style={hasEnoughPhotos ? {
                background: "linear-gradient(135deg,rgba(43,170,143,0.9),rgba(232,196,90,0.85))",
                border: "1px solid rgba(232,196,90,0.4)",
                boxShadow: "0 0 32px rgba(43,170,143,0.35),inset 0 1px 0 rgba(255,255,255,0.2)",
                color: "hsl(204,46%,9%)"
              } : {
                background: "rgba(43,170,143,0.1)",
                border: "1px solid rgba(43,170,143,0.18)",
                color: "rgba(43,170,143,0.35)"
              }}>
              {hasEnoughPhotos ? "Proceed to Checkout →" : `${Math.max(0, 3 - photos.length)} more photo${3 - photos.length !== 1 ? 's' : ''} needed`}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
