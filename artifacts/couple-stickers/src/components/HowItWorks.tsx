import { motion } from "framer-motion";
import { Upload, Wand2, Package } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Photo",
    description: "Pick a favorite photo of you and your partner. We'll handle the rest."
  },
  {
    icon: Wand2,
    title: "Pick Your Poses",
    description: "Our artists transform your photo into beautifully illustrated sticker poses."
  },
  {
    icon: Package,
    title: "We Print & Ship",
    description: "Receive your premium die-cut sticker sheet in aesthetic packaging in 3-5 days."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Magic in 3 Steps
          </h2>
          <p className="text-lg text-muted-foreground">
            From your camera roll to a physical love letter.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px bg-border -translate-y-1/2 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center text-center bg-card p-8 rounded-3xl border shadow-sm"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6 text-secondary-foreground">
                <step.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
