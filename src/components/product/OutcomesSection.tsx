import { motion } from "framer-motion";
import type { Product } from "@/types/product";

interface OutcomesSectionProps {
  product: Product;
}

const OutcomesSection = ({ product }: OutcomesSectionProps) => {
  if (!product.outcomes || product.outcomes.length === 0) return null;

  return (
    <section className="border-t border-white/10 bg-[#070a10] py-8 lg:py-16">
      <div className="container mx-auto px-6 md:px-4 lg:px-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
          What It Covers
        </span>
        <h2 className="mt-2 max-w-lg text-2xl font-bold leading-tight lg:mt-3 md:text-4xl">
          One system, end to end.
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {product.outcomes.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5"
            >
              <span className="mt-0.5 text-[11px] font-bold text-primary/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-6 text-muted-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutcomesSection;
