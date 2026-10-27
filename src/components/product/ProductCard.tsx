import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { prefetchRoute } from "@/lib/routePrefetch";
import PublicationStatusBadge from "@/components/product/PublicationStatusBadge";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const path = `/library/${product.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="h-full"
    >
      <Link
        to={path}
        onMouseEnter={() => prefetchRoute(path)}
        onFocus={() => prefetchRoute(path)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
      >
        <div className="flex aspect-[3/4] items-center justify-center overflow-hidden border-b border-white/[0.07] bg-white/[0.015]">
          {product.cover ? (
            <img
              src={product.cover}
              alt={product.coverAlt ?? `${product.shortTitle} cover`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <BookOpen className="h-8 w-8 text-muted-foreground/30" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-4 md:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/70">
              {product.category}
            </span>
            <PublicationStatusBadge status={product.publicStatus} />
          </div>
          <h3 className="text-base font-semibold leading-snug transition-colors group-hover:text-primary md:text-lg">
            {product.shortTitle}
          </h3>
          {product.dek && (
            <p className="line-clamp-2 text-[13px] leading-6 text-muted-foreground">{product.dek}</p>
          )}
          <span className="mt-auto pt-1 text-[13px] font-medium text-primary/80 transition-colors group-hover:text-primary">
            View the title &rarr;
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
