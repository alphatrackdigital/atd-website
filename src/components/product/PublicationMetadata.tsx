import type { Product } from "@/types/product";

interface PublicationMetadataProps {
  product: Product;
}

const PublicationMetadata = ({ product }: PublicationMetadataProps) => {
  const rows: Array<{ label: string; value: string }> = [];
  if (product.pageCount) rows.push({ label: "Page count", value: String(product.pageCount) });
  if (product.format) rows.push({ label: "Format", value: product.format });
  if (product.version) rows.push({ label: "Version", value: product.version });
  if (product.publicationDate) rows.push({ label: "Published", value: product.publicationDate });

  if (rows.length === 0) return null;

  return (
    <section className="border-t border-white/10 bg-[#080b10] py-8 lg:py-12">
      <div className="container mx-auto px-6 md:px-4 lg:px-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
          Publication Metadata
        </span>
        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label}>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">{row.label}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PublicationMetadata;
