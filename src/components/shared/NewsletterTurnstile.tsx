import { useEffect, useRef } from "react";

interface TurnstileWidget {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      theme: "auto";
      size: "flexible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileWidget;
  }
}

interface NewsletterTurnstileProps {
  siteKey: string;
  onTokenChange: (token: string) => void;
  resetNonce: number;
}

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Newsletter-only challenge. The secret and acceptance decision remain server-side. */
const NewsletterTurnstile = ({ siteKey, onTokenChange, resetNonce }: NewsletterTurnstileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onTokenChange);

  useEffect(() => {
    callbackRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    let active = true;
    const renderWidget = () => {
      const turnstile = window.turnstile;
      if (!active || !turnstile || !containerRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action: "newsletter_signup",
        theme: "auto",
        size: "flexible",
        callback: (token) => {
          if (active) callbackRef.current(token);
        },
        "expired-callback": () => {
          if (active) callbackRef.current("");
        },
        "error-callback": () => {
          if (active) callbackRef.current("");
        },
      });
    };

    let script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    if (window.turnstile) renderWidget();
    else script.addEventListener("load", renderWidget);

    return () => {
      active = false;
      script?.removeEventListener("load", renderWidget);
      if (widgetIdRef.current !== null) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetNonce > 0 && widgetIdRef.current !== null) {
      window.turnstile?.reset(widgetIdRef.current);
    }
  }, [resetNonce]);

  return <div ref={containerRef} className="min-h-8" aria-label="Newsletter verification" />;
};

export default NewsletterTurnstile;
