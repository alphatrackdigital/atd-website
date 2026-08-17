import { Helmet } from "react-helmet-async";
import { SEO_DEFAULTS, SITE_URL, buildCanonicalUrl } from "@/config/seo";

interface SEOProps {
  title: string;
  description: string;
  noindex?: boolean;
  omitCanonical?: boolean;
  schema?: Record<string, unknown>;
  canonicalUrl?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageType?: string;
  ogUrl?: string;
  ogType?: "website" | "article";
  twitterImage?: string;
}

const SEO = ({
  title,
  description,
  noindex,
  omitCanonical,
  schema,
  canonicalUrl,
  ogImage,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  ogImageType,
  ogUrl,
  ogType = SEO_DEFAULTS.ogType,
  twitterImage,
}: SEOProps) => {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const resolvedCanonical = buildCanonicalUrl(canonicalUrl || currentPath);
  const resolvedOgUrl = buildCanonicalUrl(ogUrl || canonicalUrl || currentPath);
  const resolvedOgImage = buildCanonicalUrl(ogImage || SEO_DEFAULTS.ogImage);
  const resolvedTwitterImage = buildCanonicalUrl(twitterImage || resolvedOgImage);
  const resolvedOgImageAlt = ogImageAlt || SEO_DEFAULTS.ogImageAlt;
  const resolvedOgImageWidth = ogImageWidth || SEO_DEFAULTS.ogImageWidth;
  const resolvedOgImageHeight = ogImageHeight || SEO_DEFAULTS.ogImageHeight;
  const resolvedOgImageType = ogImageType || SEO_DEFAULTS.ogImageType;
  const twitterDomain = (() => {
    try {
      return new URL(SITE_URL).hostname;
    } catch {
      return "alphatrack.digital";
    }
  })();

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {!omitCanonical && <link rel="canonical" href={resolvedCanonical} />}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SEO_DEFAULTS.siteName} />
      {!omitCanonical && <meta property="og:url" content={resolvedOgUrl} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:secure_url" content={resolvedOgImage} />
      <meta property="og:image:type" content={resolvedOgImageType} />
      <meta property="og:image:width" content={String(resolvedOgImageWidth)} />
      <meta property="og:image:height" content={String(resolvedOgImageHeight)} />
      <meta property="og:image:alt" content={resolvedOgImageAlt} />

      <meta name="twitter:card" content={SEO_DEFAULTS.twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedTwitterImage} />
      <meta name="twitter:image:alt" content={resolvedOgImageAlt} />
      <meta name="twitter:domain" content={twitterDomain} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
    </Helmet>
  );
};

export default SEO;
