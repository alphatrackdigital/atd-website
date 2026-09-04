import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
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
import {
  TrackingAuditFormSelect as FormSelect,
  TrackingAuditHumanReviewBadge,
  TrackingAuditReviewCue,
  TrackingAuditSuccessState,
} from "@/components/shared/TrackingAuditShared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companyProfile } from "@/data/companyProfile";
import { submitLead } from "@/lib/leads";
import { withCampaignSearch } from "@/lib/campaignAttribution";
import { pushLeadSubmissionEvent } from "@/lib/tracking";

const TRACKING_AUDIT_THEME_STORAGE_KEY = "atd-tracking-audit-theme";

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
    ["paused_or_not_spending", "5000_9999", "10000_19999", "20000_plus", "not_sure"],
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
  { value: "founder_ceo", label: "Founder / Director" },
  { value: "marketing_lead", label: "Marketing / Admissions" },
  { value: "growth_performance", label: "Growth / Student Recruitment" },
  { value: "operations_commercial", label: "Operations / Admissions" },
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
  { value: "5000_9999", label: "$5k–10k" },
  { value: "10000_19999", label: "$10k–20k" },
  { value: "20000_plus", label: "$20k+" },
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
  { value: "application_enrolment", label: "Application / enrolment" },
  { value: "booked_call_appointment", label: "Booked consultation / campus visit" },
  { value: "whatsapp_message", label: "WhatsApp / message" },
  { value: "other", label: "Other recruitment action" },
] as const;

const PROBLEM_OPTIONS = [
  { value: "unclear_campaign_performance", label: "I can’t tell which ads bring applicants" },
  { value: "conflicting_numbers", label: "Ads and analytics don’t agree" },
  { value: "missing_conversion_tracking", label: "Some applications aren’t tracked" },
  { value: "leads_without_attribution", label: "Enquiries arrive without campaign source" },
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
  { icon: Globe2, title: "Programme page" },
  { icon: Send, title: "Enquiry / application" },
  { icon: Gauge, title: "Admissions / CRM" },
] as const;

const JOURNEY_BREAKS = [
  { label: "Campaign source lost", position: "25%" },
  { label: "Application event missed", position: "50%" },
  { label: "Source not passed through", position: "75%" },
] as const;

const REPORTING_SNAPSHOT = [
  { label: "Ad platform", value: "18 leads", detail: "Reports 18 leads." },
  { label: "Analytics", value: "12 applications", detail: "Shows 12 applications." },
  { label: "Admissions / CRM", value: "15 applications", detail: "Receives 15 applications." },
] as const;

const SCORECARD_PREVIEW = [
  {
    label: "Conversion Capture",
    status: "Needs attention",
    detail: "Application-submit event is not being recorded consistently.",
    tone: "warning",
  },
  {
    label: "Attribution",
    status: "Partial",
    detail: "Campaign source reaches the programme page but is lost before the admissions handoff.",
    tone: "partial",
  },
  {
    label: "Lead Visibility",
    status: "Needs attention",
    detail: "Some enquiries reach admissions without useful source information.",
    tone: "warning",
  },
] as const;

const AUDIT_DELIVERABLES = [
  {
    icon: CheckCircle2,
    title: "Where the issue is",
    description: "The point in the recruitment journey where tracking or source information stops being reliable.",
  },
  {
    icon: Gauge,
    title: "What it affects",
    description: "How the issue changes what you see in ad reports, analytics or the enquiries and applications admissions receives.",
  },
  {
    icon: Route,
    title: "What to do next",
    description: "A short, prioritized list of checks or fixes to tackle first.",
  },
] as const;

const HEALTH_DIMENSIONS = [
  { icon: Code2, number: "01", title: "Did we capture the action?", description: "We check whether enquiry forms, applications, booked consultations and other key recruitment actions are actually being recorded." },
  { icon: Route, number: "02", title: "Do we know which campaign it came from?", description: "We check whether the enquiry or application can still be tied back to the ad, campaign or source that generated it." },
  { icon: Send, number: "03", title: "Does the source reach admissions?", description: "We check whether useful source information survives into your admissions inbox, system or CRM." },
] as const;

const PROCESS_STEPS = [
  { number: "01", title: "Apply", description: "Tell us how you recruit students or learners and which journey matters most." },
  { number: "02", title: "Fit review", description: "We confirm that the free audit can answer a useful measurement question within scope." },
  { number: "03", title: "Trace the journey", description: "We review one path from campaign click through the programme page to the admissions destination." },
  { number: "04", title: "Get the scorecard", description: "You receive prioritized findings, business impact and recommended next actions." },
] as const;

const AUDIT_FAQS: FAQItem[] = [
  {
    question: "Who is this audit for?",
    answer: "The page is designed for universities, colleges, training providers, professional education businesses, bootcamps and other organisations using digital acquisition to generate enquiries, applications or enrolments.",
  },
  {
    question: "Will you need access to our accounts?",
    answer: "Usually not at first. We start with public evidence. If an important finding needs confirmation, we may ask for the lowest practical read-only access, a screenshare or an export.",
  },
  {
    question: "What does the free audit cover?",
    answer: "One institution or education brand, one website, one core recruitment journey and up to two paid ad platforms where relevant. You receive a Tracking Health Scorecard with findings, business impact, priority and recommended next steps.",
  },
  {
    question: "Does this audit cover our whole admissions CRM or student system?",
    answer: "No. The free audit checks the source and conversion handoff only where it affects the scoped recruitment journey. A full CRM, student-information-system, automation or admissions-operations audit is separate.",
  },
  {
    question: "Can the audit verify enrolment attribution?",
    answer: "We can assess whether the scoped journey preserves the campaign and conversion data needed to support reliable attribution. We do not promise full enrolment or revenue attribution where the required downstream data is outside the free audit scope.",
  },
  {
    question: "Is implementation included?",
    answer: "No. The free audit diagnoses and prioritizes issues. If you want AlphaTrack Digital to implement the recommendations, that work is scoped separately.",
  },
  {
    question: "How quickly will we hear back?",
    answer: "We aim to review applications within one business day. If your application is accepted, we’ll confirm the audit scope and timing before we begin.",
  },
] as const;

const TRACKING_AUDIT_ANCHOR_CTA = {
  label: "Request My Free Audit",
  to: "/offer/tracking-audit/education#claim",
} as const;

const STEP_ONE_FIELDS: Array<keyof AuditFormData> = ["firstName", "lastName", "email", "company", "websiteUrl"];
const STEP_TWO_FIELDS: Array<keyof AuditFormData> = ["industry", "role", "decisionInfluence", "monthlyAdSpendBand", "adPlatforms"];
const MIN_FILL_MS = 1500;
const THROTTLE_MS = 5000;

const fieldClassName =
  "h-11 rounded-xl border-white/10 bg-white/[0.045] text-foreground shadow-none placeholder:text-muted-foreground/55 focus-visible:ring-primary/45 aria-[invalid=true]:border-red-500/40";

const Field = ({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-semibold leading-4 text-foreground/82">
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

const TrackingAuditEducation = () => {
  const location = useLocation();
  const finalCtaTo = withCampaignSearch(TRACKING_AUDIT_ANCHOR_CTA.to, location.search);
  const [theme, setTheme] = useState<TrackingAuditTheme>("dark");
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
    defaultValues: { adPlatforms: [], marketingOptIn: false, industry: "education_training" },
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
        websiteRoute: location.pathname,
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
        title="Free Conversion Tracking Audit for Education & Training | AlphaTrack Digital"
        description="Request a free conversion tracking audit for one education recruitment journey and see where campaign attribution, application tracking or admissions lead-source visibility may be breaking."
        canonicalUrl="/offer/tracking-audit/education"
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

              <h1 className="title-safe mt-5 max-w-[34rem] overflow-visible text-balance text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-[2.8rem] md:text-[3.05rem] lg:text-[3.2rem]">
                <span className="block">Know which campaigns drive</span>
                <span className="block w-fit max-w-full overflow-visible pb-[0.17em] pr-[0.08em] leading-[1.1] text-gradient-atd-hero">applications</span>
                <span className="-mt-[0.02em] block w-fit max-w-full overflow-visible pb-[0.19em] pr-[0.08em] leading-[1.1] text-gradient-atd-hero">and enrolments.</span>
              </h1>

              <p className="mt-5 max-w-[35rem] text-base leading-7 text-foreground/72 md:text-lg md:leading-8">
                We check what happens from the ad click to the programme page, enquiry or application, so you can see where recruitment conversions are being missed, misreported or losing their source.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/78">
                {["No passwords", "One recruitment journey", "Clear next steps"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>

            </motion.div>

            <div className="relative w-full lg:sticky lg:top-24">
              <TrackingAuditHumanReviewBadge />

              <motion.div
                id="claim"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="tracking-audit-form-card w-full scroll-mt-24 rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.018)_100%)] p-4 shadow-[0_28px_84px_rgba(0,0,0,0.20)] backdrop-blur-xl sm:p-7 md:p-8 lg:rounded-[28px]"
            >
              {isSubmitted ? (
                <TrackingAuditSuccessState />
              ) : (
                <>
                  <div className="mb-5">
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
                    <h2 className="mt-4 text-xl font-semibold">
                      {step === 1
                        ? "Tell us about your business."
                        : step === 2
                          ? "How do you recruit students or learners?"
                          : "Where is the tracking unclear?"}
                    </h2>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                      {step === 1
                        ? "We review every application."
                        : step === 2
                          ? "A few quick details help us understand your setup."
                          : "Tell us what you want to understand before the next campaign or intake."}
                    </p>
                  </div>

                  <div className="hidden" aria-hidden="true">
                    <input name="tracking-audit-company-website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
                  </div>

                  <form id="tracking-audit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-label="Request a Free Tracking Audit">
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

                        <Field label="Institution / Organisation" htmlFor="f-company" error={errors.company?.message}>
                          <Input id="f-company" placeholder="Institution or organisation name" autoComplete="organization" className={fieldClassName} aria-invalid={!!errors.company} aria-describedby={errors.company ? "f-company-err" : undefined} {...register("company")} />
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
                        <section className="space-y-2.5" aria-labelledby="step2-business-context">
                          <p id="step2-business-context" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/75">Organisation context</p>
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

                        <section className="mt-4 space-y-3.5 border-t border-white/[0.06] pt-4" aria-labelledby="step2-marketing-setup">
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
                              <div className="space-y-3.5">
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

                        <Button type="button" size="lg" onClick={handleStepTwoContinue} className="mt-5 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
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
                        <div className="space-y-3.5">
                          <Field label="How clear are you on where enquiries and applications come from?" htmlFor="f-maturity" error={errors.trackingMaturity?.message}>
                            <Controller control={control} name="trackingMaturity" render={({ field }) => (
                              <FormSelect
                                id="f-maturity"
                                label="How clear are you on where enquiries and applications come from?"
                                value={field.value}
                                onValueChange={field.onChange}
                                options={MATURITY_OPTIONS}
                                placeholder="Select the closest answer"
                                error={errors.trackingMaturity?.message}
                                theme={theme}
                              />
                            )} />
                          </Field>

                          <Field label="What recruitment action matters most?" htmlFor="f-conversion" error={errors.primaryConversionType?.message}>
                            <Controller control={control} name="primaryConversionType" render={({ field }) => (
                              <FormSelect
                                id="f-conversion"
                                label="What recruitment action matters most?"
                                value={field.value}
                                onValueChange={field.onChange}
                                options={CONVERSION_OPTIONS}
                                placeholder="Select main recruitment action"
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

                        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.04] px-3 py-2.5">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          <p className="text-[11px] leading-4 text-muted-foreground">
                            <span className="font-semibold text-foreground/80">Free audit scope:</span>{" "}
                            Review and recommendations are included. Implementation is separate.
                          </p>
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
          </div>

          <TrackingAuditReviewCue />
        </div>
      </section>

      <PageSection id="measurement-journey" surface="quiet" spacing="spacious" className="scroll-mt-20 py-16 md:py-24 lg:py-28" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Where tracking often breaks"
          title={
            <>
              <span className="lg:block">An application can lose its source</span>{" "}
              <span className="lg:block">before your admissions team ever sees it.</span>
            </>
          }
          description="We check the path from ad to programme page to enquiry or application and into your admissions system or CRM."
          align="center"
          maxWidth="xl"
          titleClassName="text-balance lg:!max-w-[62rem]"
          descriptionClassName="text-balance lg:!max-w-[52rem]"
          className="mb-6 md:mb-7"
        />

        <div className="mx-auto max-w-[76rem]">
          <div className="relative hidden px-3 pt-10 md:block lg:px-5" data-journey-sequence>
            <div className="absolute inset-x-3 bottom-0 top-0 lg:inset-x-5">
              <div
                className="absolute left-[12.5%] right-[12.5%] top-[3.05rem] h-px bg-gradient-to-r from-atd-blue/25 via-primary/55 to-atd-cyan/25"
                aria-hidden="true"
              />
              <motion.div
                aria-hidden="true"
                className="absolute left-[12.5%] right-[12.5%] top-[3.02rem] h-[2px] origin-left bg-gradient-to-r from-transparent via-primary to-atd-cyan/70"
                animate={
                  prefersReducedMotion
                    ? { opacity: 0.35, scaleX: 1 }
                    : { opacity: [0, 0.95, 0.82, 0], scaleX: [0, 0.28, 0.7, 1] }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 8.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.25 }
                }
                style={{ transformOrigin: "left" }}
              />
              <motion.span
                aria-hidden="true"
                className="absolute top-[2.77rem] z-30 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_20px_rgba(51,204,153,0.82)]"
                animate={
                  prefersReducedMotion
                    ? { left: "12.5%", opacity: 0.75 }
                    : { left: ["12.5%", "37.5%", "62.5%", "87.5%"], opacity: [0.2, 1, 1, 0.2] }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 8.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.25 }
                }
              />

              {JOURNEY_BREAKS.map((item, index) => (
                <div
                  key={item.label}
                  data-journey-break={index}
                  className="absolute top-0 z-20 w-max -translate-x-1/2 text-center"
                  style={{ left: item.position }}
                >
                  <motion.span
                    data-journey-chip
                    className="block rounded-full border border-amber-300/25 bg-background/95 px-3 py-1.5 text-[11px] font-semibold text-amber-100/95 shadow-[0_8px_24px_rgba(0,0,0,0.10)] backdrop-blur"
                    animate={
                      prefersReducedMotion
                        ? { opacity: 0.9, y: 0 }
                        : { opacity: [0.72, 1, 0.72], y: [0, -2, 0] }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.7, repeat: Infinity, repeatDelay: 7.7, delay: 1.05 + index * 2.1 }
                    }
                  >
                    {item.label}
                  </motion.span>
                  <span
                    data-journey-diamond
                    className="absolute left-1/2 top-[2.73rem] block h-2.5 w-2.5 -translate-x-1/2"
                    aria-hidden="true"
                  >
                    <motion.span
                      className="block h-full w-full rotate-45 border border-amber-300/45 bg-[#0b1118]"
                      animate={
                        prefersReducedMotion
                          ? { scale: 1, opacity: 0.85 }
                          : { scale: [1, 1.42, 1], opacity: [0.72, 1, 0.72] }
                      }
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { duration: 0.7, repeat: Infinity, repeatDelay: 7.7, delay: 1.05 + index * 2.1 }
                      }
                    />
                  </span>
                </div>
              ))}
            </div>

            <div className="relative grid grid-cols-4">
              {MEASUREMENT_JOURNEY.map(({ icon: Icon, title }, index) => (
                <div key={title} className="text-center">
                  <motion.div
                    data-journey-node={index}
                    className="tracking-audit-node-ring relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-[#0a1017] text-primary shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                    animate={
                      prefersReducedMotion
                        ? { scale: 1 }
                        : {
                            scale: [1, 1.075, 1],
                            boxShadow: [
                              "0 8px 24px rgba(0,0,0,0.10)",
                              "0 0 32px rgba(51,204,153,0.24)",
                              "0 8px 24px rgba(0,0,0,0.10)",
                            ],
                          }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.7, repeat: Infinity, repeatDelay: 7.7, delay: index * 2.1 }
                    }
                  >
                    <Icon className="h-[1.35rem] w-[1.35rem]" aria-hidden="true" />
                  </motion.div>
                  <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/60">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold text-foreground">{title}</h3>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="mx-auto max-w-md md:hidden"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={prefersReducedMotion ? undefined : { hidden: {}, visible: { transition: { staggerChildren: 0.16 } } }}
          >
            {MEASUREMENT_JOURNEY.map(({ icon: Icon, title }, index) => (
              <motion.div
                key={title}
                className="relative flex items-center gap-4 pb-7 last:pb-0"
                variants={prefersReducedMotion ? undefined : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.34 } } }}
              >
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
                    <p className="mt-1.5 text-[11px] text-amber-100/90">{JOURNEY_BREAKS[index].label}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </PageSection>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0,175,239,0.22) 1px, transparent 1.4px)",
              backgroundSize: "34px 34px",
              maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          />
          <div className="absolute left-[8%] top-[12%] h-56 w-56 rounded-full border border-atd-cyan/[0.07]" />
          <div className="absolute right-[7%] top-[36%] h-72 w-72 rounded-full border border-primary/[0.06]" />
          <div className="absolute left-[18%] right-[18%] top-[48%] h-px bg-gradient-to-r from-transparent via-atd-blue/[0.10] to-transparent" />
          <div className="absolute left-[12%] top-[28%] h-2 w-2 rounded-full bg-atd-cyan/20 shadow-[18rem_6rem_0_rgba(51,204,153,0.12),42rem_15rem_0_rgba(0,175,239,0.12),66rem_4rem_0_rgba(51,204,153,0.10)]" />
        </div>

      <PageSection spacing="spacious" className="relative z-10 py-12 md:py-16 lg:py-20" containerClassName="px-5 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/[0.07] bg-[linear-gradient(135deg,rgba(0,175,239,0.035),rgba(51,204,153,0.025)_48%,rgba(255,255,255,0.015))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.08)] sm:p-7 lg:p-9">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-atd-cyan/[0.06] blur-3xl" aria-hidden="true" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">The familiar problem</p>
              <h2 className="mt-4 max-w-xl text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.55rem] lg:leading-[1.08] xl:text-[2.7rem]">
                <span className="block lg:whitespace-nowrap" data-familiar-problem-line>The application arrives.</span>{" "}
                <span className="block text-gradient sm:whitespace-nowrap">The source doesn’t.</span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                Your admissions team gets the application. What can disappear is the context that explains which ad, campaign or channel brought that prospective student to you.
              </p>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-background/55 shadow-[0_22px_60px_rgba(0,0,0,0.12)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5 sm:px-6">
                <div>
                  <p className="text-sm font-semibold text-foreground">Three systems. Three answers.</p>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Same period
                </span>
              </div>

              <div className="divide-y divide-white/[0.07]">
                {REPORTING_SNAPSHOT.map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="grid gap-2.5 px-5 py-3.5 sm:grid-cols-[0.85fr_0.72fr_1.18fr] sm:items-center sm:px-6"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.55 }}
                    transition={{ duration: 0.3, delay: index * 0.08 }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/75">{item.label}</p>
                    <p className="whitespace-nowrap text-xl font-bold tracking-tight text-foreground">{item.value}</p>
                    <p className="text-[13px] leading-5 text-muted-foreground">{item.detail}</p>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-white/[0.07] bg-primary/[0.045] px-5 py-3.5 text-center sm:px-6">
                <p className="mx-auto max-w-2xl text-[13px] font-semibold leading-5 text-foreground/88">
                  The useful question: where did the measurement journey stop agreeing?
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection id="audit-coverage" spacing="spacious" className="relative z-10 scroll-mt-20 py-16 md:py-24 lg:py-28" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="What we review"
          title={
            <>
              <span className="lg:block">We follow one recruitment journey</span>{" "}
              <span className="lg:block">from click to admissions handoff.</span>
            </>
          }
          description="The audit stays focused on one real recruitment journey so we can answer three practical questions without burying your marketing or admissions team in technical detail."
          align="center"
          maxWidth="xl"
          titleClassName="text-balance lg:!max-w-[58rem]"
          descriptionClassName="text-balance lg:!max-w-[52rem]"
          className="mb-9 md:mb-11"
        />

        <div className="tracking-audit-scope-card mx-auto mb-10 max-w-6xl overflow-hidden rounded-[24px] border border-white/[0.07] bg-[linear-gradient(135deg,rgba(51,204,153,0.055),rgba(0,175,239,0.025)_52%,rgba(255,255,255,0.015))] md:mb-12">
          <div className="grid md:grid-cols-[1.05fr_1.95fr]">
            <div className="border-b border-white/[0.07] p-5 md:border-b-0 md:border-r md:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/75">Free audit scope</p>
              <h2 className="mt-2.5 text-xl font-bold tracking-tight md:text-2xl">One institution. One website. One recruitment journey.</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 md:p-5">
              {[
                ["01", "One institution / brand"],
                ["02", "One website / domain"],
                ["03", "One core recruitment journey"],
                ["04", "Up to two paid platforms"],
              ].map(([number, label]) => (
                <div key={label} className="rounded-2xl border border-white/[0.07] bg-background/[0.35] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.05)]">
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
                <h3
                  className={[
                    "mt-6 text-[0.95rem] font-semibold tracking-[-0.01em] text-foreground",
                    index === 1 ? "lg:whitespace-nowrap lg:text-[0.9rem] xl:text-[0.95rem]" : "",
                  ].join(" ")}
                  data-health-dimension-title={index}
                >
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </PageSection>
      </div>

      <PageSection surface="quiet" spacing="spacious" className="py-16 md:py-24 lg:py-28" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="What you get"
          title="A scorecard that turns uncertainty into next steps."
          description="You get a short Tracking Health Scorecard that shows what we found, why it matters and what should be checked or fixed first."
          align="center"
          maxWidth="xl"
          titleClassName="text-balance"
          descriptionClassName="text-balance lg:!max-w-[52rem]"
          className="mb-9 md:mb-11"
        />

        <div className="mx-auto mb-16 flex max-w-6xl justify-center">
          <motion.div
            className="relative w-full max-w-[46rem] overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.03] shadow-[0_30px_90px_rgba(0,0,0,0.16)]"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-3.5 sm:px-7">
              <div>
                <p className="text-sm font-semibold">Tracking Health Scorecard</p>
              </div>
              <span className="rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                Sample
              </span>
            </div>

            <div className="divide-y divide-white/[0.07]">
              {SCORECARD_PREVIEW.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="px-5 py-3.5 sm:px-7"
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
                  <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{item.detail}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 border-t border-white/[0.07] bg-primary/[0.035] text-center">
              <div className="px-3 py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary/70">Recommended first step</p>
                <p className="mt-1 text-[13px] font-semibold">Fix the application / CRM handoff</p>
              </div>
              <div className="border-l border-white/[0.07] px-3 py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary/70">Priority</p>
                <p className="mt-1 text-[13px] font-semibold">High</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mx-auto mt-20 max-w-6xl rounded-[30px] border border-white/[0.07] bg-background/30 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.07)] sm:p-8 lg:p-10">
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">From finding to action</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">The scorecard gives you three things.</h3>
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

          </div>
        </div>

        <div className="mx-auto mt-16 max-w-6xl border-t border-white/[0.07] pt-12">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/75">How it works</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">From application to scorecard in four steps.</h3>
          </div>

          <motion.div
            data-process-sequence
            data-process-pace="deliberate"
            className="relative overflow-hidden rounded-[30px] border border-white/[0.07] bg-[linear-gradient(135deg,rgba(0,175,239,0.025),rgba(51,204,153,0.02),rgba(255,255,255,0.012))] px-5 py-9 shadow-[0_22px_64px_rgba(0,0,0,0.07)] sm:px-7 lg:px-9 lg:py-12"
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.32 }}
          >
            <svg
              className="pointer-events-none absolute inset-x-[7%] top-[4.8rem] hidden h-36 w-[86%] text-primary/22 lg:block"
              viewBox="0 0 1000 180"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <motion.path
                data-process-path
                d="M20 92 C135 24 215 24 325 92 S515 160 625 92 S815 24 980 92"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="7 8"
                strokeLinecap="round"
                variants={
                  prefersReducedMotion
                    ? undefined
                    : {
                        hidden: { pathLength: 0, opacity: 0.18 },
                        visible: { pathLength: 1, opacity: 1, transition: { duration: 2.1, ease: "easeInOut" } },
                      }
                }
              />
            </svg>

            <motion.ol
              className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
              variants={
                prefersReducedMotion
                  ? undefined
                  : { hidden: {}, visible: { transition: { delayChildren: 0.32, staggerChildren: 0.42 } } }
              }
            >
              {PROCESS_STEPS.map((item, index) => {
                const Icon = [Send, ShieldCheck, Route, CheckCircle2][index];
                return (
                  <motion.li
                    key={item.number}
                    data-process-step={index}
                    variants={
                      prefersReducedMotion
                        ? undefined
                        : {
                            hidden: { opacity: 0, y: 18, scale: 0.985 },
                            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.62, ease: "easeOut" } },
                          }
                    }
                  >
                    <div
                      className={[
                        "relative h-full rounded-2xl border border-white/[0.08] bg-background/70 p-5 text-left shadow-[0_14px_38px_rgba(0,0,0,0.08)] backdrop-blur",
                        index % 2 === 0 ? "lg:-translate-y-5" : "lg:translate-y-5",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.06] text-primary">
                          <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/65">
                          {item.number} / 04
                        </span>
                      </div>
                      <h4 className="mt-5 text-base font-semibold">{item.title}</h4>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ol>
          </motion.div>
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

        <section className="tracking-audit-final-cta relative border-t border-white/[0.05] py-16 md:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_55%_at_50%_100%,rgba(51,204,153,0.09),transparent_68%),radial-gradient(ellipse_45%_50%_at_20%_45%,rgba(0,175,239,0.055),transparent_72%)]" />
            <div className="absolute left-[18%] right-[18%] top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          <div className="container relative mx-auto px-5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl text-center">
              <h2 className="mx-auto max-w-5xl px-2 text-balance text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl md:text-[2.8rem] lg:text-5xl">
                <span className="block">Know which recruitment campaigns are</span>
                <span className="mt-1 block pb-[0.12em] text-gradient lg:whitespace-nowrap">actually producing applications.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                If you’re spending on student recruitment but can’t confidently connect campaigns to enquiries, applications or enrolments, request a free audit.
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

export default TrackingAuditEducation;
