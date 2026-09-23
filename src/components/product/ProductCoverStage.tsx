import { BookOpen } from "lucide-react";
import PublicationStatusBadge from "@/components/product/PublicationStatusBadge";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCoverStageProps {
  product: Product;
  className?: string;
}

const ProductCoverStage = ({ product, className }: ProductCoverStageProps) => (
  <div className={cn("w-full", className)}>
    <div className="relative mx-auto w-full max-w-[22rem] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <div className="flex aspect-[3/4] items-center justify-center bg-white/[0.015]">
        {product.cover ? (
          <img
            src={product.cover}
            alt={product.coverAlt ?? `${product.shortTitle} cover`}
            className="h-full w-full object-cover"
            loading="eager"
            width={720}
            height={960}
          />
        ) : (
          <BookOpen className="h-10 w-10 text-muted-foreground/30" aria-hidden="true" />
        )}
      </div>
    </div>
    <div className="mt-4 flex items-center justify-center gap-3">
      <PublicationStatusBadge status={product.publicStatus} />
      {import.meta.env.DEV && product.cover && (
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/50">
          Cover — provisional
        </span>
      )}
    </div>
  </div>
);

export default ProductCoverStage;
