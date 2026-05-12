import { motion } from "framer-motion";
import gallery1 from "@/assets/gallery-1.png";
import gallery2 from "@/assets/gallery-2.png";

export function Gallery() {
  return (
    <section id="gallery" className="py-24 bg-secondary/10">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Real Love, <br className="hidden md:block" /> Real Stickers.
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              See how others are capturing their favorite moments in sticker form.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="group relative rounded-[2rem] overflow-hidden aspect-square md:aspect-auto md:h-[600px] bg-white"
          >
            <img 
              src={gallery1} 
              alt="Aesthetic sticker sheet" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </motion.div>
          
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative rounded-[2rem] overflow-hidden aspect-square md:aspect-auto md:h-[600px] bg-white"
          >
            <img 
              src={gallery2} 
              alt="Couple putting sticker on phone" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
