import { motion } from "framer-motion";
import gallery1 from "@/assets/gallery-1.png";
import gallery2 from "@/assets/gallery-2.png";

const glows = [
  { color: "rgba(43,170,143,0.35)", border: "rgba(43,170,143,0.22)" },
  { color: "rgba(240,147,106,0.3)", border: "rgba(240,147,106,0.2)" },
];

export function Gallery() {
  return (
    <section id="gallery" className="py-28">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "rgba(240,147,106,0.7)" }}
            >
              Real couples, real joy
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ color: "hsl(43,80%,92%)", textShadow: "0 0 60px rgba(240,147,106,0.25)" }}
            >
              Real Love,<br className="hidden md:block" /> Real Stickers. 💝
            </motion.h2>
            <p className="text-lg max-w-md" style={{ color: "rgba(232,196,90,0.5)" }}>
              See how others are capturing their favorite moments in sticker form.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full text-sm px-7 h-10 font-bold cursor-pointer shrink-0"
            style={{
              background: "rgba(43,170,143,0.15)",
              border: "1px solid rgba(43,170,143,0.35)",
              color: "rgba(43,170,143,0.9)",
              boxShadow: "0 4px 16px rgba(43,170,143,0.15)",
            }}
          >
            View All →
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[gallery1, gallery2].map((img, i) => (
            <motion.div
              key={i}
              initial={{ y: i === 0 ? 20 : 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.3 } }}
              className="group relative rounded-[2rem] overflow-hidden"
              style={{
                height: 500,
                background: "rgba(18,40,55,0.6)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${glows[i].border}`,
                boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 50px ${glows[i].color.replace("0.35", "0.12")}, inset 0 1px 0 rgba(232,196,90,0.12)`,
              }}
            >
              <img
                src={img}
                alt="Couple sticker lifestyle"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(12,28,38,0.6) 0%, transparent 60%)" }}
              />
              {/* Specular top */}
              <div
                className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent, ${glows[i].color.replace("0.35", "0.5")}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
