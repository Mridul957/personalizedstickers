import { motion } from "framer-motion";

const reviews = [
  {
    name: "Sarah & Mark",
    handle: "@sarahandmark",
    text: "I got these for our anniversary and cried when I saw them. They look exactly like us, down to my favorite jacket.",
    glowColor: "rgba(43,170,143,0.25)",
    borderColor: "rgba(43,170,143,0.2)",
    emoji: "🥺",
  },
  {
    name: "Jessica P.",
    handle: "@jessicap",
    text: "Put one on my laptop and my boyfriend put one on his water bottle. The quality is incredible.",
    glowColor: "rgba(232,196,90,0.22)",
    borderColor: "rgba(232,196,90,0.18)",
    emoji: "💛",
  },
  {
    name: "David T.",
    handle: "@davidt",
    text: "Such a unique gift. The packaging felt super premium, like something you'd get from a luxury brand.",
    glowColor: "rgba(240,147,106,0.22)",
    borderColor: "rgba(240,147,106,0.18)",
    emoji: "🔥",
  },
];

export function Reviews() {
  return (
    <section id="reviews" className="py-28">
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

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ y: 28, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="relative p-8 rounded-3xl overflow-hidden"
              style={{
                background: "rgba(18,40,55,0.65)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: `1px solid ${review.borderColor}`,
                boxShadow: `0 4px 32px rgba(0,0,0,0.4), 0 0 40px ${review.glowColor.replace("0.25", "0.08")}, inset 0 1px 0 rgba(232,196,90,0.12)`,
              }}
            >
              <div
                className="absolute top-0 left-[10%] right-[10%] h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${review.glowColor.replace("0.25", "0.45")}, transparent)` }}
              />
              <div className="absolute top-5 right-5 text-xl">{review.emoji}</div>

              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: "rgba(232,196,90,0.9)" }}>
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
              <p className="text-base font-medium mb-5 leading-snug" style={{ color: "hsl(43,80%,88%)" }}>"{review.text}"</p>
              <div>
                <p className="text-sm font-bold" style={{ color: "hsl(43,80%,80%)" }}>{review.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(232,196,90,0.35)" }}>{review.handle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
