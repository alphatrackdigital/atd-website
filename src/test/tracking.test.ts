import { describe, expect, it, beforeEach, vi } from "vitest";

import {
  getBookingClickEventForUrl,
  getConversionEventForPath,
  getConversionEventsForPath,
  pushBookingClickEvent,
  pushDataLayerEvent,
  pushLeadSubmissionEvent,
} from "@/lib/tracking";

describe("tracking helpers", () => {
  beforeEach(() => {
    window.dataLayer = [];
    window.fbq = undefined;
    window.__atdConsentState = undefined;
    window.__atdMetaDispatchedEvents = undefined;
    window.__atdMetaEventIds = undefined;
    window.__atdMetaSuppressedEvents = undefined;
  });

  it("maps thank-you routes to canonical conversion events", () => {
    expect(getConversionEventForPath("/book-a-call/thank-you")).toBe("generate_lead");
    expect(getConversionEventForPath("/book-a-call/thank-you/")).toBe("generate_lead");
    expect(getConversionEventsForPath("/book-a-call/thank-you")).toEqual([
      "generate_lead",
      "meeting_booking_redirect",
    ]);
    expect(getConversionEventForPath("/contact-us/thank-you")).toBe("contact_form_submit");
    expect(getConversionEventForPath("/contact-us/thank-you/")).toBe("contact_form_submit");
    expect(getConversionEventForPath("/contact-us")).toBeNull();
  });

  it("maps booking links to booking flow events", () => {
    expect(getBookingClickEventForUrl("/book-a-call")).toBe("booking_cta_click");
    expect(getBookingClickEventForUrl("https://alphatrack.digital/book-a-call/")).toBe("booking_cta_click");
    expect(getBookingClickEventForUrl("https://meet.brevo.com/meet-atd/borderless?l=discovery")).toBe(
      "booking_scheduler_open",
    );
    expect(getBookingClickEventForUrl("/services")).toBeNull();
  });

  it("pushes events into the GTM dataLayer", () => {
    pushDataLayerEvent("contact_form_submit", {
      page_path: "/contact-us/thank-you",
      page_location: "https://alphatrack.digital/contact-us/thank-you",
    });

    expect(window.dataLayer).toContainEqual({
      event: "contact_form_submit",
      page_path: "/contact-us/thank-you",
      page_location: "https://alphatrack.digital/contact-us/thank-you",
    });
  });

  it("adds current page context to lead submission events", () => {
    window.history.pushState({}, "", "/offer/tracking-audit");

    pushLeadSubmissionEvent("tracking_audit_submit", {
      event_id: "atd-test-event",
      eventID: "atd-test-event",
      form_id: "tracking-audit-form",
      lead_source: "tracking_audit_offer",
    });

    expect(window.dataLayer).toEqual([
      expect.objectContaining({
        event: "tracking_audit_submit",
        event_id: "atd-test-event",
        eventID: "atd-test-event",
        page_path: "/offer/tracking-audit",
        page_location: expect.stringContaining("/offer/tracking-audit"),
        form_id: "tracking-audit-form",
        lead_source: "tracking_audit_offer",
      }),
    ]);
  });

  it("injects the active event ID into Meta Pixel standard events", () => {
    const fbq = vi.fn();
    window.fbq = fbq as typeof window.fbq;

    pushDataLayerEvent("contact_form_submit", {
      event_id: "atd-browser-dedupe-id",
      eventID: "atd-browser-dedupe-id",
      page_path: "/contact-us/thank-you",
      page_location: "https://alphatrack.digital/contact-us/thank-you",
    });

    window.fbq?.("track", "Lead", { content_name: "Contact Form Submission" });

    expect(fbq).toHaveBeenLastCalledWith(
      "track",
      "Lead",
      { content_name: "Contact Form Submission" },
      { eventID: "atd-browser-dedupe-id" },
    );
  });

  it("lets GTM fire the Tracking Audit browser Lead once with the server event ID", () => {
    const fbq = vi.fn();
    window.fbq = fbq as typeof window.fbq;

    pushLeadSubmissionEvent("tracking_audit_submit", {
      event_id: "atd-tracking-audit-dedupe-id",
      eventID: "atd-tracking-audit-dedupe-id",
      form_id: "tracking-audit-form",
      lead_source: "tracking_audit_offer",
    });

    expect(fbq).not.toHaveBeenCalled();

    window.fbq?.("track", "Lead", {
      content_name: "Tracking Audit Request",
      content_category: "primary_conversion",
      form_id: "tracking-audit-form",
      lead_source: "tracking_audit_offer",
    });

    expect(fbq).toHaveBeenCalledTimes(1);
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "Lead",
      expect.objectContaining({
        content_name: "Tracking Audit Request",
        form_id: "tracking-audit-form",
        lead_source: "tracking_audit_offer",
      }),
      { eventID: "atd-tracking-audit-dedupe-id" },
    );
  });

  it("does not bypass GTM consent controls with a direct Tracking Audit Lead", () => {
    const fbq = vi.fn();
    window.fbq = fbq as typeof window.fbq;
    window.__atdConsentState = {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    };

    pushLeadSubmissionEvent("tracking_audit_submit", {
      eventID: "atd-no-ad-consent",
    });

    expect(fbq).not.toHaveBeenCalled();
  });

  it("sends Newsletter Subscribe directly with the server event ID and suppresses stale GTM Lead", () => {
    const fbq = vi.fn();
    window.fbq = fbq as typeof window.fbq;
    window.__atdConsentState = {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    };

    pushLeadSubmissionEvent("newsletter_subscribe", {
      event_id: "atd-newsletter-dedupe-id",
      eventID: "atd-newsletter-dedupe-id",
      form_id: "footer-newsletter-form",
      lead_source: "newsletter",
    });

    expect(fbq).toHaveBeenCalledTimes(1);
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "Subscribe",
      expect.objectContaining({
        content_name: "Newsletter Signup",
        form_id: "footer-newsletter-form",
        lead_source: "newsletter",
      }),
      { eventID: "atd-newsletter-dedupe-id" },
    );

    window.fbq?.("track", "Lead", {
      form_id: "footer-newsletter-form",
      lead_source: "newsletter",
    });

    expect(fbq).toHaveBeenCalledTimes(1);
  });

  it("leaves Newsletter Meta delivery to consent-aware tooling when ad consent is not granted", () => {
    const fbq = vi.fn();
    window.fbq = fbq as typeof window.fbq;
    window.__atdConsentState = {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    };

    pushLeadSubmissionEvent("newsletter_subscribe", {
      eventID: "atd-newsletter-no-consent",
      form_id: "footer-newsletter-form",
      lead_source: "newsletter",
    });

    expect(fbq).not.toHaveBeenCalled();
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: "newsletter_subscribe",
        eventID: "atd-newsletter-no-consent",
      }),
    );
  });

  it("waits for the consented Meta Pixel before releasing the Newsletter GTM event", () => {
    vi.useFakeTimers();
    window.__atdConsentState = {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    };

    pushLeadSubmissionEvent("newsletter_subscribe", {
      eventID: "atd-newsletter-late-pixel",
      form_id: "footer-newsletter-form",
      lead_source: "newsletter",
    });

    expect(window.dataLayer).toEqual([]);

    const fbq = vi.fn();
    window.fbq = fbq as typeof window.fbq;
    vi.advanceTimersByTime(100);

    expect(fbq).toHaveBeenCalledWith(
      "track",
      "Subscribe",
      expect.objectContaining({
        form_id: "footer-newsletter-form",
      }),
      { eventID: "atd-newsletter-late-pixel" },
    );
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({
        event: "newsletter_subscribe",
        eventID: "atd-newsletter-late-pixel",
      }),
    );

    vi.useRealTimers();
  });

  it("suppresses GTM attempts to initialize an already active Meta Pixel", () => {
    const fbq = vi.fn() as typeof window.fbq;
    if (!fbq) throw new Error("fbq mock was not created");
    fbq.getState = () => ({
      pixels: [{ id: "955663116586662" }],
    });
    window.fbq = fbq;

    pushDataLayerEvent("tracking_audit_submit", {
      eventID: "atd-existing-pixel",
    });
    window.fbq?.("init", "955663116586662");

    expect(fbq).not.toHaveBeenCalledWith("init", "955663116586662");
  });

  it("adds current page context to booking click events", () => {
    window.history.pushState({}, "", "/services");

    const anchor = document.createElement("a");
    anchor.href = "/book-a-call";
    anchor.textContent = "Book A Free Strategy Call";

    pushBookingClickEvent(anchor);

    expect(window.dataLayer).toEqual([
      expect.objectContaining({
        event: "booking_cta_click",
        page_path: "/services",
        page_location: expect.stringContaining("/services"),
        link_url: expect.stringContaining("/book-a-call"),
        link_text: "Book A Free Strategy Call",
        booking_stage: "booking_page_intent",
      }),
    ]);
  });
});
