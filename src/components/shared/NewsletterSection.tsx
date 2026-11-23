import { useState } from "react";
import NewsletterTurnstile from "./NewsletterTurnstile";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { submitLead } from "@/lib/leads";
import { pushLeadSubmissionEvent } from "@/lib/tracking";

const newsletterTurnstileSiteKey = (import.meta.env.VITE_TURNSTILE_NEWSLETTER_SITE_KEY || "").trim();

interface NewsletterSectionProps {
  className?: string;
}

const NewsletterSection = ({ className }: NewsletterSectionProps) => {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetNonce, setTurnstileResetNonce] = useState(0);
  const [optIn, setOptIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!optIn) {
      setErrorMsg("Please confirm you want to receive newsletter emails.");
      return;
    }
    if (newsletterTurnstileSiteKey && !turnstileToken) {
      setErrorMsg("Please complete the newsletter verification challenge.");
      return;
    }
    setErrorMsg("");
    setStatus("loading");
    try {
      const result = await submitLead({
        source: "newsletter",
        firstName: "",
        lastName: "",
        email: trimmed,
        optIn,
        ...(newsletterTurnstileSiteKey ? { turnstileToken } : {}),
      });
      setPendingConfirmation(result.pendingConfirmation === true);
      setStatus("success");
      if (!result.duplicate) {
        pushLeadSubmissionEvent("newsletter_subscribe", {
          event_id: result.metaEventId,
          eventID: result.metaEventId,
          form_id: "newsletter-section-form",
          lead_source: "newsletter",
          pending_confirmation: result.pendingConfirmation === true,
        });
      }
    } catch {
      if (newsletterTurnstileSiteKey) {
        setTurnstileToken("");
        setTurnstileResetNonce((value) => value + 1);
      }
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <section className={className}>
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-[22px] border border-primary/15 bg-[radial-gradient(circle_at_top_left,rgba(51,204,153,0.07),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.025)_0%,rgba(255,255,255,0.01)_100%)] px-5 py-5 shadow-[0_14px_40px_rgba(0,0,0,0.12)] sm:px-6 md:rounded-[24px] md:px-10 md:py-10"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <p className="text-lg font-semibold">
                {pendingConfirmation ? "Check your email to confirm." : "You're subscribed!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {pendingConfirmation
                  ? "Open the confirmation email we just sent, then confirm your subscription."
                  : "Expect actionable insights in your inbox every fortnight. No fluff."}
              </p>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 md:h-11 md:w-11">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold leading-snug md:text-base">
                    Get insights straight to your inbox
                  </p>
                  <p className="mt-1 max-w-sm text-[13px] leading-5 text-muted-foreground md:text-sm md:leading-6">
                    Actionable strategies on tracking, paid media, and automation. Fortnightly. No fluff.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex w-full min-w-0 flex-col gap-2.5 md:max-w-[26rem]"
              >
                <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:gap-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    placeholder="your@email.com"
                    required
                    aria-label="Email address"
                    className="block h-11 w-full min-w-0 flex-none appearance-none rounded-xl border border-white/[0.12] bg-background/70 px-4 py-2.5 text-[15px] leading-6 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-muted-foreground/60 focus:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 md:h-12 md:py-3 lg:flex-1"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 md:h-12 lg:w-auto"
                  >
                    {status === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>
                {newsletterTurnstileSiteKey && (
                  <NewsletterTurnstile
                    siteKey={newsletterTurnstileSiteKey}
                    onTokenChange={setTurnstileToken}
                    resetNonce={turnstileResetNonce}
                  />
                )}
                {(errorMsg || status === "error") && (
                  <p className="text-xs text-destructive">
                    {errorMsg || "Something went wrong. Please try again."}
                  </p>
                )}
                <label className="flex items-start gap-2 pl-1 text-left text-[11px] text-muted-foreground/70 lg:pl-3 lg:text-xs">
                  <input
                    type="checkbox"
                    checked={optIn}
                    onChange={(e) => {
                      setOptIn(e.target.checked);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-background/70 accent-primary"
                  />
                  <span>I agree to receive AlphaTrack Digital emails.</span>
                </label>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
