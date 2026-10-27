import { useState } from "react";
import { Link } from "react-router-dom";

import CTASection from "@/components/shared/CTASection";
import SEO from "@/components/shared/SEO";
import { BOOK_A_FREE_STRATEGY_CALL_CTA } from "@/config/cta";
import { products } from "@/data/products";
import { prefetchRoute } from "@/lib/routePrefetch";
import { cn } from "@/lib/utils";
import type { Product, PublicStatus } from "@/types/product";

const SPINE_COLORS = ["#003399", "#00AFEF", "#33CC99", "#F59E0B", "#E4572E", "#8B5CF6", "#0F172A"];
const colorFor = (product: Product) =>
  SPINE_COLORS[Math.max(0, products.findIndex((p) => p.id === product.id)) % SPINE_COLORS.length];
const pathFor = (product: Product) => `/library/${product.slug}`;

const GROUP_LABEL: Record<Product["group"], string> = {
  featured: "Featured",
  start_here: "Start here",
  tools: "Reference & tools",
};

const STATUS_LABEL: Record<PublicStatus, string> = {
  coming_soon: "Coming soon",
  preview: "Preview",
  available: "Available",
  archived: "Archived",
};

const FILTERS = ["all", "featured", "start_here", "tools"] as const;

/** Cover image if one exists, otherwise a typographic cover in the product's color. */
const Cover = ({ product, className }: { product: Product; className?: string }) => {
  if (product.cover) {
    return (
      <img
        src={product.cover}
        alt={product.coverAlt ?? `${product.shortTitle} cover`}
        className={cn("aspect-[3/4] w-full rounded-md object-cover shadow-xl", className)}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={cn("flex aspect-[3/4] w-full flex-col justify-between rounded-md p-4 text-white shadow-xl", className)}
      style={{ backgroundColor: colorFor(product) }}
      aria-hidden="true"
    >
      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-70">AlphaTrack Playbook Series</span>
      <span className="text-lg font-extrabold leading-tight">{product.shortTitle}</span>
    </div>
  );
};

const ProductLibrary = () => {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const shown = products.filter((p) => filter === "all" || p.group === filter);

  return (
    <>
      <SEO
        title="Product Library | AlphaTrack Digital"
        description="Working manuals for teams that market in Africa — the AlphaTrack Digital Playbook series, starting with the Digital Growth Playbook."
        canonicalUrl="/library"
      />

      <div className="bg-[#faf6ee] text-[#14120e]">
        <section className="container mx-auto px-6 pb-10 pt-12 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#14120e]/50">Product Library</p>
          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="text-[22vw] font-black leading-[0.8] tracking-tighter sm:text-[15vw] lg:text-[11rem]">
              Play<span className="text-[#003399]">books</span>
            </h1>
            <div className="flex items-end gap-2 sm:gap-3" role="list" aria-label="The series, as book spines">
              {products.map((product, i) => (
                <Link
                  key={product.id}
                  to={pathFor(product)}
                  role="listitem"
                  title={product.shortTitle}
                  onMouseEnter={() => prefetchRoute(pathFor(product))}
                  onFocus={() => prefetchRoute(pathFor(product))}
                  className="group flex w-9 items-start justify-center rounded-t-sm pt-3 text-white shadow-md transition-transform duration-300 hover:-translate-y-3 sm:w-12"
                  style={{ backgroundColor: colorFor(product), height: `${12 + ((i * 37) % 5) * 1.1}rem` }}
                >
                  <span className="text-[11px] font-semibold tracking-wide [text-orientation:mixed] [writing-mode:vertical-rl]">
                    {product.shortTitle}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#14120e]/70">
            Working manuals for teams that market in Africa — practical publications documenting the methods we run for
            clients.
          </p>
        </section>

        <section className="container mx-auto px-6 pb-20 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#14120e]/15 py-4">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm transition-colors",
                    filter === key
                      ? "border-[#14120e] bg-[#14120e] text-white"
                      : "border-[#14120e]/20 hover:border-[#14120e]/60",
                  )}
                >
                  {key === "all" ? "All titles" : GROUP_LABEL[key]}
                </button>
              ))}
            </div>
            <span className="text-sm text-[#14120e]/50">{shown.length} titles</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((product) => (
              <Link
                key={product.id}
                to={pathFor(product)}
                onMouseEnter={() => prefetchRoute(pathFor(product))}
                onFocus={() => prefetchRoute(pathFor(product))}
                className="group block"
              >
                <div className="rounded-lg bg-[#efe8d8] p-5 transition-colors group-hover:bg-[#e6dcc6]">
                  <Cover product={product} className="transition-transform duration-300 group-hover:-translate-y-1" />
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#14120e]/50">
                  {GROUP_LABEL[product.group]} · {STATUS_LABEL[product.publicStatus]}
                </p>
                <h3 className="mt-1 text-base font-bold leading-snug group-hover:underline">{product.shortTitle}</h3>
                {product.dek && <p className="mt-1 line-clamp-2 text-sm text-[#14120e]/60">{product.dek}</p>}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <CTASection
        title={
          <>
            Have Questions About the{" "}
            <br />
            <span className="text-gradient">Playbook Series?</span>
          </>
        }
        description="No price or release date has been set yet. Book a free strategy call if you'd like to talk through the method in the meantime."
        primaryCta={BOOK_A_FREE_STRATEGY_CALL_CTA}
        secondaryCta={null}
        variant="hero-close"
      />
    </>
  );
};

export default ProductLibrary;
