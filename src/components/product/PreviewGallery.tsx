import type { Product } from "@/types/product";

interface PreviewGalleryProps {
  product: Product;
}

/**
 * Renders only when approved preview/spread assets exist. No product has
 * approved spreads yet, so this is wired but inert until `previewImages`
 * is populated.
 */
const PreviewGallery = ({ product }: PreviewGalleryProps) => {
  if (!product.previewImages || product.previewImages.length === 0) return null;

  return (
    <section className="border-t border-white/10 bg-[#080b10] py-8 lg:py-16">
      <div className="container mx-auto px-6 md:px-4 lg:px-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
          Sample Spreads
        </span>
        <h2 className="mt-2 max-w-lg text-2xl font-bold leading-tight lg:mt-3 md:text-4xl">Preview the pages.</h2>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {product.previewImages.map((src) => (
            <img
              key={src}
              src={src}
              alt={`${product.shortTitle} sample spread`}
              className="h-72 w-auto shrink-0 rounded-xl border border-white/10 object-cover"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreviewGallery;
