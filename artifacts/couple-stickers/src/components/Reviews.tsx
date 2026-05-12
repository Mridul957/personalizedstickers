import { motion } from "framer-motion";

const reviews = [
  {
    name: "Sarah & Mark",
    text: "I got these for our anniversary and cried when I saw them. They look exactly like us, down to my favorite jacket.",
  },
  {
    name: "Jessica P.",
    text: "Put one on my laptop and my boyfriend put one on his water bottle. The quality is incredible.",
  },
  {
    name: "David T.",
    text: "Such a unique gift. The packaging felt super premium, like something you'd get from a luxury brand.",
  }
];

export function Reviews() {
  return (
    <section id="reviews" className="py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          Loved by 10,000+ Couples
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-secondary/20 border border-secondary/30"
            >
              <div className="flex gap-1 mb-4 text-accent">
                {/* Star SVGs */}
                {[...Array(5)].map((_, j) => (
                  <svg key={j} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                  </svg>
                ))}
              </div>
              <p className="text-lg font-medium mb-4 leading-snug">"{review.text}"</p>
              <p className="text-muted-foreground">— {review.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
