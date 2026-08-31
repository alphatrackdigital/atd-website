import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  BarChart3,
  Check,
  CheckCircle2,
  Code2,
  Gauge,
  Globe2,
  Loader2,
  Moon,
  Route,
  Sun,
  Send,
  ShieldCheck,
} from "lucide-react";

import SEO from "@/components/shared/SEO";
import FAQAccordion, { type FAQItem } from "@/components/shared/FAQAccordion";
import HeroEyebrow from "@/components/shared/HeroEyebrow";
import PageSection from "@/components/shared/PageSection";
import SectionIntro from "@/components/shared/SectionIntro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companyProfile } from "@/data/companyProfile";
import { submitLead } from "@/lib/leads";
import { withCampaignSearch } from "@/lib/campaignAttribution";
import { pushLeadSubmissionEvent } from "@/lib/tracking";

const normalizeWebsiteUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const isValidWebsiteUrl = (value: string) => {
  try {
    const url = new URL(normalizeWebsiteUrl(value));
    const hostname = url.hostname.toLowerCase();

    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (!hostname.includes(".") || hostname.startsWith(".") || hostname.endsWith(".")) return false;
    if (hostname === "localhost" || hostname.includes("..")) return false;

    const labels = hostname.split(".");
    const validLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    if (labels.some((label) => !validLabel.test(label))) return false;

    const topLevelDomain = labels.at(-1) ?? "";
    return /^[a-z]{2,63}$/i.test(topLevelDomain) || /^xn--[a-z0-9-]{2,59}$/i.test(topLevelDomain);
  } catch {
    return false;
  }
};

const auditSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().min(1, "Required").max(200),
  websiteUrl: z
    .string()
    .trim()
    .min(1, "Enter your website")
    .max(500)
    .refine(isValidWebsiteUrl, "Enter a valid website, e.g. company.com"),
  industry: z.enum(["professional_services", "education_training", "ecommerce_dtc", "real_estate", "other"], {
    required_error: "Select your industry",
  }),
  role: z.enum(["founder_ceo", "marketing_lead", "growth_performance", "operations_commercial", "other"], {
    required_error: "Select your role",
  }),
  decisionInfluence: z.enum(["final_decision_maker", "strong_influence", "contributor", "researching"], {
    required_error: "Select your decision role",
  }),
  monthlyAdSpendBand: z.enum(
    ["paused_or_not_spending", "under_1500", "1500_2999", "3000_5999", "6000_14999", "15000_plus", "not_sure"],
    { required_error: "Select a spend range" },
  ),
  adPlatforms: z.array(z.enum(["meta_ads", "google_ads", "microsoft_ads", "linkedin_ads", "tiktok_ads", "other", "none_currently"])).min(1, "Select at least one option"),
  trackingMaturity: z.enum(["not_sure", "basic", "partial", "disconnected", "confident"], {
    required_error: "Select your tracking confidence",
  }),
  primaryConversionType: z.enum(["lead_form", "booked_call_appointment", "whatsapp_message", "ecommerce_purchase", "application_enrolment", "other"], {
    required_error: "Select your main conversion",
  }),
  measurementProblem: z.enum(["unclear_campaign_performance", "conflicting_numbers", "missing_conversion_tracking", "leads_without_attribution", "browser_server_signal_gap", "other"], {
    required_error: "Select the closest issue",
  }),
  urgency: z.enum(["before_scaling", "within_30_days", "one_to_three_months", "exploring"], {
    required_error: "Select your timing",
  }),
  marketingOptIn: z.boolean().optional().default(false),
});

type AuditFormData = z.infer<typeof auditSchema>;
type AuditPlatform = AuditFormData["adPlatforms"][number];

const ROLE_OPTIONS = [
  { value: "founder_ceo", label: "Founder / Managing Partner" },
  { value: "marketing_lead", label: "Marketing / Business Development" },
  { value: "growth_performance", label: "Growth / Performance" },
  { value: "operations_commercial", label: "Operations / Commercial" },
  { value: "other", label: "Other" },
] as const;

const DECISION_OPTIONS = [
  { value: "final_decision_maker", label: "I make the decision" },
  { value: "strong_influence", label: "I help choose" },
  { value: "contributor", label: "I’m contributing" },
  { value: "researching", label: "I’m researching" },
] as const;

const SPEND_OPTIONS = [
  { value: "paused_or_not_spending", label: "Not spending" },
  { value: "under_1500", label: "Under GHS 1.5k" },
  { value: "1500_2999", label: "GHS 1.5k–3k" },
  { value: "3000_5999", label: "GHS 3k–6k" },
  { value: "6000_14999", label: "GHS 6k–15k" },
  { value: "15000_plus", label: "GHS 15k+" },
  { value: "not_sure", label: "Not sure" },
] as const;

const PLATFORM_OPTIONS: Array<{ value: AuditPlatform; label: string }> = [
  { value: "meta_ads", label: "Meta" },
  { value: "google_ads", label: "Google" },
  { value: "microsoft_ads", label: "Microsoft" },
  { value: "linkedin_ads", label: "LinkedIn" },
  { value: "tiktok_ads", label: "TikTok" },
  { value: "other", label: "Other" },
  { value: "none_currently", label: "None currently" },
];

const MATURITY_OPTIONS = [
  { value: "not_sure", label: "Not sure" },
  { value: "basic", label: "Some tracking, low confidence" },
  { value: "partial", label: "Partly clear" },
  { value: "disconnected", label: "Often unclear" },
  { value: "confident", label: "Clear — want validation" },
] as const;

const CONVERSION_OPTIONS = [
  { value: "lead_form", label: "Website enquiry form" },
  { value: "booked_call_appointment", label: "Booked call / consultation" },
  { value: "whatsapp_message", label: "WhatsApp / message" },
  { value: "other", label: "Other enquiry action" },
] as const;

const PROBLEM_OPTIONS = [
  { value: "unclear_campaign_performance", label: "I can’t tell which ads bring enquiries" },
  { value: "conflicting_numbers", label: "Ads and analytics don’t agree" },
  { value: "missing_conversion_tracking", label: "Some enquiries aren’t tracked" },
  { value: "leads_without_attribution", label: "We get leads but lose the source" },
  { value: "browser_server_signal_gap", label: "One system shows conversions another misses" },
  { value: "other", label: "Other" },
] as const;

const URGENCY_OPTIONS = [
  { value: "before_scaling", label: "Before increasing ad spend" },
  { value: "within_30_days", label: "Within 30 days" },
  { value: "one_to_three_months", label: "1–3 months" },
  { value: "exploring", label: "Just exploring" },
] as const;

const MEASUREMENT_JOURNEY = [
  { icon: BarChart3, title: "Ad click" },
  { icon: Globe2, title: "Website" },
  { icon: Send, title: "Enquiry / call" },
  { icon: Gauge, title: "CRM / inbox" },
] as const;

const JOURNEY_BREAKS = [
  { label: "Campaign source lost", position: "25%" },
  { label: "Form or call missed", position: "50%" },
  { label: "Source not passed through", position: "75%" },
] as const;

const REPORTING_SNAPSHOT = [
  { label: "Ad platform", value: "14 leads", detail: "Campaign says it generated fourteen." },
  { label: "Analytics", value: "9 conversions", detail: "Website reporting only sees nine." },
  { label: "CRM / inbox", value: "11 enquiries", detail: "The team receives eleven enquiries." },
] as const;

const SCORECARD_PREVIEW = [
  {
    label: "Conversion Capture",
    status: "Needs attention",
    detail: "Booked-call event is not being recorded consistently.",
    tone: "warning",
  },
  {
    label: "Attribution",
    status: "Partial",
    detail: "Campaign source reaches the website but is lost before the CRM handoff.",
    tone: "partial",
  },
  {
    label: "Lead Visibility",
    status: "Needs attention",
    detail: "Some enquiries reach the team without useful source information.",
    tone: "warning",
  },
] as const;

const AUDIT_DELIVERABLES = [
  {
    icon: CheckCircle2,
    title: "Where the issue is",
    description: "The point in the enquiry journey where tracking or source information stops being reliable.",
  },
  {
    icon: Gauge,
    title: "What it affects",
    description: "How the issue changes what you see in ad reports, analytics or the leads your team receives.",
  },
  {
    icon: Route,
    title: "What to do next",
    description: "A short, prioritized list of checks or fixes to tackle first.",
  },
] as const;

const HEALTH_DIMENSIONS = [
  { icon: Code2, number: "01", title: "Did we capture the enquiry?", description: "We check whether forms, booked calls and other key enquiry actions are actually being recorded." },
  { icon: Route, number: "02", title: "Do we know where it came from?", description: "We check whether the enquiry can still be tied back to the ad, campaign or source that generated it." },
  { icon: Send, number: "03", title: "Does the source reach your team?", description: "We check whether useful source information survives into your inbox, scheduler or CRM." },
] as const;

const PROCESS_STEPS = [
  { number: "01", title: "Apply", description: "Tell us how your business generates enquiries and which journey matters most." },
  { number: "02", title: "Fit review", description: "We confirm that the free audit can answer a useful measurement question within scope." },
  { number: "03", title: "Trace the journey", description: "We review one path from campaign click through the website to the lead destination." },
  { number: "04", title: "Get the scorecard", description: "You receive prioritized findings, business impact and recommended next actions." },
] as const;

const AUDIT_FAQS: FAQItem[] = [
  {
    question: "Who is this audit for?",
    answer: "The page is designed for enquiry-led businesses such as consultancies, agencies, legal and accounting practices, advisory businesses and other B2B service providers using digital acquisition to generate leads or booked calls.",
  },
  {
    question: "Will you need access to our accounts?",
    answer: "Usually not at first. We start with public evidence. If an important finding needs confirmation, we may ask for the lowest practical read-only access, a screenshare or an export.",
  },
  {
    question: "What does the free audit cover?",
    answer: "One company, one website, one core enquiry journey and up to two paid ad platforms where relevant. You receive a Tracking Health Scorecard with findings, business impact, priority and recommended next steps.",
  },
  {
    question: "Do you audit our whole CRM or sales process?",
    answer: "No. The free audit checks the lead-source handoff only where it affects the scoped measurement journey. A full CRM, automation or sales-operations audit is separate.",
  },
  {
    question: "Is implementation included?",
    answer: "No. The free audit diagnoses and prioritizes issues. If you want AlphaTrack Digital to implement the recommendations, that work is scoped separately.",
  },
  {
    question: "How quickly will we hear back?",
    answer: "We aim to review applications within one business day. If your application is accepted, we’ll confirm the audit scope and timing before we begin.",
  },
];

const TRACKING_AUDIT_ANCHOR_CTA = {
  label: "Request My Free Audit",
  to: "/offer/tracking-audit/professional-services#claim",
} as const;

const STEP_ONE_FIELDS: Array<keyof AuditFormData> = ["firstName", "lastName", "email", "company", "websiteUrl"];
const STEP_TWO_FIELDS: Array<keyof AuditFormData> = ["industry", "role", "decisionInfluence", "monthlyAdSpendBand", "adPlatforms"];
const MIN_FILL_MS = 1500;
const THROTTLE_MS = 5000;

const fieldClassName =
  "h-11 rounded-xl border-white/10 bg-white/[0.045] text-foreground shadow-none placeholder:text-muted-foreground/55 focus-visible:ring-primary/45 aria-[invalid=true]:border-red-500/40";

const Field = ({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground/90">
      {label}
    </label>
    {children}
    {error && (
      <p id={`${htmlFor}-err`} role="alert" className="mt-1.5 text-xs text-red-400">
        {error}
      </p>
    )}
  </div>
);

type TrackingAuditTheme = "dark" | "light";

type FormSelectOption = {
  value: string;
  label: string;
};

const TRACKING_AUDIT_THEME_STORAGE_KEY = "atd-tracking-audit-theme";

const FormSelect = ({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
  theme,
}: {
  id: string;
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: readonly FormSelectOption[];
  placeholder: string;
  error?: string;
  theme: TrackingAuditTheme;
}) => (
  <div className="relative">
    <select
      id={id}
      aria-label={label}
      value={value ?? ""}
      onChange={(event) => onValueChange(event.target.value)}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-err` : undefined}
      className={`${fieldClassName} w-full appearance-none px-3 pr-10`}
      style={{ colorScheme: theme }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      aria-hidden="true"
    />
  </div>
);

const TrackingAuditProfessionalServices = () => {
  const location = useLocation();
  const finalCtaTo = withCampaignSearch(TRACKING_AUDIT_ANCHOR_CTA.to, location.search);
  const [theme, setTheme] = useState<TrackingAuditTheme>("dark");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const formStartAt = useRef(0);
  const formStartTracked = useRef(false);
  const stepOneTracked = useRef(false);
  const lastSubmit = useRef(0);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(TRACKING_AUDIT_THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
    } catch {
      // Local storage may be unavailable in privacy-restricted contexts.
    }
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme: TrackingAuditTheme = currentTheme === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(TRACKING_AUDIT_THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Theme switching still works for the current session.
      }
      return nextTheme;
    });
  };

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<AuditFormData>({
    resolver: zodResolver(auditSchema),
    defaultValues: { adPlatforms: [], marketingOptIn: false, industry: "professional_services" },
  });

  const websiteRegistration = register("websiteUrl");

  const handleMeaningfulInteraction = () => {
    if (!formStartAt.current) formStartAt.current = Date.now();
    if (formStartTracked.current) return;

    formStartTracked.current = true;
    pushLeadSubmissionEvent("tracking_audit_form_start", {
      form_id: "tracking-audit-form",
      lead_source: "tracking_audit_offer",
    });
  };

  const moveToStep = (nextStep: 1 | 2 | 3) => {
    setStep(nextStep);
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        document.getElementById("claim")?.scrollIntoView({ block: "start", behavior: "auto" });
      }
    });
  };

  const handleStepOneContinue = async () => {
    const valid = await trigger(STEP_ONE_FIELDS, { shouldFocus: true });
    if (!valid) return;

    handleMeaningfulInteraction();
    if (!stepOneTracked.current) {
      stepOneTracked.current = true;
      pushLeadSubmissionEvent("tracking_audit_step1_complete", {
        form_id: "tracking-audit-form",
        lead_source: "tracking_audit_offer",
      });
    }
    moveToStep(2);
  };

  const handleStepTwoContinue = async () => {
    const valid = await trigger(STEP_TWO_FIELDS, { shouldFocus: true });
    if (!valid) return;
    moveToStep(3);
  };

  const onSubmit = async (data: AuditFormData) => {
    if (honeypot.trim()) return;

    const now = Date.now();
    if (!formStartAt.current || now - formStartAt.current < MIN_FILL_MS) {
      toast.error("Please take a moment to complete the application.");
      return;
    }
    if (now - lastSubmit.current < THROTTLE_MS) {
      toast.error("Please wait a moment before submitting again.");
      return;
    }
    lastSubmit.current = now;

    setIsSubmitting(true);
    try {
      const result = await submitLead({
        source: "tracking_audit_offer",
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        company: data.company,
        websiteUrl: normalizeWebsiteUrl(data.websiteUrl),
        industry: data.industry,
        role: data.role,
        decisionInfluence: data.decisionInfluence,
        monthlyAdSpendBand: data.monthlyAdSpendBand,
        adPlatforms: data.adPlatforms,
        trackingMaturity: data.trackingMaturity,
        primaryConversionType: data.primaryConversionType,
        measurementProblem: data.measurementProblem,
        urgency: data.urgency,
        optIn: data.marketingOptIn === true,
      });

      if (!result.duplicate) {
        pushLeadSubmissionEvent("tracking_audit_submit", {
          event_id: result.metaEventId,
          eventID: result.metaEventId,
          form_id: "tracking-audit-form",
          lead_source: "tracking_audit_offer",
          opt_in: data.marketingOptIn === true,
        });
      }

      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch {
      toast.error(`Something went wrong. Email us at ${companyProfile.contact.email}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Free Conversion Tracking Audit | AlphaTrack Digital"
        description="Request a free tracking audit for your enquiry journey and see where campaign attribution, conversion capture or lead-source visibility may be breaking."
        canonicalUrl="/offer/tracking-audit/professional-services"
      />

      <div className={theme === "light" ? "tracking-audit-theme tracking-audit-light bg-background text-foreground" : "tracking-audit-theme bg-background text-foreground"}>
      <section className="tracking-audit-hero relative overflow-hidden border-b border-white/[0.05] pb-14 pt-10 md:pb-20 md:pt-28 lg:flex lg:min-h-[calc(100svh-64px)] lg:flex-col lg:pb-10 lg:pt-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_50%_at_31%_40%,rgba(0,175,239,0.12)_0%,rgba(0,51,153,0.08)_38%,transparent_72%),radial-gradient(ellipse_46%_48%_at_73%_30%,rgba(51,204,153,0.10)_0%,transparent_72%)]" />
          <div
            className="tracking-audit-grid-overlay absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "46px 46px",
              maskImage: "linear-gradient(to bottom, black 5%, rgba(0,0,0,0.72) 58%, transparent 100%)",
            }}
          />
          <div className="absolute right-[-7rem] top-16 h-80 w-80 rounded-full bg-primary/[0.065] blur-[120px]" />
          <div className="absolute bottom-[-5rem] left-[-8rem] h-96 w-96 rounded-full bg-atd-blue/[0.14] blur-[150px]" />
        </div>

        <div className="container relative mx-auto px-5 sm:px-6 lg:flex lg:flex-1 lg:flex-col lg:px-8">
          <div className="relative z-30 mb-4 flex justify-end lg:absolute lg:right-8 lg:top-0 lg:mb-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>

          <div className="mx-auto grid max-w-6xl gap-9 lg:my-auto lg:w-full lg:-translate-y-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,480px)] lg:items-center lg:gap-14">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="pt-2 lg:pt-0">
              <HeroEyebrow>Free Conversion Tracking Audit</HeroEyebrow>

              <h1 className="title-safe mt-5 max-w-[36rem] text-balance text-[2.55rem] font-extrabold leading-[1.02] tracking-tight sm:text-5xl md:text-[3.4rem] lg:text-[3.6rem]">
                <span className="block">Know which ads are bringing you</span>{" "}
                <span className="block text-gradient-atd-hero sm:whitespace-nowrap">real enquiries</span>{" "}
                <span className="block text-gradient-atd-hero sm:whitespace-nowrap">and booked calls.</span>
              </h1>

              <p className="mt-5 max-w-[35rem] text-base leading-7 text-foreground/72 md:text-lg md:leading-8">
                We check what happens from the ad click to the form, booked call or enquiry, so you can see where leads are being missed, misreported or losing their source.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/78">
                {["No passwords", "One enquiry journey", "Clear next steps"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-6 max-w-[35rem] text-xs leading-5 text-foreground/65 sm:text-sm">
                For consultancies, agencies, legal, accounting, advisory and other service businesses that rely on enquiries, calls or consultations.
              </p>

            </motion.div>

            <motion.div
              id="claim"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="tracking-audit-form-card w-full scroll-mt-24 rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.018)_100%)] p-4 shadow-[0_28px_84px_rgba(0,0,0,0.20)] backdrop-blur-xl sm:p-7 md:p-8 lg:sticky lg:top-24 lg:rounded-[28px]"
            >
              {isSubmitted ? (
                <div className="py-7 text-center" aria-live="polite">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
                  <h2 className="mt-4 text-2xl font-semibold">Application received.</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                    Thanks for requesting a Free Conversion Tracking Audit. We’ll review your application to see if the free audit is a good fit. If it is, we’ll confirm what we’ll review and tell you if we need any read-only access. Please do not send passwords or account credentials.
                  </p>
                  <p className="mx-auto mt-4 max-w-md text-xs leading-5 text-muted-foreground">
                    We aim to review applications within one business day, but submitting the form does not automatically mean the audit has been accepted.
                  </p>
                  <p className="mt-4 text-xs text-foreground/70">Application contact: {submittedEmail}</p>
                  <Button asChild variant="ghost" className="mt-6 rounded-xl text-muted-foreground hover:text-foreground">
                    <Link to="/">Back to site</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex min-h-8 items-center justify-between gap-4">
                      {step === 1 ? (
                        <span className="text-xs font-medium text-muted-foreground">Step 1 of 3</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => moveToStep(step === 2 ? 1 : 2)}
                          className="-ml-1 inline-flex min-h-8 items-center gap-1.5 rounded-lg px-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                          Back
                        </button>
                      )}
                      {step > 1 && <span className="text-xs font-medium text-muted-foreground">Step {step} of 3</span>}
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                      />
                    </div>
                    <h2 className="mt-5 text-xl font-semibold">
                      {step === 1
                        ? "Tell us about your business."
                        : step === 2
                          ? "How do you generate enquiries?"
                          : "Where is the tracking unclear?"}
                    </h2>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {step === 1
                        ? "We review every application."
                        : step === 2
                          ? "A few quick details help us understand your setup."
                          : "Tell us what you want to understand before you spend more."}
                    </p>
                  </div>

                  <div className="hidden" aria-hidden="true">
                    <input name="tracking-audit-company-website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
                  </div>

                  <form id="tracking-audit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate aria-label="Request a Free Tracking Audit">
                    {step === 1 ? (
                      <motion.div
                        key="tracking-audit-step-1"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-5"
                        onChangeCapture={handleMeaningfulInteraction}
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="First Name" htmlFor="f-first" error={errors.firstName?.message}>
                            <Input id="f-first" placeholder="Jane" autoComplete="given-name" className={fieldClassName} aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "f-first-err" : undefined} {...register("firstName")} />
                          </Field>
                          <Field label="Last Name" htmlFor="f-last" error={errors.lastName?.message}>
                            <Input id="f-last" placeholder="Smith" autoComplete="family-name" className={fieldClassName} aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? "f-last-err" : undefined} {...register("lastName")} />
                          </Field>
                        </div>

                        <Field label="Work Email" htmlFor="f-email" error={errors.email?.message}>
                          <Input id="f-email" type="email" placeholder="jane@company.com" autoComplete="email" className={fieldClassName} aria-invalid={!!errors.email} aria-describedby={errors.email ? "f-email-err" : undefined} {...register("email")} />
                        </Field>

                        <Field label="Business / Company" htmlFor="f-company" error={errors.company?.message}>
                          <Input id="f-company" placeholder="Business or company name" autoComplete="organization" className={fieldClassName} aria-invalid={!!errors.company} aria-describedby={errors.company ? "f-company-err" : undefined} {...register("company")} />
                        </Field>

                        <Field label="Website" htmlFor="f-url" error={errors.websiteUrl?.message}>
                          <Input
                            id="f-url"
                            type="text"
                            inputMode="url"
                            placeholder="yourcompany.com"
                            autoComplete="url"
                            autoCapitalize="none"
                            autoCorrect="off"
                            className={fieldClassName}
                            aria-invalid={!!errors.websiteUrl}
                            aria-describedby={errors.websiteUrl ? "f-url-err" : undefined}
                            {...websiteRegistration}
                            onBlur={(event) => {
                              websiteRegistration.onBlur(event);
                              void trigger("websiteUrl");
                            }}
                          />
                        </Field>

                        <Button type="button" size="lg" onClick={handleStepOneContinue} className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                          Continue
                          <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                        </Button>

                        <p className="text-center text-xs leading-5 text-muted-foreground">
                          About 2 minutes total.
                        </p>
                      </motion.div>
                    ) : step === 2 ? (
                      <motion.div
                        key="tracking-audit-step-2"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <section className="space-y-3" aria-labelledby="step2-business-context">
                          <p id="step2-business-context" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/75">Business context</p>
                          <Field label="Your role" htmlFor="f-role" error={errors.role?.message}>
                            <Controller control={control} name="role" render={({ field }) => (
                              <FormSelect
                                id="f-role"
                                label="Your role"
                                value={field.value}
                                onValueChange={field.onChange}
                                options={ROLE_OPTIONS}
                                placeholder="Select role"
                                error={errors.role?.message}
                                theme={theme}
                              />
                            )} />
                          </Field>
                        </section>

                        <section className="mt-5 space-y-4 border-t border-white/[0.06] pt-5" aria-labelledby="step2-marketing-setup">
                          <p id="step2-marketing-setup" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/75">Marketing setup</p>

                          <Field label="Are you involved in choosing a provider?" htmlFor="f-decision" error={errors.decisionInfluence?.message}>
                            <Controller control={control} name="decisionInfluence" render={({ field }) => (
                              <FormSelect
                                id="f-decision"
                                label="Are you involved in choosing a provider?"
                                value={field.value}
                                onValueChange={field.onChange}
                                options={DECISION_OPTIONS}
                                placeholder="Select the closest answer"
                                error={errors.decisionInfluence?.message}
                                theme={theme}
                              />
                            )} />
                          </Field>

                          <Field label="Rough monthly ad spend" htmlFor="f-spend" error={errors.monthlyAdSpendBand?.message}>
                            <Controller control={control} name="monthlyAdSpendBand" render={({ field }) => (
                              <FormSelect
                                id="f-spend"
                                label="Rough monthly ad spend"
                                value={field.value}
                                onValueChange={field.onChange}
                                options={SPEND_OPTIONS}
                                placeholder="Select spend range"
                                error={errors.monthlyAdSpendBand?.message}
                                theme={theme}
                              />
                            )} />
                          </Field>

                          <Controller control={control} name="adPlatforms" render={({ field }) => {
                            const selected = field.value ?? [];
                            const primaryPlatform = selected[0];
                            const secondPlatform = selected[1];
                            const secondOptions = PLATFORM_OPTIONS.filter(
                              (option) => option.value !== "none_currently" && option.value !== primaryPlatform,
                            );

                            return (
                              <div className="space-y-4">
                                <Field label="Main ad platform" htmlFor="f-primary-platform" error={errors.adPlatforms?.message}>
                                  <FormSelect
                                    id="f-primary-platform"
                                    label="Main ad platform"
                                    value={primaryPlatform}
                                    onValueChange={(value) => {
                                      const nextPrimary = value as AuditPlatform;
                                      if (nextPrimary === "none_currently") {
                                        field.onChange(["none_currently"]);
                                        return;
                                      }

                                      const nextPlatforms: AuditPlatform[] = [nextPrimary];
                                      if (secondPlatform && secondPlatform !== nextPrimary && secondPlatform !== "none_currently") {
                                        nextPlatforms.push(secondPlatform);
                                      }
                                      field.onChange(nextPlatforms);
                                    }}
                                    options={PLATFORM_OPTIONS}
                                    placeholder="Select main platform"
                                    error={errors.adPlatforms?.message}
                                    theme={theme}
                                  />
                                </Field>

                                {primaryPlatform && primaryPlatform !== "none_currently" && (
                                  <Field label="Second platform (optional)" htmlFor="f-second-platform">
                                    <FormSelect
                                      id="f-second-platform"
                                      label="Second platform (optional)"
                                      value={secondPlatform ?? "no_second_platform"}
                                      onValueChange={(value) => {
                                        if (value === "no_second_platform") {
                                          field.onChange([primaryPlatform]);
                                          return;
                                        }
                                        field.onChange([primaryPlatform, value as AuditPlatform]);
                                      }}
                                      options={[
                                        { value: "no_second_platform", label: "No second platform" },
                                        ...secondOptions,
                                      ]}
                                      placeholder="No second platform"
                                      theme={theme}
                                    />
                                  </Field>
                                )}

                                <p className="-mt-1 text-[11px] leading-4 text-muted-foreground/90">
                                  We’ll review up to two paid platforms where relevant.
                                </p>
                              </div>
                            );
                          }} />
                        </section>

                        <Button type="button" size="lg" onClick={handleStepTwoContinue} className="mt-6 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                          Continue
                          <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="tracking-audit-step-3"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="space-y-4">
                          <Field label="How clear are you on where enquiries come from?" htmlFor="f-maturity" error={errors.trackingMaturity?.message}>
                            <Controller control={control} name="trackingMaturity" render={({ field }) => (
                              <FormSelect
                                id="f-maturity"
                                label="How clear are you on where enquiries come from?"
                                value={field.value}
                                onValueChange={field.onChange}
                                options={MATURITY_OPTIONS}
                                placeholder="Select the closest answer"
                                error={errors.trackingMaturity?.message}
                                theme={theme}
                              />
                            )} />
                          </Field>

                          <Field label="What enquiry action matters most?" htmlFor="f-conversion" error={errors.primaryConversionType?.message}>
                            <Controller control={control} name="primaryConversionType" render={({ field }) => (
                              <FormSelect
                                id="f-conversion"
                                label="What enquiry action matters most?"
                                value={field.value}
                                onValueChange={field.onChange}
                                options={CONVERSION_OPTIONS}
                                placeholder="Select main enquiry action"
                                error={errors.primaryConversionType?.message}
                                theme={theme}
                              />
                            )} />
                          </Field>

                          <Field label="What’s unclear?" htmlFor="f-problem" error={errors.measurementProblem?.message}>
                            <Controller control={control} name="measurementProblem" render={({ field }) => (
                              <FormSelect
                                id="f-problem"
                                label="What’s unclear?"
                                value={field.value}
                                onValueChange={field.onChange}
                                options={PROBLEM_OPTIONS}
                                placeholder="Select the closest issue"
                                error={errors.measurementProblem?.message}
                                theme={theme}
                              />
                            )} />
                          </Field>

                          <Field label="When do you want clarity?" htmlFor="f-urgency" error={errors.urgency?.message}>
                            <Controller control={control} name="urgency" render={({ field }) => (
                              <FormSelect
                                id="f-urgency"
                                label="When do you want clarity?"
                                value={field.value}
                                onValueChange={field.onChange}
                                options={URGENCY_OPTIONS}
                                placeholder="Select timing"
                                error={errors.urgency?.message}
                                theme={theme}
                              />
                            )} />
                          </Field>
                        </div>

                        <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                          <div className="flex items-start gap-3">
                            <input type="checkbox" id="f-marketing-opt-in" className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/5 accent-primary" {...register("marketingOptIn")} />
                            <label htmlFor="f-marketing-opt-in" className="cursor-pointer text-[13px] leading-5 text-muted-foreground sm:text-sm">
                              Send me occasional ATD marketing insights.
                            </label>
                          </div>
                          <p className="mt-1.5 pl-7 text-[11px] leading-4 text-muted-foreground/75">Optional. Not required for the audit.</p>
                        </div>

                        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-5 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                          {isSubmitting ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />Submitting…</> : "Request My Free Audit"}
                        </Button>
                      </motion.div>

                    )}
                  </form>
                </>
              )}
            </motion.div>
          </div>

          <div className="mt-8 hidden justify-center md:mt-10 md:flex lg:mt-0 lg:shrink-0 lg:pb-1">
            <a
              href="#measurement-journey"
              className="group inline-flex flex-col items-center gap-2 text-center text-xs font-medium tracking-wide text-foreground/55 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 lg:gap-1.5"
            >
              <span>See what we review</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] transition-colors group-hover:border-primary/25 group-hover:bg-primary/[0.05] lg:h-7 lg:w-7">
                <ArrowDown className="h-4 w-4 motion-safe:animate-bounce motion-reduce:animate-none lg:h-3.5 lg:w-3.5" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </section>

      <PageSection id="measurement-journey" surface="quiet" spacing="spacious" className="scroll-mt-20 py-16 md:py-24 lg:py-28" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Where tracking often breaks"
          title="An enquiry can lose its source before your team ever sees it."
          description="We check the simple path from ad to website to enquiry and into your CRM or inbox."
          align="center"
          maxWidth="2xl"
          className="mb-10 md:mb-12"
        />

        <div className="mx-auto max-w-6xl">
          <div className="relative hidden px-8 pt-6 md:block">
            <motion.div
              className="absolute left-[12.5%] right-[12.5%] top-[2.7rem] h-px bg-gradient-to-r from-atd-blue/25 via-primary/55 to-atd-cyan/25"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
              aria-hidden="true"
            />

            <motion.span
              aria-hidden="true"
              className="absolute top-[2.48rem] z-30 h-2 w-2 rounded-full bg-primary shadow-[0_0_18px_rgba(51,204,153,0.75)]"
              initial={{ left: "12.5%", opacity: 0 }}
              whileInView={{ left: "87.5%", opacity: [0, 1, 1, 0.25] }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.5, delay: 0.25, ease: "easeInOut" }}
            />

            {JOURNEY_BREAKS.map((item) => (
              <div key={item.label} className="absolute top-[2.38rem] z-20 -translate-x-1/2" style={{ left: item.position }}>
                <span className="block h-2.5 w-2.5 rotate-45 border border-amber-300/45 bg-[#0b1118]" aria-hidden="true" />
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/20 bg-background/90 px-2.5 py-1 text-[10px] font-medium text-amber-100/70 shadow-[0_8px_24px_rgba(0,0,0,0.10)] backdrop-blur">
                  {item.label}
                </span>
              </div>
            ))}

            <div className="relative grid grid-cols-4 gap-10">
              {MEASUREMENT_JOURNEY.map(({ icon: Icon, title }, index) => (
                <div key={title} className="text-center">
                  <div className="tracking-audit-node-ring relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-[#0a1017] text-primary shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
                    <Icon className="h-5.5 w-5.5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/55">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{title}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-md md:hidden">
            {MEASUREMENT_JOURNEY.map(({ icon: Icon, title }, index) => (
              <div key={title} className="relative flex items-center gap-4 pb-7 last:pb-0">
                {index < MEASUREMENT_JOURNEY.length - 1 && (
                  <div className="absolute bottom-0 left-[21px] top-10 w-px bg-gradient-to-b from-primary/40 to-atd-blue/15" aria-hidden="true" />
                )}
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-[#0a1017] text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/55">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold">{title}</h3>
                  {JOURNEY_BREAKS[index] && (
                    <p className="mt-1.5 text-[11px] text-amber-100/60">{JOURNEY_BREAKS[index].label}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-9 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
            You may still receive the lead, but lose the information that tells you which ad or campaign produced it.
          </p>
        </div>
      </PageSection>

      <PageSection spacing="spacious" className="py-16 md:py-24 lg:py-28" containerClassName="px-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">The familiar problem</p>
            <h2 className="mt-4 max-w-xl text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.8rem] lg:leading-[1.08]">
              <span className="block">The enquiry arrives.</span>{" "}
              <span className="block text-gradient sm:whitespace-nowrap">The source doesn’t.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Your team knows people are contacting you. The hard part is confidently connecting those enquiries to the ads, campaigns or channels that produced them.
            </p>
            <p className="mt-5 max-w-lg text-sm leading-6 text-foreground/70">
              When each system tells a different story, it becomes harder to decide what deserves more budget and what needs fixing first.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(0,175,239,0.10),transparent_68%)] blur-2xl" aria-hidden="true" />
            <div className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.025] shadow-[0_24px_70px_rgba(0,0,0,0.14)]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-semibold text-foreground">Three systems. Three answers.</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Illustrative example — not client data.</p>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Same period
                </span>
              </div>

              <div className="divide-y divide-white/[0.07]">
                {REPORTING_SNAPSHOT.map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="grid gap-3 px-5 py-5 sm:grid-cols-[0.8fr_0.7fr_1.5fr] sm:items-center sm:px-6"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.55 }}
                    transition={{ duration: 0.35, delay: index * 0.1 }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/70">{item.label}</p>
                    <p className="text-xl font-bold tracking-tight text-foreground">{item.value}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-white/[0.07] bg-primary/[0.035] px-5 py-4 sm:px-6">
                <p className="text-sm font-medium text-foreground/88">
                  The question is not “which dashboard is right?” It is “where did the measurement journey stop agreeing?”
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection id="audit-coverage" spacing="spacious" className="scroll-mt-20 py-16 md:py-24 lg:py-28" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="What we review"
          title="We follow one enquiry from click to handoff."
          description="The audit stays focused on one real journey so we can answer three practical questions without burying you in technical detail."
          align="center"
          maxWidth="2xl"
          className="mb-9 md:mb-11"
        />

        <div className="tracking-audit-scope-card mx-auto mb-10 max-w-6xl overflow-hidden rounded-[24px] border border-white/[0.07] bg-[linear-gradient(135deg,rgba(51,204,153,0.055),rgba(0,175,239,0.025)_52%,rgba(255,255,255,0.015))] md:mb-12">
          <div className="grid md:grid-cols-[1.05fr_1.95fr]">
            <div className="border-b border-white/[0.07] p-5 md:border-b-0 md:border-r md:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/75">Free audit scope</p>
              <h2 className="mt-2.5 text-xl font-bold tracking-tight md:text-2xl">One business. One website. One enquiry journey.</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 md:p-5">
              {[
                ["01", "One company / brand"],
                ["02", "One website / domain"],
                ["03", "One core enquiry journey"],
                ["04", "Up to two paid platforms"],
              ].map(([number, label]) => (
                <div key={label} className="rounded-2xl border border-white/[0.07] bg-background/35 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.05)]">
                  <p className="text-xs font-semibold text-primary/75">{number}</p>
                  <p className="mt-2 text-sm font-medium leading-5 text-foreground/90">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl border-y border-white/[0.07]">
          <div className="grid md:grid-cols-3">
            {HEALTH_DIMENSIONS.map(({ icon: Icon, number, title, description }, index) => (
              <article
                key={title}
                className={[
                  "py-8 md:px-7 lg:min-h-[13rem] lg:py-9",
                  index > 0 ? "border-t border-white/[0.07] md:border-l md:border-t-0" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-2xl font-light tracking-tight text-foreground/38">{number}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.055] text-primary"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                </div>
                <h3 className="mt-6 text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
          <p className="mx-auto my-6 max-w-3xl px-4 text-center text-xs leading-5 text-muted-foreground/90">
            Your scorecard still covers Conversion Capture, Signal Quality, Attribution, Lead Visibility and Data Reliability.
          </p>
        </div>
      </PageSection>

      <PageSection surface="quiet" spacing="spacious" className="py-16 md:py-24 lg:py-28" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="What you get"
          title="A scorecard that turns uncertainty into next steps."
          description="You get a short Tracking Health Scorecard that shows what we found, why it matters and what should be checked or fixed first."
          align="center"
          maxWidth="2xl"
          className="mb-9 md:mb-11"
        />

        <div className="mx-auto mb-16 grid max-w-6xl items-center gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-16">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">Example preview</p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">See the finding, the impact and the priority at a glance.</h3>
            <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
              The scorecard is designed to be useful to a business owner or marketing lead — not just someone who works in analytics.
            </p>
            <p className="mt-4 text-xs leading-5 text-muted-foreground/85">
              Example only. The findings shown here are fictional and do not represent a client.
            </p>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] shadow-[0_30px_90px_rgba(0,0,0,0.16)]"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
          >
            <span className="pointer-events-none absolute -right-5 top-16 -rotate-12 text-5xl font-black uppercase tracking-[0.18em] text-foreground/[0.025]" aria-hidden="true">
              Sample
            </span>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-6">
              <div>
                <p className="text-sm font-semibold">Tracking Health Scorecard</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Illustrative preview</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sample health</p>
                  <div className="mt-1 flex gap-1" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((segment) => (
                      <span key={segment} className={["h-1.5 w-5 rounded-full", segment < 2 ? "bg-amber-400/70" : "bg-white/[0.10]"].join(" ")} />
                    ))}
                  </div>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Priority view
                </span>
              </div>
            </div>

            <div className="divide-y divide-white/[0.07]">
              {SCORECARD_PREVIEW.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="px-5 py-5 sm:px-6"
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.3, delay: 0.12 + index * 0.08 }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <span
                      className={[
                        "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        item.tone === "warning"
                          ? "border-amber-400/25 bg-amber-400/[0.07] text-amber-200/85"
                          : "border-atd-cyan/25 bg-atd-cyan/[0.07] text-atd-cyan",
                      ].join(" ")}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 border-t border-white/[0.07] bg-primary/[0.035]">
              <div className="p-4 sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/70">Recommended first step</p>
                <p className="mt-1.5 text-sm font-medium">Fix the form / CRM source handoff</p>
              </div>
              <div className="border-l border-white/[0.07] p-4 sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/70">Priority</p>
                <p className="mt-1.5 text-sm font-medium">High</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute left-[16.5%] right-[16.5%] top-7 hidden h-px bg-gradient-to-r from-primary/20 via-primary/55 to-atd-cyan/20 md:block" aria-hidden="true" />

          <div className="grid gap-7 md:grid-cols-3 md:gap-8">
            {AUDIT_DELIVERABLES.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="relative text-center md:px-4">
                <div className="tracking-audit-node-ring relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-[#0a1017] text-primary shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/65">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1.5 text-base font-semibold">{title}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>

          <div className="tracking-audit-trust-card mx-auto mt-14 grid max-w-5xl overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[190px] md:min-h-[230px]">
              <img
                src="/about-hero-team-optimized.jpg"
                alt="Marketing team reviewing campaign performance"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center saturate-[0.92] contrast-[1.03]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background/20"
                aria-hidden="true"
              />
              <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-white/75 backdrop-blur">
                Illustrative review session
              </span>
            </div>

            <div className="flex flex-col justify-center p-5 sm:p-6 md:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">Human-reviewed</p>
              <h3 className="mt-2 text-lg font-semibold">Reviewed by people, not an automated report.</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your application and audit are reviewed by the AlphaTrack Digital team. We trace one enquiry journey and explain what we find in plain language.
              </p>

              <div className="mt-4 flex items-start gap-3 border-t border-white/[0.07] pt-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h4 className="text-sm font-semibold">We start without account access.</h4>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    If verification is needed, we ask for the lowest practical read-only access. We never ask for passwords.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-5xl border-t border-white/[0.07] pt-10">
            <div className="mb-6 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/75">How it works</p>
              <h3 className="mt-2 text-xl font-bold tracking-tight">From application to scorecard in four steps.</h3>
            </div>

            <div className="relative">
              <div className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px bg-gradient-to-r from-primary/15 via-primary/40 to-atd-cyan/15 lg:block" aria-hidden="true" />
              <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
                {PROCESS_STEPS.map((item, index) => (
                  <motion.li
                    key={item.number}
                    className="flex gap-3 lg:block lg:text-center"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.55 }}
                    transition={{ duration: 0.3, delay: index * 0.08 }}
                  >
                    <span className="tracking-audit-node-ring relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-[#091017] text-xs font-bold text-primary lg:mx-auto">
                      {item.number}
                    </span>
                    <div className="min-w-0 lg:mt-4">
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-center text-xs leading-5 text-muted-foreground/90">
            The free audit includes the review and recommendations. Fixing the issues is separate.
          </p>
        </div>
      </PageSection>

      <div>
        <FAQAccordion
          items={AUDIT_FAQS}
          eyebrow="Before you apply"
          title="Common questions"
          variant="minimal"
          density="compact"
          accordionClassName="!overflow-visible !rounded-none !border-0 !bg-transparent"
          contentClassName="max-w-[42rem]"
          sectionClassName="bg-transparent"
          sectionSpacingClassName="py-16 md:py-24"
        />

        <section className="tracking-audit-final-cta relative overflow-hidden border-t border-white/[0.05] py-16 md:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_55%_at_50%_100%,rgba(51,204,153,0.09),transparent_68%),radial-gradient(ellipse_45%_50%_at_20%_45%,rgba(0,175,239,0.055),transparent_72%)]" />
            <div className="absolute left-[18%] right-[18%] top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          <div className="container relative mx-auto px-5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                <span className="block">Know which marketing is</span>{" "}
                <span className="block text-gradient sm:whitespace-nowrap">actually producing enquiries.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                If you’re spending on ads but can’t confidently connect them to enquiries or booked calls, request a free audit.
              </p>
              <Button asChild size="lg" className="mt-8 rounded-xl bg-primary px-8 text-primary-foreground shadow-[0_0_24px_rgba(51,204,153,0.18)] transition-shadow hover:bg-primary/90 hover:shadow-[0_0_34px_rgba(0,175,239,0.14)]">
                <Link to={finalCtaTo}>{TRACKING_AUDIT_ANCHOR_CTA.label}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      </div>
    </>
  );
};

export default TrackingAuditProfessionalServices;
