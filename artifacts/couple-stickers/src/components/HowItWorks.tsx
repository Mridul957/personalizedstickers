import { motion } from "framer-motion";
import { Upload, Wand2, Package } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Photo",
    description: "Pick a favorite photo of you and your partner. We'll handle the rest.",
    color: "rgba(147,51,234,0.6)",
  },
  {
    icon: Wand2,
    title: "Pick Your Poses",
    description: "Our artists transform your photo into beautifully illustrated sticker poses.",
    color: "rgba(236,72,153,0.6)",
  },
  {
    icon: Package,
    title: "We Print & Ship",
    description: "Receive your premium die-cut sticker sheet in aesthetic packaging in 3–5 days.",
    color: "rgba(163,230,53,0.6)",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            style={{ textShadow: "0 0 60px rgba(147,51,234,0.3)" }}
          >
            Magic in 3 Steps
          </motion.h2>
          <p className="text-lg text-white/50">From your camera roll to a physical love letter.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="relative flex flex-col items-center text-center p-8 rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              {/* Specular top */}
              <div
                className="absolute top-0 left-[15%] right-[15%] h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
              />
              {/* Step glow blob */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full -z-10 opacity-30"
                style={{ background: `radial-gradient(circle, ${step.color} 0%, transparent 70%)` }}
              />

              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: `0 0 24px ${step.color.replace("0.6", "0.3")}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  color: "white",
                }}
              >
                <step.icon size={26} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
              <p className="text-white/50 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
