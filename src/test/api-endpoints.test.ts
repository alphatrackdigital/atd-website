import { afterEach, describe, expect, it, vi } from "vitest";

import { getAdminEndpoint, resolveApiEndpoint } from "@/lib/apiEndpoints";

describe("API endpoint resolution", () => {
  it("uses the live backend for static production hostnames", () => {
    expect(resolveApiEndpoint("/api/leads", undefined, "alphatrack.digital")).toBe(
      "https://alphatra-serv.netlify.app/api/leads",
    );

    expect(resolveApiEndpoint("/api/brevo-subscribe", undefined, "www.alphatrack.digital")).toBe(
      "https://alphatra-serv.netlify.app/api/brevo-subscribe",
    );
  });

  it("keeps same-origin API routes for local hosts", () => {
    expect(resolveApiEndpoint("/api/leads", undefined, "localhost")).toBe("/api/leads");
    expect(resolveApiEndpoint("/api/leads", undefined, "127.0.0.1")).toBe("/api/leads");
    expect(resolveApiEndpoint("/api/leads", undefined, "dev.localhost")).toBe("/api/leads");
  });

  it("keeps same-origin API routes for Vercel test hosts", () => {
    expect(resolveApiEndpoint("/api/leads", undefined, "website-internal-test.vercel.app")).toBe(
      "/api/leads",
    );
    expect(
      resolveApiEndpoint(
        "/api/brevo-subscribe",
        undefined,
        "atd-website-test-9pb572koc-alphatrackdigitals-projects.vercel.app",
      ),
    ).toBe("/api/brevo-subscribe");
  });

  it("uses the live backend for static staging and preview hostnames", () => {
    expect(resolveApiEndpoint("/api/leads", undefined, "alphatrackdigital.netlify.app")).toBe(
      "https://alphatra-serv.netlify.app/api/leads",
    );
    expect(resolveApiEndpoint("/api/leads", undefined, "temporary-namecheap-preview.example")).toBe(
      "https://alphatra-serv.netlify.app/api/leads",
    );
  });

  it("uses explicitly configured endpoints first", () => {
    expect(resolveApiEndpoint("/api/leads", "https://example.com/leads", "alphatrack.digital")).toBe(
      "https://example.com/leads",
    );
  });
});

describe("admin endpoint resolution", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds admin URLs from the configured backend origin", () => {
    vi.stubEnv("VITE_ADMIN_API_BASE_URL", "https://atd-backend-test.vercel.app");

    expect(getAdminEndpoint("/api/auth/login")).toBe(
      "https://atd-backend-test.vercel.app/api/auth/login",
    );
  });

  it("tolerates a trailing slash on the configured origin", () => {
    vi.stubEnv("VITE_ADMIN_API_BASE_URL", "https://atd-backend-test.vercel.app/");

    expect(getAdminEndpoint("/api/contacts/admin")).toBe(
      "https://atd-backend-test.vercel.app/api/contacts/admin",
    );
  });

  it("throws rather than silently targeting a backend with no admin routes", () => {
    // The public-endpoint fallback would resolve to alphatra-serv.netlify.app,
    // which serves lead handlers only - the resulting 404s would look like
    // authentication failures.
    vi.stubEnv("VITE_ADMIN_API_BASE_URL", "");

    expect(() => getAdminEndpoint("/api/auth/login")).toThrow(/VITE_ADMIN_API_BASE_URL/);
  });
});
