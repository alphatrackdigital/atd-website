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
  ChevronDown,
  Code2,
  Gauge,
  Layers3,
  Loader2,
  Route,
  Send,
  ShieldCheck,
  Target,
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
import { REQUEST_A_FREE_TRACKING_AUDIT_CTA } from "@/config/cta";
import { companyProfile } from "@/data/companyProfile";
import { submitLead } from "@/lib/leads";
import { pushLeadSubmissionEvent } from "@/lib/tracking";

const auditSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(100),
  lastName: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  websiteUrl: z.string().trim().url("Enter a valid URL").max(500),
  monthlyAdSpend: z.string().min(1, "Select your spend level"),
  adPlatforms: z.array(z.string()).min(1, "Select at least one platform"),
  marketingOptIn: z.boolean().optional().default(false),
});

type AuditFormData = z.infer<typeof auditSchema>;

const PLATFORM_OPTIONS = [
  "Google Ads",
  "Meta Ads",
  "TikTok Ads",
  "LinkedIn Ads",
  "Microsoft Ads",
  "Other",
] as const;

const SPEND_OPTIONS = [
  { value: "Not spending consistently yet", label: "Not spending consistently yet" },
  { value: "Under 1k per month", label: "Under $1k / mo" },
  { value: "1k to 5k per month", label: "$1k - $5k / mo" },
  { value: "5k to 20k per month", label: "$5k - $20k / mo" },
  { value: "20k+ per month", label: "$20k+ / mo" },
] as const;

const AUDIT_AREAS = [
  {
    icon: Code2,
    title: "Pixel & server-side tracking",
    description: "Review Meta Pixel and Conversions API signals for obvious gaps or conflicts.",
  },
  {
    icon: Layers3,
    title: "GA4 & tag management",
    description: "Check whether your analytics and tag setup support reliable decision-making.",
  },
  {
    icon: ShieldCheck,
    title: "Events & deduplication",
    description: "Look for missing events, duplicate conversions, and inconsistent event naming.",
  },
  {
    icon: Route,
    title: "UTMs & attribution",
    description: "Assess whether campaign traffic can be traced cleanly from click to lead.",
  },
  {
    icon: Send,
    title: "Form & CRM handoff",
    description: "Review how conversion data moves from your website into follow-up systems.",
  },
  {
    icon: BarChart3,
    title: "Consent & data quality",
    description: "Flag measurement risks that can distort reports or weaken usable signal quality.",
  },
] as const;

const DELIVERABLES = [
  "A concise assessment of your tracking reliability",
  "The highest-priority gaps affecting campaign decisions",
  "Practical recommendations for what to fix first",
] as const;

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Share the context",
    description: "Tell us where you advertise and what website should be reviewed.",
  },
  {
    number: "02",
    title: "We review the setup",
    description: "We examine the visible measurement journey and identify likely failure points.",
  },
  {
    number: "03",
    title: "Receive your findings",
    description: "We aim to send a clear, prioritized response within 48 hours.",
  },
] as const;

const FIT_SIGNALS = [
  "You are already running ads or preparing to launch",
  "Platform reports do not match your actual leads or sales",
  "You want to scale but do not trust the underlying data",
  "You are unsure whether key conversion events are firing correctly",
] as const;

const AUDIT_FAQS: FAQItem[] = [
  {
    question: "Is the tracking audit really free?",
    answer:
      "Yes. The initial diagnostic review is free and does not obligate you to purchase implementation or ongoing services.",
  },
  {
    question: "Do I need to share account credentials now?",
    answer:
      "No. The request form does not ask for account credentials. If deeper access would materially improve the review, we will explain why and agree the next step with you first.",
  },
  {
    question: "What will AlphaTrack Digital review?",
    answer:
      "We review the measurement journey around your website, advertising platforms, conversion events, attribution, and lead handoff based on the context and evidence available.",
  },
  {
    question: "What happens after I submit?",
    answer:
      "We aim to reply within 48 hours with the main findings and recommended next steps. If useful, you can then discuss fixes or implementation support with us.",
  },
];

const TRACKING_AUDIT_ANCHOR_CTA = {
  label: "Request Your Free Audit",
  to: "/offer/tracking-audit#claim",
} as const;

const MIN_FILL_MS = 1500;
const THROTTLE_MS = 5000;

const fieldClassName =
  "h-11 rounded-xl border-white/10 bg-white/[0.045] text-foreground shadow-none placeholder:text-muted-foreground/55 focus-visible:ring-primary/45 aria-[invalid=true]:border-red-500/40";

const Field = ({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) => (
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const formStart = useRef(0);
  const hasInteracted = useRef(false);
  const lastSubmit = useRef(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AuditFormData>({
    resolver: zodResolver(auditSchema),
    defaultValues: { monthlyAdSpend: "", adPlatforms: [], marketingOptIn: false },
  });

  const handleFirstInteraction = () => {
    if (!hasInteracted.current) {
      formStart.current = Date.now();
      hasInteracted.current = true;
    }
  };

  const onSubmit = async (data: AuditFormData) => {
    if (honeypot.trim()) return;

    const now = Date.now();
    if (now - formStart.current < MIN_FILL_MS) {
      toast.error("Please take a moment to fill in the form.");
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
        websiteUrl: data.websiteUrl,
        monthlyAdSpend: data.monthlyAdSpend,
        adPlatforms: data.adPlatforms.join(", "),
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
        description="Request a free conversion tracking audit. We review your website, ad platforms, and conversion setup, then show what to fix first."
        canonicalUrl="/offer/tracking-audit"
      />

      <section className="relative overflow-hidden border-b border-white/[0.05] pb-10 pt-6 md:pb-20 md:pt-32 lg:pb-24 lg:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_74%_46%_at_50%_-8%,rgba(0,51,153,0.16)_0%,rgba(0,175,239,0.055)_43%,transparent_74%)]" />
          <div className="absolute right-[-7rem] top-16 h-80 w-80 rounded-full bg-primary/[0.055] blur-[120px]" />
          <div className="absolute left-[-8rem] bottom-[-5rem] h-96 w-96 rounded-full bg-atd-blue/[0.12] blur-[150px]" />
        </div>

        <div className="container relative mx-auto px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(410px,480px)] lg:items-center lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="pt-2"
            >
              <HeroEyebrow>Free tracking audit</HeroEyebrow>

              <h1 className="title-safe mt-5 max-w-3xl text-[2.5rem] font-extrabold leading-[1.03] tracking-tight sm:mt-6 sm:text-5xl md:text-[4rem] lg:text-[4.35rem]">
                Check if your{" "}
                <span className="title-safe-inline text-gradient-atd-hero">tracking is reliable.</span>
              </h1>

              <p className="mt-4 max-w-[38rem] text-base leading-7 text-muted-foreground md:mt-5 md:text-lg md:leading-8">
                <span className="md:hidden">
                  Know whether your ad tracking can be trusted—and what to fix first.
                </span>
                <span className="hidden md:inline">
                  Find out whether your conversion data can be trusted before you spend more on
                  ads. We identify likely gaps and show you what is worth fixing first.
                </span>
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5 text-sm text-foreground/75 md:mt-7 md:flex md:flex-wrap md:gap-x-6 md:gap-y-3">
                {["Free diagnostic review", "No credentials required now", "Reply within 48 hours"].map(
                  (item, index) => (
                    <span
                      key={item}
                      className={index === 1 ? "hidden items-center gap-2 md:flex" : "flex items-center gap-2"}
                    >
                      <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span className="md:hidden">
                        {index === 0 ? "Free review" : "48-hour reply"}
                      </span>
                      <span className="hidden md:inline">{item}</span>
                    </span>
                  ),
                )}
              </div>

              <Button
                asChild
                variant="outline"
                className="group mt-8 hidden h-11 rounded-xl border-primary/25 bg-primary/[0.055] px-5 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-primary/45 hover:bg-primary/[0.1] hover:text-primary md:inline-flex"
              >
                <Link to="/service/conversion-tracking">
                  Explore our measurement approach
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              id="claim"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="w-full rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.018)_100%)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)] sm:p-7 md:rounded-2xl md:p-8 md:shadow-[0_26px_80px_rgba(0,0,0,0.26)] lg:sticky lg:top-28"
            >
              {isSubmitted ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                  <h2 className="mt-4 text-2xl font-semibold">Request received</h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                    We will review your setup and aim to reply within 48 hours.
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
                    We will send the reply to{" "}
                    <span className="font-medium text-foreground/85">{submittedEmail}</span>.
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    className="mt-7 rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    <Link to="/">Back to site</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="hidden" aria-hidden="true">
                    <input
                      name="tracking-audit-company-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(event) => setHoneypot(event.target.value)}
                    />
                  </div>

                  <form
                    id="tracking-audit-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4 md:space-y-6"
                    noValidate
                    aria-label="Request your free audit"
                    onFocus={handleFirstInteraction}
                  >
                    <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
                      <Field label="First Name" htmlFor="f-first" error={errors.firstName?.message}>
                        <Input
                          id="f-first"
                          placeholder="Jane"
                          autoComplete="given-name"
                          className={fieldClassName}
                          aria-invalid={!!errors.firstName}
                          aria-describedby={errors.firstName ? "f-first-err" : undefined}
                          {...register("firstName")}
                        />
                      </Field>

                      <Field label="Last Name" htmlFor="f-last" error={errors.lastName?.message}>
                        <Input
                          id="f-last"
                          placeholder="Smith"
                          autoComplete="family-name"
                          className={fieldClassName}
                          aria-invalid={!!errors.lastName}
                          aria-describedby={errors.lastName ? "f-last-err" : undefined}
                          {...register("lastName")}
                        />
                      </Field>
                    </div>

                    <Field label="Work Email" htmlFor="f-email" error={errors.email?.message}>
                      <Input
                        id="f-email"
                        type="email"
                        placeholder="jane@company.com"
                        autoComplete="email"
                        className={fieldClassName}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "f-email-err" : undefined}
                        {...register("email")}
                      />
                    </Field>

                    <Field label="Website URL" htmlFor="f-url" error={errors.websiteUrl?.message}>
                      <Input
                        id="f-url"
                        type="url"
                        placeholder="https://yoursite.com"
                        className={fieldClassName}
                        aria-invalid={!!errors.websiteUrl}
                        aria-describedby={errors.websiteUrl ? "f-url-err" : undefined}
                        {...register("websiteUrl")}
                      />
                    </Field>

                    <Field
                      label="Monthly Ad Spend Level"
                      htmlFor="f-spend"
                      error={errors.monthlyAdSpend?.message}
                    >
                      <Controller
                        control={control}
                        name="monthlyAdSpend"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger
                              id="f-spend"
                              className={fieldClassName}
                              aria-invalid={!!errors.monthlyAdSpend}
                              aria-describedby={errors.monthlyAdSpend ? "f-spend-err" : undefined}
                            >
                              <SelectValue placeholder="Select spend level" />
                            </SelectTrigger>
                            <SelectContent>
                              {SPEND_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Field>

                    <fieldset
                      aria-invalid={!!errors.adPlatforms}
                      aria-describedby={errors.adPlatforms ? "f-platforms-err" : undefined}
                      className="space-y-3"
                    >
                      <legend className="text-sm font-medium text-foreground/90">
                        Which ad platforms are active right now?
                      </legend>
                      <div className="flex flex-wrap gap-2.5">
                        {PLATFORM_OPTIONS.map((platform) => (
                          <label
                            key={platform}
                            className="flex cursor-pointer items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-foreground/82 transition-colors focus-within:ring-1 focus-within:ring-primary/50 has-[:checked]:border-primary/35 has-[:checked]:bg-primary/[0.09] has-[:checked]:text-primary"
                          >
                            <input
                              type="checkbox"
                              value={platform}
                              className="sr-only"
                              {...register("adPlatforms")}
                            />
                            {platform}
                          </label>
                        ))}
                      </div>
                      {errors.adPlatforms && (
                        <p id="f-platforms-err" role="alert" className="text-xs text-red-400">
                          {errors.adPlatforms.root?.message ?? errors.adPlatforms.message}
                        </p>
                      )}
                    </fieldset>

                    <div className="flex items-start gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="f-marketing-opt-in"
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/5 accent-primary"
                        {...register("marketingOptIn")}
                      />
                      <label
                        htmlFor="f-marketing-opt-in"
                        className="cursor-pointer text-[13.5px] leading-6 text-muted-foreground sm:text-sm"
                      >
                        Yes, you can also send me occasional insights and service updates by email.
                      </label>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full gap-1.5 rounded-xl bg-primary text-primary-foreground shadow-[0_0_18px_rgba(51,204,153,0.12)] hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(51,204,153,0.18)]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        REQUEST_A_FREE_TRACKING_AUDIT_CTA.label
                      )}
                    </Button>

                  </form>
                </>
              )}
            </motion.div>
          </div>

          <a
            href="#audit-coverage"
            className="mx-auto mt-10 hidden w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary lg:flex"
          >
            See what we check
            <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
          </a>
        </div>
      </section>

      <PageSection
        id="audit-coverage"
        surface="quiet"
        spacing="spacious"
        className="scroll-mt-20 py-10 md:py-24"
        containerClassName="px-6 lg:px-8"
      >
        <SectionIntro
          eyebrow="Audit coverage"
          title="What we check before you scale"
          description="A focused review of the measurement signals behind your campaigns."
          align="center"
          maxWidth="lg"
          className="mb-6 md:mb-14"
          descriptionClassName="hidden md:block"
        />

        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-5 gap-y-1 md:gap-4 lg:grid-cols-3">
          {AUDIT_AREAS.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group border-b border-white/[0.07] bg-transparent px-0 py-3.5 transition-colors md:rounded-2xl md:border md:border-white/[0.08] md:bg-white/[0.025] md:p-6 md:hover:border-primary/20 md:hover:bg-white/[0.04]"
            >
              <div className="flex h-6 w-6 items-center justify-center text-primary md:h-10 md:w-10 md:rounded-xl md:border md:border-primary/20 md:bg-primary/[0.08]">
                <Icon className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-2 text-[13px] font-semibold leading-5 text-foreground md:mt-5 md:text-base">
                {title}
              </h3>
              <p className="mt-2 hidden text-sm leading-6 text-muted-foreground md:block">
                {description}
              </p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection
        surface="glow"
        border="both"
        spacing="spacious"
        className="py-10 md:py-24"
        containerClassName="px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-8 md:gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:gap-16">
          <div>
            <SectionIntro
              eyebrow="Useful, not overwhelming"
              title="Clear findings you can act on"
              description="The audit is designed to help you make the next measurement decision with more confidence."
              titleClassName="lg:max-w-none lg:whitespace-nowrap lg:text-[1.7rem] xl:text-3xl"
              descriptionClassName="hidden md:block"
            />

            <div className="mt-5 divide-y divide-white/[0.07] border-y border-white/[0.07] md:mt-8 md:space-y-4 md:divide-y-0 md:border-y-0">
              {DELIVERABLES.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 py-3 md:rounded-xl md:border md:border-white/[0.07] md:bg-black/10 md:px-4 md:py-3.5"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary md:h-5 md:w-5" aria-hidden="true" />
                  <p className="text-sm leading-6 text-foreground/85">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-6 md:rounded-[24px] md:border md:border-white/[0.09] md:bg-background/55 md:p-8 md:shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/90 md:text-left">
              How it works
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 md:block md:space-y-7">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step.number} className="relative flex flex-col items-center gap-2 text-center md:flex-row md:items-start md:gap-5 md:text-left">
                  {index < PROCESS_STEPS.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute left-[19px] top-11 hidden h-[calc(100%+0.25rem)] w-px bg-white/10 md:block"
                    />
                  )}
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.08] text-[11px] font-bold text-primary md:h-10 md:w-10 md:text-xs">
                    {step.number}
                  </span>
                  <div className="pb-1">
                    <h3 className="text-xs font-semibold leading-4 text-foreground md:text-base">{step.title}</h3>
                    <p className="mt-1.5 hidden text-sm leading-6 text-muted-foreground md:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection
        spacing="spacious"
        className="py-10 md:py-24"
        containerClassName="px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-4 md:gap-8 lg:grid-cols-2">
          <div className="border-b border-white/[0.08] pb-7 md:rounded-[24px] md:border md:border-white/[0.08] md:bg-white/[0.025] md:p-9">
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-atd-blue/[0.14] text-atd-light-blue md:flex md:h-11 md:w-11">
              <Target className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold tracking-tight md:mt-6 md:text-3xl">
              A good fit if measurement is holding back a decision
            </h2>
            <ul className="mt-5 space-y-2.5 md:mt-7 md:space-y-4">
              {FIT_SIGNALS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-foreground/80">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 md:rounded-[24px] md:border md:border-primary/15 md:bg-[linear-gradient(145deg,rgba(51,204,153,0.075),rgba(0,51,153,0.07)_58%,rgba(255,255,255,0.018))] md:p-9">
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.1] text-primary md:flex md:h-11 md:w-11">
              <Gauge className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/90 md:mt-6">
              Our methodology
            </p>
            <h2 className="mt-3 text-xl font-bold tracking-tight md:text-[1.6rem] xl:text-3xl">
              <span className="md:block">Measurement first. Every</span>{" "}
              <span className="md:block md:whitespace-nowrap">
                important event should be provable.
              </span>
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground md:mt-5 md:text-base md:leading-7">
              We trace the path from ad click to business outcome, looking for where signal is
              lost, duplicated, or mislabeled. The goal is one dependable view of performance—not
              more dashboards.
            </p>
          </div>

          <div className="flex items-start gap-3 border-y border-primary/15 py-4 md:gap-4 md:rounded-2xl md:border md:border-primary/20 md:bg-primary/[0.055] md:px-6 lg:col-span-2">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-foreground">Clear scope from the start</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                This free review provides diagnosis and recommendations. It does not include
                implementation or require credentials at the request stage.
              </p>
            </div>
          </div>
        </div>
      </PageSection>

      <div className="border-t border-white/[0.06]">
        <FAQAccordion
          items={AUDIT_FAQS}
          eyebrow="Before you request"
          title="Common questions"
          description="What to expect from the free tracking audit."
          variant="minimal"
          density="compact"
          defaultOpenItem={0}
          mobileInitialItems={3}
          sectionSpacingClassName="py-10 md:py-20"
        />

        <CTASection
          title={
            <>
              Know what your tracking is
              <br />
              <span className="text-gradient">telling you?</span>
            </>
          }
          description=""
          primaryCta={TRACKING_AUDIT_ANCHOR_CTA}
          secondaryCta={null}
          variant="service-close"
          titleClassName="max-w-[22ch]"
        />
      </div>
    </>
  );
};

export default TrackingLandingPage;
