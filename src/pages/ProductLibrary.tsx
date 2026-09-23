import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

import CTASection from "@/components/shared/CTASection";
import HeroEyebrow from "@/components/shared/HeroEyebrow";
import SectionIntro from "@/components/shared/SectionIntro";
import SEO from "@/components/shared/SEO";
import ProductGroup from "@/components/product/ProductGroup";
import PublicationStatusBadge from "@/components/product/PublicationStatusBadge";
import { Button } from "@/components/ui/button";
import { BOOK_A_FREE_STRATEGY_CALL_CTA } from "@/config/cta";
import { prefetchRoute } from "@/lib/routePrefetch";
import { featuredProduct, getProductsByGroup } from "@/data/products";

const ProductLibrary = () => {
  const startHereProducts = getProductsByGroup("start_here");
  const toolProducts = getProductsByGroup("tools");
  const featuredPath = featuredProduct ? `/library/${featuredProduct.slug}` : "/library";

  return (
    <>
      <SEO
        title="Product Library | AlphaTrack Digital"
        description="Working manuals for teams that market in Africa — the AlphaTrack Digital Playbook series, starting with the Digital Growth Playbook."
        canonicalUrl="/library"
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#05070d] pb-14 pt-6 text-center md:pb-20 md:pt-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,1)_0%,rgba(7,10,16,0.94)_54%,rgba(5,7,13,1)_100%)]" />
          <div className="absolute left-1/2 top-[28%] h-[18rem] w-[24rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,175,239,0.12)_0%,rgba(51,204,153,0.07)_42%,transparent_74%)] blur-[76px] md:h-[25rem] md:w-[42rem] md:blur-[124px]" />
        </div>
        <div className="container relative mx-auto px-6 text-center lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <HeroEyebrow className="mb-5 mx-auto">Product Library</HeroEyebrow>
            <h1 className="title-safe mx-auto max-w-3xl font-extrabold leading-[1.1] tracking-normal md:text-5xl lg:text-6xl">
              Working manuals for teams<br className="hidden sm:block" /> that market in{" "}
              <span className="text-gradient">Africa.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[1.02rem] leading-8 text-muted-foreground sm:text-lg sm:leading-relaxed">
              The AlphaTrack Digital Playbook series — practical, repeatable publications documenting the
              same methods we run for clients. Published by AlphaTrack Digital.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="w-full max-w-[17rem] gap-1.5 rounded-xl bg-primary px-8 text-primary-foreground hover:bg-primary/90 sm:w-auto sm:max-w-none"
              >
                <Link to={featuredPath} onMouseEnter={() => prefetchRoute(featuredPath)} onFocus={() => prefetchRoute(featuredPath)}>
                  View the Digital Growth Playbook
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      {featuredProduct && (
        <section className="border-t border-white/10 bg-[#070a10] py-12 md:py-16">
          <div className="container mx-auto px-6 lg:px-8">
            <SectionIntro eyebrow="Featured" title="Start here" className="mb-6 md:mb-8" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Link
                to={featuredPath}
                onMouseEnter={() => prefetchRoute(featuredPath)}
                onFocus={() => prefetchRoute(featuredPath)}
                className="group grid grid-cols-1 gap-6 overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(180deg,rgba(0,51,153,0.1)_0%,rgba(0,175,239,0.03)_42%,rgba(51,204,153,0.03)_100%)] p-5 shadow-[0_18px_60px_rgba(0,51,153,0.1)] transition-all duration-300 hover:-translate-y-1 md:grid-cols-[220px_minmax(0,1fr)] md:items-center md:p-8"
              >
                <div className="mx-auto flex aspect-[3/4] w-full max-w-[220px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                  {featuredProduct.cover ? (
                    <img
                      src={featuredProduct.cover}
                      alt={featuredProduct.coverAlt ?? `${featuredProduct.shortTitle} cover`}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <BookOpen className="h-10 w-10 text-muted-foreground/30" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/70">
                      {featuredProduct.category}
                    </span>
                    <PublicationStatusBadge status={featuredProduct.publicStatus} />
                  </div>
                  <h3 className="mt-2.5 text-2xl font-bold leading-tight transition-colors group-hover:text-primary md:text-3xl">
                    {featuredProduct.shortTitle}
                  </h3>
                  {featuredProduct.dek && (
                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-[15px]">
                      {featuredProduct.dek}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors">
                    View the playbook &rarr;
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Start here */}
      <section className="border-t border-white/10 bg-[#080b10] py-12 md:py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <ProductGroup
            eyebrow="Start here"
            title="The fast on-ramp"
            description="A quick way into the method before working through the full Playbook."
            products={startHereProducts}
          />
        </div>
      </section>

      {/* Reference & execution tools */}
      <section className="border-t border-white/10 bg-[#070a10] py-12 md:py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <ProductGroup
            eyebrow="Reference & execution tools"
            title="Companions to the Playbook"
            description="Field references, worksheets, and indexes used while the work is happening — not separate courses."
            products={toolProducts}
          />
        </div>
      </section>

      {/* Suite relationship */}
      <section className="border-t border-white/10 bg-[#080b10] py-12 md:py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <SectionIntro
            eyebrow="One suite"
            mode="content"
            title="Seven distinct jobs, one method."
            description="The Digital Growth Playbook is the operating system — strategy through measurement, end to end. The companion titles sit alongside it: a fast on-ramp, field references for ad specs and KPIs, worksheets for the recurring work, a prompt library for safe AI use, and an index of the tools and sources we rely on. You can start anywhere, but each title assumes the same underlying method."
            maxWidth="lg"
            titleClassName="text-[1.65rem] leading-[1.12] md:text-4xl"
            descriptionClassName="max-w-2xl text-sm leading-6 md:text-base md:leading-7"
          />
        </div>
      </section>

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
