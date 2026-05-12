import { motion } from "framer-motion";
import gallery1 from "@/assets/gallery-1.png";
import gallery2 from "@/assets/gallery-2.png";

export function Gallery() {
  return (
    <section id="gallery" className="py-28">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ textShadow: "0 0 60px rgba(236,72,153,0.3)" }}
            >
              Real Love,<br className="hidden md:block" /> Real Stickers.
            </motion.h2>
            <p className="text-lg text-white/50 max-w-md">
              See how others are capturing their favorite moments in sticker form.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[gallery1, gallery2].map((img, i) => (
            <motion.div
              key={i}
              initial={{ y: i === 0 ? 20 : 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ scale: 1.015, transition: { duration: 0.3 } }}
              className="group relative rounded-[2rem] overflow-hidden"
              style={{
                height: 520,
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <img
                src={img}
                alt="Couple sticker lifestyle"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
              />
              {/* Glass overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)",
                }}
              />
              {/* Specular top edge */}
              <div
                className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
