import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import ExpertiseHero, { type ExpertiseHeroContent } from "@/components/shared/ExpertiseHero";
import FAQAccordion from "@/components/shared/FAQAccordion";
import PageSection from "@/components/shared/PageSection";
import SectionIntro from "@/components/shared/SectionIntro";
import SEO from "@/components/shared/SEO";
import ServiceHero from "@/components/shared/ServiceHero";
import {
  BOOK_A_FREE_STRATEGY_CALL_CTA,
  EXPLORE_SERVICES_CTA,
} from "@/config/cta";
import { getExpertiseBySlug } from "@/data/expertise";
import { withCampaignSearch } from "@/lib/campaignAttribution";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.09,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const closeCtaHighlightPhrases = [
  "SaaS growth",
  "enrolment growth",
  "ecommerce revenue",
  "FMCG demand",
  "booking growth",
  "property lead",
  "fashion growth",
  "gaming growth",
  "growth gaps",
];

const renderCloseCtaTitle = (title: string) => {
  const lowerTitle = title.toLowerCase();
  const phrase = closeCtaHighlightPhrases.find((item) => lowerTitle.includes(item.toLowerCase()));

  if (!phrase) {
    return title;
  }

  const start = lowerTitle.indexOf(phrase.toLowerCase());
  const end = start + phrase.length;

  return (
    <>
      {title.slice(0, start).trimEnd()}
      <br />
      <span className="text-gradient">{title.slice(start, end)}</span>
      {title.slice(end)}
    </>
  );
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const GradientRule = () => (
  <div className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
);

const saasChallengeDetails = [
  {
    title: "You cannot see which ads turn into customers",
    description:
      "You may know how many people visit or sign up, but not which campaigns lead to demos, sales conversations, or paying customers.",
  },
  {
    title: "Ad platforms chase cheap leads",
    description:
      "Your ads may bring in form fills or trials, but many of those leads are not the right fit or never move closer to buying.",
  },
  {
    title: "Good leads go quiet after they sign up",
    description:
      "A signup or demo request only helps if the person gets a fast, useful follow-up before their interest fades.",
  },
] as const;

const saasSystemSteps = [
  {
    label: "Track the source",
    service: "Tracking",
    copy: "Connect signups, demos, and sales back to campaigns.",
    tone: "secondary",
  },
  {
    label: "Improve lead quality",
    service: "Paid Media",
    copy: "Spend on people who are more likely to buy.",
    tone: "blue",
  },
  {
    label: "Follow up faster",
    service: "Automation",
    copy: "Follow up before interest fades.",
    tone: "primary",
  },
  {
    label: "Scale what works",
    service: "Output",
    copy: "Know what to fix, repeat, and scale.",
    tone: "primary",
  },
] as const;

type ExpertiseTone = "secondary" | "blue" | "primary";

interface ExpertiseProfile {
  hero: Omit<ExpertiseHeroContent, "dashboard">;
  challengeTitle: string;
  challengeDescription: string;
  challengeCards: Array<{ title: string; description: string }>;
  systemTitle: string;
  systemDescription: string;
  systemSteps: Array<{ label: string; service: string; copy: string; tone: ExpertiseTone }>;
  outcomesTitle: string;
  outcomesDescription: string;
  outcomeItems: Array<{ label: string; value: string; description: string }>;
  fitIntro: string;
  fitItems: string[];
  notFitYet: string[];
  faqTitle: string;
  closeCtaTitle: string;
}

const makeHero = (
  visual: ExpertiseHeroContent["visual"],
  background: ExpertiseHeroContent["background"],
  eyebrow: string,
  title: string,
  highlightedText: string,
  description: string,
  slug: string,
): Omit<ExpertiseHeroContent, "dashboard"> => ({
  eyebrow,
  title,
  highlightedText,
  description,
  primaryCtaLabel: BOOK_A_FREE_STRATEGY_CALL_CTA.label,
  primaryCtaTo: BOOK_A_FREE_STRATEGY_CALL_CTA.to,
  secondaryCtaLabel: "See how we work",
  secondaryCtaTo: `/expertise/${slug}#how-we-work`,
  visual,
  background,
});

type ExpertiseBackgroundKey = NonNullable<ExpertiseHeroContent["background"]>;

const expertisePageBackgrounds: Record<ExpertiseBackgroundKey, string> = {
  saas: "radial-gradient(circle at 18% 28%, rgba(51,204,153,0.10), transparent 29%), radial-gradient(circle at 76% 35%, rgba(0,175,239,0.12), transparent 30%), radial-gradient(circle at 50% 82%, rgba(0,51,153,0.16), transparent 36%), linear-gradient(180deg, #05070d 0%, #061017 54%, #05070d 100%)",
  education:
    "radial-gradient(circle at 20% 18%, rgba(51,204,153,0.055), transparent 30%), radial-gradient(circle at 76% 20%, rgba(0,175,239,0.075), transparent 32%), radial-gradient(circle at 52% 82%, rgba(0,51,153,0.065), transparent 36%), linear-gradient(180deg, #05070d 0%, #06111a 42%, #05070d 100%)",
  ecommerce:
    "radial-gradient(circle at 18% 24%, rgba(51,204,153,0.075), transparent 30%), radial-gradient(circle at 78% 20%, rgba(0,175,239,0.045), transparent 31%), radial-gradient(circle at 50% 84%, rgba(0,51,153,0.06), transparent 35%), linear-gradient(180deg, #05070d 0%, #061311 42%, #05070d 100%)",
  fmcg: "radial-gradient(circle at 18% 20%, rgba(0,175,239,0.05), transparent 30%), radial-gradient(circle at 78% 20%, rgba(0,51,153,0.11), transparent 33%), radial-gradient(circle at 50% 82%, rgba(51,204,153,0.045), transparent 34%), linear-gradient(180deg, #05070d 0%, #071020 42%, #05070d 100%)",
  hospitality:
    "radial-gradient(circle at 20% 22%, rgba(0,175,239,0.045), transparent 29%), radial-gradient(circle at 76% 20%, rgba(51,204,153,0.075), transparent 31%), radial-gradient(circle at 52% 82%, rgba(0,51,153,0.065), transparent 35%), linear-gradient(180deg, #05070d 0%, #061412 42%, #05070d 100%)",
  "real-estate":
    "radial-gradient(circle at 17% 24%, rgba(0,51,153,0.09), transparent 31%), radial-gradient(circle at 78% 20%, rgba(0,175,239,0.065), transparent 31%), radial-gradient(circle at 50% 82%, rgba(51,204,153,0.035), transparent 34%), linear-gradient(180deg, #05070d 0%, #07111d 42%, #05070d 100%)",
  fashion:
    "radial-gradient(circle at 18% 22%, rgba(0,51,153,0.085), transparent 30%), radial-gradient(circle at 76% 20%, rgba(51,204,153,0.065), transparent 31%), radial-gradient(circle at 50% 84%, rgba(0,175,239,0.04), transparent 34%), linear-gradient(180deg, #05070d 0%, #07101a 42%, #05070d 100%)",
  gaming:
    "radial-gradient(circle at 18% 22%, rgba(0,175,239,0.06), transparent 30%), radial-gradient(circle at 78% 20%, rgba(0,51,153,0.13), transparent 34%), radial-gradient(circle at 50% 84%, rgba(51,204,153,0.04), transparent 35%), linear-gradient(180deg, #05070d 0%, #070f21 42%, #05070d 100%)",
};

const expertiseProfiles: Record<string, ExpertiseProfile> = {
  education: {
    hero: makeHero(
      "education-enrollment",
      "education",
      "Education Growth Expertise",
      "Turn enquiries into trackable enrolment demand",
      "trackable",
      "Education teams need to know which campaigns create real enquiries, applications, and enrolments. We connect ads, landing pages, forms, and follow-up so intake decisions are easier to make.",
      "education",
    ),
    challengeTitle: "Where education marketing usually loses momentum.",
    challengeDescription: "Most teams are not short on interest. They are missing clear source data, fast enquiry handling, and visibility across the enrolment journey.",
    challengeCards: [
      { title: "Enquiry sources are unclear", description: "Open days, forms, calls, and ads create interest, but the team cannot always see which sources lead to applications." },
      { title: "Campaign windows move fast", description: "Intake periods need quick decisions, but reporting often arrives too late to improve spend while demand is active." },
      { title: "Prospects wait too long", description: "Parents and students compare options quickly. Slow or inconsistent follow-up can lose them before admissions gets involved." },
    ],
    systemTitle: "The enrolment system we help tighten.",
    systemDescription: "We connect campaign source, enquiry capture, admissions visibility, and follow-up around each intake window.",
    systemSteps: [
      { label: "Track enquiries", service: "Tracking", copy: "Connect forms, calls, and events back to campaigns.", tone: "secondary" },
      { label: "Prioritise demand", service: "Paid Media", copy: "Focus spend around programmes and intake windows.", tone: "blue" },
      { label: "Respond faster", service: "Automation", copy: "Send useful follow-up before prospects go quiet.", tone: "primary" },
      { label: "Improve enrolment", service: "Output", copy: "Know which campaigns support applications.", tone: "primary" },
    ],
    outcomesTitle: "The enrolment decisions your team can make faster.",
    outcomesDescription: "The goal is clearer source data, faster response, and better timing during intake periods.",
    outcomeItems: [
      { label: "Which sources create applicants?", value: "Enquiry quality", description: "See which campaigns lead to serious applications, not just form fills." },
      { label: "Where should budget shift?", value: "Intake timing", description: "Move spend while the campaign window is still active." },
      { label: "Who needs follow-up?", value: "Admissions handoff", description: "Spot enquiries that need a faster response from the team." },
      { label: "What should repeat?", value: "Programme demand", description: "See which messages and programmes create stronger interest." },
    ],
    fitIntro: "ATD works best when your team wants clearer enrolment data and faster enquiry handling.",
    fitItems: [
      "You run campaigns for intakes, open days, or programme enquiries.",
      "You cannot see which campaigns create applications.",
      "Your admissions follow-up depends too much on manual checks.",
      "You need cleaner reporting before the next intake push.",
    ],
    notFitYet: [
      "You are not ready to review forms, CRM, or admissions access.",
      "You only want more enquiries without improving response speed.",
      "No one can own enrolment reporting after setup.",
    ],
    faqTitle: "Education marketing FAQs.",
    closeCtaTitle: "Talk through your enrolment growth gaps.",
  },
  "ecommerce-retail": {
    hero: makeHero(
      "ecommerce-revenue",
      "ecommerce",
      "Ecommerce Growth Expertise",
      "Turn traffic into measurable revenue",
      "measurable",
      "Ecommerce teams need to know which campaigns create orders, repeat purchases, and profitable revenue. We connect store events, ad platforms, and retention flows so scaling is less guesswork.",
      "ecommerce-retail",
    ),
    challengeTitle: "Where ecommerce growth usually leaks revenue.",
    challengeDescription: "Traffic is only useful when the team can see what becomes orders, repeat purchases, and profitable spend.",
    challengeCards: [
      { title: "Revenue attribution is incomplete", description: "Product views, carts, purchases, and repeat orders are not always connected clearly to campaign source." },
      { title: "Paid spend scales faster than insight", description: "Campaigns may increase sales, but the team can struggle to see which spend is actually profitable." },
      { title: "Retention happens too late", description: "Customers buy once and disappear because email, cart recovery, and win-back flows are not structured enough." },
    ],
    systemTitle: "The revenue system we help connect.",
    systemDescription: "We connect purchase tracking, paid acquisition, and retention so the store has a clearer path from traffic to repeat revenue.",
    systemSteps: [
      { label: "Track sales", service: "Tracking", copy: "Connect carts, orders, and revenue to channels.", tone: "secondary" },
      { label: "Improve profit", service: "Paid Media", copy: "Focus campaigns around buyers, not just clicks.", tone: "blue" },
      { label: "Recover demand", service: "Automation", copy: "Use cart, post-purchase, and win-back flows.", tone: "primary" },
      { label: "Scale winners", service: "Output", copy: "Know what products and channels deserve budget.", tone: "primary" },
    ],
    outcomesTitle: "The ecommerce decisions your team can make with confidence.",
    outcomesDescription: "The goal is knowing where revenue comes from, what to recover, and what to scale.",
    outcomeItems: [
      { label: "Which campaigns create sales?", value: "Revenue source", description: "Connect ad spend to purchases and repeat customers." },
      { label: "What products should we push?", value: "Product demand", description: "See which products convert from paid and owned channels." },
      { label: "Where are carts leaking?", value: "Recovery gaps", description: "Spot cart and checkout points that need follow-up." },
      { label: "When should we scale?", value: "Profit signal", description: "Increase spend with better revenue visibility." },
    ],
    fitIntro: "ATD works best when your store is ready to improve measurement, acquisition, and retention together.",
    fitItems: [
      "You sell online and need clearer purchase attribution.",
      "You run paid campaigns but cannot trust profitability signals.",
      "Your cart recovery or retention flows need to work harder.",
      "You want to scale products or channels with better data.",
    ],
    notFitYet: [
      "You are not ready to review ecommerce tracking or ad accounts.",
      "You only want more traffic without improving conversion or retention.",
      "Your store does not have enough sales activity to evaluate yet.",
    ],
    faqTitle: "Ecommerce growth FAQs.",
    closeCtaTitle: "Talk through your ecommerce revenue gaps.",
  },
  fmcg: {
    hero: makeHero(
      "fmcg-demand",
      "fmcg",
      "FMCG Demand Expertise",
      "Connect campaign activity to real demand signals",
      "demand",
      "FMCG campaigns often create attention across many channels, but teams still need clearer signals around stockist visits, retailer clicks, samples, coupons, and owned audience growth.",
      "fmcg",
    ),
    challengeTitle: "Where FMCG campaign signals get cloudy.",
    challengeDescription: "When sales happen across retail, digital activity needs to show demand signals the team can actually use.",
    challengeCards: [
      { title: "Awareness is hard to connect", description: "Reach and engagement are visible, but retailer clicks, stockist searches, and sample actions are harder to tie back." },
      { title: "Launches move across many channels", description: "Creative, media, influencers, retail pages, and owned audiences often report separately." },
      { title: "First-party data is underbuilt", description: "Campaign attention disappears if there is no useful capture, nurture, or audience-building layer." },
    ],
    systemTitle: "The demand-signal system we help build.",
    systemDescription: "We connect campaign activity to practical signals like stockist clicks, sample requests, owned audiences, and retail demand proxies.",
    systemSteps: [
      { label: "Track demand", service: "Tracking", copy: "Measure stockist, coupon, sample, and site actions.", tone: "secondary" },
      { label: "Shape launches", service: "Paid Media", copy: "Coordinate media around launch and retail moments.", tone: "blue" },
      { label: "Capture audience", service: "Automation", copy: "Turn attention into owned follow-up lists.", tone: "primary" },
      { label: "Read demand", service: "Output", copy: "Know which signals justify the next campaign move.", tone: "primary" },
    ],
    outcomesTitle: "The FMCG decisions your team can make earlier.",
    outcomesDescription: "The goal is not perfect retail attribution. It is better demand visibility from the signals you can control.",
    outcomeItems: [
      { label: "Which launch activity worked?", value: "Demand signals", description: "Compare media activity against stockist, sample, and site actions." },
      { label: "Where is interest strongest?", value: "Market insight", description: "See which audiences, regions, or messages are showing intent." },
      { label: "What audience can we own?", value: "First-party growth", description: "Build useful audience lists from campaign attention." },
      { label: "What should repeat?", value: "Campaign learning", description: "Use cleaner signals to plan the next push." },
    ],
    fitIntro: "ATD works best when FMCG teams need practical demand signals, not just campaign activity.",
    fitItems: [
      "You are launching or supporting products across retail and digital.",
      "You need clearer signals beyond impressions and engagement.",
      "You want to build first-party audience capture around campaigns.",
      "You need reporting before the next campaign investment.",
    ],
    notFitYet: [
      "You expect direct in-store sales attribution from every media click.",
      "You are not ready to define useful digital demand signals.",
      "There is no owner for campaign reporting or audience capture.",
    ],
    faqTitle: "FMCG demand FAQs.",
    closeCtaTitle: "Talk through your FMCG demand gaps.",
  },
  "entertainment-hospitality": {
    hero: makeHero(
      "hospitality-booking",
      "hospitality",
      "Hospitality Demand Expertise",
      "Turn interest into bookings and repeat visits",
      "bookings",
      "Hospitality and entertainment teams need demand to move quickly. We connect campaigns, booking signals, event pushes, and re-engagement so visits and reservations are easier to grow.",
      "entertainment-hospitality",
    ),
    challengeTitle: "Where hospitality demand usually slows down.",
    challengeDescription: "Guests may show interest quickly, but booking visibility and follow-up often lag behind.",
    challengeCards: [
      { title: "Bookings are hard to attribute", description: "Campaigns send people to booking engines, event pages, and third-party tools where source visibility often breaks." },
      { title: "Promotions have short windows", description: "Events, offers, and occupancy periods need decisions while demand is active, not weeks later." },
      { title: "Past guests are underused", description: "Repeat demand drops when guest lists, email, retargeting, and seasonal reminders are not connected." },
    ],
    systemTitle: "The booking system we help tighten.",
    systemDescription: "We connect campaign source, booking intent, guest follow-up, and repeat demand around your key windows.",
    systemSteps: [
      { label: "Track intent", service: "Tracking", copy: "Measure booking clicks, calls, forms, and event actions.", tone: "secondary" },
      { label: "Fill windows", service: "Paid Media", copy: "Focus campaigns around events, offers, and occupancy.", tone: "blue" },
      { label: "Re-engage guests", service: "Automation", copy: "Bring past visitors back with timely follow-up.", tone: "primary" },
      { label: "Grow bookings", service: "Output", copy: "Know which pushes create visits and reservations.", tone: "primary" },
    ],
    outcomesTitle: "The booking decisions your team can make faster.",
    outcomesDescription: "The goal is clearer demand visibility before key dates pass.",
    outcomeItems: [
      { label: "Which campaigns drive bookings?", value: "Booking source", description: "See what creates reservation intent and enquiries." },
      { label: "What offers need budget?", value: "Demand window", description: "Move spend around events and seasonal peaks." },
      { label: "Who should return?", value: "Guest reactivation", description: "Use past visitors for repeat bookings and offers." },
      { label: "What should repeat?", value: "Promotion learning", description: "Compare campaign pushes across locations or events." },
    ],
    fitIntro: "ATD works best when your venue or hospitality team needs clearer booking demand and repeat engagement.",
    fitItems: [
      "You run campaigns for bookings, visits, events, or seasonal offers.",
      "You cannot clearly see which campaigns create commercial activity.",
      "Past guests are not being re-engaged consistently.",
      "You need faster reporting during short demand windows.",
    ],
    notFitYet: [
      "You are not ready to review booking, website, or campaign access.",
      "You only want more reach without improving booking visibility.",
      "Your team cannot act on campaign and guest data.",
    ],
    faqTitle: "Hospitality growth FAQs.",
    closeCtaTitle: "Talk through your booking growth gaps.",
  },
  "real-estate": {
    hero: makeHero(
      "real-estate-pipeline",
      "real-estate",
      "Real Estate Lead Expertise",
      "Turn property enquiries into a clearer sales pipeline",
      "pipeline",
      "Real estate teams need to know which sources create serious enquiries, viewings, and sales conversations. We connect lead tracking, paid media, and agent follow-up.",
      "real-estate",
    ),
    challengeTitle: "Where real estate lead generation usually breaks.",
    challengeDescription: "More enquiries are not enough if the team cannot see source quality or respond quickly.",
    challengeCards: [
      { title: "Lead quality is hard to compare", description: "Portals, ads, organic enquiries, and referrals bring different intent levels, but reporting often treats them the same." },
      { title: "Agent handoff is too slow", description: "New enquiries lose momentum when routing, alerts, and follow-up depend on manual checks." },
      { title: "Campaign spend lacks pipeline feedback", description: "Budgets go into lead generation without enough visibility into viewings, qualified buyers, or next steps." },
    ],
    systemTitle: "The property lead system we help connect.",
    systemDescription: "We connect source tracking, paid lead generation, CRM handoff, and follow-up around serious buyer or tenant intent.",
    systemSteps: [
      { label: "Track enquiries", service: "Tracking", copy: "Connect forms, calls, portals, and viewing requests.", tone: "secondary" },
      { label: "Improve lead fit", service: "Paid Media", copy: "Attract stronger buyers, tenants, or investors.", tone: "blue" },
      { label: "Route faster", service: "Automation", copy: "Alert the right agent and keep prospects warm.", tone: "primary" },
      { label: "Grow pipeline", service: "Output", copy: "Know which sources create serious opportunities.", tone: "primary" },
    ],
    outcomesTitle: "The property marketing decisions your team can make.",
    outcomesDescription: "The goal is clearer source quality and faster handling of serious enquiries.",
    outcomeItems: [
      { label: "Which sources create serious leads?", value: "Lead quality", description: "Compare campaigns by enquiry quality, not just volume." },
      { label: "Who needs an agent now?", value: "Handoff priority", description: "Spot high-intent enquiries before they go cold." },
      { label: "Where should budget move?", value: "Source clarity", description: "Shift spend toward better viewing and pipeline signals." },
      { label: "What should scale?", value: "Property demand", description: "See which listings, locations, or segments create demand." },
    ],
    fitIntro: "ATD works best when real estate teams want better lead quality, source clarity, and follow-up.",
    fitItems: [
      "You generate enquiries from portals, ads, forms, or listing pages.",
      "You cannot clearly see which sources produce serious leads.",
      "Your agent follow-up is slower or less consistent than it should be.",
      "You need cleaner reporting before a launch or campaign push.",
    ],
    notFitYet: [
      "You are not ready to review CRM, ad, or website access.",
      "You only want more leads without improving qualification.",
      "No one can own lead handling after campaigns go live.",
    ],
    faqTitle: "Real estate lead FAQs.",
    closeCtaTitle: "Talk through your property lead gaps.",
  },
  fashion: {
    hero: makeHero(
      "fashion-launch",
      "fashion",
      "Fashion Growth Expertise",
      "Turn launch attention into measurable sales",
      "sales",
      "Fashion brands need launches, creators, ads, and retention journeys to connect back to revenue. We help track demand and keep shoppers moving after the first touch.",
      "fashion",
    ),
    challengeTitle: "Where fashion launch demand usually gets lost.",
    challengeDescription: "Attention is useful only when it connects to product interest, sales, and repeat purchase.",
    challengeCards: [
      { title: "Launch buzz is hard to measure", description: "Creators, social, ads, email, and product pages create demand, but sales source data can stay unclear." },
      { title: "Paid spend can hide waste", description: "Campaigns may drive traffic and carts without enough clarity on profitability or repeat purchase." },
      { title: "Retention is often too manual", description: "Post-purchase, cart recovery, product interest, and win-back flows need more structure." },
    ],
    systemTitle: "The launch-to-retention system we help build.",
    systemDescription: "We connect product demand, paid media, and retention flows so launches become measurable growth.",
    systemSteps: [
      { label: "Track demand", service: "Tracking", copy: "Connect product views, carts, orders, and launches.", tone: "secondary" },
      { label: "Push winners", service: "Paid Media", copy: "Spend around collections and products that convert.", tone: "blue" },
      { label: "Bring shoppers back", service: "Automation", copy: "Use cart, post-purchase, and win-back flows.", tone: "primary" },
      { label: "Scale drops", service: "Output", copy: "Know which launch signals deserve more budget.", tone: "primary" },
    ],
    outcomesTitle: "The fashion growth decisions your team can make.",
    outcomesDescription: "The goal is knowing which launch activity creates demand, sales, and repeat purchase.",
    outcomeItems: [
      { label: "Which launch channels worked?", value: "Launch source", description: "Connect creators, ads, and email to product demand." },
      { label: "Which products should scale?", value: "Product signal", description: "See what converts from interest to purchase." },
      { label: "Where are shoppers dropping?", value: "Cart gaps", description: "Spot recovery and retention opportunities." },
      { label: "Who should come back?", value: "Repeat demand", description: "Use first-party journeys to drive repeat purchase." },
    ],
    fitIntro: "ATD works best when fashion brands want cleaner launch reporting and stronger retention.",
    fitItems: [
      "You run collection launches, campaigns, or creator-led pushes.",
      "You cannot clearly see which activity creates sales.",
      "Your cart recovery or post-purchase flows need improvement.",
      "You want to scale paid media with better revenue data.",
    ],
    notFitYet: [
      "You are not ready to review store, ad, or email access.",
      "You only want more traffic without improving conversion.",
      "Your store has too little activity to read campaign patterns.",
    ],
    faqTitle: "Fashion growth FAQs.",
    closeCtaTitle: "Talk through your fashion growth gaps.",
  },
  gaming: {
    hero: makeHero(
      "gaming-community",
      "gaming",
      "Gaming Growth Expertise",
      "Turn attention into trackable community growth",
      "community",
      "Gaming teams need launch attention to become wishlists, signups, community joins, and event participation. We connect campaign tracking, paid acquisition, and follow-up journeys.",
      "gaming",
    ),
    challengeTitle: "Where gaming campaigns lose the player signal.",
    challengeDescription: "Attention is visible, but teams often need cleaner tracking from campaign touchpoints into community and launch actions.",
    challengeCards: [
      { title: "Buzz does not equal growth", description: "Views, trailer clicks, and social engagement need to connect to wishlists, signups, and community actions." },
      { title: "Launch data is scattered", description: "Paid media, creators, landing pages, Discord, email, and event tools often report separately." },
      { title: "Community follow-up is inconsistent", description: "Interested players need updates, reminders, and onboarding after the first action." },
    ],
    systemTitle: "The player-growth system we help connect.",
    systemDescription: "We connect launch tracking, paid acquisition, community actions, and follow-up around the player journey.",
    systemSteps: [
      { label: "Track actions", service: "Tracking", copy: "Measure wishlists, signups, Discord joins, and events.", tone: "secondary" },
      { label: "Grow intent", service: "Paid Media", copy: "Reach players likely to join, register, or wishlist.", tone: "blue" },
      { label: "Keep interest warm", service: "Automation", copy: "Send updates, reminders, and launch follow-up.", tone: "primary" },
      { label: "Scale community", service: "Output", copy: "Know which activity creates real player growth.", tone: "primary" },
    ],
    outcomesTitle: "The gaming growth decisions your team can make.",
    outcomesDescription: "The goal is cleaner visibility from launch attention to community and player actions.",
    outcomeItems: [
      { label: "Which channels create players?", value: "Action source", description: "Connect campaigns to signups, wishlists, and community joins." },
      { label: "What content pulls intent?", value: "Creative signal", description: "See which trailers, messages, or pages create action." },
      { label: "Who needs follow-up?", value: "Community nurture", description: "Keep interested players warm before launch or events." },
      { label: "Where should we scale?", value: "Launch confidence", description: "Increase spend around clearer player signals." },
    ],
    fitIntro: "ATD works best when gaming teams want campaign attention to become measurable community growth.",
    fitItems: [
      "You are promoting a launch, event, title, or community.",
      "You need to connect campaigns to signups or wishlists.",
      "Your audience journey spans multiple platforms.",
      "You need practical tracking before scaling spend.",
    ],
    notFitYet: [
      "You are not ready to define the player actions that matter.",
      "You only want awareness without tracking community growth.",
      "No one can own campaign and community follow-up.",
    ],
    faqTitle: "Gaming growth FAQs.",
    closeCtaTitle: "Talk through your gaming growth gaps.",
  },
};

const ChallengeDiagnosticVisual = ({
  expertiseName,
  profile,
}: {
  expertiseName: string;
  profile?: ExpertiseProfile;
}) => {
  const stages = profile
    ? profile.systemSteps.map((step, index) => ({
        label: step.label,
        detail: step.service.toLowerCase(),
        tone: index === 0 ? "secondary" : index === 1 ? "blue" : index === 3 ? "primary" : "muted",
      }))
    : [
        { label: "Traffic", detail: "where leads came from", tone: "secondary" },
        { label: "Signup", detail: "what they did", tone: "blue" },
        { label: "CRM", detail: "what sales knows", tone: "muted" },
        { label: "Pipeline", detail: "what turned into revenue", tone: "primary" },
      ];
  const gapLabels = profile ? ["visibility gap", "quality gap", "handoff gap"] : ["source unclear", "wrong-fit leads", "slow follow-up"];

  return (
    <div className="relative mx-auto mt-10 w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080d16] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(0,175,239,0.11),transparent_32%),radial-gradient(circle_at_82%_78%,rgba(51,204,153,0.10),transparent_30%)]" />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {profile ? `${expertiseName} signal map` : "Growth leak map"}
          </p>
          <span className="rounded-full border border-primary/20 bg-primary/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
            start here
          </span>
        </div>

        <div className="relative py-4 md:py-6">
          <svg className="pointer-events-none absolute inset-x-4 top-1/2 hidden h-24 -translate-y-1/2 md:block" viewBox="0 0 920 120" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="challengeSignal" x1="0" x2="920" y1="60" y2="60">
                <stop stopColor="#00afef" stopOpacity="0.55" />
                <stop offset="0.52" stopColor="#003399" stopOpacity="0.54" />
                <stop offset="1" stopColor="#33cc99" stopOpacity="0.58" />
              </linearGradient>
            </defs>
            <path d="M35 60H885" stroke="url(#challengeSignal)" strokeWidth="2" />
            <path d="M35 74H885" stroke="url(#challengeSignal)" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.16" />
            {[300, 512, 724].map((x) => (
              <g key={x}>
                <circle cx={x} cy="60" r="15" fill="#080d16" stroke="rgba(0,175,239,0.52)" />
                <path d={`M${x - 7} 60H${x + 7}`} stroke="#33cc99" strokeWidth="2" strokeLinecap="round" />
              </g>
            ))}
          </svg>

          <div className="relative grid gap-3 md:grid-cols-[1.05fr_6.4rem_1.05fr_6.4rem_1.05fr_6.4rem_1.1fr] md:items-center">
            {stages.map((stage, index) => (
              <div key={stage.label} className="contents">
                <div
                  className={cn(
                    "relative z-10 min-h-[5.35rem] rounded-xl border bg-[#111724]/95 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md",
                    stage.tone === "secondary" && "border-secondary/30 shadow-secondary/[0.08]",
                    stage.tone === "blue" && "border-atd-blue/35",
                    stage.tone === "muted" && "border-white/[0.08]",
                    stage.tone === "primary" && "border-primary/35 shadow-primary/[0.12]",
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-xl",
                      stage.tone === "secondary" && "bg-secondary/18 opacity-100",
                      stage.tone === "primary" && "bg-primary/18 opacity-100",
                    )}
                  />
                  <p
                    className={cn(
                      "relative text-[11px] font-bold leading-5 text-muted-foreground",
                      stage.tone === "secondary" && "text-secondary/85",
                      stage.tone === "blue" && "text-secondary/85",
                      stage.tone === "muted" && "text-muted-foreground",
                      stage.tone === "primary" && "text-primary/85",
                    )}
                  >
                    {stage.detail}
                  </p>
                  <p className="relative mt-2 text-base font-extrabold text-foreground">{stage.label}</p>
                  {index === 3 && (
                    <span className="relative mt-3 inline-flex rounded-full bg-primary/[0.1] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                      ready to scale
                    </span>
                  )}
                </div>

                {index < 3 && (
                  <div className="relative z-10 flex items-center justify-center rounded-xl border border-dashed border-secondary/20 bg-white/[0.022] px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/72 md:min-h-[3.1rem]">
                    <span className="absolute -left-2 top-1/2 h-px w-3 -translate-y-1/2 bg-[#080d16]" />
                    <span className="absolute -right-2 top-1/2 h-px w-3 -translate-y-1/2 bg-[#080d16]" />
                    {gapLabels[index]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpertiseChallengesSection = ({
  expertiseName,
  challenges,
  profile,
}: {
  expertiseName: string;
  challenges: string[];
  profile?: ExpertiseProfile;
}) => {
  const challengeDetails =
    profile?.challengeCards ??
    (expertiseName === "SaaS"
      ? saasChallengeDetails
      : challenges.map((challenge, index) => ({
          title: `Challenge ${index + 1}`,
          description: challenge,
        })));

  return (
    <PageSection mode="content" spacing="spacious" className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(5,8,14,0.22)_0%,rgba(0,175,239,0.008)_58%,rgba(5,8,14,0.16)_100%)] py-10 md:py-20">
      <SectionIntro
        eyebrow="Common Challenges"
        mode="content"
        align="center"
        title={profile?.challengeTitle ?? (expertiseName === "SaaS" ? "Where SaaS growth usually breaks down." : `The challenges most ${expertiseName} teams face.`)}
        description={profile?.challengeDescription ?? (expertiseName === "SaaS" ? "Most teams do not need more traffic first. They need to know which leads are worth chasing and what happens after someone signs up." : "These are the problems that hold back growth the most.")}
        maxWidth="lg"
        className="mx-auto"
        titleClassName="text-2xl leading-[1.18] md:text-[2.15rem]"
        descriptionClassName="mt-3 text-[13px] leading-6 md:text-base md:leading-7"
      />

      <div className="hidden md:block">
        <ChallengeDiagnosticVisual expertiseName={expertiseName} profile={profile} />
      </div>

      <div className="mt-7 grid gap-2.5 md:hidden">
        {challengeDetails.map((challenge, index) => (
          <div key={challenge.title} className="rounded-xl border border-white/[0.07] bg-white/[0.018] p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-secondary/80">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-[15px] font-bold leading-tight text-foreground">{challenge.title}</h3>
                <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">{challenge.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mx-auto mt-7 hidden max-w-6xl gap-3 md:mt-9 md:grid md:grid-cols-3 md:gap-0 md:border-y md:border-white/[0.07]">
        <div className="pointer-events-none absolute -top-9 left-[16.66%] h-9 w-px bg-gradient-to-b from-secondary/25 to-transparent" />
        <div className="pointer-events-none absolute -top-9 left-1/2 h-9 w-px bg-gradient-to-b from-secondary/18 to-transparent" />
        <div className="pointer-events-none absolute -top-9 right-[16.66%] h-9 w-px bg-gradient-to-b from-primary/24 to-transparent" />
        {challengeDetails.map((challenge, index) => (
          <div
            key={challenge.title}
            className="relative rounded-xl border border-white/[0.07] bg-white/[0.018] p-4 md:rounded-none md:border-y-0 md:border-l-0 md:border-r md:bg-transparent md:p-6 md:last:border-r-0"
          >
            <div className="pointer-events-none absolute left-6 top-0 h-px w-12 bg-gradient-to-r from-secondary/45 to-transparent" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary/80">
              0{index + 1}
            </span>
            <h3 className="mt-3 text-base font-bold leading-tight text-foreground md:mt-4 md:text-xl">
              {challenge.title}
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground md:text-[15px] md:leading-7">
              {challenge.description}
            </p>
          </div>
        ))}
      </div>
    </PageSection>
  );
};

const ExpertiseOperatingSystemSection = ({
  expertiseName,
  profile,
}: {
  expertiseName: string;
  profile?: ExpertiseProfile;
}) => {
  const systemSteps = profile?.systemSteps ?? saasSystemSteps;

  return (
    <PageSection id="how-we-work" mode="content" spacing="spacious" className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.006)_0%,rgba(4,8,14,0.18)_100%)] py-10 md:py-20">
      <SectionIntro
        eyebrow="How We Help"
        mode="content"
        align="center"
        title={profile?.systemTitle ?? (expertiseName === "SaaS" ? "The three fixes that make SaaS growth easier to scale." : `How we help ${expertiseName} businesses grow.`)}
        description={profile?.systemDescription ?? "We connect tracking, paid media, and follow-up so your team can make better growth decisions faster."}
        maxWidth="lg"
        className="mx-auto mb-7 md:mb-12"
        titleClassName="text-2xl leading-[1.18] md:text-[2.15rem]"
        descriptionClassName="mt-3 text-[13px] leading-6 md:text-base md:leading-7"
      />

    <div className="grid grid-cols-2 gap-3 md:hidden">
      {systemSteps.map((step) => (
        <div key={step.label} className="rounded-xl border border-white/[0.08] bg-[#111724]/94 p-3">
          <p
            className={cn(
              "text-[9px] font-bold uppercase tracking-[0.14em]",
              step.tone === "secondary" && "text-secondary",
              step.tone === "blue" && "text-secondary",
              step.tone === "primary" && "text-primary",
            )}
          >
            {step.service}
          </p>
          <h3 className="mt-1.5 text-[14px] font-extrabold leading-tight text-foreground">{step.label}</h3>
          <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">{step.copy}</p>
        </div>
      ))}
    </div>

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      className="mx-auto hidden max-w-6xl md:block"
    >
      <motion.div
        custom={0}
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080d16] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_40%,rgba(0,175,239,0.10),transparent_28%),radial-gradient(circle_at_86%_56%,rgba(51,204,153,0.10),transparent_28%)]" />
        <svg className="pointer-events-none absolute inset-x-8 top-1/2 hidden h-16 -translate-y-1/2 opacity-80 lg:block" viewBox="0 0 1020 80" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="systemLine" x1="0" x2="1020" y1="40" y2="40">
              <stop stopColor="#00afef" stopOpacity="0.55" />
              <stop offset="0.5" stopColor="#003399" stopOpacity="0.5" />
              <stop offset="1" stopColor="#33cc99" stopOpacity="0.58" />
            </linearGradient>
          </defs>
          <path d="M26 40H994" stroke="url(#systemLine)" strokeWidth="2" />
          <path d="M26 52H994" stroke="url(#systemLine)" strokeWidth="10" strokeOpacity="0.12" strokeLinecap="round" />
        </svg>

        <div className="relative grid grid-cols-2 gap-3 lg:grid-cols-[1fr_3rem_1fr_3rem_1fr_3rem_1fr] lg:items-stretch">
          {systemSteps.map((step, index) => (
            <div key={step.label} className="contents">
              <div
                className={cn(
                  "relative z-10 rounded-xl border bg-[#111724]/94 p-3 shadow-[0_14px_42px_rgba(0,0,0,0.26)] md:p-4",
                  step.tone === "secondary" && "border-secondary/25",
                  step.tone === "blue" && "border-atd-blue/30",
                  step.tone === "primary" && "border-primary/25",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.16em]",
                    step.tone === "secondary" && "text-secondary",
                    step.tone === "blue" && "text-secondary",
                    step.tone === "primary" && "text-primary",
                  )}
                >
                  {step.service}
                </p>
                <h3 className="mt-2 text-[14px] font-extrabold leading-tight text-foreground md:text-base">{step.label}</h3>
                <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground md:mt-2 md:text-sm md:leading-6">{step.copy}</p>
              </div>

              {index < 3 && (
                <div className="relative z-10 hidden items-center justify-center text-secondary lg:flex">
                  <span className="text-sm font-extrabold leading-none">-&gt;</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
    </PageSection>
  );
};

const ExpertiseDecisionDashboardSection = ({
  expertiseName,
  outcomes,
  proofNotes,
  profile,
}: {
  expertiseName: string;
  outcomes: string[];
  proofNotes?: string[];
  profile?: ExpertiseProfile;
}) => {
  const dashboardItems =
    profile?.outcomeItems ??
    (expertiseName === "SaaS"
      ? [
          {
            label: "Where should we spend more?",
            value: "Best lead sources",
            description: "See which campaigns bring people who are more likely to buy.",
          },
          {
            label: "Which leads should sales chase?",
            value: "Lead quality",
            description: "Separate serious prospects from signups that will never move forward.",
          },
          {
            label: "Where are leads getting stuck?",
            value: "Follow-up gaps",
            description: "Spot where leads slow down after a signup, demo request, or CRM handoff.",
          },
          {
            label: "Are we ready to scale?",
            value: "Trusted numbers",
            description: "Increase spend with clearer tracking instead of guessing from ad reports.",
          },
        ]
      : (proofNotes && proofNotes.length > 0 ? proofNotes : outcomes).slice(0, 4).map((item) => ({
          label: "Decision",
          value: item,
          description: item,
        })));

  return (
    <PageSection mode="content" spacing="spacious" className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(0,175,239,0.006)_0%,rgba(51,204,153,0.008)_58%,rgba(5,8,14,0.14)_100%)] py-10 md:py-20">
      <SectionIntro
        eyebrow="Outcomes"
        mode="content"
        align="center"
        title={profile?.outcomesTitle ?? (expertiseName === "SaaS" ? "The questions your team can finally answer." : "What to expect from the work.")}
        description={profile?.outcomesDescription ?? "The point is not another report. It is knowing what to fix, who to follow up with, and what to scale next."}
        maxWidth="lg"
        className="mx-auto mb-7 md:mb-9"
        titleClassName="text-2xl leading-[1.18] md:text-[2.15rem]"
        descriptionClassName="mt-3 text-[13px] leading-6 md:text-base md:leading-7"
      />

      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080d16] shadow-[0_24px_80px_rgba(0,0,0,0.26)]">
        <div className="hidden flex-col gap-3 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:flex">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Decision view</p>
            <p className="mt-1 text-sm text-muted-foreground">Clear answers for the next growth decision.</p>
          </div>
          <span className="rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            ready to act
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/[0.06] lg:grid-cols-4">
          {dashboardItems.map((item, index) => (
            <div key={`${item.label}-${index}`} className="bg-[#0b111c] p-3 md:p-5">
              <div className="mb-2.5 flex items-center justify-between md:mb-5">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-secondary/80">
                  0{index + 1}
                </span>
                <CheckCircle2 className="h-4 w-4 text-primary md:h-5 md:w-5" />
              </div>
              <p className="text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-primary/80 md:text-[11px] md:tracking-[0.16em]">{item.label}</p>
              <h3 className="mt-1 text-[14px] font-extrabold leading-tight text-foreground md:mt-2 md:text-xl">{item.value}</h3>
              <p className="mt-2 hidden text-[12px] leading-5 text-muted-foreground md:mt-3 md:block md:text-sm md:leading-6">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PageSection>
  );
};

const ExpertiseFitSection = ({
  expertiseName,
  idealFor,
  search,
  profile,
}: {
  expertiseName: string;
  idealFor: string[];
  search: string;
  profile?: ExpertiseProfile;
}) => {
  const isSaas = expertiseName === "SaaS";
  const strategyCallTo = withCampaignSearch(BOOK_A_FREE_STRATEGY_CALL_CTA.to, search);
  const fitItems = profile?.fitItems ?? (isSaas
    ? [
        "You run ads but cannot see which ones create real pipeline.",
        "Leads come in, but follow-up is slow or inconsistent.",
        "You want to spend more, but need to trust the numbers first.",
        "Your team is growing and needs tracking before scaling.",
      ]
    : idealFor.slice(0, 4));
  const notFitYet =
    profile?.notFitYet ??
    (isSaas
      ? [
          "You are not ready to review tracking, CRM, or campaign access yet.",
          "You only want more traffic without fixing measurement or follow-up.",
          "No one on your team can own the next steps after the call.",
        ]
      : [
          "You are not ready to review the systems behind growth.",
          "You only want more traffic without fixing visibility or follow-up.",
          "There is no owner for acting on the data.",
        ]);

  return (
    <PageSection mode="content" spacing="spacious" className="relative overflow-hidden py-10 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(51,204,153,0.026),transparent_34%)]" />
      <div className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Fit check</p>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-foreground md:mt-4 md:text-3xl">
            Is this the right fit?
          </h2>
          <p className="mt-3 text-[13px] leading-6 text-muted-foreground md:text-base md:leading-7">
            {profile?.fitIntro ?? "ATD works best when you are ready to fix how growth works, not just buy more traffic."}
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-primary/20 bg-[linear-gradient(145deg,rgba(51,204,153,0.08),rgba(0,175,239,0.025)_48%,rgba(255,255,255,0.018))] p-5 md:hidden">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Good fit</p>
          <h3 className="mt-3 text-xl font-bold leading-tight text-foreground">This works best when...</h3>
          <div className="mt-4 grid gap-2.5">
            {fitItems.map((item) => (
              <div key={item} className="flex gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <p className="text-[13px] leading-6 text-foreground/86">{item}</p>
              </div>
            ))}
          </div>
          <details className="mt-4 rounded-xl border border-white/[0.08] bg-black/10 px-4 py-3">
            <summary className="cursor-pointer text-[12px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Hold off if
            </summary>
            <div className="mt-3 grid gap-2.5">
              {notFitYet.map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-3 h-px w-4 shrink-0 bg-muted-foreground/45" />
                  <p className="text-[13px] leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </details>
        </div>

        <div className="mt-7 hidden gap-4 md:mt-9 md:grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-2xl border border-primary/24 bg-[linear-gradient(145deg,rgba(51,204,153,0.09),rgba(0,175,239,0.035)_42%,rgba(255,255,255,0.025))] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.22)] md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Good fit</p>
            <h3 className="mt-3 text-xl font-bold leading-tight text-foreground md:mt-4 md:text-3xl">
              This works best when...
            </h3>
            <div className="mt-4 grid gap-2.5 md:mt-6 md:gap-3.5">
              {fitItems.map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[13px] leading-6 text-foreground/86 md:text-sm md:leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.022] p-5 md:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Hold off if
            </p>
            <h3 className="mt-3 text-xl font-bold leading-tight text-foreground/92 md:mt-4 md:text-3xl">
              Wait until these are clear.
            </h3>
            <div className="mt-4 grid gap-2.5 md:mt-6 md:gap-3.5">
              {notFitYet.map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-3 h-px w-4 shrink-0 bg-muted-foreground/45" />
                  <p className="text-[13px] leading-6 text-muted-foreground md:text-sm md:leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-5 hidden max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4 text-center sm:flex-row sm:justify-between sm:text-left md:mt-7 md:flex md:py-5">
          <p className="text-sm font-semibold text-foreground/88">Not sure where you fit? Book a free strategy call.</p>
          <Link
            to={strategyCallTo}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Book A Free Strategy Call
          </Link>
        </div>
      </div>
    </PageSection>
  );
};

const ExpertiseCloseCta = ({
  expertiseName,
  search,
  profile,
}: {
  expertiseName: string;
  search: string;
  profile?: ExpertiseProfile;
}) => {
  const strategyCallTo = withCampaignSearch(BOOK_A_FREE_STRATEGY_CALL_CTA.to, search);

  return (
    <section className="relative overflow-hidden border-t border-white/10 py-5 md:py-[4.75rem]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01)_0%,rgba(0,175,239,0.025)_45%,rgba(51,204,153,0.035)_100%)]" />
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="relative mx-auto max-w-[66rem] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-7 md:px-9 md:py-10">
          <div className="pointer-events-none absolute inset-x-[16%] top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
          <div className="grid gap-7 text-center lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center lg:text-left">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Expertise check</p>
              <h2 className="mx-auto mt-3 max-w-[15ch] text-[2.1rem] font-extrabold leading-[1.12] tracking-normal text-foreground md:text-[2.65rem] lg:mx-0 lg:text-[3rem]">
                {renderCloseCtaTitle(profile?.closeCtaTitle ?? `Talk through your ${expertiseName} growth gaps.`)}
              </h2>
            </div>

            <div className="grid justify-items-center lg:justify-items-end">
              <Link
                to={strategyCallTo}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:px-8"
              >
                Book A Free Strategy Call
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ExpertiseDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const expertise = slug ? getExpertiseBySlug(slug) : undefined;

  if (!expertise) {
    return (
      <>
        <SEO
          title="Expertise | AlphaTrack Digital"
          description="Explore the industries AlphaTrack Digital supports across tracking, paid media, and automation."
          canonicalUrl="/expertise"
        />
        <PageSection mode="hero" spacing="compact">
          <SectionIntro
            as="h1"
            eyebrow="Expertise"
            mode="hero"
            title="That expertise page could not be found."
            description="Go back to the homepage or explore our services to see where AlphaTrack Digital can help."
            maxWidth="lg"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Back to Home
            </Link>
            <Link
              to="/service"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-foreground"
            >
              Explore Services
            </Link>
          </div>
        </PageSection>
      </>
    );
  }

  const profile = expertiseProfiles[expertise.slug];
  const expertiseHeroContent = expertise.expertiseHero ?? profile?.hero;
  const expertiseBackgroundKey = expertiseHeroContent?.background ?? "saas";
  const expertisePageBackground = expertisePageBackgrounds[expertiseBackgroundKey];

  return (
    <>
      <SEO
        title={`${expertise.name} Marketing | AlphaTrack Digital`}
        description={expertise.heroDescription}
        canonicalUrl={`/expertise/${expertise.slug}`}
      />

      <div className="relative overflow-hidden" style={{ background: expertisePageBackground }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:radial-gradient(circle,rgba(0,175,239,0.8)_1px,transparent_1.5px)] [background-size:36px_36px] [mask-image:linear-gradient(180deg,transparent_0%,black_18%,black_40%,transparent_88%)]" />
        <div className="pointer-events-none absolute left-[-12rem] top-[30rem] h-[34rem] w-[34rem] rounded-full bg-secondary/[0.02] blur-[120px]" />
        <div className="pointer-events-none absolute right-[-10rem] top-[74rem] h-[36rem] w-[36rem] rounded-full bg-primary/[0.024] blur-[130px]" />
        <div className="relative">
          {expertiseHeroContent ? (
            <ExpertiseHero
              content={expertiseHeroContent}
              expertiseName={expertise.name}
              search={location.search}
            />
          ) : (
            <ServiceHero
              breadcrumbs={[
                { label: "Expertise", path: "/expertise" },
                { label: expertise.name },
              ]}
              badgeLabel={`${expertise.name} Expertise`}
              title={expertise.heroTitle}
              description={expertise.heroDescription}
              snapshot={expertise.heroSnapshot}
              tone="tracking"
              bodyWidth="wide"
              primaryCta={BOOK_A_FREE_STRATEGY_CALL_CTA}
              secondaryCta={{ ...EXPLORE_SERVICES_CTA, style: "outline" }}
            />
          )}

          <GradientRule />

          <ExpertiseChallengesSection expertiseName={expertise.name} challenges={expertise.challenges} profile={profile} />

          <GradientRule />

          <ExpertiseOperatingSystemSection expertiseName={expertise.name} profile={profile} />

          <GradientRule />

          <ExpertiseDecisionDashboardSection
            expertiseName={expertise.name}
            outcomes={expertise.outcomes}
            proofNotes={expertise.proofNotes}
            profile={profile}
          />

          <GradientRule />

          <ExpertiseFitSection expertiseName={expertise.name} idealFor={expertise.idealFor} search={location.search} profile={profile} />

          <GradientRule />

          <FAQAccordion
            items={expertise.faqs}
            eyebrow="FAQ"
            title={profile?.faqTitle ?? (expertise.name === "SaaS" ? "SaaS growth tracking FAQs." : `Common questions about ${expertise.name} marketing.`)}
            description="Have a question we have not covered? Book a call and we will walk you through it."
            variant="minimal"
            density="compact"
            defaultOpenItem={0}
            contentClassName="max-w-[46rem]"
            accordionClassName="space-y-3"
            mobileInitialItems={3}
          />

          <ExpertiseCloseCta expertiseName={expertise.name} search={location.search} profile={profile} />
        </div>
      </div>
    </>
  );
};

export default ExpertiseDetail;
