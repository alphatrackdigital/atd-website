import { mkdir } from "node:fs/promises";
import { expect, test, type Page, type Route } from "@playwright/test";

const routes = [
  ["general", "/offer/tracking-audit"],
  ["professional", "/offer/tracking-audit/professional-services"],
  ["education", "/offer/tracking-audit/education"],
  ["real-estate", "/offer/tracking-audit/real-estate"],
] as const;

const hideExternalOverlays = async (page: Page) => {
  await page.addStyleTag({
    content:
      "#lanyard_root, [data-ketch-backdrop='true'] { display: none !important; pointer-events: none !important; } *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }",
  });
};

const installMockSubmit = async (page: Page) => {
  await page.route("**/api/leads", async (requestRoute: Route) => {
    const request = requestRoute.request();
    const payload = JSON.parse(request.postData() || "{}") as { metaEventId?: string };
    await requestRoute.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        duplicate: false,
        pendingConfirmation: false,
        metaEventId: payload.metaEventId || "qa-screenshot-event",
      }),
    });
  });
};

const selectCombobox = async (page: Page, label: string, option: string) => {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};

const submitGeneral = async (page: Page) => {
  await page.getByLabel("First Name").fill("QA");
  await page.getByLabel("Last Name").fill("Reviewer");
  await page.getByLabel("Work Email").fill("qa-review@example.com");
  await page.getByLabel("Company").fill("ATD QA");
  await page.getByLabel("Website").fill("example.com");
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await selectCombobox(page, "Industry", "Professional services");
  await selectCombobox(page, "Your role", "Founder / CEO");
  await selectCombobox(page, "Your role in this decision", "Final decision maker");
  await selectCombobox(page, "Monthly ad spend", "GHS 3k–6k");
  await selectCombobox(page, "Main ad platform", "Meta");
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  await selectCombobox(page, "How confident are you in your tracking?", "Partly working");
  await selectCombobox(page, "What matters most?", "Lead form");
  await selectCombobox(page, "What’s going wrong?", "Lead sources are missing");
  await selectCombobox(page, "How soon do you want this addressed?", "Within 30 days");

  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: "Request My Free Audit" }).click();
  await expect(page.locator("[data-tracking-audit-success]")).toBeVisible();
};

test.describe("QA screenshot evidence", () => {
  test.describe.configure({ timeout: 90_000 });
  test.beforeAll(async () => {
    await mkdir("qa-screenshots", { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
  });

  test("captures General desktop tablet and mobile hero/form treatment", async ({ page }) => {
    for (const viewport of [
      { name: "desktop", width: 1440, height: 1000 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "mobile", width: 390, height: 844 },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/offer/tracking-audit");
      await hideExternalOverlays(page);
      await page.locator(".tracking-audit-hero").screenshot({
        path: `qa-screenshots/general-${viewport.name}.png`,
      });
    }
  });

  test("captures all four LP hero/form shells on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const [name, route] of routes) {
      await page.goto(route);
      await hideExternalOverlays(page);
      await page.locator(".tracking-audit-hero").screenshot({
        path: `qa-screenshots/${name}-desktop.png`,
      });
    }
  });

  test("captures the compact General success state on desktop and mobile", async ({ page }) => {
    await installMockSubmit(page);
    for (const viewport of [
      { name: "desktop", width: 1440, height: 1000 },
      { name: "mobile", width: 390, height: 844 },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/offer/tracking-audit");
      await hideExternalOverlays(page);
      await submitGeneral(page);
      await page.locator("#claim").screenshot({
        path: `qa-screenshots/general-success-${viewport.name}.png`,
      });
    }
  });
});
