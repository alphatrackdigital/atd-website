import type { Product } from "@/types/product";

interface ContentsOverviewProps {
  product: Product;
}

/**
 * Renders only once an approved section-by-section table of contents
 * exists. No product has one yet (PRD: final TOC is publication-dependent
 * and must not be fabricated), so this is wired but inert until
 * `contentsSummary` is populated.
 */
const ContentsOverview = ({ product }: ContentsOverviewProps) => {
  if (!product.contentsSummary || product.contentsSummary.length === 0) return null;

  return (
    <section className="border-t border-white/10 bg-[#080b10] py-8 lg:py-16">
      <div className="container mx-auto px-6 md:px-4 lg:px-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
          Section Overview
        </span>
        <h2 className="mt-2 max-w-lg text-2xl font-bold leading-tight lg:mt-3 md:text-4xl">What&apos;s inside.</h2>
        <div className="mt-6 divide-y divide-white/[0.07] lg:mt-10">
          {product.contentsSummary.map((item) => (
            <div key={item.n} className="flex items-start gap-4 py-3.5">
              <span className="text-xs font-bold text-primary/70">{item.n}</span>
              <span className="text-sm text-muted-foreground">{item.t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentsOverview;
