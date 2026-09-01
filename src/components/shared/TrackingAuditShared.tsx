import { ArrowDown, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export const TrackingAuditSuccessState = () => (
  <div
    data-tracking-audit-success
    className="mx-auto flex max-w-md flex-col items-center px-1 py-5 text-center sm:py-6"
    aria-live="polite"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/[0.08] text-primary shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
    </div>
    <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-[22px]">Application received.</h2>
    <p className="mx-auto mt-2 max-w-sm text-[13px] leading-5 text-foreground/78">
      Thanks — we’ve received your Tracking Audit application.
    </p>
    <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-5 text-muted-foreground">
      We’ll review it and email you within one business day if the audit is a good fit.
    </p>
    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.045] px-3 py-1.5 text-[11px] font-medium text-foreground/72">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
      <span>No passwords or account credentials are required.</span>
    </div>
    <Button asChild variant="ghost" size="sm" className="mt-4 h-8 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground">
      <Link to="/">Back to site</Link>
    </Button>
  </div>
);

export const TrackingAuditHumanReviewBadge = () => (
  <div
    className="absolute right-3 -top-5 z-40 sm:-right-3 sm:-top-4"
    data-human-review-badge
    aria-label="Human-reviewed audit. Not an automated report."
  >
    <div className="relative flex items-center gap-2 rounded-xl border border-amber-200/80 bg-[linear-gradient(135deg,#fff7d6_0%,#f3cf6b_42%,#d99a24_100%)] px-3.5 py-2 text-[10px] font-semibold text-[#3f2a07] shadow-[0_12px_28px_rgba(116,73,8,0.24),0_0_0_1px_rgba(255,255,255,0.35)_inset] sm:text-[11px]">
      <ShieldCheck className="h-4 w-4 shrink-0 text-[#795009]" aria-hidden="true" />
      <span className="leading-tight">
        <span className="block uppercase tracking-[0.12em]">Human-reviewed audit</span>
        <span className="mt-0.5 block font-medium tracking-normal text-[#65420a]/85">Not an automated report</span>
      </span>
      <span
        aria-hidden="true"
        className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 border-b border-r border-[#b97911]/55 bg-[#cf8d1e]"
      />
    </div>
  </div>
);

export const TrackingAuditReviewCue = () => (
  <div className="mt-9 flex justify-center md:mt-11 lg:mt-4 lg:shrink-0 lg:pb-1">
    <a
      href="#measurement-journey"
      data-tracking-audit-review-cue
      className="group inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/[0.055] px-4 py-2.5 text-sm font-semibold text-foreground/82 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.09] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <span>See what we review</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-background/55 text-primary">
        <ArrowDown className="h-4 w-4 motion-safe:animate-bounce motion-reduce:animate-none" aria-hidden="true" />
      </span>
    </a>
  </div>
);
