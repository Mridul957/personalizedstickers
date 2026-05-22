import { motion } from "framer-motion";
import { LayoutGrid, Upload, Package } from "lucide-react";

const steps = [
  {
    icon: LayoutGrid,
    emoji: "🎨",
    title: "Choose Your Style",
    description: "Browse our sticker poses and pick the perfect style that matches your vibe as a couple.",
    glowColor: "rgba(43,170,143,0.5)",
    borderColor: "rgba(43,170,143,0.3)",
    badgeColor: "rgba(43,170,143,0.15)",
    step: "01",
  },
  {
    icon: Upload,
    emoji: "📸",
    title: "Upload Your Photo",
    description: "Share a favorite photo of you and your partner. Clear, well-lit shots work best!",
    glowColor: "rgba(232,196,90,0.5)",
    borderColor: "rgba(232,196,90,0.3)",
    badgeColor: "rgba(232,196,90,0.12)",
    step: "02",
  },
  {
    icon: Package,
    emoji: "📦",
    title: "We Print & Ship",
    description: "Receive your premium die-cut sticker sheet in aesthetic packaging in 3–5 days.",
    glowColor: "rgba(240,147,106,0.5)",
    borderColor: "rgba(240,147,106,0.3)",
    badgeColor: "rgba(240,147,106,0.12)",
    step: "03",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold tracking-[0.2em] uppercase mb-3"
            style={{ color: "rgba(43,170,143,0.7)" }}
          >
            Super simple
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{
              color: "hsl(43,80%,92%)",
              textShadow: "0 0 60px rgba(43,170,143,0.3)",
            }}
          >
            Magic in 3 Steps 🪄
          </motion.h2>
          <p className="text-lg" style={{ color: "rgba(232,196,90,0.5)" }}>
            From your camera roll to a physical love letter.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ y: 36, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="relative flex flex-col items-center text-center p-8 rounded-3xl overflow-hidden"
              style={{
                background: "rgba(18,40,55,0.65)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: `1px solid ${step.borderColor}`,
                boxShadow: `0 4px 32px rgba(0,0,0,0.35), 0 0 40px ${step.glowColor.replace("0.5", "0.12")}, inset 0 1px 0 rgba(232,196,90,0.12)`,
              }}
            >
              {/* Specular top */}
              <div
                className="absolute top-0 left-[15%] right-[15%] h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${step.glowColor.replace("0.5", "0.45")}, transparent)` }}
              />
              {/* Step number badge */}
              <div
                className="absolute top-5 right-5 text-xs font-black tracking-widest px-2 py-0.5 rounded-full"
                style={{
                  background: step.badgeColor,
                  border: `1px solid ${step.borderColor}`,
                  color: step.glowColor.replace("0.5", "0.9"),
                }}
              >
                {step.step}
              </div>
              {/* Icon */}
              <motion.div
                className="text-5xl mb-5"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              >
                {step.emoji}
              </motion.div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "hsl(43,80%,92%)" }}>{step.title}</h3>
              <p className="leading-relaxed text-sm" style={{ color: "rgba(232,196,90,0.5)" }}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
