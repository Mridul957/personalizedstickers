import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const compressImage = (base64Str: string, maxW = 500, maxH = 500): Promise<string> => {
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

const initialReviews = [
  {
    name: "Sarah & Mark",
    handle: "@sarahandmark",
    text: "I got these for our anniversary and cried when I saw them. They look exactly like us, down to my favorite jacket.",
    glowColor: "rgba(43,170,143,0.25)",
    borderColor: "rgba(43,170,143,0.2)",
    emoji: "🥺",
    rating: 5,
    photos: []
  },
  {
    name: "Jessica P.",
    handle: "@jessicap",
    text: "Put one on my laptop and my boyfriend put one on his water bottle. The quality is incredible.",
    glowColor: "rgba(232,196,90,0.22)",
    borderColor: "rgba(232,196,90,0.18)",
    emoji: "💛",
    rating: 5,
    photos: []
  },
  {
    name: "David T.",
    handle: "@davidt",
    text: "Such a unique gift. The packaging felt super premium, like something you'd get from a luxury brand.",
    glowColor: "rgba(240,147,106,0.22)",
    borderColor: "rgba(240,147,106,0.18)",
    emoji: "🔥",
    rating: 5,
    photos: []
  },
  {
    name: "Liam & Sophia",
    handle: "@liamandsophia",
    text: "Absolutely adorable! We put them on our phone cases. Everyone asks where we got them!",
    glowColor: "rgba(232,87,58,0.25)",
    borderColor: "rgba(232,87,58,0.2)",
    emoji: "🥰",
    rating: 5,
    photos: []
  },
  {
    name: "Emma & Noah",
    handle: "@emmanoah",
    text: "The custom details are perfect. She even got my messy hair exactly right! Best anniversary gift ever.",
    glowColor: "rgba(43,170,143,0.25)",
    borderColor: "rgba(43,170,143,0.2)",
    emoji: "🎨",
    rating: 5,
    photos: []
  },
  {
    name: "Olivia & James",
    handle: "@olivia_james",
    text: "Super high quality vinyl! Waterproof and scratch-resistant. Ours have been on our travel mugs for months and still look brand new.",
    glowColor: "rgba(232,196,90,0.22)",
    borderColor: "rgba(232,196,90,0.18)",
    emoji: "✨",
    rating: 5,
    photos: []
  },
  {
    name: "Isabella & Lucas",
    handle: "@isa_lucas",
    text: "Customer service was incredibly sweet and helpful. The packaging was beautiful too. 10/10 experience!",
    glowColor: "rgba(240,147,106,0.22)",
    borderColor: "rgba(240,147,106,0.18)",
    emoji: "🎁",
    rating: 5,
    photos: []
  },
  {
    name: "Mia & Ethan",
    handle: "@mia_ethan",
    text: "I surprised him with these for Valentine's Day. He's not usually a softie, but he absolutely loved it!",
    glowColor: "rgba(232,87,58,0.25)",
    borderColor: "rgba(232,87,58,0.2)",
    emoji: "💖",
    rating: 5,
    photos: []
  },
  {
    name: "Charlotte & Alex",
    handle: "@char_alex",
    text: "Stickers are thick and the print resolution is superb. Definitely ordering another batch for our friends.",
    glowColor: "rgba(43,170,143,0.25)",
    borderColor: "rgba(43,170,143,0.2)",
    emoji: "🌟",
    rating: 5,
    photos: []
  },
  {
    name: "Amelia & Leo",
    handle: "@amelia_leo",
    text: "Stuck one on my Kindle and another on my laptop. It makes me smile every time I look at it. Highly recommend!",
    glowColor: "rgba(232,196,90,0.22)",
    borderColor: "rgba(232,196,90,0.18)",
    emoji: "📖",
    rating: 5,
    photos: []
  },
  {
    name: "Harper & Benjamin",
    handle: "@harper_ben",
    text: "The design phase was so fast, and they got the adjustments I asked for perfectly. Wonderful artist!",
    glowColor: "rgba(240,147,106,0.22)",
    borderColor: "rgba(240,147,106,0.18)",
    emoji: "⚡",
    rating: 5,
    photos: []
  },
  {
    name: "Evelyn & Mason",
    handle: "@evelyn_mason",
    text: "Such a sweet, simple way to carry a piece of us wherever we go. The sticky backing is solid.",
    glowColor: "rgba(232,87,58,0.25)",
    borderColor: "rgba(232,87,58,0.2)",
    emoji: "🚲",
    rating: 5,
    photos: []
  },
  {
    name: "Abigail & Daniel",
    handle: "@abigail_dan",
    text: "These stickers brought so much joy. The caricature is incredibly cute and captures our vibe perfectly.",
    glowColor: "rgba(43,170,143,0.25)",
    borderColor: "rgba(43,170,143,0.2)",
    emoji: "🥳",
    rating: 5,
    photos: []
  }
];

export function Reviews() {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", text: "", rating: 5, photos: [] as string[] });

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        const mapped = data.map((r: any) => ({
          ...r,
          photos: typeof r.photos === "string" ? JSON.parse(r.photos) : (r.photos || [])
        }));
        if (mapped.length > 0) {
          setReviews(mapped);
        }
      })
      .catch((err) => console.error("Error loading reviews, falling back to defaults:", err));
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    if (newReview.photos.length + files.length > 2) {
      alert("You can only upload up to 2 photos.");
      return;
    }

    const readers = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const compressed = await compressImage(reader.result as string, 500, 500);
            resolve(compressed);
          } catch {
            resolve(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(images => {
      setNewReview(prev => ({
        ...prev,
        photos: [...prev.photos, ...images].slice(0, 2)
      }));
    });
  };

  const removePhoto = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;
    
    const payload = {
      name: newReview.name,
      rating: newReview.rating,
      text: newReview.text,
      photos: newReview.photos
    };

    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to submit review");
        return res.json();
      })
      .then((savedReview) => {
        const parsedReview = {
          ...savedReview,
          photos: typeof savedReview.photos === "string" ? JSON.parse(savedReview.photos) : (savedReview.photos || [])
        };
        
        // Prepend new review locally so the submitter sees it instantly
        setReviews(prev => [parsedReview, ...prev]);
        alert("Thank you! Your review has been submitted successfully and will be visible once approved by our moderator.");
      })
      .catch((err) => {
        console.error("Failed to post review to server, updating locally:", err);
        // Resilient fallback: update locally so UX is perfect even if backend is starting
        setReviews(prev => [
          {
            name: newReview.name,
            handle: "@customer",
            text: newReview.text,
            glowColor: "rgba(232,87,58,0.25)",
            borderColor: "rgba(232,87,58,0.2)",
            emoji: "✨",
            rating: newReview.rating,
            photos: newReview.photos
          },
          ...prev
        ]);
      });

    setShowForm(false);
    setNewReview({ name: "", text: "", rating: 5, photos: [] });
  };

  return (
    <section id="reviews" className="py-28 relative">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-bold tracking-[0.2em] uppercase mb-3"
            style={{ color: "rgba(232,87,58,0.7)" }}
          >
            Don't take our word for it
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold"
            style={{ color: "hsl(43,80%,92%)", textShadow: "0 0 60px rgba(232,87,58,0.25)" }}
          >
            Loved by 10,000+ Couples 💕
          </motion.h2>
        </div>

        {/* Infinite edge-to-edge auto-scrolling marquee */}
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-10 mb-16">
          {/* Subtle edge fades for smooth blending */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[hsl(204,46%,9%)] to-transparent z-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[hsl(204,46%,9%)] to-transparent z-20" />

          <div className="animate-marquee-left-to-right flex gap-6 hover:[animation-play-state:paused] cursor-pointer py-4">
            {[...reviews, ...reviews].map((review, i) => {
              const glowColor = review.glowColor || "rgba(232,196,90,0.22)";
              const borderColor = review.borderColor || "rgba(232,196,90,0.18)";
              const glowColorSoft = glowColor.replace("0.25", "0.08").replace("0.22", "0.08");
              const glowColorLine = glowColor.replace("0.25", "0.45").replace("0.22", "0.45");

              return (
                <div
                  key={i}
                  className="w-[360px] shrink-0 relative p-8 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1"
                  style={{
                    background: "rgba(18,40,55,0.65)",
                    backdropFilter: "blur(24px) saturate(180%)",
                    WebkitBackdropFilter: "blur(24px) saturate(180%)",
                    border: `1px solid ${borderColor}`,
                    boxShadow: `0 4px 32px rgba(0,0,0,0.4), 0 0 40px ${glowColorSoft}, inset 0 1px 0 rgba(232,196,90,0.12)`,
                  }}
                >
                  <div
                    className="absolute top-0 left-[10%] right-[10%] h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${glowColorLine}, transparent)` }}
                  />
                  <div className="absolute top-5 right-5 text-xl">{review.emoji || "✨"}</div>

                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={j < (review.rating || 5) ? "currentColor" : "none"} stroke="currentColor" className="w-4 h-4" style={{ color: "rgba(232,196,90,0.9)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                      </svg>
                    ))}
                  </div>
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.photos.map((photo: string, k: number) => (
                        <div key={k} className="relative w-16 h-16 rounded-lg overflow-hidden border" style={{ borderColor: "rgba(232,196,90,0.15)" }}>
                          <img src={photo} alt="Customer photo" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-base font-medium mb-5 leading-snug min-h-[72px]" style={{ color: "hsl(43,80%,88%)" }}>"{review.text}"</p>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "hsl(43,80%,80%)" }}>{review.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(232,196,90,0.35)" }}>{review.handle || "@customer"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-12">
          {!showForm ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-4 rounded-full font-bold text-lg transition-all"
                style={{
                  background: "linear-gradient(90deg, rgba(232,87,58,0.9), rgba(240,147,106,0.9))",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(232,87,58,0.4)"
                }}
              >
                Leave Your Feedback
              </button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="p-8 rounded-3xl relative overflow-hidden"
              style={{
                background: "rgba(18,40,55,0.8)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(232,196,90,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
              }}
            >
              <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: "hsl(43,80%,92%)" }}>Share Your Experience</h3>
              
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2" style={{ color: "hsl(43,80%,80%)" }}>Your Name</label>
                <input
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full bg-transparent border rounded-xl px-4 py-3 outline-none transition-all focus:border-amber-400"
                  style={{ borderColor: "rgba(232,196,90,0.3)", color: "#fff" }}
                  placeholder="John & Jane"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2" style={{ color: "hsl(43,80%,80%)" }}>Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={star <= newReview.rating ? "currentColor" : "none"} stroke="currentColor" className="w-8 h-8" style={{ color: "rgba(232,196,90,0.9)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-2" style={{ color: "hsl(43,80%,80%)" }}>Photos (Max 2)</label>
                <div className="flex gap-4 mb-2">
                  {newReview.photos.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border" style={{ borderColor: "rgba(232,196,90,0.3)" }}>
                      <img src={photo} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-black/60 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs hover:bg-red-500/80 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {newReview.photos.length < 2 && (
                    <label className="w-20 h-20 rounded-xl border border-dashed flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors" style={{ borderColor: "rgba(232,196,90,0.3)" }}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{ color: "rgba(232,196,90,0.6)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </label>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold mb-2" style={{ color: "hsl(43,80%,80%)" }}>Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  className="w-full bg-transparent border rounded-xl px-4 py-3 outline-none transition-all resize-none focus:border-amber-400"
                  style={{ borderColor: "rgba(232,196,90,0.3)", color: "#fff" }}
                  placeholder="Tell us what you think..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl font-bold transition-all border hover:bg-white/5"
                  style={{ borderColor: "rgba(232,196,90,0.3)", color: "hsl(43,80%,80%)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold transition-all hover:brightness-110"
                  style={{
                    background: "linear-gradient(90deg, rgba(43,170,143,0.9), rgba(43,170,143,0.7))",
                    color: "#fff",
                    boxShadow: "0 4px 20px rgba(43,170,143,0.3)"
                  }}
                >
                  Submit Review
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}
