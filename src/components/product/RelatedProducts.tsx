import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { prefetchRoute } from "@/lib/routePrefetch";
import PublicationStatusBadge from "@/components/product/PublicationStatusBadge";
import type { Product } from "@/types/product";

interface RelatedProductsProps {
  items: Product[];
}

const RelatedProducts = ({ items }: RelatedProductsProps) => {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-white/10 bg-[#080b10] py-8 lg:py-16">
      <div className="container mx-auto px-6 md:px-4 lg:px-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
          Related Titles
        </span>
        <h2 className="mt-2 max-w-lg text-2xl font-bold leading-tight lg:mt-3 md:text-4xl">Part of the suite.</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {items.map((item, index) => {
            const path = `/library/${item.slug}`;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <Link
                  to={path}
                  onMouseEnter={() => prefetchRoute(path)}
                  onFocus={() => prefetchRoute(path)}
                  className="group flex h-full flex-col gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-white/20"
                >
                  <div className="flex items-center justify-between gap-2">
                    <BookOpen className="h-4 w-4 text-primary/70" aria-hidden="true" />
                    <PublicationStatusBadge status={item.publicStatus} />
                  </div>
                  <h3 className="text-[15px] font-semibold leading-snug transition-colors group-hover:text-primary">
                    {item.shortTitle}
                  </h3>
                  {item.dek && (
                    <p className="line-clamp-2 text-[13px] leading-6 text-muted-foreground">{item.dek}</p>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
