import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";

test("real production Tracking Audit journey reaches backend and browser Meta Pixel", async ({ page }) => {
  const facebookRequests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (/facebook\.com\/tr|connect\.facebook\.net/i.test(url)) facebookRequests.push(url);
  });

  const query = "?utm_source=meta&utm_medium=paid_social&utm_campaign=atd_prod_live_e2e_20260901&utm_content=full_journey&utm_term=qa&fbclid=atd-prod-live-e2e";
  await page.goto("/offer/tracking-audit" + query, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: "#lanyard_root, [data-ketch-backdrop='true'] { display:none !important; pointer-events:none !important; }" });

  // Explicit QA-browser consent so GTM/Meta Pixel can participate in the dedupe check.
  await page.evaluate(() => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "ketchPermitChanged",
      analytics___measurement: true,
      targeted_advertising: true,
    });
  });
  await page.waitForTimeout(2500);

  await page.getByLabel("First Name").fill("ATD");
  await page.getByLabel("Last Name").fill("Production E2E");
  await page.getByLabel("Work Email").fill("alphatrackdigital+atd-prod-e2e-20260901@gmail.com");
  await page.getByLabel("Company").fill("AlphaTrack Digital QA");
  await page.getByLabel("Website").fill("alphatrack.digital");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("combobox", { name: "Industry", exact: true }).click();
  await page.getByRole("option", { name: "Professional services", exact: true }).click();
  await page.getByRole("combobox", { name: "Your role", exact: true }).click();
  await page.getByRole("option", { name: "Founder / CEO", exact: true }).click();
  await page.getByText("Final decision maker", { exact: true }).click();
  await page.getByRole("combobox", { name: "Monthly ad spend", exact: true }).click();
  await page.getByRole("option", { name: "GHS 3k–6k", exact: true }).click();
  await page.getByText("Meta", { exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).evaluate((element: HTMLButtonElement) => element.click());

  await page.getByText("Partly working", { exact: true }).click();
  await page.getByText("Lead form", { exact: true }).click();
  await page.getByRole("combobox", { name: "What’s going wrong?", exact: true }).click();
  await page.getByRole("option", { name: "Lead sources are missing", exact: true }).click();
  await page.getByText("Within 30 days", { exact: true }).click();

  await page.waitForTimeout(1700);
  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("alphatra-serv.netlify.app/api/leads") &&
    response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Request My Free Audit" }).click();
  const response = await responsePromise;
  const backend = await response.json();
  expect(response.status()).toBe(200);
  expect(backend.ok).toBe(true);
  expect(backend.duplicate).toBe(false);
  expect(backend.metaEventId).toMatch(/^atd-/);
  await expect(page.getByRole("heading", { name: "Application received." })).toBeVisible();

  await page.waitForTimeout(5000);
  const browser = await page.evaluate(() => {
    const events = ((window as any).dataLayer || []).filter((e: any) => e?.event === "tracking_audit_submit");
    return {
      event: events.at(-1),
      consent: (window as any).__atdConsentState,
      fbqPresent: typeof (window as any).fbq === "function",
    };
  });

  expect(browser.event?.event_id).toBe(backend.metaEventId);
  expect(browser.event?.eventID).toBe(backend.metaEventId);
  expect(browser.event?.page_path).toBe("/offer/tracking-audit");
  expect(browser.consent?.ad_storage).toBe("granted");
  expect(browser.fbqPresent).toBe(true);

  const leadRequests = facebookRequests.filter((url) => /[?&]ev=Lead(?:&|$)/i.test(url));
  expect(leadRequests.length).toBeGreaterThan(0);
  const eventIdSeen = leadRequests.some((url) => {
    const decoded = decodeURIComponent(url);
    return decoded.includes(backend.metaEventId);
  });

  writeFileSync("production-live-e2e-evidence.json", JSON.stringify({
    backendStatus: response.status(),
    ok: backend.ok,
    duplicate: backend.duplicate,
    metaEventId: backend.metaEventId,
    route: "/offer/tracking-audit",
    browserTrackingEventId: browser.event?.event_id,
    consent: browser.consent,
    fbqPresent: browser.fbqPresent,
    metaLeadRequestCount: leadRequests.length,
    browserPixelCarriesServerEventId: eventIdSeen,
  }, null, 2));

  expect(eventIdSeen).toBe(true);
});
