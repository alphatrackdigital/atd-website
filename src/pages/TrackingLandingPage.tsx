import type { ReactNode } from "react";
import { useRef, useState } from "react";
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
  BarChart3,
  Check,
  CheckCircle2,
  Code2,
  Gauge,
  Globe2,
  Loader2,
  Route,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type ChoiceOption = {
  value: string;
  label: string;
};

const INDUSTRY_OPTIONS = [
  { value: "professional_services", label: "Professional services" },
  { value: "education_training", label: "Education / training" },
  { value: "ecommerce_dtc", label: "Ecommerce / DTC" },
  { value: "real_estate", label: "Real estate" },
  { value: "other", label: "Other" },
] as const;

const ROLE_OPTIONS = [
  { value: "founder_ceo", label: "Founder / CEO" },
  { value: "marketing_lead", label: "Marketing lead" },
  { value: "growth_performance", label: "Growth / performance" },
  { value: "operations_commercial", label: "Operations / commercial" },
  { value: "other", label: "Other" },
] as const;

const DECISION_OPTIONS = [
  { value: "final_decision_maker", label: "Final decision maker" },
  { value: "strong_influence", label: "Strong influence" },
  { value: "contributor", label: "Contributor" },
  { value: "researching", label: "Researching" },
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
  { value: "basic", label: "Basic" },
  { value: "partial", label: "Partly working" },
  { value: "disconnected", label: "Disconnected" },
  { value: "confident", label: "Confident — want validation" },
] as const;

const CONVERSION_OPTIONS = [
  { value: "lead_form", label: "Lead form" },
  { value: "booked_call_appointment", label: "Booked call" },
  { value: "whatsapp_message", label: "WhatsApp / message" },
  { value: "ecommerce_purchase", label: "Purchase" },
  { value: "application_enrolment", label: "Application / enrolment" },
  { value: "other", label: "Other" },
] as const;

const PROBLEM_OPTIONS = [
  { value: "unclear_campaign_performance", label: "I can’t tell which campaigns work" },
  { value: "conflicting_numbers", label: "My numbers don’t match" },
  { value: "missing_conversion_tracking", label: "Conversions are missing" },
  { value: "leads_without_attribution", label: "Lead sources are missing" },
  { value: "browser_server_signal_gap", label: "Browser and server tracking don’t match" },
  { value: "other", label: "Other" },
] as const;

const URGENCY_OPTIONS = [
  { value: "before_scaling", label: "Before scaling" },
  { value: "within_30_days", label: "Within 30 days" },
  { value: "one_to_three_months", label: "1–3 months" },
  { value: "exploring", label: "Exploring" },
] as const;

const MEASUREMENT_JOURNEY = [
  { icon: BarChart3, title: "Paid ads", description: "Someone clicks one of your ads.", signal: "Click" },
  { icon: Globe2, title: "Website", description: "They visit your website and take a look around.", signal: "Visit" },
  { icon: CheckCircle2, title: "Conversion", description: "They fill a form, book, message or buy.", signal: "Action" },
  { icon: Send, title: "CRM / sales", description: "The lead reaches the system or team that follows up.", signal: "Lead" },
  { icon: Gauge, title: "Business result", description: "You should be able to trace the lead or sale back to marketing.", signal: "Result" },
] as const;

const JOURNEY_BREAKS = [
  { label: "Source gets lost", position: "20%" },
  { label: "Action is not tracked", position: "40%" },
  { label: "Lead loses its source", position: "60%" },
  { label: "Sale can’t be traced", position: "80%" },
] as const;

const HEALTH_DIMENSIONS = [
  { icon: Code2, number: "01", title: "Conversion capture", description: "Are the actions that matter being tracked?" },
  { icon: Gauge, number: "02", title: "Signal quality", description: "Is the right data reaching your ad platforms?" },
  { icon: Route, number: "03", title: "Attribution", description: "Can you tell which campaign or source produced a result?" },
  { icon: Send, number: "04", title: "Lead visibility", description: "Can you see where each lead came from?" },
  { icon: BarChart3, number: "05", title: "Data reliability", description: "Do your reports agree enough to make decisions?" },
] as const;

const PROCESS_STEPS = [
  { number: "01", title: "Apply", description: "Tell us about your business and the result you want to track." },
  { number: "02", title: "Fit review", description: "We check that the free audit is a good fit." },
  { number: "03", title: "Review", description: "We check one customer journey and look for gaps." },
  { number: "04", title: "Scorecard", description: "You get clear findings and next steps." },
] as const;

const AUDIT_FAQS: FAQItem[] = [
  {
    question: "Will you need access to our accounts?",
    answer: "Usually not at first. We start with what we can see publicly. If we need to confirm something, we may ask for read-only access, a screenshare or an export.",
  },
  {
    question: "What does the free audit cover?",
    answer: "One company, one website, one main conversion journey and up to two paid ad platforms where relevant. You receive a Tracking Health Scorecard with the main findings and recommended next steps.",
  },
  {
    question: "Is implementation included?",
    answer: "No. The free audit tells you what we found and what should happen next. If you want us to fix the issues, that work is scoped separately.",
  },
  {
    question: "How long does the review take?",
    answer: "We aim to review applications within one business day. If your application is accepted, we’ll confirm the audit timing before we begin.",
  },
  {
    question: "What if our setup is more complex?",
    answer: "If your setup needs a deeper review across several systems, we’ll tell you before proceeding and explain what would need to be scoped separately.",
  },
];

const TRACKING_AUDIT_ANCHOR_CTA = {
  label: "Request My Free Audit",
  to: "/offer/tracking-audit#claim",
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

const ChoiceGrid = ({
  legend,
  name,
  value,
  onChange,
  options,
  error,
  helper,
  columns = "two",
}: {
  legend: string;
  name: string;
  value?: string;
  onChange: (value: string) => void;
  options: readonly ChoiceOption[];
  error?: string;
  helper?: string;
  columns?: "two" | "three";
}) => (
  <fieldset className="space-y-2.5" aria-invalid={!!error} aria-describedby={error ? name + "-err" : undefined}>
    <legend className="text-sm font-medium text-foreground/90">{legend}</legend>
    {helper && <p className="text-xs leading-5 text-muted-foreground">{helper}</p>}
    <div className={columns === "three" ? "grid grid-cols-2 gap-2 sm:grid-cols-3" : "grid grid-cols-2 gap-2"}>
      {options.map((option) => {
        const checked = value === option.value;
        const id = name + "-" + option.value;
        return (
          <label
            key={option.value}
            htmlFor={id}
            className={[
              "flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-medium leading-4 transition-colors sm:text-[13px]",
              checked
                ? "border-primary/45 bg-primary/[0.12] text-primary shadow-[inset_0_0_0_1px_rgba(51,204,153,0.05)]"
                : "border-white/[0.08] bg-white/[0.025] text-foreground/78 hover:border-white/[0.14] hover:bg-white/[0.045]",
            ].join(" ")}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
    {error && <p id={name + "-err"} role="alert" className="text-xs text-red-400">{error}</p>}
  </fieldset>
);

const SingleChoiceChips = ({
  legend,
  name,
  value,
  onChange,
  options,
  error,
}: {
  legend: string;
  name: string;
  value?: string;
  onChange: (value: string) => void;
  options: readonly ChoiceOption[];
  error?: string;
}) => (
  <fieldset className="space-y-2.5" aria-invalid={!!error} aria-describedby={error ? name + "-err" : undefined}>
    <legend className="text-sm font-medium text-foreground/90">{legend}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const checked = value === option.value;
        const id = name + "-" + option.value;
        return (
          <label
            key={option.value}
            htmlFor={id}
            className={[
              "flex min-h-10 cursor-pointer items-center rounded-full border px-3.5 py-2 text-xs font-medium transition-colors focus-within:ring-1 focus-within:ring-primary/50",
              checked
                ? "border-primary/45 bg-primary/[0.12] text-primary"
                : "border-white/[0.08] bg-white/[0.025] text-foreground/78 hover:border-white/[0.14] hover:bg-white/[0.045]",
            ].join(" ")}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
    {error && <p id={name + "-err"} role="alert" className="text-xs text-red-400">{error}</p>}
  </fieldset>
);

const TrackingLandingPage = () => {
  const location = useLocation();
  const finalCtaTo = withCampaignSearch(TRACKING_AUDIT_ANCHOR_CTA.to, location.search);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const formStartAt = useRef(0);
  const formStartTracked = useRef(false);
  const stepOneTracked = useRef(false);
  const lastSubmit = useRef(0);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<AuditFormData>({
    resolver: zodResolver(auditSchema),
    defaultValues: { adPlatforms: [], marketingOptIn: false },
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
        description="Request a free conversion tracking audit to find gaps in your tracking, see where lead-source information gets lost and understand whether your marketing reports can be trusted."
        canonicalUrl="/offer/tracking-audit"
      />

      <section className="relative overflow-hidden border-b border-white/[0.05] pb-12 pt-7 md:pb-16 md:pt-24 lg:pb-20 lg:pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_50%_at_31%_40%,rgba(0,175,239,0.12)_0%,rgba(0,51,153,0.08)_38%,transparent_72%),radial-gradient(ellipse_46%_48%_at_73%_30%,rgba(51,204,153,0.10)_0%,transparent_72%)]" />
          <div
            className="absolute inset-0 opacity-[0.16]"
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

        <div className="container relative mx-auto px-5 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,480px)] lg:items-center lg:gap-14">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="pt-2 lg:pt-0">
              <HeroEyebrow>Free Conversion Tracking Audit</HeroEyebrow>

              <h1 className="title-safe mt-5 max-w-[36rem] text-[2.55rem] font-extrabold leading-[1.02] tracking-tight sm:text-5xl md:text-[3.4rem] lg:text-[3.6rem]">
                Know what your marketing is <span className="title-safe-inline text-gradient-atd-hero">actually producing.</span>
              </h1>

              <p className="mt-5 max-w-[35rem] text-base leading-7 text-foreground/72 md:text-lg md:leading-8">
                We review one customer journey to show where your tracking breaks and why your marketing reports may not be telling the full story.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/78">
                {["No passwords", "Read-only access only if needed"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-7">
                <a
                  href="#measurement-journey"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground/62 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  See what we review
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </motion.div>

            <motion.div
              id="claim"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="w-full scroll-mt-24 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-7 md:p-8 lg:sticky lg:top-24 lg:rounded-[28px]"
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
                          ? "A little about your marketing."
                          : "What do you want to understand?"}
                    </h2>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                      {step === 1
                        ? "We review every application."
                        : step === 2
                          ? "This helps us see if the free audit is a good fit."
                          : "Tell us what isn’t clear in your tracking or reports."}
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

                        <Field label="Company" htmlFor="f-company" error={errors.company?.message}>
                          <Input id="f-company" placeholder="Company name" autoComplete="organization" className={fieldClassName} aria-invalid={!!errors.company} aria-describedby={errors.company ? "f-company-err" : undefined} {...register("company")} />
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
                          <p id="step2-business-context" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">Business context</p>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Industry" htmlFor="f-industry" error={errors.industry?.message}>
                              <Controller control={control} name="industry" render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger id="f-industry" className={fieldClassName} aria-invalid={!!errors.industry} aria-describedby={errors.industry ? "f-industry-err" : undefined}>
                                    <SelectValue placeholder="Select industry" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {INDUSTRY_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              )} />
                            </Field>

                            <Field label="Your role" htmlFor="f-role" error={errors.role?.message}>
                              <Controller control={control} name="role" render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger id="f-role" className={fieldClassName} aria-invalid={!!errors.role} aria-describedby={errors.role ? "f-role-err" : undefined}>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              )} />
                            </Field>
                          </div>
                        </section>

                        <section className="mt-6 space-y-4 border-t border-white/[0.06] pt-5" aria-labelledby="step2-decision-spend">
                          <p id="step2-decision-spend" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">Decision & spend</p>
                          <Controller control={control} name="decisionInfluence" render={({ field }) => (
                            <ChoiceGrid
                              legend="Your role in this decision"
                              name="decisionInfluence"
                              value={field.value}
                              onChange={field.onChange}
                              options={DECISION_OPTIONS}
                              error={errors.decisionInfluence?.message}
                            />
                          )} />

                          <Field label="Monthly ad spend" htmlFor="f-spend" error={errors.monthlyAdSpendBand?.message}>
                            <Controller control={control} name="monthlyAdSpendBand" render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="f-spend" className={fieldClassName} aria-invalid={!!errors.monthlyAdSpendBand} aria-describedby={errors.monthlyAdSpendBand ? "f-spend-err" : undefined}>
                                  <SelectValue placeholder="Select spend range" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SPEND_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )} />
                          </Field>
                        </section>

                        <section className="mt-6 space-y-3 border-t border-white/[0.06] pt-5" aria-labelledby="step2-advertising">
                          <p id="step2-advertising" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">Advertising</p>
                          <Controller control={control} name="adPlatforms" render={({ field }) => (
                            <fieldset aria-invalid={!!errors.adPlatforms} aria-describedby={errors.adPlatforms ? "f-platforms-err" : undefined} className="space-y-2.5">
                              <legend className="text-sm font-medium text-foreground/90">Where do you advertise?</legend>
                              <div className="flex flex-wrap gap-2">
                                {PLATFORM_OPTIONS.map((platform) => {
                                  const checked = field.value?.includes(platform.value) ?? false;
                                  return (
                                    <label
                                      key={platform.value}
                                      className={[
                                        "flex min-h-10 cursor-pointer items-center rounded-full border px-3.5 py-2 text-xs font-medium transition-colors focus-within:ring-1 focus-within:ring-primary/50",
                                        checked
                                          ? "border-primary/45 bg-primary/[0.12] text-primary"
                                          : "border-white/[0.08] bg-white/[0.025] text-foreground/78 hover:border-white/[0.14] hover:bg-white/[0.045]",
                                      ].join(" ")}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        className="sr-only"
                                        onChange={() => {
                                          const current = field.value ?? [];
                                          if (platform.value === "none_currently") {
                                            field.onChange(checked ? [] : ["none_currently"]);
                                            return;
                                          }
                                          const withoutNone = current.filter((value) => value !== "none_currently");
                                          field.onChange(checked ? withoutNone.filter((value) => value !== platform.value) : [...withoutNone, platform.value]);
                                        }}
                                      />
                                      {platform.label}
                                    </label>
                                  );
                                })}
                              </div>
                              {errors.adPlatforms && <p id="f-platforms-err" role="alert" className="text-xs text-red-400">{errors.adPlatforms.message}</p>}
                            </fieldset>
                          )} />
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
                        <section className="space-y-3" aria-labelledby="step3-tracking">
                          <p id="step3-tracking" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">Tracking</p>
                          <Controller control={control} name="trackingMaturity" render={({ field }) => (
                            <SingleChoiceChips
                              legend="How confident are you in your tracking?"
                              name="trackingMaturity"
                              value={field.value}
                              onChange={field.onChange}
                              options={MATURITY_OPTIONS}
                              error={errors.trackingMaturity?.message}
                            />
                          )} />
                        </section>

                        <section className="mt-6 space-y-3 border-t border-white/[0.06] pt-5" aria-labelledby="step3-conversion">
                          <p id="step3-conversion" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">Conversion</p>
                          <Controller control={control} name="primaryConversionType" render={({ field }) => (
                            <SingleChoiceChips
                              legend="What matters most?"
                              name="primaryConversionType"
                              value={field.value}
                              onChange={field.onChange}
                              options={CONVERSION_OPTIONS}
                              error={errors.primaryConversionType?.message}
                            />
                          )} />
                        </section>

                        <section className="mt-6 space-y-3 border-t border-white/[0.06] pt-5" aria-labelledby="step3-main-issue">
                          <p id="step3-main-issue" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">Main issue</p>
                          <Field label="What’s going wrong?" htmlFor="f-problem" error={errors.measurementProblem?.message}>
                            <Controller control={control} name="measurementProblem" render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="f-problem" className={fieldClassName} aria-invalid={!!errors.measurementProblem} aria-describedby={errors.measurementProblem ? "f-problem-err" : undefined}>
                                  <SelectValue placeholder="Select the closest issue" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROBLEM_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )} />
                          </Field>
                        </section>

                        <section className="mt-6 space-y-3 border-t border-white/[0.06] pt-5" aria-labelledby="step3-timing">
                          <p id="step3-timing" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">Timing</p>
                          <Controller control={control} name="urgency" render={({ field }) => (
                            <ChoiceGrid
                              legend="How soon do you want this addressed?"
                              name="urgency"
                              value={field.value}
                              onChange={field.onChange}
                              options={URGENCY_OPTIONS}
                              error={errors.urgency?.message}
                            />
                          )} />
                        </section>

                        <div className="mt-6 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
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
        </div>
      </section>

      <PageSection id="measurement-journey" surface="quiet" spacing="spacious" className="scroll-mt-20 py-14 md:py-20" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="What happens after the click"
          title="Your marketing results pass through several steps."
          description="An ad click can look fine at the start and still lose important information before it becomes a lead or sale. We check that journey to find where the problem starts."
          align="center"
          maxWidth="2xl"
          className="mb-12 md:mb-16"
        />

        <div className="mx-auto max-w-6xl">
          <div className="relative hidden pt-10 lg:block">
            <motion.div
              className="absolute left-[10%] right-[10%] top-[3.85rem] h-px bg-gradient-to-r from-atd-blue/25 via-primary/55 to-atd-cyan/25"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
              aria-hidden="true"
            />

            {JOURNEY_BREAKS.map((item) => (
              <div key={item.label} className="absolute top-[3.52rem] z-20 -translate-x-1/2" style={{ left: item.position }}>
                <span className="block h-2.5 w-2.5 rotate-45 border border-amber-300/45 bg-[#0b1118]" aria-hidden="true" />
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-amber-100/65">
                  {item.label}
                </span>
              </div>
            ))}

            <div className="relative grid grid-cols-5 gap-8">
              {MEASUREMENT_JOURNEY.map(({ icon: Icon, title, description, signal }, index) => (
                <article key={title} className="text-center">
                  <div className="relative z-10 mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-[#0a1017] text-primary shadow-[0_0_0_7px_rgba(8,14,20,0.94)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/60">
                    {String(index + 1).padStart(2, "0")} · {signal}
                  </p>
                  <h3 className="mt-1.5 text-base font-semibold text-foreground">{title}</h3>
                  <p className="mx-auto mt-2 max-w-[12rem] text-sm leading-6 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="lg:hidden">
            {MEASUREMENT_JOURNEY.map(({ icon: Icon, title, description, signal }, index) => (
              <div key={title} className="relative pb-8 pl-14 last:pb-0">
                {index < MEASUREMENT_JOURNEY.length - 1 && (
                  <div className="absolute bottom-0 left-[21px] top-10 w-px bg-gradient-to-b from-primary/40 to-atd-blue/15" aria-hidden="true" />
                )}
                <div className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 bg-[#0a1017] text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/60">
                  {String(index + 1).padStart(2, "0")} · {signal}
                </p>
                <h3 className="mt-1 text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
                {JOURNEY_BREAKS[index] && (
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-amber-100/65">
                    <span className="h-2 w-2 rotate-45 border border-amber-300/45" aria-hidden="true" />
                    {JOURNEY_BREAKS[index].label}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-6 text-muted-foreground">
            If one step loses information, your ad reports, website data and sales records can all show a different picture.
          </p>
        </div>
      </PageSection>

      <PageSection id="audit-coverage" spacing="spacious" className="scroll-mt-20 py-14 md:py-20" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          title="We check five parts of your tracking."
          description="For your reports to be useful, these five parts need to work together."
          align="center"
          maxWidth="2xl"
          className="mb-10 md:mb-14"
        />

        <div className="mx-auto max-w-6xl border-y border-white/[0.07]">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5">
            {HEALTH_DIMENSIONS.map(({ icon: Icon, number, title, description }, index) => (
              <article
                key={title}
                className={[
                  "py-6 sm:px-5 lg:min-h-[15rem] lg:py-7",
                  index % 2 === 1 ? "sm:border-l sm:border-white/[0.07]" : "",
                  index > 1 ? "sm:border-t sm:border-white/[0.07]" : "",
                  index > 0 ? "lg:border-l lg:border-t-0 lg:border-white/[0.07]" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-2xl font-light tracking-tight text-foreground/28">{number}</span>
                  <Icon className="h-4 w-4 text-primary/65" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection surface="quiet" spacing="spacious" className="py-14 md:py-20" containerClassName="px-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-14">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/85">What you get</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">You get clear findings and next steps.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
              We show what we found, why it matters and what should be fixed first.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {["Scorecard", "Priorities", "Next actions"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 text-sm text-foreground/78">
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>

            <p className="mt-6 max-w-lg text-xs leading-5 text-muted-foreground">
              The free audit includes the review and recommendations. Fixing the issues is separate.
            </p>
          </div>

          <motion.article
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-2xl bg-white/[0.025] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.18)] ring-1 ring-white/[0.08] sm:p-7"
          >
            <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-amber-300/55" aria-hidden="true" />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">Illustrative scorecard finding</p>
                <h3 className="mt-2 text-xl font-semibold">Attribution</h3>
                <p className="mt-1 text-sm text-amber-100/75">Needs attention</p>
              </div>
              <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1 text-[11px] font-medium text-amber-100/75">
                High priority
              </span>
            </div>

            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Evidence</p>
                <p className="mt-2 text-sm leading-6 text-foreground/82">
                  The campaign source is visible when a visitor arrives, but it is sometimes lost when the lead is created.
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Business impact</p>
                <p className="mt-2 text-sm leading-6 text-foreground/82">
                  Some paid leads may show up as direct or unknown, making campaign results harder to judge.
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-white/[0.07] pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recommended next step</p>
              <p className="mt-2 text-sm leading-6 text-foreground/82">
                Check that the campaign source stays attached from the website form through to the CRM before changing your campaigns.
              </p>
            </div>
          </motion.article>
        </div>
      </PageSection>

      <PageSection spacing="spacious" className="py-14 md:py-20" containerClassName="px-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-14">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/[0.07] text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">We start with the least access possible.</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
              We start with public information. If we need to confirm something, we may ask for read-only access. We never ask for passwords.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/[0.018] p-5 ring-1 ring-white/[0.055] sm:p-6">
            <div className="border-l-2 border-primary/55 pl-4 sm:pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/70">Level 0</p>
              <h3 className="mt-1.5 text-base font-semibold">Public information</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">We start here. No account access needed.</p>
            </div>

            <div className="mt-5 ml-4 rounded-2xl bg-white/[0.025] p-4 sm:ml-8 sm:p-5">
              <div className="border-l-2 border-atd-cyan/45 pl-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-atd-cyan/70">Level 1</p>
                <h3 className="mt-1.5 text-base font-semibold">Read-only access</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  Only if we need to confirm something we cannot see publicly.
                </p>
              </div>

              <div className="mt-5 ml-4 rounded-xl bg-black/15 p-4 sm:ml-8">
                <div className="border-l-2 border-white/15 pl-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Level 2</p>
                  <h3 className="mt-1.5 text-base font-semibold text-foreground/88">Paid implementation</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    Access to make changes is only requested if you hire us to fix the issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection surface="quiet" spacing="spacious" className="py-14 md:py-20" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          title="Here’s how the audit works."
          description="You apply, we check fit, review one journey and send your scorecard."
          align="center"
          maxWidth="2xl"
          className="mb-12 md:mb-16"
        />

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-px bg-white/[0.10] lg:block" aria-hidden="true" />
          <ol className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PROCESS_STEPS.map((item) => (
              <li key={item.number} className="relative flex gap-4 border-b border-white/[0.06] pb-6 last:border-b-0 sm:block sm:border-b-0 sm:pb-0 lg:text-center">
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-[#091017] text-xs font-bold text-primary sm:mb-5 lg:mx-auto">
                  {item.number}
                </span>
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
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
          contentClassName="max-w-[46rem]"
          sectionClassName="bg-transparent"
          sectionSpacingClassName="py-14 md:py-20"
        />

        <section className="relative overflow-hidden border-t border-white/[0.05] py-16 md:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_55%_at_50%_100%,rgba(51,204,153,0.09),transparent_68%),radial-gradient(ellipse_45%_50%_at_20%_45%,rgba(0,175,239,0.055),transparent_72%)]" />
            <div className="absolute left-[18%] right-[18%] top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          <div className="container relative mx-auto px-5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Find out where your <span className="text-gradient">tracking breaks.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Apply for a free audit and get a clearer view of what your marketing is really producing.
              </p>
              <Button asChild size="lg" className="mt-8 rounded-xl bg-primary px-8 text-primary-foreground shadow-[0_0_24px_rgba(51,204,153,0.18)] transition-shadow hover:bg-primary/90 hover:shadow-[0_0_34px_rgba(0,175,239,0.14)]">
                <Link to={finalCtaTo}>{TRACKING_AUDIT_ANCHOR_CTA.label}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

    </>
  );
};

export default TrackingLandingPage;
