import { describe, expect, it, vi } from "vitest";
import {
  MANUAL_UI_EVIDENCE_REQUIRED,
  collectBrevoLifecycleEvidence,
} from "../../scripts/brevo-lifecycle-evidence.mjs";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const buildFetch = () => {
  const calls: Array<{ url: URL; init: RequestInit }> = [];

  const fetchImpl = vi.fn(async (input: URL | RequestInfo, init: RequestInit = {}) => {
    const url = input instanceof URL ? input : new URL(String(input));
    calls.push({ url, init });

    if (url.pathname === "/v3/account") {
      return jsonResponse({
        organization_id: "org-secret-id",
        companyName: "AlphaTrack Digital",
        email: "owner@alphatrack.digital",
        enterprise: false,
        plan: [{ type: "free" }],
      });
    }

    if (
      url.pathname === "/v3/contacts/qa%40example.com" &&
      url.searchParams.get("identifierType") === "email_id"
    ) {
      return jsonResponse({
        id: 12345,
        email: "qa@example.com",
        emailBlacklisted: false,
        smsBlacklisted: true,
        whatsappBlacklisted: false,
        listIds: [11, 14],
        listUnsubscribed: [9],
        consentGroups: [{ id: 3, status: "subscribed" }],
        attributes: {
          SOURCE: "ATD Website Tracking Audit",
          LEAD_SOURCE: "tracking_audit_offer",
          WEBSITE_ROUTE: "/offer/tracking-audit",
          OFFER: "tracking-audit",
          CONSENT_STATUS: "opted_in",
          OPT_IN: true,
          FIRST_SOURCE: "ATD Website Tracking Audit",
          FIRST_LEAD_SOURCE: "tracking_audit_offer",
          LAST_SOURCE: "ATD Website Tracking Audit",
          LAST_LEAD_SOURCE: "tracking_audit_offer",
          SOURCE_HISTORY: "[private lifecycle history]",
          MESSAGE: "private message that must not be emitted",
        },
      });
    }

    if (url.pathname === "/v3/contacts/attributes") {
      return jsonResponse({
        attributes: [
          { category: "normal", name: "SOURCE", type: "text" },
          { category: "normal", name: "LEAD_SOURCE", type: "text" },
          { category: "normal", name: "WEBSITE_ROUTE", type: "text" },
          { category: "normal", name: "OFFER", type: "text" },
          { category: "normal", name: "CONSENT_STATUS", type: "text" },
          { category: "normal", name: "OPT_IN", type: "boolean" },
          { category: "normal", name: "SOURCE_HISTORY", type: "text" },
        ],
      });
    }

    if (url.pathname === "/v3/contacts/lists") {
      return jsonResponse({
        count: 3,
        lists: [
          { id: 9, name: "ATD | Newsletter" },
          { id: 11, name: "Tracking Audit Leads" },
          { id: 14, name: "ATD | Suppression - Sales Converted" },
        ],
      });
    }

    if (url.pathname === "/v3/smtp/templates") {
      return jsonResponse({
        count: 2,
        templates: [
          {
            id: 58,
            name: "Tracking Audit - Accepted",
            isActive: true,
            modifiedAt: "2026-09-01T00:00:00Z",
            htmlContent: "<p>private template body</p>",
            subject: "Private subject not needed in evidence",
            sender: {
              name: "AlphaTrack Digital",
              email: "hello@alphatrack.digital",
            },
          },
          {
            id: 60,
            name: "Tracking Audit - Disqualified",
            isActive: true,
            sender: {
              name: "AlphaTrack Digital",
              email: "hello@alphatrack.digital",
            },
          },
        ],
      });
    }

    if (url.pathname === "/v3/senders") {
      return jsonResponse({
        senders: [
          {
            id: 7,
            name: "AlphaTrack Digital",
            email: "hello@alphatrack.digital",
            active: true,
          },
        ],
      });
    }

    if (url.pathname === "/v3/webhooks") {
      const type = url.searchParams.get("type");
      if (type === "transactional") {
        return jsonResponse({
          webhooks: [
            {
              id: 90,
              type,
              description: "ATD transactional evidence",
              events: ["delivered", "hardBounce"],
              url: "https://hooks.alphatrack.digital/very-secret-hook-token",
              auth: { type: "bearer", token: "super-secret-token" },
              headers: [{ key: "x-atd-secret", value: "super-secret-header" }],
              batched: true,
            },
          ],
        });
      }
      return jsonResponse({ webhooks: [] });
    }

    return jsonResponse({ message: "unexpected endpoint" }, 404);
  });

  return { fetchImpl, calls };
};

describe("Brevo lifecycle evidence helper", () => {
  it("uses GET-only requests and emits redacted lifecycle evidence", async () => {
    const { fetchImpl, calls } = buildFetch();

    const report = await collectBrevoLifecycleEvidence({
      apiKey: "test-api-key",
      contactEmail: "QA@Example.com",
      expectedListIds: [11, 14],
      templateIds: [58, 59, 60],
      fetchImpl,
      now: () => new Date("2026-09-22T01:30:00.000Z"),
    });

    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every(({ init }) => init.method === "GET")).toBe(true);
    expect(report.boundaries.writesAttempted).toBe(0);
    expect(report.boundaries.sendsAttempted).toBe(0);
    expect(report.contact.found).toBe(true);
    expect(report.contact.expectedMembership).toEqual([
      { id: 11, name: "Tracking Audit Leads", member: true },
      { id: 14, name: "ATD | Suppression - Sales Converted", member: true },
    ]);
    expect(report.contact.suppression).toMatchObject({
      emailBlacklisted: false,
      smsBlacklisted: true,
      whatsappBlacklisted: false,
      listUnsubscribed: [9],
    });
    expect(report.contact.sourceHistoryPresent).toBe(true);
    expect(report.templates.missingIds).toEqual([59]);
    expect(report.workflowEvidence.status).toBe(MANUAL_UI_EVIDENCE_REQUIRED);

    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain("qa@example.com");
    expect(serialized).not.toContain("owner@alphatrack.digital");
    expect(serialized).not.toContain("hello@alphatrack.digital");
    expect(serialized).not.toContain("very-secret-hook-token");
    expect(serialized).not.toContain("super-secret-token");
    expect(serialized).not.toContain("super-secret-header");
    expect(serialized).not.toContain("private message");
    expect(serialized).not.toContain("private template body");
    expect(serialized).not.toContain("Private subject");
    expect(serialized).not.toContain("[private lifecycle history]");
    expect(report.webhooks.transactional.webhooks[0]).toMatchObject({
      endpoint: {
        host: "hooks.alphatrack.digital",
      },
      authType: "bearer",
      hasAuth: true,
      headerKeys: ["x-atd-secret"],
    });
  });

  it("fails closed on account authentication failure without exposing provider response text", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ message: "provider detail with secret-token" }, 401),
    );

    await expect(
      collectBrevoLifecycleEvidence({
        apiKey: "bad-key",
        contactEmail: "qa@example.com",
        fetchImpl,
      }),
    ).rejects.toThrow("Brevo authentication failed with HTTP 401.");

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("reports an absent contact without treating it as workflow evidence", async () => {
    const { fetchImpl } = buildFetch();
    const wrappedFetch = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const url = input instanceof URL ? input : new URL(String(input));
      if (url.pathname === "/v3/contacts/missing%40example.com") {
        return jsonResponse({ message: "not found" }, 404);
      }
      return fetchImpl(input, init);
    });

    const report = await collectBrevoLifecycleEvidence({
      apiKey: "test-api-key",
      contactEmail: "missing@example.com",
      expectedListIds: [11],
      fetchImpl: wrappedFetch,
    });

    expect(report.contact.found).toBe(false);
    expect(report.contact.status).toBe(404);
    expect(report.contact.suppression).toBeNull();
    expect(report.workflowEvidence.status).toBe(MANUAL_UI_EVIDENCE_REQUIRED);
    expect(report.workflowEvidence.requiredUiChecks).toContain("re-entry policy");
  });
});
