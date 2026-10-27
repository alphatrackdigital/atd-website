import type { Product } from "@/types/product";

interface FrameworksToolsSectionProps {
  product: Product;
}

const FrameworksToolsSection = ({ product }: FrameworksToolsSectionProps) => {
  if (!product.frameworks || product.frameworks.length === 0) return null;

  return (
    <section className="border-t border-white/10 bg-[#070a10] py-8 lg:py-16">
      <div className="container mx-auto px-6 md:px-4 lg:px-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
          Frameworks &amp; Tools
        </span>
        <h2 className="mt-2 max-w-lg text-2xl font-bold leading-tight lg:mt-3 md:text-4xl">
          Key frameworks inside.
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {product.frameworks.map((item) => (
            <div key={item.title}>
              <h3 className="text-[15px] font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-[1.7] text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FrameworksToolsSection;
