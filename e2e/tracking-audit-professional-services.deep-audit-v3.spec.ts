import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const route = "/offer/tracking-audit/professional-services";
const evidenceDir = path.join(process.cwd(), "qa-evidence", "professional-services-deep-audit-v3");

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

const selectDesktop = async (page: Page, label: string, option: string) => {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};

const selectMobile = async (page: Page, id: string, label: string) => {
  const control = page.locator(`select#${id}`);
  await expect(control).toBeVisible();
  await control.selectOption({ label });
};

const shellMetrics = async (page: Page) => ({
  viewport: await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.getBoundingClientRect().width,
    scrollY: window.scrollY,
    bodyPosition: getComputedStyle(document.body).position,
    bodyTop: getComputedStyle(document.body).top,
    dataScrollLocked: document.body.getAttribute("data-scroll-locked"),
  })),
  header: await page.locator("header").boundingBox(),
  hero: await page.locator(".tracking-audit-hero h1").boundingBox(),
});

const assertNoHorizontalOverflow = async (page: Page) => {
  const values = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(values.scrollWidth - values.clientWidth).toBeLessThanOrEqual(1);
  expect(values.bodyScrollWidth - values.clientWidth).toBeLessThanOrEqual(1);
};

const assertMobileBodyUnlocked = async (page: Page) => {
  const state = await page.evaluate(() => ({
    position: getComputedStyle(document.body).position,
    top: getComputedStyle(document.body).top,
    overflow: getComputedStyle(document.body).overflow,
    dataScrollLocked: document.body.getAttribute("data-scroll-locked"),
  }));
  expect(state.position).not.toBe("fixed");
  expect(state.dataScrollLocked).toBeNull();
};

const take = async (page: Page, name: string, fullPage = true) => {
  ensureEvidenceDir();
  await page.screenshot({
    path: path.join(evidenceDir, name),
    fullPage,
    animations: "disabled",
  });
};

test.describe("Professional Services deep LP audit v3", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
    await page.goto(route);
    await hideExternalOverlays(page);
  });

  test("campaign chrome is focused and desktop dark/light states persist", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => window.localStorage.removeItem("atd-tracking-audit-theme"));
    await page.reload();
    await hideExternalOverlays(page);

    await expect(page.getByRole("link", { name: "AlphaTrack Digital Home" }).first()).toBeVisible();
    await expect(page.getByText("Services", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Book A Free Strategy Call/i })).toHaveCount(0);
    await expect(page.getByText("Free Newsletter", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Questions\? .*@/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Terms", exact: true })).toBeVisible();

    await assertNoHorizontalOverflow(page);
    await take(page, "desktop-dark-full.png");

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.locator(".tracking-audit-light")).toBeVisible();
    await assertNoHorizontalOverflow(page);
    await take(page, "desktop-light-full.png");

    await page.reload();
    await hideExternalOverlays(page);
    await expect(page.locator(".tracking-audit-light")).toBeVisible();
    await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  });

  test("desktop 3-step flow, custom select stability, keyboard close and mocked success", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => window.localStorage.setItem("atd-tracking-audit-theme", "light"));
    await page.reload();
    await hideExternalOverlays(page);

    await page.route("**/api/leads", async (route) => {
      const payload = route.request().postDataJSON();
      expect(payload.industry).toBe("professional_services");
      expect(payload.adPlatforms).toEqual(["google_ads", "linkedin_ads"]);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, duplicate: false, metaEventId: "qa-prof-services-v2" }),
      });
    });

    await fillStepOne(page);
    await take(page, "desktop-light-step2.png");

    const role = page.getByRole("combobox", { name: "Your role", exact: true });
    await role.click();
    await page.getByRole("option", { name: "Founder / Managing Partner", exact: true }).click();
    await expect(role).toContainText("Founder / Managing Partner");

    const roleTextFits = await role.locator("span").first().evaluate((el) => ({
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
    }));
    expect(roleTextFits.scrollWidth - roleTextFits.clientWidth).toBeLessThanOrEqual(1);

    await selectDesktop(page, "Are you involved in choosing a provider?", "I make the decision");
    await selectDesktop(page, "Rough monthly ad spend", "GHS 3k–6k");

    const before = await shellMetrics(page);
    const primary = page.getByRole("combobox", { name: "Main ad platform", exact: true });
    await primary.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("option", { name: "Google", exact: true })).toBeVisible();
    const during = await shellMetrics(page);

    expect(Math.abs(during.viewport.clientWidth - before.viewport.clientWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(during.viewport.bodyWidth - before.viewport.bodyWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs((during.header?.width ?? 0) - (before.header?.width ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((during.hero?.x ?? 0) - (before.hero?.x ?? 0))).toBeLessThanOrEqual(1);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("option", { name: "Google", exact: true })).toHaveCount(0);

    await selectDesktop(page, "Main ad platform", "Google");
    await selectDesktop(page, "Second platform (optional)", "LinkedIn");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Step 3 of 3")).toBeVisible();
    await take(page, "desktop-light-step3.png");

    await selectDesktop(page, "How clear are you on where enquiries come from?", "Often unclear");
    await selectDesktop(page, "What enquiry action matters most?", "Booked call / consultation");
    await selectDesktop(page, "What’s unclear?", "We get leads but lose the source");
    await selectDesktop(page, "When do you want clarity?", "Before increasing ad spend");

    await page.waitForTimeout(1600);
    await page.getByRole("button", { name: "Request My Free Audit" }).click();
    await expect(page.getByRole("heading", { name: "Application received." })).toBeVisible();
    await take(page, "desktop-light-success.png");
  });

  test("mobile native-select flow stays scrollable through Step 3 and preserves values", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.localStorage.setItem("atd-tracking-audit-theme", "dark"));
    await page.reload();
    await hideExternalOverlays(page);

    await assertNoHorizontalOverflow(page);
    await take(page, "mobile-dark-step1.png");

    await fillStepOne(page);
    await expect(page.locator("select#f-role")).toBeVisible();

    await selectMobile(page, "f-role", "Founder / Managing Partner");
    await assertMobileBodyUnlocked(page);
    await selectMobile(page, "f-decision", "I help choose");
    await assertMobileBodyUnlocked(page);
    await selectMobile(page, "f-spend", "GHS 1.5k–3k");
    await assertMobileBodyUnlocked(page);
    await selectMobile(page, "f-primary-platform", "Meta");
    await assertMobileBodyUnlocked(page);
    await selectMobile(page, "f-second-platform", "Google");
    await assertMobileBodyUnlocked(page);

    const roleText = await page.locator("select#f-role option:checked").textContent();
    expect(roleText).toBe("Founder / Managing Partner");

    await page.getByRole("button", { name: "Continue" }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Step 3 of 3")).toBeVisible();
    await assertMobileBodyUnlocked(page);
    await take(page, "mobile-dark-step3.png");

    await selectMobile(page, "f-maturity", "Often unclear");
    await selectMobile(page, "f-conversion", "Booked call / consultation");
    await selectMobile(page, "f-problem", "We get leads but lose the source");
    await selectMobile(page, "f-urgency", "Before increasing ad spend");
    await assertMobileBodyUnlocked(page);
    await assertNoHorizontalOverflow(page);

    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByText("Step 2 of 3")).toBeVisible();
    await expect(page.locator("select#f-primary-platform")).toHaveValue("meta_ads");
    await expect(page.locator("select#f-second-platform")).toHaveValue("google_ads");
    await take(page, "mobile-dark-step2-return.png");
  });

  test("mobile light lower sections are readable and page is materially shorter", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.localStorage.setItem("atd-tracking-audit-theme", "light"));
    await page.reload();
    await hideExternalOverlays(page);

    await expect(page.locator(".tracking-audit-light")).toBeVisible();
    await assertNoHorizontalOverflow(page);

    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(pageHeight).toBeLessThan(6500);

    await page.locator("#measurement-journey").scrollIntoViewIfNeeded();
    await take(page, "mobile-light-journey.png");

    await page.getByRole("heading", { name: "Three practical questions about one enquiry journey." }).scrollIntoViewIfNeeded();
    await take(page, "mobile-light-review-scope.png");

    await page.getByRole("heading", { name: "Know what’s broken, why it matters and what to do next." }).scrollIntoViewIfNeeded();
    await expect(page.getByText("We start without account access.")).toBeVisible();
    await take(page, "mobile-light-deliverable-trust.png");

    await page.getByRole("heading", { name: "From application to scorecard in four steps." }).scrollIntoViewIfNeeded();
    await take(page, "mobile-light-process.png");

    await page.getByRole("heading", { name: /See where your enquiry tracking is breaking/ }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("link", { name: "Request My Free Audit" }).last()).toBeVisible();
    await take(page, "mobile-light-final-cta.png");
  });

  test("tablet has no overflow and retains desktop custom selects", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    for (const theme of ["dark", "light"] as const) {
      await page.evaluate((value) => window.localStorage.setItem("atd-tracking-audit-theme", value), theme);
      await page.reload();
      await hideExternalOverlays(page);
      await assertNoHorizontalOverflow(page);
      await fillStepOne(page);
      await expect(page.locator("select#f-role")).toHaveCount(0);
      await expect(page.getByRole("combobox", { name: "Your role", exact: true })).toBeVisible();
      await take(page, `tablet-${theme}-step2.png`);
      await page.getByRole("button", { name: "Back", exact: true }).click();
    }
  });
});
