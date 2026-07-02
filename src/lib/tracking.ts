type DataLayerValue = string | number | boolean | null | undefined;

export type DataLayerPayload = Record<string, DataLayerValue>;

type FbqFunction = ((...args: unknown[]) => unknown) & {
  _atdEventIdWrapped?: boolean;
  _atdOriginalFbq?: FbqFunction;
  getState?: () => {
    pixels?: Array<{ id?: string }>;
  };
  [key: string]: unknown;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: FbqFunction;
    __atdConsentState?: Record<string, string>;
    __atdMetaDispatchedEvents?: Record<string, boolean>;
    __atdMetaEventIds?: Record<string, string>;
  }
}

const metaStandardEventsByDataLayerEvent: Record<string, string> = {
  contact_form_submit: "Lead",
  generate_lead: "Lead",
  tracking_audit_submit: "Lead",
  exit_popup_success: "Lead",
  newsletter_subscribe: "Subscribe",
};

const getPayloadEventId = (payload: DataLayerPayload) => {
  const eventId = payload.eventID || payload.event_id;
  return typeof eventId === "string" && eventId.trim() ? eventId.trim() : "";
};

const objectHasEventId = (value: unknown) =>
  Boolean(
    value &&
      typeof value === "object" &&
      "eventID" in value &&
      typeof (value as { eventID?: unknown }).eventID === "string" &&
      (value as { eventID: string }).eventID.trim(),
  );

const setMetaPixelEventIdOption = (args: unknown[], optionIndex: number, eventId: string) => {
  const nextArgs = [...args];
  const existingOptions = nextArgs[optionIndex];

  if (objectHasEventId(existingOptions)) {
    return nextArgs;
  }

  nextArgs[optionIndex] = {
    ...(existingOptions && typeof existingOptions === "object" ? existingOptions : {}),
    eventID: eventId,
  };

  return nextArgs;
};

const getMetaPixelEventKey = (eventName: string, eventId: string) =>
  `${eventName}:${eventId}`;

const hasDispatchedMetaPixelEvent = (eventName: string, eventId: string) =>
  Boolean(window.__atdMetaDispatchedEvents?.[getMetaPixelEventKey(eventName, eventId)]);

const markMetaPixelEventDispatched = (eventName: string, eventId: string) => {
  window.__atdMetaDispatchedEvents = window.__atdMetaDispatchedEvents || {};
  window.__atdMetaDispatchedEvents[getMetaPixelEventKey(eventName, eventId)] = true;
};

const isMetaPixelInitialized = (fbq: FbqFunction, pixelId: string) => {
  try {
    return Boolean(fbq.getState?.().pixels?.some((pixel) => pixel.id === pixelId));
  } catch {
    return false;
  }
};

const installMetaPixelEventIdPatch = () => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (window.fbq._atdEventIdWrapped) return;

  const originalFbq = window.fbq;
  const wrappedFbq: FbqFunction = (...args: unknown[]) => {
    const command = args[0];

    if (
      command === "init" &&
      typeof args[1] === "string" &&
      isMetaPixelInitialized(originalFbq, args[1])
    ) {
      return undefined;
    }

    if (command === "track" && typeof args[1] === "string") {
      const eventName = args[1];
      const eventId = window.__atdMetaEventIds?.[eventName];
      if (eventId) {
        const nextArgs = args.length >= 3 ? args : [args[0], args[1], {}];
        if (hasDispatchedMetaPixelEvent(eventName, eventId)) return undefined;
        markMetaPixelEventDispatched(eventName, eventId);
        return originalFbq(...setMetaPixelEventIdOption(nextArgs, 3, eventId));
      }
    }

    if (command === "trackSingle" && typeof args[2] === "string") {
      const eventName = args[2];
      const eventId = window.__atdMetaEventIds?.[eventName];
      if (eventId) {
        const nextArgs = args.length >= 4 ? args : [args[0], args[1], args[2], {}];
        if (hasDispatchedMetaPixelEvent(eventName, eventId)) return undefined;
        markMetaPixelEventDispatched(eventName, eventId);
        return originalFbq(...setMetaPixelEventIdOption(nextArgs, 4, eventId));
      }
    }

    return originalFbq(...args);
  };

  Object.assign(wrappedFbq, originalFbq);
  wrappedFbq._atdEventIdWrapped = true;
  wrappedFbq._atdOriginalFbq = originalFbq;
  window.fbq = wrappedFbq;
};

const rememberMetaPixelEventId = (event: string, payload: DataLayerPayload) => {
  if (typeof window === "undefined") return;

  const metaEventName = metaStandardEventsByDataLayerEvent[event];
  const eventId = getPayloadEventId(payload);
  if (!metaEventName || !eventId) return;

  window.__atdMetaEventIds = window.__atdMetaEventIds || {};
  window.__atdMetaEventIds[metaEventName] = eventId;
  installMetaPixelEventIdPatch();
};

export const pushDataLayerEvent = (event: string, payload: DataLayerPayload = {}) => {
  if (typeof window === "undefined") return;

  try {
    rememberMetaPixelEventId(event, payload);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  } catch (error) {
    console.warn("Tracking event push failed", {
      event,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

export const pushLeadSubmissionEvent = (
  event: string,
  payload: DataLayerPayload = {},
) => {
  if (typeof window === "undefined") return;

  pushDataLayerEvent(event, {
    page_path: window.location.pathname,
    page_location: window.location.href,
    ...payload,
  });
};

export const getBookingClickEventForUrl = (href: string, baseUrl = "https://alphatrack.digital") => {
  try {
    const url = new URL(href, baseUrl);
    const normalizedPath = url.pathname.endsWith("/") && url.pathname !== "/"
      ? url.pathname.slice(0, -1)
      : url.pathname;

    if (url.hostname === "meet.brevo.com") {
      return "booking_scheduler_open";
    }

    if (normalizedPath === "/book-a-call") {
      return "booking_cta_click";
    }
  } catch {
    return null;
  }

  return null;
};

export const pushBookingClickEvent = (anchor: HTMLAnchorElement) => {
  if (typeof window === "undefined") return;

  const event = getBookingClickEventForUrl(anchor.href, window.location.origin);
  if (!event) return;

  const linkText = anchor.textContent?.replace(/\s+/g, " ").trim() || anchor.getAttribute("aria-label") || "";
  const isSchedulerOpen = event === "booking_scheduler_open";

  pushDataLayerEvent(event, {
    page_path: window.location.pathname,
    page_location: window.location.href,
    link_url: anchor.href,
    link_text: linkText,
    booking_provider: isSchedulerOpen ? "brevo_meetings" : undefined,
    booking_stage: isSchedulerOpen ? "scheduler_open" : "booking_page_intent",
  });
};

export const getConversionEventsForPath = (pathname: string) => {
  const normalizedPath = pathname.endsWith("/") && pathname !== "/"
    ? pathname.slice(0, -1)
    : pathname;

  if (normalizedPath === "/book-a-call/thank-you") {
    return ["generate_lead", "meeting_booking_redirect"];
  }

  if (normalizedPath === "/contact-us/thank-you") {
    return ["contact_form_submit"];
  }

  return [];
};

export const getConversionEventForPath = (pathname: string) => {
  return getConversionEventsForPath(pathname)[0] ?? null;
};
