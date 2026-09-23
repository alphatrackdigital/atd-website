import SectionIntro from "@/components/shared/SectionIntro";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

interface ProductGroupProps {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
}

const ProductGroup = ({ eyebrow, title, description, products }: ProductGroupProps) => {
  if (products.length === 0) return null;

  return (
    <div>
      <SectionIntro
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-5 md:mb-8"
        descriptionClassName="max-w-2xl text-sm"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
};

export default ProductGroup;
