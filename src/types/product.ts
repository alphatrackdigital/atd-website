export type PublicStatus = "coming_soon" | "preview" | "available" | "archived";
export type ContentState = "stable" | "mixed" | "final";
export type ProductGroupKey = "featured" | "start_here" | "tools";
export type ConversionMode =
  | "none"
  | "notify"
  | "lead_capture"
  | "direct_download"
  | "purchase"
  | "external_checkout";

export interface ProductFramework {
  title: string;
  description: string;
}

export interface ProductContentsItem {
  n: string;
  t: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

/**
 * Content/data schema per the ATD Product Library & Playbook Landing Pages
 * PRD (Implementation PRD v1.0), section 8.1. Fields are optional wherever
 * the underlying fact is publication-dependent and not yet approved — page
 * modules must omit cleanly when their field is absent, not render a
 * placeholder like "TBC".
 */
export interface Product {
  // Identity
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  family: string;
  category: string;
  edition?: string;
  publisher: string;

  // Governance / status
  publicStatus: PublicStatus;
  contentState: ContentState;
  launchEnabled: boolean;
  sourceRef?: string;

  // Editorial grouping (hub discovery model, PRD section 5)
  group: ProductGroupKey;

  // Positioning
  eyebrow?: string;
  headline?: string;
  dek?: string;
  valueProposition?: string;
  audience?: string[];
  notFor?: string[];
  problems?: string[];
  outcomes?: string[];

  // Contents
  contentsSummary?: ProductContentsItem[];
  frameworks?: ProductFramework[];
  includedResources?: string[];

  // Visual assets
  cover?: string;
  coverAlt?: string;
  previewImages?: string[];
  previewPdf?: string;

  // Publication metadata
  pageCount?: number;
  format?: string;
  version?: string;
  publicationDate?: string;

  // Conversion
  conversionMode: ConversionMode;

  // SEO
  seoTitle: string;
  seoDescription: string;
  ogImage?: string;
  ogImageAlt?: string;

  // Relationships
  relatedProductIds?: string[];

  faqs?: ProductFaq[];
}
