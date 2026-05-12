import { motion } from "framer-motion";

const reviews = [
  {
    name: "Sarah & Mark",
    text: "I got these for our anniversary and cried when I saw them. They look exactly like us, down to my favorite jacket.",
    color: "rgba(147,51,234,0.25)",
  },
  {
    name: "Jessica P.",
    text: "Put one on my laptop and my boyfriend put one on his water bottle. The quality is incredible.",
    color: "rgba(236,72,153,0.25)",
  },
  {
    name: "David T.",
    text: "Such a unique gift. The packaging felt super premium, like something you'd get from a luxury brand.",
    color: "rgba(163,230,53,0.18)",
  },
];

export function Reviews() {
  return (
    <section id="reviews" className="py-28">
      <div className="container max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-center text-white mb-16"
          style={{ textShadow: "0 0 60px rgba(147,51,234,0.3)" }}
        >
          Loved by 10,000+ Couples
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="relative p-8 rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              {/* Specular top */}
              <div
                className="absolute top-0 left-[10%] right-[10%] h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
              />
              {/* Color glow */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full -z-10"
                style={{ background: `radial-gradient(circle, ${review.color} 0%, transparent 70%)` }}
              />

              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
              <p className="text-base font-medium mb-5 leading-snug text-white/85">"{review.text}"</p>
              <p className="text-white/40 text-sm">— {review.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
