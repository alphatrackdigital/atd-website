import { expect, test, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";

const enableConsent = async (page: Page, path: string) => {
  await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "ketchPermitChanged",
      analytics___measurement: true,
      targeted_advertising: true,
    });
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
  });
  await page.waitForTimeout(2500);
};

const startFacebookCapture = (page: Page) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (/facebook\.com\/tr|connect\.facebook\.net/i.test(url)) requests.push(url);
  });
  return requests;
};

const hasPixelEvent = (requests: string[], eventName: string, eventId: string) =>
  requests.some((url) => {
    const decoded = decodeURIComponent(url);
    return decoded.includes(`ev=${eventName}`) && decoded.includes(eventId);
  });

test.skip("real production Contact journey", async ({ page }) => {
  const fb = startFacebookCapture(page);
  await enableConsent(
    page,
    "/contact-us?utm_source=qa&utm_medium=e2e&utm_campaign=prod_aux_forms&utm_content=contact&fbclid=atd-contact-e2e"
  );

  await page.getByLabel("First Name").fill("ATD");
  await page.getByLabel("Last Name").fill("Contact E2E");
  await page.getByLabel("Company Email").fill("alphatrackdigital+atd-contact-e2e-20260901@gmail.com");
  await page.getByText("Analytics & Tracking", { exact: true }).click();
  await page.getByLabel("Your Message").fill("ATD controlled production Contact form E2E.");
  await page.getByLabel(/Yes, you can also send me occasional insights/i).check();

  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("alphatra-serv.netlify.app/api/leads") &&
    response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Start the Conversation" }).click();
  const response = await responsePromise;
  const backend = await response.json();

  expect(response.status()).toBe(200);
  expect(backend.ok).toBe(true);
  expect(backend.duplicate).toBe(false);
  expect(backend.metaEventId).toMatch(/^atd-/);
  await page.waitForURL("**/contact-us/thank-you");
  await page.waitForTimeout(4500);

  const event = await page.evaluate(() =>
    ((window as any).dataLayer || []).filter((x: any) => x?.event === "contact_form_submit").at(-1)
  );
  expect(event?.event_id).toBe(backend.metaEventId);
  expect(hasPixelEvent(fb, "Lead", backend.metaEventId)).toBe(true);

  writeFileSync("contact-live-e2e.json", JSON.stringify({
    status: response.status(),
    ok: backend.ok,
    duplicate: backend.duplicate,
    metaEventId: backend.metaEventId,
    route: "/contact-us",
    browserEventId: event?.event_id,
    pixelLeadCarriesEventId: hasPixelEvent(fb, "Lead", backend.metaEventId),
  }, null, 2));
});

test("real production Newsletter journey", async ({ page }) => {
  const fb = startFacebookCapture(page);
  await enableConsent(
    page,
    "/blog?utm_source=qa&utm_medium=e2e&utm_campaign=prod_aux_forms&utm_content=newsletter&fbclid=atd-newsletter-e2e"
  );

  const section = page.locator("section").filter({ hasText: "Get insights straight to your inbox" }).first();
  await section.scrollIntoViewIfNeeded();
  await section.getByRole("textbox", { name: "Email address" }).fill("alphatrackdigital+atd-newsletter-e2e2-20260901@gmail.com");
  await section.getByRole("checkbox").check();

  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("alphatra-serv.netlify.app/api/leads") &&
    response.request().method() === "POST"
  );
  await section.getByRole("button", { name: "Subscribe" }).click();
  const response = await responsePromise;
  const backend = await response.json();

  expect(response.status()).toBe(200);
  expect(backend.ok).toBe(true);
  expect(backend.duplicate).toBe(false);
  expect(backend.metaEventId).toMatch(/^atd-/);
  await expect(page.getByText(/You're subscribed|Check your email to confirm/i).first()).toBeVisible();
  await page.waitForTimeout(4500);

  const event = await page.evaluate(() =>
    ((window as any).dataLayer || []).filter((x: any) => x?.event === "newsletter_subscribe").at(-1)
  );
  expect(event?.event_id).toBe(backend.metaEventId);
  expect(hasPixelEvent(fb, "Subscribe", backend.metaEventId)).toBe(true);

  writeFileSync("newsletter-live-e2e.json", JSON.stringify({
    status: response.status(),
    ok: backend.ok,
    duplicate: backend.duplicate,
    pendingConfirmation: backend.pendingConfirmation === true,
    metaEventId: backend.metaEventId,
    browserEventId: event?.event_id,
    pixelSubscribeCarriesEventId: hasPixelEvent(fb, "Subscribe", backend.metaEventId),
  }, null, 2));
});

test("real production Exit Popup journey", async ({ page }) => {
  const fb = startFacebookCapture(page);
  await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
  await page.goto(
    "/?utm_source=qa&utm_medium=e2e&utm_campaign=prod_aux_forms&utm_content=exit_popup&fbclid=atd-exit-e2e",
    { waitUntil: "domcontentloaded" }
  );
  await page.evaluate(() => {
    localStorage.removeItem("atd_exit_popup_dismissed_until");
    localStorage.removeItem("atd_exit_popup_submitted");
    sessionStorage.removeItem("atd_exit_popup_seen_session");
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "ketchPermitChanged",
      analytics___measurement: true,
      targeted_advertising: true,
    });
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    document.dispatchEvent(new MouseEvent("mouseout", {
      bubbles: true,
      clientY: 0,
      relatedTarget: null,
    }));
  });

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("First name").fill("ATD Exit E2E");
  await dialog.getByLabel("Work email").fill("alphatrackdigital+atd-exit-e2e3-20260901@gmail.com");
  await dialog.getByLabel(/Website URL/i).fill("alphatrack.digital");
  await dialog.getByRole("checkbox").check();

  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("alphatra-serv.netlify.app/api/brevo-subscribe") &&
    response.request().method() === "POST"
  );
  await dialog.getByRole("button", { name: "Get My Free Growth Audit" }).click();
  const response = await responsePromise;
  const backend = await response.json();

  expect(response.status()).toBe(200);
  expect(backend.ok).toBe(true);
  expect(backend.duplicate).toBe(false);
  expect(backend.metaEventId).toMatch(/^atd-/);
  await expect(dialog.getByRole("heading", { name: "Your audit request is in." })).toBeVisible();
  await page.waitForTimeout(10000);

  const browserState = await page.evaluate(() => ({
    event: ((window as any).dataLayer || []).filter((x: any) => x?.event === "exit_popup_success").at(-1),
    consent: (window as any).__atdConsentState,
    metaEventIds: (window as any).__atdMetaEventIds,
    dispatched: (window as any).__atdMetaDispatchedEvents,
    fbqPresent: typeof (window as any).fbq === "function",
  }));
  const pixelMatched = hasPixelEvent(fb, "Lead", backend.metaEventId);

  writeFileSync("exit-live-e2e.json", JSON.stringify({
    status: response.status(),
    ok: backend.ok,
    duplicate: backend.duplicate,
    metaEventId: backend.metaEventId,
    route: "/",
    browserEventId: browserState.event?.event_id,
    consent: browserState.consent,
    metaEventIds: browserState.metaEventIds,
    dispatched: browserState.dispatched,
    fbqPresent: browserState.fbqPresent,
    facebookRequestCount: fb.length,
    pixelLeadCarriesEventId: pixelMatched,
  }, null, 2));

  expect(browserState.event?.event_id).toBe(backend.metaEventId);
  expect(browserState.fbqPresent).toBe(true);
  expect(pixelMatched).toBe(true);
});
