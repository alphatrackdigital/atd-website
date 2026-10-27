import type { Product } from "@/types/product";

const FAMILY = "AlphaTrack Digital Playbook Series";
const SOURCE_REF = "ATD Product Library & Playbook Landing Pages — Implementation PRD v1.0";

/**
 * Typed product registry for the AlphaTrack Digital Product Library.
 *
 * Only the Digital Growth Playbook carries approved positioning copy today
 * (PRD section 9, "Stable content allowed now"). The six companion titles
 * exist as governed records — title, category, status — with their
 * one-line role descriptions drawn directly from the PRD's own suite
 * explainer (section 9, "Explain its relationship to the six companion
 * publications"), not invented marketing copy. Everything else
 * publication-dependent (final cover, page count, TOC, price, publication
 * date) is left undefined until approved; the shared product components
 * omit those modules rather than showing placeholder text.
 */
export const products: Product[] = [
  {
    id: "digital-growth-playbook",
    slug: "digital-growth-playbook",
    title: "The AlphaTrack Digital Growth Playbook for African SMEs",
    shortTitle: "Digital Growth Playbook",
    family: FAMILY,
    category: "Featured",
    publisher: "AlphaTrack Digital",

    publicStatus: "coming_soon",
    contentState: "stable",
    launchEnabled: false,
    sourceRef: SOURCE_REF,

    group: "featured",

    eyebrow: "AlphaTrack Digital · Playbook Series",
    headline: "The Digital Growth Playbook",
    dek: "A practical working manual and repeatable marketing operating system for African SMEs — not a passive ebook.",
    valueProposition:
      "Strategy through measurement, built as a system your team can run again every quarter, not a book you read once.",
    audience: [
      "Founders and owner-managers",
      "Small internal marketing teams",
      "Marketing coordinators and junior marketers",
      "Freelancers and consultants who need a repeatable client system",
      "Businesses already marketing online without a reliable system",
    ],
    problems: [
      "Marketing effort that doesn't compound into a repeatable system",
      "No shared method for choosing platforms, building campaigns, or reading results",
      "Growth work that depends on one person's instinct instead of a process the team can run",
    ],
    outcomes: [
      "Strategy and platform selection",
      "Campaign building and diagnosis",
      "Industry-specific playbooks",
      "A repeatable content system",
      "Lead conversion",
      "Email and WhatsApp nurture",
      "KPI measurement",
      "Safe, productive use of AI",
      "Ongoing review routines and worksheets",
    ],

    conversionMode: "none",

    seoTitle: "Digital Growth Playbook | AlphaTrack Digital Product Library",
    seoDescription:
      "A practical working manual and repeatable marketing operating system for African SMEs, from AlphaTrack Digital.",

    cover: "/digital-growth-playbook-cover-placeholder.jpg",
    coverAlt: "Digital Growth Playbook cover — provisional placeholder, final publication cover pending approval",

    relatedProductIds: [
      "quick-start-guide",
      "advertising-specifications-field-guide",
      "industry-kpi-guide",
      "marketing-worksheets",
      "ai-marketing-prompt-library",
      "resource-index",
    ],

    faqs: [
      {
        question: "Is this a course or a book?",
        answer:
          "It is a publication. You read it, work through the sections that apply to you, and use the worksheets as part of a recurring routine.",
      },
      {
        question: "What if my industry is not covered directly?",
        answer:
          "The industry playbooks are worked examples of the same method. The strategy, campaign, and measurement sections apply regardless of sector.",
      },
      {
        question: "When will it be available, and at what price?",
        answer:
          "Availability and pricing are confirmed at publication. We do not publish a date or a price until the edition is final.",
      },
    ],
  },
  {
    id: "quick-start-guide",
    slug: "quick-start-guide",
    title: "Quick Start Guide",
    shortTitle: "Quick Start Guide",
    family: FAMILY,
    category: "Start here",
    publisher: "AlphaTrack Digital",

    publicStatus: "coming_soon",
    contentState: "mixed",
    launchEnabled: false,
    sourceRef: SOURCE_REF,

    group: "start_here",
    eyebrow: "AlphaTrack Digital · Playbook Series",
    dek: "The fast on-ramp into the Digital Growth Playbook method.",

    conversionMode: "none",
    seoTitle: "Quick Start Guide | AlphaTrack Digital Product Library",
    seoDescription: "The fast on-ramp into the Digital Growth Playbook method, from AlphaTrack Digital.",

    relatedProductIds: ["digital-growth-playbook"],
  },
  {
    id: "advertising-specifications-field-guide",
    slug: "advertising-specifications-field-guide",
    title: "Advertising Specifications Field Guide",
    shortTitle: "Ad Specs Field Guide",
    family: FAMILY,
    category: "Reference & execution tools",
    publisher: "AlphaTrack Digital",

    publicStatus: "coming_soon",
    contentState: "mixed",
    launchEnabled: false,
    sourceRef: SOURCE_REF,

    group: "tools",
    eyebrow: "AlphaTrack Digital · Playbook Series",
    dek: "A field reference for ad platform specifications.",

    conversionMode: "none",
    seoTitle: "Advertising Specifications Field Guide | AlphaTrack Digital Product Library",
    seoDescription: "A field reference for ad platform specifications, from AlphaTrack Digital.",

    relatedProductIds: ["digital-growth-playbook"],
  },
  {
    id: "industry-kpi-guide",
    slug: "industry-kpi-guide",
    title: "Industry KPI Guide",
    shortTitle: "Industry KPI Guide",
    family: FAMILY,
    category: "Reference & execution tools",
    publisher: "AlphaTrack Digital",

    publicStatus: "coming_soon",
    contentState: "mixed",
    launchEnabled: false,
    sourceRef: SOURCE_REF,

    group: "tools",
    eyebrow: "AlphaTrack Digital · Playbook Series",
    dek: "A reference for the KPIs that matter, by industry.",

    conversionMode: "none",
    seoTitle: "Industry KPI Guide | AlphaTrack Digital Product Library",
    seoDescription: "A reference for the KPIs that matter, by industry, from AlphaTrack Digital.",

    relatedProductIds: ["digital-growth-playbook"],
  },
  {
    id: "marketing-worksheets",
    slug: "marketing-worksheets",
    title: "Marketing Worksheets",
    shortTitle: "Marketing Worksheets",
    family: FAMILY,
    category: "Reference & execution tools",
    publisher: "AlphaTrack Digital",

    publicStatus: "coming_soon",
    contentState: "mixed",
    launchEnabled: false,
    sourceRef: SOURCE_REF,

    group: "tools",
    eyebrow: "AlphaTrack Digital · Playbook Series",
    dek: "Fillable worksheets for the recurring planning and review work.",

    conversionMode: "none",
    seoTitle: "Marketing Worksheets | AlphaTrack Digital Product Library",
    seoDescription: "Fillable worksheets for the recurring planning and review work, from AlphaTrack Digital.",

    relatedProductIds: ["digital-growth-playbook"],
  },
  {
    id: "ai-marketing-prompt-library",
    slug: "ai-marketing-prompt-library",
    title: "AI Marketing Prompt Library",
    shortTitle: "AI Prompt Library",
    family: FAMILY,
    category: "Reference & execution tools",
    publisher: "AlphaTrack Digital",

    publicStatus: "coming_soon",
    contentState: "mixed",
    launchEnabled: false,
    sourceRef: SOURCE_REF,

    group: "tools",
    eyebrow: "AlphaTrack Digital · Playbook Series",
    dek: "A prompt library for safe, productive use of AI across marketing tasks.",

    conversionMode: "none",
    seoTitle: "AI Marketing Prompt Library | AlphaTrack Digital Product Library",
    seoDescription: "A prompt library for safe, productive use of AI across marketing tasks, from AlphaTrack Digital.",

    relatedProductIds: ["digital-growth-playbook"],
  },
  {
    id: "resource-index",
    slug: "resource-index",
    title: "Resource Index",
    shortTitle: "Resource Index",
    family: FAMILY,
    category: "Reference & execution tools",
    publisher: "AlphaTrack Digital",

    publicStatus: "coming_soon",
    contentState: "mixed",
    launchEnabled: false,
    sourceRef: SOURCE_REF,

    group: "tools",
    eyebrow: "AlphaTrack Digital · Playbook Series",
    dek: "An index of the tools and sources the series relies on.",

    conversionMode: "none",
    seoTitle: "Resource Index | AlphaTrack Digital Product Library",
    seoDescription: "An index of the tools and sources the Playbook series relies on, from AlphaTrack Digital.",

    relatedProductIds: ["digital-growth-playbook"],
  },
];

export const getProductBySlug = (slug: string): Product | undefined =>
  products.find((product) => product.slug === slug);

export const getProductsByGroup = (group: Product["group"]): Product[] =>
  products.filter((product) => product.group === group);

export const getRelatedProducts = (product: Product): Product[] =>
  (product.relatedProductIds ?? [])
    .map((id) => products.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is Product => Boolean(candidate));

export const featuredProduct = products.find((product) => product.group === "featured");
