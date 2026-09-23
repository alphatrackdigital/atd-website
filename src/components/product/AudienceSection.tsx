import { motion } from "framer-motion";
import type { Product } from "@/types/product";

interface AudienceSectionProps {
  product: Product;
}

const AudienceSection = ({ product }: AudienceSectionProps) => {
  if (!product.audience || product.audience.length === 0) return null;

  return (
    <section className="border-t border-white/10 bg-[#070a10] py-8 lg:py-16">
      <div className="container mx-auto px-6 md:px-4 lg:px-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
          Who It&apos;s For
        </span>
        <h2 className="mt-2 max-w-lg text-2xl font-bold leading-tight lg:mt-3 md:text-4xl">
          Built for the people doing the work.
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-2.5 sm:grid-cols-2 lg:mt-10">
          {product.audience.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2.5"
            >
              <div className="h-[3px] w-[3px] shrink-0 rounded-full bg-primary/50" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
