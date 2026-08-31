import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const route = "/offer/tracking-audit/professional-services";
const evidenceDir = path.join(process.cwd(), "qa-evidence", "professional-services-deep-audit");

const ensureEvidenceDir = () => fs.mkdirSync(evidenceDir, { recursive: true });

const hideExternalOverlays = async (page: Page) => {
  await page.addStyleTag({
    content: [
      "#lanyard_root",
      "[data-ketch-backdrop='true']",
      ".brevo-conversations",
      "[class*='brevo-conversations']",
    ].join(",") + " { display: none !important; pointer-events: none !important; }",
  });
};

const fillStepOne = async (page: Page) => {
  await page.getByLabel("First Name").fill("Jane");
  await page.getByLabel("Last Name").fill("Smith");
  await page.getByLabel("Work Email").fill("jane@example.com");
  await page.getByLabel("Firm / Company").fill("Example Advisory");
  await page.getByLabel("Website").fill("example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Step 2 of 3")).toBeVisible();
};

const selectOption = async (page: Page, label: string, option: string) => {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};

const collectShellMetrics = async (page: Page) => {
  const header = page.locator("header");
  const hero = page.locator(".tracking-audit-hero h1");
  const form = page.locator(".tracking-audit-form-card");

  const viewport = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.getBoundingClientRect().width,
    scrollY: window.scrollY,
  }));

  return {
    viewport,
    header: await header.boundingBox(),
    hero: await hero.boundingBox(),
    form: await form.boundingBox(),
  };
};

const assertNoHorizontalOverflow = async (page: Page) => {
  const values = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(values.scrollWidth - values.clientWidth).toBeLessThanOrEqual(1);
  expect(values.bodyScrollWidth - values.clientWidth).toBeLessThanOrEqual(1);
  return values;
};

const take = async (page: Page, name: string, fullPage = true) => {
  ensureEvidenceDir();
  await page.screenshot({
    path: path.join(evidenceDir, name),
    fullPage,
    animations: "disabled",
  });
};

test.describe("Professional Services deep LP audit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(route);
    await hideExternalOverlays(page);
  });

  test("desktop dark/light visual states and theme persistence", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => window.localStorage.removeItem("atd-tracking-audit-theme"));
    await page.reload();
    await hideExternalOverlays(page);

    await expect(page.getByRole("heading", {
      name: "Know which ads are bringing you real enquiries and booked calls.",
    })).toBeVisible();
    await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();

    await assertNoHorizontalOverflow(page);
    await take(page, "desktop-dark-step1.png");

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.locator(".tracking-audit-light")).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await take(page, "desktop-light-step1.png");

    await page.reload();
    await hideExternalOverlays(page);
    await expect(page.locator(".tracking-audit-light")).toBeVisible();
    await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  });

  test("desktop form interaction, select stability and completed success state", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => window.localStorage.setItem("atd-tracking-audit-theme", "light"));
    await page.reload();
    await hideExternalOverlays(page);

    await page.route("**/api/leads", async (route) => {
      const request = route.request();
      const payload = request.postDataJSON();
      expect(payload.industry).toBe("professional_services");
      expect(payload.adPlatforms).toEqual(["google_ads", "linkedin_ads"]);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, duplicate: false, metaEventId: "qa-prof-services-deep-audit" }),
      });
    });

    await fillStepOne(page);
    await take(page, "desktop-light-step2-before.png");

    const role = page.getByRole("combobox", { name: "Your role", exact: true });
    await role.click();
    await page.getByRole("option", { name: "Founder / Managing Partner", exact: true }).click();
    await expect(role).toContainText("Founder / Managing Partner");

    const roleTextFits = await role.locator("span").first().evaluate((el) => ({
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
      text: el.textContent,
    }));
    expect(roleTextFits.scrollWidth - roleTextFits.clientWidth).toBeLessThanOrEqual(1);

    await selectOption(page, "Your role in decisions like this", "I make the decision");
    await selectOption(page, "Rough monthly ad spend", "GHS 3k–6k");

    const beforeSelectOpen = await collectShellMetrics(page);
    await page.getByRole("combobox", { name: "Main ad platform", exact: true }).click();
    await expect(page.getByRole("option", { name: "Google", exact: true })).toBeVisible();
    const duringSelectOpen = await collectShellMetrics(page);

    expect(Math.abs(duringSelectOpen.viewport.innerWidth - beforeSelectOpen.viewport.innerWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(duringSelectOpen.viewport.clientWidth - beforeSelectOpen.viewport.clientWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(duringSelectOpen.viewport.bodyWidth - beforeSelectOpen.viewport.bodyWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs((duringSelectOpen.header?.width ?? 0) - (beforeSelectOpen.header?.width ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((duringSelectOpen.hero?.x ?? 0) - (beforeSelectOpen.hero?.x ?? 0))).toBeLessThanOrEqual(1);

    const popupBox = await page.getByRole("listbox").boundingBox();
    expect(popupBox).not.toBeNull();
    expect((popupBox?.x ?? 0)).toBeGreaterThanOrEqual(0);
    expect((popupBox?.x ?? 0) + (popupBox?.width ?? 0)).toBeLessThanOrEqual(1440);

    await page.getByRole("option", { name: "Google", exact: true }).click();
    await expect(page.getByRole("combobox", { name: "Second platform (optional)", exact: true })).toBeVisible();
    await selectOption(page, "Second platform (optional)", "LinkedIn");

    await take(page, "desktop-light-step2-complete.png");

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Step 3 of 3")).toBeVisible();
    await take(page, "desktop-light-step3.png");

    await selectOption(page, "How clear are you on where enquiries come from?", "Often unclear");
    await selectOption(page, "What enquiry action matters most?", "Booked call / consultation");
    await selectOption(page, "What’s unclear?", "We get leads but lose the source");
    await selectOption(page, "When do you want clarity?", "Before increasing ad spend");

    await page.waitForTimeout(1600);
    await page.getByRole("button", { name: "Request My Free Audit" }).click();

    await expect(page.getByRole("heading", { name: "Application received." })).toBeVisible();
    await expect(page.getByText("Application contact: jane@example.com")).toBeVisible();
    await take(page, "desktop-light-success.png");
  });

  test("mobile dark form flow, scroll behavior and dropdown containment", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.localStorage.setItem("atd-tracking-audit-theme", "dark"));
    await page.reload();
    await hideExternalOverlays(page);

    await assertNoHorizontalOverflow(page);
    await take(page, "mobile-dark-step1.png");

    await fillStepOne(page);
    const claimTop = await page.locator("#claim").evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(claimTop - 96)).toBeLessThanOrEqual(24);

    await selectOption(page, "Your role", "Founder / Managing Partner");
    const role = page.getByRole("combobox", { name: "Your role", exact: true });
    const roleTextFits = await role.locator("span").first().evaluate((el) => ({
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
    }));
    expect(roleTextFits.scrollWidth - roleTextFits.clientWidth).toBeLessThanOrEqual(1);

    await selectOption(page, "Your role in decisions like this", "I make the decision");
    await selectOption(page, "Rough monthly ad spend", "GHS 1.5k–3k");

    const before = await collectShellMetrics(page);
    await page.getByRole("combobox", { name: "Main ad platform", exact: true }).click();
    const during = await collectShellMetrics(page);
    expect(Math.abs(during.viewport.clientWidth - before.viewport.clientWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(during.viewport.bodyWidth - before.viewport.bodyWidth)).toBeLessThanOrEqual(1);

    const popup = await page.getByRole("listbox").boundingBox();
    expect(popup).not.toBeNull();
    expect((popup?.x ?? 0)).toBeGreaterThanOrEqual(0);
    expect((popup?.x ?? 0) + (popup?.width ?? 0)).toBeLessThanOrEqual(390);

    await page.getByRole("option", { name: "Meta", exact: true }).click();
    await selectOption(page, "Second platform (optional)", "Google");
    await take(page, "mobile-dark-step2.png");

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Step 3 of 3")).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await take(page, "mobile-dark-step3.png");

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Step 2 of 3")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Main ad platform", exact: true })).toContainText("Meta");
    await expect(page.getByRole("combobox", { name: "Second platform (optional)", exact: true })).toContainText("Google");
  });

  test("mobile light page remains readable through lower sections and final CTA", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.localStorage.setItem("atd-tracking-audit-theme", "light"));
    await page.reload();
    await hideExternalOverlays(page);

    await expect(page.locator(".tracking-audit-light")).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.locator("#measurement-journey").scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "An enquiry can lose its source before your team ever sees it." })).toBeVisible();
    await take(page, "mobile-light-journey.png");

    await page.getByRole("heading", { name: "One firm. One website. One enquiry journey." }).scrollIntoViewIfNeeded();
    await take(page, "mobile-light-scope.png");

    await page.getByRole("heading", { name: "Here’s how the free audit works." }).scrollIntoViewIfNeeded();
    await take(page, "mobile-light-process.png");

    await page.getByRole("heading", { name: /See where your enquiry tracking is breaking/ }).scrollIntoViewIfNeeded();
    const cta = page.getByRole("link", { name: "Request My Free Audit" }).last();
    await expect(cta).toBeVisible();
    await take(page, "mobile-light-final-cta.png");
  });

  test("tablet layout has no overflow in both themes", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    for (const theme of ["dark", "light"] as const) {
      await page.evaluate((value) => window.localStorage.setItem("atd-tracking-audit-theme", value), theme);
      await page.reload();
      await hideExternalOverlays(page);
      await assertNoHorizontalOverflow(page);
      await take(page, `tablet-${theme}-step1.png`);
    }
  });
});
