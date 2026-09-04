import { expect, test, type Page, type Route } from "@playwright/test";

type CapturedPayload = Record<string, unknown>;

type CapturedAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  landingPage?: string;
};

const UTM_QUERY =
  "?utm_source=meta&utm_medium=paid_social&utm_campaign=tracking_audit_beta_uat&utm_content=route_contract&utm_term=beta&fbclid=uat-click-123";

const hideExternalOverlays = async (page: Page) => {
  await page.addStyleTag({
    content:
      "#lanyard_root, [data-ketch-backdrop='true'] { display: none !important; pointer-events: none !important; }",
  });
};

const installLeadCapture = async (page: Page) => {
  let captured: CapturedPayload | null = null;

  await page.route("**/api/leads", async (requestRoute: Route) => {
    const request = requestRoute.request();
    if (request.method() !== "POST") {
      await requestRoute.fulfill({
        status: 405,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, message: "Method not allowed" }),
      });
      return;
    }

    captured = JSON.parse(request.postData() || "{}") as CapturedPayload;
    const metaEventId = captured.metaEventId || "uat-fallback-event";

    await requestRoute.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        duplicate: false,
        pendingConfirmation: false,
        metaEventId,
      }),
    });
  });

  return () => captured;
};

const selectCombobox = async (page: Page, label: string, option: string) => {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};

const assertPremiumSuccessState = async (page: Page) => {
  await expect(page.getByRole("heading", { name: "Application received." })).toBeVisible();
  await expect(
    page.getByText("Thanks — we’ve received your Tracking Audit application.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("We’ll review it and email you within one business day if the audit is a good fit.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("No passwords or account credentials are required.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to site" })).toBeVisible();
  await expect(page.getByText(/Application contact:/)).toHaveCount(0);
};

const assertSubmissionContract = async (
  page: Page,
  payload: CapturedPayload | null,
  expected: {
    route: string;
    industry: string;
    company: string;
    primaryConversionType: string;
  },
) => {
  expect(payload).not.toBeNull();
  expect(payload?.source).toBe("tracking_audit_offer");
  expect(payload?.websiteRoute).toBe(expected.route);
  expect(payload?.industry).toBe(expected.industry);
  expect(payload?.company).toBe(expected.company);
  expect(payload?.primaryConversionType).toBe(expected.primaryConversionType);
  expect(payload?.optIn).toBe(false);
  expect(payload?.metaEventId).toMatch(/^atd-/);

  const attribution = (payload?.attribution || {}) as CapturedAttribution;
  expect(attribution).toMatchObject({
    utmSource: "meta",
    utmMedium: "paid_social",
    utmCampaign: "tracking_audit_beta_uat",
    utmContent: "route_contract",
    utmTerm: "beta",
    fbclid: "uat-click-123",
  });
  expect(attribution.landingPage).toBe(`${expected.route}${UTM_QUERY}`);

  const trackingEvent = await page.evaluate(() =>
    (window.dataLayer || [])
      .filter((event) => event?.event === "tracking_audit_submit")
      .at(-1),
  );

  expect(trackingEvent).toMatchObject({
    event: "tracking_audit_submit",
    event_id: payload?.metaEventId,
    eventID: payload?.metaEventId,
    page_path: expected.route,
    form_id: "tracking-audit-form",
    lead_source: "tracking_audit_offer",
    opt_in: false,
  });
};

test.describe("Tracking Audit Beta application contract UAT", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
  });

  test("General LP submits its exact page route, attribution and canonical qualification payload", async ({ page }) => {
    const getCaptured = await installLeadCapture(page);
    const route = "/offer/tracking-audit";

    await page.goto(`${route}${UTM_QUERY}`);
    await hideExternalOverlays(page);

    await page.getByLabel("First Name").fill("Beta");
    await page.getByLabel("Last Name").fill("General");
    await page.getByLabel("Work Email").fill("beta-general@example.com");
    await page.getByLabel("Company").fill("Beta General Co");
    await page.getByLabel("Website").fill("example.com");
    await page.getByRole("button", { name: "Continue" }).click();

    await selectCombobox(page, "Industry", "Other");
    await selectCombobox(page, "Your role", "Founder / CEO");
    await selectCombobox(page, "Your role in this decision", "Final decision maker");
    await selectCombobox(page, "Monthly ad spend", "$5k–10k");
    await selectCombobox(page, "Main ad platform", "Meta");
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await selectCombobox(page, "How confident are you in your tracking?", "Partly working");
    await selectCombobox(page, "What matters most?", "Lead form");
    await selectCombobox(page, "What’s going wrong?", "Lead sources are missing");
    await selectCombobox(page, "How soon do you want this addressed?", "Within 30 days");

    await page.waitForTimeout(1600);
    await page.getByRole("button", { name: "Request My Free Audit" }).click();
    await assertPremiumSuccessState(page);

    await assertSubmissionContract(page, getCaptured(), {
      route,
      industry: "other",
      company: "Beta General Co",
      primaryConversionType: "lead_form",
    });
  });

  test("Professional Services LP submits its preset with the correct page route", async ({ page }) => {
    const getCaptured = await installLeadCapture(page);
    const route = "/offer/tracking-audit/professional-services";

    await page.goto(`${route}${UTM_QUERY}`);
    await hideExternalOverlays(page);

    await page.getByLabel("First Name").fill("Beta");
    await page.getByLabel("Last Name").fill("Professional");
    await page.getByLabel("Work Email").fill("beta-pro@example.com");
    await page.getByLabel("Business / Company").fill("Beta Advisory");
    await page.getByLabel("Website").fill("example.com");
    await page.getByRole("button", { name: "Continue" }).click();

    await selectCombobox(page, "Your role", "Founder / Managing Partner");
    await selectCombobox(page, "Are you involved in choosing a provider?", "I help choose");
    await selectCombobox(page, "Rough monthly ad spend", "$5k–10k");
    await selectCombobox(page, "Main ad platform", "Google");
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await selectCombobox(page, "How clear are you on where enquiries come from?", "Partly clear");
    await selectCombobox(page, "What enquiry action matters most?", "Booked call / consultation");
    await selectCombobox(page, "What’s unclear?", "We get leads but lose the source");
    await selectCombobox(page, "When do you want clarity?", "Within 30 days");

    await page.waitForTimeout(1600);
    await page.getByRole("button", { name: "Request My Free Audit" }).click();
    await assertPremiumSuccessState(page);

    await assertSubmissionContract(page, getCaptured(), {
      route,
      industry: "professional_services",
      company: "Beta Advisory",
      primaryConversionType: "booked_call_appointment",
    });
  });

  test("Education LP submits its preset with the correct page route", async ({ page }) => {
    const getCaptured = await installLeadCapture(page);
    const route = "/offer/tracking-audit/education";

    await page.goto(`${route}${UTM_QUERY}`);
    await hideExternalOverlays(page);

    await page.getByLabel("First Name").fill("Beta");
    await page.getByLabel("Last Name").fill("Education");
    await page.getByLabel("Work Email").fill("beta-education@example.com");
    await page.getByLabel("Institution / Organisation").fill("Beta College");
    await page.getByLabel("Website").fill("example.edu");
    await page.getByRole("button", { name: "Continue" }).click();

    await selectCombobox(page, "Your role", "Founder / Director");
    await selectCombobox(page, "Are you involved in choosing a provider?", "I help choose");
    await selectCombobox(page, "Rough monthly ad spend", "$5k–10k");
    await selectCombobox(page, "Main ad platform", "Google");
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await selectCombobox(page, "How clear are you on where enquiries and applications come from?", "Partly clear");
    await selectCombobox(page, "What recruitment action matters most?", "Application / enrolment");
    await selectCombobox(page, "What’s unclear?", "I can’t tell which ads bring applicants");
    await selectCombobox(page, "When do you want clarity?", "Within 30 days");

    await page.waitForTimeout(1600);
    await page.getByRole("button", { name: "Request My Free Audit" }).click();
    await assertPremiumSuccessState(page);

    await assertSubmissionContract(page, getCaptured(), {
      route,
      industry: "education_training",
      company: "Beta College",
      primaryConversionType: "application_enrolment",
    });
  });

  test("Real Estate LP submits its preset with the correct page route", async ({ page }) => {
    const getCaptured = await installLeadCapture(page);
    const route = "/offer/tracking-audit/real-estate";

    await page.goto(`${route}${UTM_QUERY}`);
    await hideExternalOverlays(page);

    await page.getByLabel("First Name").fill("Beta");
    await page.getByLabel("Last Name").fill("Real Estate");
    await page.getByLabel("Work Email").fill("beta-real-estate@example.com");
    await page.getByLabel("Company / Organisation").fill("Beta Realty");
    await page.getByLabel("Website").fill("example.com");
    await page.getByRole("button", { name: "Continue" }).click();

    await selectCombobox(page, "Your role", "Founder / Director");
    await selectCombobox(page, "Are you involved in choosing a provider?", "I help choose");
    await selectCombobox(page, "Rough monthly ad spend", "$5k–10k");
    await selectCombobox(page, "Main ad platform", "Google");
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    await selectCombobox(page, "How clear are you on where property enquiries come from?", "Partly clear");
    await selectCombobox(page, "What property action matters most?", "Booked viewing / appointment");
    await selectCombobox(page, "What’s unclear?", "I can’t tell which ads bring qualified property enquiries");
    await selectCombobox(page, "When do you want clarity?", "Within 30 days");

    await page.waitForTimeout(1600);
    await page.getByRole("button", { name: "Request My Free Audit" }).click();
    await assertPremiumSuccessState(page);

    await assertSubmissionContract(page, getCaptured(), {
      route,
      industry: "real_estate",
      company: "Beta Realty",
      primaryConversionType: "booked_call_appointment",
    });
  });
});
