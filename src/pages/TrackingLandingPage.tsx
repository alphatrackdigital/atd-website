import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Code2,
  Gauge,
  Loader2,
  Route,
  Send,
  ShieldCheck,
} from "lucide-react";

import SEO from "@/components/shared/SEO";
import CTASection from "@/components/shared/CTASection";
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
import { pushLeadSubmissionEvent } from "@/lib/tracking";

const normalizeWebsiteUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const isValidWebsiteUrl = (value: string) => {
  try {
    const url = new URL(normalizeWebsiteUrl(value));
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
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
  { value: "browser_server_signal_gap", label: "Pixel / CAPI concerns" },
  { value: "other", label: "Other" },
] as const;

const URGENCY_OPTIONS = [
  { value: "before_scaling", label: "Before scaling" },
  { value: "within_30_days", label: "Within 30 days" },
  { value: "one_to_three_months", label: "1–3 months" },
  { value: "exploring", label: "Exploring" },
] as const;

const HEALTH_DIMENSIONS = [
  { icon: Code2, title: "Conversion capture", description: "Are key actions recorded?" },
  { icon: Gauge, title: "Signal quality", description: "Are platform signals reliable?" },
  { icon: Route, title: "Attribution", description: "Can conversions be tied to source?" },
  { icon: Send, title: "Lead visibility", description: "Can you see what happens after conversion?" },
  { icon: BarChart3, title: "Data reliability", description: "Can your team trust the numbers?" },
] as const;

const DELIVERABLES = [
  "Tracking Health Scorecard",
  "Prioritized findings",
  "Clear next steps",
] as const;

const PROCESS_STEPS = [
  { number: "01", title: "Apply", description: "Tell us about your business and one conversion journey." },
  { number: "02", title: "We review fit", description: "We confirm whether the free audit is a good fit." },
  { number: "03", title: "We diagnose", description: "We start with public evidence and ask for read-only evidence only if needed." },
  { number: "04", title: "You get the scorecard", description: "We send the findings and the most important next steps." },
] as const;

const AUDIT_FAQS: FAQItem[] = [
  {
    question: "Is the audit really free?",
    answer: "Yes. The audit is a bounded diagnostic for eligible businesses. Implementation or repair work is separate.",
  },
  {
    question: "Do you need access to my accounts?",
    answer: "Not always. We start with public evidence. If something important needs confirmation, we may ask for viewer/read-only access, a screenshare or an export.",
  },
  {
    question: "Will you ask for my passwords?",
    answer: "No. Do not send passwords, API keys or other credentials by email or form.",
  },
  {
    question: "What platforms do you review?",
    answer: "We review the measurement journey around your website, analytics, paid platforms, attribution and lead handoff. The free scope covers one core journey and up to two paid platforms where relevant.",
  },
  {
    question: "Will you fix the issues during the audit?",
    answer: "No. The free audit diagnoses and prioritizes issues. If you want AlphaTrack Digital to implement the recommendations, that is scoped separately.",
  },
  {
    question: "How quickly will I hear back?",
    answer: "We aim to review applications within one business day. Audit acceptance and delivery timing depend on fit, scope and current capacity.",
  },
];

const TRACKING_AUDIT_ANCHOR_CTA = {
  label: "Request a Free Tracking Audit",
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
        description="Request a free conversion tracking audit to find broken tracking, weak attribution and missing lead-source data across one core conversion journey."
        canonicalUrl="/offer/tracking-audit"
      />

      <section className="relative overflow-hidden border-b border-white/[0.05] pb-12 pt-7 md:pb-16 md:pt-24 lg:pb-20 lg:pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_74%_46%_at_50%_-8%,rgba(0,51,153,0.16)_0%,rgba(0,175,239,0.055)_43%,transparent_74%)]" />
          <div className="absolute right-[-7rem] top-16 h-80 w-80 rounded-full bg-primary/[0.055] blur-[120px]" />
          <div className="absolute bottom-[-5rem] left-[-8rem] h-96 w-96 rounded-full bg-atd-blue/[0.12] blur-[150px]" />
        </div>

        <div className="container relative mx-auto px-5 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,480px)] lg:items-start lg:gap-14">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="pt-2 lg:pt-7">
              <HeroEyebrow>Free Conversion Tracking Audit</HeroEyebrow>

              <h1 className="title-safe mt-5 max-w-[36rem] text-[2.55rem] font-extrabold leading-[1.02] tracking-tight sm:text-5xl md:text-[3.4rem] lg:text-[3.6rem]">
                Know what your marketing is <span className="title-safe-inline text-gradient-atd-hero">actually producing.</span>
              </h1>

              <p className="mt-5 max-w-[35rem] text-base leading-7 text-foreground/72 md:text-lg md:leading-8">
                We review one conversion journey to find broken tracking, weak attribution and missing lead-source data.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/78">
                {["No passwords", "Read-only access only if needed"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              id="claim"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="w-full scroll-mt-24 rounded-2xl border border-white/[0.09] bg-[#0c1118]/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-7 md:p-8 lg:sticky lg:top-24"
            >
              {isSubmitted ? (
                <div className="py-7 text-center" aria-live="polite">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
                  <h2 className="mt-4 text-2xl font-semibold">Application received.</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                    Thanks for requesting a Free Conversion Tracking Audit. We’ll review your application for fit and scope. If we can proceed, we’ll confirm the audit scope and let you know whether any read-only evidence is needed. Please do not send passwords or account credentials.
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
                    <div className="text-xs font-medium text-muted-foreground">
                      Step {step} of 3
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
                          ? "This helps us check fit and scope."
                          : "Tell us where measurement is breaking down."}
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
                        className="space-y-4"
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
                          <Input id="f-url" type="text" inputMode="url" placeholder="yourcompany.com" autoComplete="url" autoCapitalize="none" autoCorrect="off" className={fieldClassName} aria-invalid={!!errors.websiteUrl} aria-describedby={errors.websiteUrl ? "f-url-err" : undefined} {...register("websiteUrl")} />
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
                        className="space-y-5"
                      >
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

                        <div className="grid grid-cols-[auto_1fr] gap-2.5 pt-1">
                          <Button type="button" variant="outline" onClick={() => moveToStep(1)} className="rounded-xl border-white/10 px-4">Back</Button>
                          <Button type="button" size="lg" onClick={handleStepTwoContinue} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                            Continue
                            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="tracking-audit-step-3"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-5"
                      >
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

                        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                          <div className="flex items-start gap-3">
                            <input type="checkbox" id="f-marketing-opt-in" className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/5 accent-primary" {...register("marketingOptIn")} />
                            <label htmlFor="f-marketing-opt-in" className="cursor-pointer text-[13px] leading-5 text-muted-foreground sm:text-sm">
                              Send me occasional ATD marketing insights.
                            </label>
                          </div>
                          <p className="mt-1.5 pl-7 text-[11px] leading-4 text-muted-foreground/75">Optional. Not required for the audit.</p>
                        </div>

                        <div className="grid grid-cols-[auto_1fr] gap-2.5 pt-1">
                          <Button type="button" variant="outline" onClick={() => moveToStep(2)} className="rounded-xl border-white/10 px-4">Back</Button>
                          <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                            {isSubmitting ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />Submitting…</> : "Request My Free Audit"}
                          </Button>
                        </div>

                        <p className="text-center text-[11px] leading-4 text-muted-foreground">
                          No passwords, API keys or admin credentials.
                        </p>
                      </motion.div>
                    )}
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <PageSection id="audit-coverage" surface="quiet" border="both" spacing="spacious" className="scroll-mt-20 py-12 md:py-20" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="What we check"
          title="Five parts of your tracking."
          description="We score one conversion journey across five areas."
          align="center"
          maxWidth="xl"
          className="mb-8 md:mb-12"
        />

        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {HEALTH_DIMENSIONS.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-white/[0.08] bg-background/45 p-5">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection spacing="spacious" className="py-12 md:py-20" containerClassName="px-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">What you get</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">Clear findings. Clear next steps.</h2>
            <div className="mt-6 space-y-4">
              {DELIVERABLES.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm leading-6 text-foreground/85">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 border-t border-white/[0.07] pt-6">
              <p className="text-sm font-semibold text-foreground">Free audit boundary</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The free audit covers diagnosis and recommendations. Implementation is scoped separately if you want help fixing the issues.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/15 bg-[linear-gradient(145deg,rgba(51,204,153,0.07),rgba(0,51,153,0.06)_58%,rgba(255,255,255,0.018))] p-6 md:p-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">Access safety</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Your accounts stay under your control.</h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              We start with public evidence. If something important needs confirmation, we use the lowest practical read-only access, a screenshare or an export.
            </p>
            <div className="mt-6 rounded-xl border border-white/[0.08] bg-black/10 p-4">
              <p className="text-sm font-semibold text-foreground">Never send us a password.</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">We do not ask for passwords, API keys or admin credentials.</p>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection surface="quiet" border="both" spacing="spacious" className="py-12 md:py-20" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="How it works" title="Four simple steps." description="Apply, we review fit, we diagnose one journey, you get the scorecard." align="center" maxWidth="xl" className="mb-8 md:mb-12" />

        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((item) => (
            <article key={item.number} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.08] text-xs font-bold text-primary">{item.number}</span>
              <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <div className="border-t border-white/[0.06]">
        <FAQAccordion
          items={AUDIT_FAQS}
          eyebrow="Before you apply"
          title="Common questions"
          description="Quick answers before you apply."
          variant="minimal"
          density="compact"
          defaultOpenItem={0}
          mobileInitialItems={3}
          sectionSpacingClassName="py-12 md:py-20"
        />

        <CTASection
          title={<><span className="md:block">Ready to see what your</span> <span className="text-gradient">tracking is missing?</span></>}
          description=""
          primaryCta={TRACKING_AUDIT_ANCHOR_CTA}
          secondaryCta={null}
          variant="service-close"
          titleClassName="max-w-[25ch]"
        />
      </div>
    </>
  );
};

export default TrackingLandingPage;
