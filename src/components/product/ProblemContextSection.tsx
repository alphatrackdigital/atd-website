import { motion } from "framer-motion";
import type { Product } from "@/types/product";

interface ProblemContextSectionProps {
  product: Product;
}

const numberClasses = [
  "text-primary",
  "text-[#33CC99]",
  "bg-gradient-to-r from-primary to-[#33CC99] bg-clip-text text-transparent",
];

const ProblemContextSection = ({ product }: ProblemContextSectionProps) => {
  if (!product.problems || product.problems.length === 0) return null;

  return (
    <section className="border-t border-white/10 bg-[#080b10] py-8 lg:py-16">
      <div className="container mx-auto px-6 md:px-4 lg:px-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
          The Problem
        </span>
        <h2 className="mt-2 max-w-lg text-2xl font-bold leading-tight lg:mt-3 md:text-4xl">
          What gets in the way.
        </h2>
        <div className="mt-4 lg:mt-6">
          {product.problems.map((problem, index) => (
            <motion.div
              key={problem}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="border-t border-white/[0.08] py-4 lg:py-6"
            >
              <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-[4rem_1fr] lg:items-start lg:gap-10">
                <span
                  className={`text-[1.5rem] font-black leading-none tracking-normal lg:text-[2.25rem] ${
                    numberClasses[index % numberClasses.length]
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-[1.75] text-muted-foreground lg:pt-2 lg:text-[15px]">{problem}</p>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-white/[0.08]" />
        </div>
      </div>
    </section>
  );
};

export default ProblemContextSection;
