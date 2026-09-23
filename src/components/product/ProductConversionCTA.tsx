import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BOOK_A_FREE_STRATEGY_CALL_CTA } from "@/config/cta";
import type { Product } from "@/types/product";

interface ProductConversionCTAProps {
  product: Product;
}

/**
 * Conversion adapter: behaviour is selected by `product.conversionMode`
 * rather than hardcoded, so a future commercial/distribution decision
 * (notify, lead_capture, direct_download, purchase, external_checkout) can
 * be wired in without restructuring the page. Only `none` is implemented —
 * every product ships informational/prelaunch today; no provider-specific
 * checkout logic lives in this component.
 */
const ProductConversionCTA = ({ product }: ProductConversionCTAProps) => {
  return (
    <section className="border-t border-white/10 bg-[#070a10] py-10 lg:py-16">
      <div className="container mx-auto px-6 text-center md:px-4 lg:px-8">
        <h2 className="mx-auto max-w-xl text-2xl font-bold leading-tight md:text-3xl">
          {product.shortTitle} is in production.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground md:text-[15px]">
          No price or release date has been set. Have a question about the series in the meantime?
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-xl bg-primary px-8 text-primary-foreground hover:bg-primary/90">
            <Link to={BOOK_A_FREE_STRATEGY_CALL_CTA.to}>{BOOK_A_FREE_STRATEGY_CALL_CTA.label}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl border-white/20 hover:bg-white/5">
            <Link to="/library">Back to Product Library</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductConversionCTA;
