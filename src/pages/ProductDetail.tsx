import { Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import FAQAccordion from "@/components/shared/FAQAccordion";
import HeroEyebrow from "@/components/shared/HeroEyebrow";
import SEO from "@/components/shared/SEO";
import ProductCoverStage from "@/components/product/ProductCoverStage";
import AudienceSection from "@/components/product/AudienceSection";
import ProblemContextSection from "@/components/product/ProblemContextSection";
import OutcomesSection from "@/components/product/OutcomesSection";
import ContentsOverview from "@/components/product/ContentsOverview";
import PreviewGallery from "@/components/product/PreviewGallery";
import FrameworksToolsSection from "@/components/product/FrameworksToolsSection";
import PublicationMetadata from "@/components/product/PublicationMetadata";
import PublisherCredibility from "@/components/product/PublisherCredibility";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductConversionCTA from "@/components/product/ProductConversionCTA";
import { getProductBySlug, getRelatedProducts } from "@/data/products";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;

  if (!product || !slug) return <Navigate to="/library" replace />;

  const productUrl = `https://alphatrack.digital/library/${slug}`;
  const relatedProducts = getRelatedProducts(product);

  return (
    <>
      <SEO
        title={product.seoTitle}
        description={product.seoDescription}
        canonicalUrl={`/library/${slug}`}
        ogImage={product.ogImage ?? product.cover}
        ogImageAlt={product.ogImageAlt ?? product.coverAlt}
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.seoDescription,
          brand: { "@type": "Organization", name: product.publisher },
          url: productUrl,
        }}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://alphatrack.digital/" },
              { "@type": "ListItem", position: 2, name: "Product Library", item: "https://alphatrack.digital/library" },
              { "@type": "ListItem", position: 3, name: product.shortTitle, item: productUrl },
            ],
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#05070d] pb-14 pt-6 md:pb-20 md:pt-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,1)_0%,rgba(7,10,16,0.94)_56%,rgba(5,7,13,1)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(0,175,239,0.12)_0%,rgba(0,51,153,0.07)_50%,transparent_72%)]" />
        </div>
        <div className="container relative z-10 mx-auto px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", path: "/" },
              { label: "Product Library", path: "/library" },
              { label: product.shortTitle },
            ]}
          />
          <div className="mt-10 grid grid-cols-1 items-center gap-10 md:mt-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              {product.eyebrow && <HeroEyebrow className="mb-5">{product.eyebrow}</HeroEyebrow>}
              <h1 className="title-safe text-[2.1rem] font-extrabold leading-[1.14] tracking-normal md:text-5xl lg:text-[3.4rem]">
                {product.headline ?? product.shortTitle}
              </h1>
              {product.dek && (
                <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-lg">
                  {product.dek}
                </p>
              )}
              {product.valueProposition && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground/80">
                  {product.valueProposition}
                </p>
              )}
            </motion.div>
            <ProductCoverStage product={product} />
          </div>
        </div>
      </section>

      <AudienceSection product={product} />
      <ProblemContextSection product={product} />
      <OutcomesSection product={product} />
      <ContentsOverview product={product} />
      <PreviewGallery product={product} />
      <FrameworksToolsSection product={product} />
      <PublicationMetadata product={product} />
      <PublisherCredibility />

      {product.faqs && product.faqs.length > 0 && (
        <FAQAccordion
          items={product.faqs}
          title="Questions"
          eyebrow="FAQ"
          variant="minimal"
          density="compact"
          defaultOpenItem={0}
          contentClassName="max-w-[46rem]"
          accordionClassName="space-y-3"
        />
      )}

      <RelatedProducts items={relatedProducts} />
      <ProductConversionCTA product={product} />
    </>
  );
};

export default ProductDetail;
