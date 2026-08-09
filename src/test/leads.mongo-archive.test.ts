import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Guards the MongoDB lead archive added for the admin console. It must record
 * submissions faithfully when configured, and must never be able to break lead
 * capture when it is unconfigured or failing.
 */

const mocks = vi.hoisted(() => ({
  connectDB: vi.fn(),
  create: vi.fn(),
}));

vi.mock("../../api/_lib/db.js", () => ({ connectDB: mocks.connectDB }));
vi.mock("../../api/_lib/models/Contact.js", () => ({
  Contact: { create: mocks.create },
}));

const { default: handler } = await import("../../api/leads");

const createRes = () => {
  const res = {
    statusCode: 0,
    payload: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.payload = payload;
    },
    setHeader(name: string, value: string) {
      res.headers[name] = value;
    },
  };
  return res;
};

const createReq = (body: Record<string, unknown>) => ({
  method: "POST",
  body: body as never,
  headers: {
    origin: "https://alphatrack.digital",
    // Unique IP per request so the in-handler rate limiter never trips.
    "x-forwarded-for": `127.2.0.${Math.floor(Math.random() * 200) + 1}`,
  } as Record<string, string | string[] | undefined>,
});

const contactPayload = () => ({
  source: "contact_form",
  firstName: "Ada",
  lastName: "Lovelace",
  // Unique email so the dedupe key differs between tests.
  email: `ada-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
  company: "Analytical Engines Ltd",
  message: "Interested in conversion tracking.",
  serviceInterest: ["Conversion Tracking", "Paid Media"],
  monthlyBudget: "2",
});

const brevoSuccessSequence = () =>
  vi
    .fn()
    .mockResolvedValueOnce(new Response("", { status: 404 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: 123 }), { status: 201 }))
    .mockResolvedValue(new Response(JSON.stringify({ id: "ok" }), { status: 201 }));

describe("api/leads MongoDB archive", () => {
  beforeEach(() => {
    process.env.BREVO_API_KEY = "test-api-key";
    process.env.BREVO_CONTACT_LIST_ID = "8";
    mocks.connectDB.mockReset().mockResolvedValue(undefined);
    mocks.create.mockReset().mockResolvedValue({});
    vi.stubGlobal("fetch", brevoSuccessSequence());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_CONTACT_LIST_ID;
    delete process.env.MONGODB_URI;
  });

  it("archives the submission with serviceInterest preserved as an array", async () => {
    process.env.MONGODB_URI = "mongodb://example.test/alphatrack";
    const payload = contactPayload();

    const res = createRes();
    await handler(createReq(payload), res);

    expect(res.statusCode).toBe(200);
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "contact_form",
        email: payload.email,
        company: "Analytical Engines Ltd",
        // Brevo treats SERVICE_INTEREST as multiple-choice; the archive must
        // not flatten it to a string.
        serviceInterest: ["Conversion Tracking", "Paid Media"],
        monthlyBudget: "2",
      }),
    );
  });

  it("captures the lead and skips the archive when MONGODB_URI is unset", async () => {
    delete process.env.MONGODB_URI;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const res = createRes();
    await handler(createReq(contactPayload()), res);

    expect(res.statusCode).toBe(200);
    expect(res.payload).toMatchObject({ ok: true });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("MongoDB lead archive skipped"),
      expect.objectContaining({ source: "contact_form" }),
    );
  });

  it("still returns a successful capture when the archive throws", async () => {
    process.env.MONGODB_URI = "mongodb://example.test/alphatrack";
    mocks.create.mockRejectedValue(new Error("connection refused"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = createRes();
    await handler(createReq(contactPayload()), res);

    // The failure is logged, never surfaced to the visitor.
    expect(res.statusCode).toBe(200);
    expect(res.payload).toMatchObject({ ok: true });
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("MongoDB lead archive failed"),
      expect.objectContaining({ source: "contact_form" }),
    );
  });
});
