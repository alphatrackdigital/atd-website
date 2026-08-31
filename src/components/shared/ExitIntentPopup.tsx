import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import { getBrevoSubscribeEndpoint } from "@/lib/apiEndpoints";
import { getLeadAttribution } from "@/lib/attribution";
import { createMetaEventId } from "@/lib/leads";
import { pushLeadSubmissionEvent } from "@/lib/tracking";

type PopupStatus = "idle" | "loading" | "success" | "error";

type DataLayerEvent =
  | "exit_popup_view"
  | "exit_popup_close"
  | "exit_popup_submit"
  | "exit_popup_success"
  | "exit_popup_error";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const DISMISSED_KEY = "atd_exit_popup_dismissed_until";
const SUBMITTED_KEY = "atd_exit_popup_submitted";
const SESSION_KEY = "atd_exit_popup_seen_session";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const MOBILE_DELAY_MS = 60_000;
const MOBILE_SCROLL_DEPTH = 70;
const MOBILE_QUERY = "(pointer: coarse), (max-width: 767px)";
const EXCLUDED_PATHS = [
  "/contact-us",
  "/book-a-call",
  "/offer/tracking-audit",
  "/expertise",
  "/privacy-policy",
  "/cookie-policy",
  "/terms-of-service",
];

const pushDataLayer = (event: DataLayerEvent) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event });
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidWebsite = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return true;

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
};

const getDismissedUntil = () => {
  const value = window.localStorage.getItem(DISMISSED_KEY);
  return value ? Number(value) : 0;
};

const CONSENT_UI_RETRY_MS = 1000;
const CONSENT_UI_MAX_RETRIES = 30;

// Ketch renders its banner and preference center into #lanyard_root, backed by an
// element marked data-ketch-backdrop="true" (or a role="dialog") whenever consent UI
// is actively shown. The exit popup must never open on top of or behind that UI.
const isConsentUiVisible = () => {
  if (typeof document === "undefined") return false;

  const isElementVisible = (element: Element | null) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  return (
    isElementVisible(document.querySelector('[data-ketch-backdrop="true"]')) ||
    isElementVisible(document.querySelector('#lanyard_root [role="dialog"]'))
  );
};

const isExcludedPath = (pathname: string) =>
  EXCLUDED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
  pathname.includes("thank-you");

const ExitIntentPopup = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<PopupStatus>("idle");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState("");

  const excluded = useMemo(() => isExcludedPath(pathname), [pathname]);

  const canShow = useCallback(() => {
    if (typeof window === "undefined" || excluded) return false;
    if (window.sessionStorage.getItem(SESSION_KEY) === "true") return false;
    if (window.localStorage.getItem(SUBMITTED_KEY) === "true") return false;
    return Date.now() > getDismissedUntil();
  }, [excluded]);

  const openPopup = useCallback(() => {
    if (!canShow()) return;
    window.sessionStorage.setItem(SESSION_KEY, "true");
    setIsOpen(true);
    pushDataLayer("exit_popup_view");
  }, [canShow]);

  const closePopup = useCallback(() => {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now() + DISMISS_MS));
    setIsOpen(false);
    pushDataLayer("exit_popup_close");
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePopup();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closePopup]);

  useEffect(() => {
    if (excluded || typeof window === "undefined") {
      setIsOpen(false);
      return undefined;
    }

    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    let timeoutId: number | undefined;
    let retryTimeoutId: number | undefined;
    let hasTriggered = false;
    let consentRetryCount = 0;

    const trigger = () => {
      if (hasTriggered) return;

      if (isConsentUiVisible()) {
        if (consentRetryCount >= CONSENT_UI_MAX_RETRIES) return;
        consentRetryCount += 1;
        retryTimeoutId = window.setTimeout(trigger, CONSENT_UI_RETRY_MS);
        return;
      }

      hasTriggered = true;
      openPopup();
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!mobileQuery.matches && event.clientY <= 0 && !event.relatedTarget) {
        trigger();
      }
    };

    const handleScroll = () => {
      if (!mobileQuery.matches) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const depth = (window.scrollY / scrollable) * 100;
      if (depth >= MOBILE_SCROLL_DEPTH) trigger();
    };

    document.addEventListener("mouseout", handleMouseOut);

    if (mobileQuery.matches) {
      timeoutId = window.setTimeout(trigger, MOBILE_DELAY_MS);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (retryTimeoutId) window.clearTimeout(retryTimeoutId);
    };
  }, [excluded, openPopup]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!isValidEmail(email.trim())) {
      nextErrors.email = "Enter a valid work email.";
    }

    if (!isValidWebsite(website)) {
      nextErrors.website = "Enter a valid website URL.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage("");

    if (!validate()) return;

    setStatus("loading");
    pushDataLayer("exit_popup_submit");
    const metaEventId = createMetaEventId();

    try {
      const response = await fetch(getBrevoSubscribeEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          website: website.trim(),
          websiteRoute: pathname,
          optIn,
          attribution: getLeadAttribution(),
          metaEventId,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        throw new Error(result?.message || "Submission failed");
      }

      window.localStorage.setItem(SUBMITTED_KEY, "true");
      setStatus("success");
      if (!result.duplicate) {
        pushLeadSubmissionEvent("exit_popup_success", {
          form_id: "exit-intent-popup-form",
          lead_source: "exit_popup",
          event_id: result.metaEventId || metaEventId,
          eventID: result.metaEventId || metaEventId,
          opt_in: optIn,
        });
      }
    } catch {
      setStatus("error");
      setFormMessage("Something went wrong. Please try again.");
      pushDataLayer("exit_popup_error");
    }
  };

  if (!isOpen || excluded) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/72 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-popup-title"
      onClick={closePopup}
    >
      <div
        className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-[26rem] overflow-x-hidden overflow-y-auto rounded-2xl border border-white/[0.09] bg-[#070a10] shadow-[0_24px_72px_rgba(0,0,0,0.48)] sm:max-h-[calc(100dvh-4rem)] sm:max-w-[29rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
        <div className="pointer-events-none absolute right-[-6rem] top-[-8rem] h-56 w-56 rounded-full bg-primary/12 blur-3xl" />

        <button
          type="button"
          onClick={closePopup}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition hover:border-white/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Close growth audit popup"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-4 py-4 sm:px-7 sm:py-7">
          {status === "success" ? (
            <div className="flex min-h-[17rem] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold tracking-normal text-foreground sm:text-2xl">
                Your audit request is in.
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                We will review your website and follow up with practical growth insights.
              </p>
            </div>
          ) : (
            <>
              <div className="mx-auto max-w-[23rem] text-center">
                <p className="mb-2.5 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary sm:text-xs">
                  Free growth audit
                </p>
                <h2
                  id="exit-popup-title"
                  className="text-[1.35rem] font-semibold leading-tight tracking-normal text-foreground sm:text-[1.85rem]"
                >
                  Before you go, get a free growth audit.
                </h2>
                <p className="mt-2.5 text-[13px] leading-5 text-muted-foreground sm:mt-3 sm:text-sm sm:leading-6">
                  Find the tracking, funnel, and conversion gaps stopping your website from turning traffic into qualified leads.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3 sm:mt-5 sm:space-y-3.5">
                <div>
                  <label htmlFor="exit-popup-first-name" className="text-xs font-medium text-foreground sm:text-sm">
                    First name
                  </label>
                  <input
                    id="exit-popup-first-name"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(event) => {
                      setFirstName(event.target.value);
                      if (errors.firstName) setErrors((current) => ({ ...current, firstName: "" }));
                    }}
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:h-11 sm:px-4"
                  />
                  {errors.firstName && <p className="mt-1.5 text-xs text-destructive">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="exit-popup-email" className="text-xs font-medium text-foreground sm:text-sm">
                    Work email
                  </label>
                  <input
                    id="exit-popup-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (errors.email) setErrors((current) => ({ ...current, email: "" }));
                    }}
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:h-11 sm:px-4"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="exit-popup-website" className="text-xs font-medium text-foreground sm:text-sm">
                    Website URL <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="exit-popup-website"
                    type="url"
                    autoComplete="url"
                    value={website}
                    onChange={(event) => {
                      setWebsite(event.target.value);
                      if (errors.website) setErrors((current) => ({ ...current, website: "" }));
                    }}
                    placeholder="https://example.com"
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:h-11 sm:px-4"
                  />
                  {errors.website && <p className="mt-1.5 text-xs text-destructive">{errors.website}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_0_18px_rgba(51,204,153,0.12)] transition hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(51,204,153,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-70 sm:h-11"
                >
                  {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get My Free Growth Audit"}
                </button>

                {formMessage && <p className="text-sm text-destructive">{formMessage}</p>}

                <label className="flex items-start gap-2 text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
                  <input
                    type="checkbox"
                    checked={optIn}
                    onChange={(event) => setOptIn(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/[0.04] accent-primary"
                  />
                  <span className="whitespace-nowrap">Send me occasional growth insights by email.</span>
                </label>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
