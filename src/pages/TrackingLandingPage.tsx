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

const PROBLEM_SIGNALS = [
  {
    icon: Target,
    title: "Wasted spend is hard to spot",
    description: "You are investing in acquisition, but you cannot confidently separate productive campaigns from expensive noise.",
  },
  {
    icon: Layers3,
    title: "Your systems disagree",
    description: "Ad platforms, analytics and CRM reports tell different stories, so routine performance decisions become harder than they should be.",
  },
  {
    icon: Route,
    title: "Leads lose their source",
    description: "Enquiries reach your inbox or CRM, but the campaign and channel context needed to judge quality is missing or unreliable.",
  },
] as const;

const HEALTH_DIMENSIONS = [
  { icon: Code2, title: "Conversion Capture", description: "Are the important actions actually recorded?" },
  { icon: Gauge, title: "Signal Quality", description: "Are the captured signals technically useful and reliable?" },
  { icon: Route, title: "Attribution", description: "Can acquisition context follow the conversion journey?" },
  { icon: Send, title: "Lead Visibility", description: "Can you see what happens to leads after they convert?" },
  { icon: BarChart3, title: "Data Reliability", description: "Can your team reasonably use the combined data to make decisions?" },
] as const;

const DELIVERABLES = [
  "A Tracking Health Scorecard across the five measurement dimensions",
  "Prioritized findings showing where confidence breaks down",
  "Practical recommendations for what to investigate or fix first",
] as const;

const PROCESS_STEPS = [
  { number: "01", title: "Apply", description: "Share the business and measurement context behind one core conversion journey." },
  { number: "02", title: "Fit review", description: "We review your application for fit, scope and current audit capacity." },
  { number: "03", title: "Diagnostic", description: "If accepted, we start with public evidence and request the lowest practical read-only evidence only when needed." },
  { number: "04", title: "Scorecard", description: "You receive the diagnostic scorecard and prioritized findings. Implementation is scoped separately if you want help fixing issues." },
] as const;

const AUDIT_FAQS: FAQItem[] = [
  {
    question: "Is the audit really free?",
    answer: "Yes. The audit is a bounded diagnostic for eligible businesses. Implementation or repair work is separate.",
  },
  {
    question: "Do you need access to my accounts?",
    answer: "Not always. We start with public/no-credential evidence. If an important finding needs confirmation, we may request the lowest practical viewer/read-only access or ask you to share evidence by screenshare or export.",
  },
  {
    question: "Will you ask for my passwords?",
    answer: "No. Do not send passwords, API keys or other credentials by email or form.",
  },
  {
    question: "What platforms do you review?",
    answer: "The audit focuses on the measurement journey: website conversion behavior, GTM/GA4 where applicable, paid-platform conversion evidence, source attribution and lead/CRM visibility. Deep platform review is limited to the scoped journey and up to two paid platforms.",
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

const TrackingLandingPage = () => {
  const [step, setStep] = useState<1 | 2>(1);
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

  const handleContinue = async () => {
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
    setStep(2);
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1023px)").matches) {
        document.getElementById("claim")?.scrollIntoView({ block: "start", behavior: "auto" });
      }
    });
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
        websiteUrl: data.websiteUrl,
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
        description="Request a free conversion tracking audit to understand whether your marketing data can be trusted and where measurement confidence breaks down."
        canonicalUrl="/offer/tracking-audit"
      />

      <section className="relative overflow-hidden border-b border-white/[0.05] pb-12 pt-7 md:pb-20 md:pt-32 lg:pb-24 lg:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_74%_46%_at_50%_-8%,rgba(0,51,153,0.16)_0%,rgba(0,175,239,0.055)_43%,transparent_74%)]" />
          <div className="absolute right-[-7rem] top-16 h-80 w-80 rounded-full bg-primary/[0.055] blur-[120px]" />
          <div className="absolute bottom-[-5rem] left-[-8rem] h-96 w-96 rounded-full bg-atd-blue/[0.12] blur-[150px]" />
        </div>

        <div className="container relative mx-auto px-5 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(430px,500px)] lg:items-start lg:gap-12">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="pt-2 lg:pt-10">
              <HeroEyebrow>Free Conversion Tracking Audit</HeroEyebrow>

              <h1 className="title-safe mt-5 max-w-3xl text-[2.45rem] font-extrabold leading-[1.03] tracking-tight sm:text-5xl md:text-[4rem] lg:text-[4.25rem]">
                Know whether your marketing data can be <span className="title-safe-inline text-gradient-atd-hero">trusted.</span>
              </h1>

              <p className="mt-5 max-w-[41rem] text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                If you’re already investing in digital acquisition but can’t clearly see which campaigns produce qualified leads or customers, we’ll review the measurement path behind one core journey and show you where confidence breaks down.
              </p>

              <div className="mt-6 grid gap-2.5 text-sm text-foreground/78 sm:grid-cols-3 lg:flex lg:flex-wrap lg:gap-x-5">
                {["Application-based", "No passwords", "Read-only if evidence is needed"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-primary/15 bg-primary/[0.055] p-4 sm:max-w-xl sm:p-5">
                <p className="text-sm font-semibold text-foreground">What the free audit covers</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  One company, one website domain, one core conversion journey and up to two paid platforms where relevant. You receive a Tracking Health Scorecard with prioritized findings.
                </p>
              </div>

              <Button asChild variant="outline" className="group mt-7 hidden h-11 rounded-xl border-primary/25 bg-primary/[0.045] px-5 hover:border-primary/45 hover:bg-primary/[0.09] md:inline-flex">
                <Link to="/service/conversion-tracking">
                  Explore our measurement approach
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              id="claim"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="w-full scroll-mt-24 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.018)_100%)] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-7 md:p-8 lg:sticky lg:top-28"
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
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">Request your free audit</p>
                      <h2 className="mt-2 text-xl font-semibold">Tell us enough to review fit and scope.</h2>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-medium text-muted-foreground">{step} of 2</span>
                  </div>

                  <div className="mb-6 flex gap-2" aria-hidden="true">
                    <span className="h-1.5 flex-1 rounded-full bg-primary" />
                    <span className={`h-1.5 flex-1 rounded-full ${step === 2 ? "bg-primary" : "bg-white/10"}`} />
                  </div>

                  <div className="hidden" aria-hidden="true">
                    <input name="tracking-audit-company-website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
                  </div>

                  <form id="tracking-audit-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate aria-label="Request a Free Tracking Audit">
                    {step === 1 ? (
                      <div className="space-y-4" onChangeCapture={handleMeaningfulInteraction}>
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
                          <Input id="f-url" type="url" placeholder="https://yourcompany.com" autoComplete="url" className={fieldClassName} aria-invalid={!!errors.websiteUrl} aria-describedby={errors.websiteUrl ? "f-url-err" : undefined} {...register("websiteUrl")} />
                        </Field>

                        <Button type="button" size="lg" onClick={handleContinue} className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                          Continue
                          <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                        </Button>

                        <p className="text-center text-xs leading-5 text-muted-foreground">
                          Application-based. We review fit and scope before accepting an audit.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Field label="Industry" htmlFor="f-industry" error={errors.industry?.message}>
                          <Controller control={control} name="industry" render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id="f-industry" className={fieldClassName} aria-invalid={!!errors.industry} aria-describedby={errors.industry ? "f-industry-err" : undefined}><SelectValue placeholder="Select industry" /></SelectTrigger>
                              <SelectContent>{INDUSTRY_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                            </Select>
                          )} />
                        </Field>

                        <Field label="Your Role" htmlFor="f-role" error={errors.role?.message}>
                          <Controller control={control} name="role" render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id="f-role" className={fieldClassName} aria-invalid={!!errors.role} aria-describedby={errors.role ? "f-role-err" : undefined}><SelectValue placeholder="Select role" /></SelectTrigger>
                              <SelectContent>{ROLE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                            </Select>
                          )} />
                        </Field>

                        <Field label="Decision Influence" htmlFor="f-decision" error={errors.decisionInfluence?.message}>
                          <Controller control={control} name="decisionInfluence" render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id="f-decision" className={fieldClassName} aria-invalid={!!errors.decisionInfluence} aria-describedby={errors.decisionInfluence ? "f-decision-err" : undefined}><SelectValue placeholder="Select decision role" /></SelectTrigger>
                              <SelectContent>{DECISION_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                            </Select>
                          )} />
                        </Field>

                        <Field label="Monthly Paid-Media Spend" htmlFor="f-spend" error={errors.monthlyAdSpendBand?.message}>
                          <Controller control={control} name="monthlyAdSpendBand" render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id="f-spend" className={fieldClassName} aria-invalid={!!errors.monthlyAdSpendBand} aria-describedby={errors.monthlyAdSpendBand ? "f-spend-err" : undefined}><SelectValue placeholder="Select spend range" /></SelectTrigger>
                              <SelectContent>{SPEND_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                            </Select>
                          )} />
                        </Field>

                        <Controller control={control} name="adPlatforms" render={({ field }) => (
                          <fieldset aria-invalid={!!errors.adPlatforms} aria-describedby={errors.adPlatforms ? "f-platforms-err" : undefined} className="space-y-3">
                            <legend className="text-sm font-medium text-foreground/90">Paid Channels</legend>
                            <div className="flex flex-wrap gap-2">
                              {PLATFORM_OPTIONS.map((platform) => {
                                const checked = field.value?.includes(platform.value) ?? false;
                                return (
                                  <label key={platform.value} className="flex cursor-pointer items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-foreground/82 transition-colors focus-within:ring-1 focus-within:ring-primary/50 has-[:checked]:border-primary/35 has-[:checked]:bg-primary/[0.09] has-[:checked]:text-primary">
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

                        <Field label="Tracking Maturity" htmlFor="f-maturity" error={errors.trackingMaturity?.message}>
                          <Controller control={control} name="trackingMaturity" render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id="f-maturity" className={`${fieldClassName} h-auto min-h-11 py-2 text-left`} aria-invalid={!!errors.trackingMaturity} aria-describedby={errors.trackingMaturity ? "f-maturity-err" : undefined}><SelectValue placeholder="Select the closest description" /></SelectTrigger>
                              <SelectContent>{MATURITY_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                            </Select>
                          )} />
                        </Field>

                        <Field label="Primary Conversion" htmlFor="f-conversion" error={errors.primaryConversionType?.message}>
                          <Controller control={control} name="primaryConversionType" render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id="f-conversion" className={fieldClassName} aria-invalid={!!errors.primaryConversionType} aria-describedby={errors.primaryConversionType ? "f-conversion-err" : undefined}><SelectValue placeholder="Select primary conversion" /></SelectTrigger>
                              <SelectContent>{CONVERSION_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                            </Select>
                          )} />
                        </Field>

                        <Field label="Biggest Measurement Problem" htmlFor="f-problem" error={errors.measurementProblem?.message}>
                          <Controller control={control} name="measurementProblem" render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id="f-problem" className={`${fieldClassName} h-auto min-h-11 py-2 text-left`} aria-invalid={!!errors.measurementProblem} aria-describedby={errors.measurementProblem ? "f-problem-err" : undefined}><SelectValue placeholder="Select the biggest issue" /></SelectTrigger>
                              <SelectContent>{PROBLEM_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                            </Select>
                          )} />
                        </Field>

                        <Field label="Timing / Urgency" htmlFor="f-urgency" error={errors.urgency?.message}>
                          <Controller control={control} name="urgency" render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id="f-urgency" className={fieldClassName} aria-invalid={!!errors.urgency} aria-describedby={errors.urgency ? "f-urgency-err" : undefined}><SelectValue placeholder="Select timing" /></SelectTrigger>
                              <SelectContent>{URGENCY_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                            </Select>
                          )} />
                        </Field>

                        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                          <div className="flex items-start gap-3">
                            <input type="checkbox" id="f-marketing-opt-in" className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/5 accent-primary" {...register("marketingOptIn")} />
                            <label htmlFor="f-marketing-opt-in" className="cursor-pointer text-[13px] leading-5 text-muted-foreground sm:text-sm">
                              Send me occasional ATD marketing insights and updates.
                            </label>
                          </div>
                          <p className="mt-2 pl-7 text-[11px] leading-4 text-muted-foreground/80">Optional. Your audit application and service receipt do not depend on marketing consent.</p>
                        </div>

                        <div className="grid grid-cols-[auto_1fr] gap-2.5 pt-1">
                          <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-xl border-white/10 px-4">Back</Button>
                          <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                            {isSubmitting ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />Submitting…</> : "Request a Free Tracking Audit"}
                          </Button>
                        </div>

                        <p className="text-center text-[11px] leading-4 text-muted-foreground">
                          Please do not send passwords, API keys or admin credentials through this form.
                        </p>
                      </div>
                    )}
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <PageSection surface="quiet" spacing="spacious" className="py-12 md:py-24" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="The problem"
          title="You should know what your marketing is actually producing."
          description="When the measurement path is incomplete, more spend can create more activity without creating more confidence."
          align="center"
          maxWidth="xl"
          className="mb-9 md:mb-14"
        />

        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {PROBLEM_SIGNALS.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection id="audit-coverage" surface="glow" border="both" spacing="spacious" className="scroll-mt-20 py-12 md:py-24" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Tracking Health Scorecard"
          title="Five dimensions of measurement confidence"
          description="The audit is structured around the parts of the measurement journey that need to work together for your data to be useful."
          align="center"
          maxWidth="xl"
          className="mb-9 md:mb-14"
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

      <PageSection spacing="spacious" className="py-12 md:py-24" containerClassName="px-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">What you receive</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">A diagnostic you can act on.</h2>
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
                The free audit is diagnostic. Implementation, tag changes, CRM rebuilds, dashboard builds and ongoing monitoring are separate paid work if needed.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/15 bg-[linear-gradient(145deg,rgba(51,204,153,0.07),rgba(0,51,153,0.06)_58%,rgba(255,255,255,0.018))] p-6 md:p-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">Access safety</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Start with the least access possible.</h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              We start with public, no-credential evidence. If account evidence is needed to confirm an important finding, we ask for the lowest practical viewer or read-only access, or use a screenshare/export where appropriate.
            </p>
            <div className="mt-6 rounded-xl border border-white/[0.08] bg-black/10 p-4">
              <p className="text-sm font-semibold text-foreground">Never send us a password.</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Passwords, API keys and admin credentials are not part of the free audit request process.</p>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection surface="quiet" border="both" spacing="spacious" className="py-12 md:py-24" containerClassName="px-5 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="How it works" title="Application first. Diagnosis second." description="Submitting the form starts a fit-and-scope review; it does not automatically create an audit slot or sales opportunity." align="center" maxWidth="xl" className="mb-10 md:mb-14" />

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
          description="What to expect from the Free Conversion Tracking Audit."
          variant="minimal"
          density="compact"
          defaultOpenItem={0}
          mobileInitialItems={3}
          sectionSpacingClassName="py-12 md:py-20"
        />

        <CTASection
          title={<><span className="md:block">Know what your marketing is</span> <span className="text-gradient">actually producing?</span></>}
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
