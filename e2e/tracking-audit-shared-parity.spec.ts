import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/offer/tracking-audit",
  "/offer/tracking-audit/professional-services",
  "/offer/tracking-audit/education",
  "/offer/tracking-audit/real-estate",
] as const;

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
] as const;

const hideExternalOverlays = async (page: Page) => {
  await page.addStyleTag({
    content:
      "#lanyard_root, [data-ketch-backdrop='true'] { display: none !important; pointer-events: none !important; }",
  });
};

const assertNoHorizontalOverflow = async (page: Page) => {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
};

test.describe("Tracking Audit shared launch-readiness parity", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
  });

  for (const viewport of viewports) {
    test(`${viewport.name} keeps the shared shell stable across all four LPs`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of routes) {
        await page.goto(route);
        await hideExternalOverlays(page);

        await expect(page.getByRole("form", { name: "Request a Free Tracking Audit" })).toBeVisible();
        await expect(page.locator(".tracking-audit-form-card")).toBeVisible();
        await expect(page.locator("[data-human-review-badge]")).toBeVisible();

        const cue = page.locator("[data-tracking-audit-review-cue]");
        await expect(cue).toBeVisible();
        await expect(cue).toHaveAttribute("href", "#measurement-journey");
        await expect(page.locator("#measurement-journey")).toHaveCount(1);

        const firstName = page.getByLabel("First Name");
        const firstNameBox = await firstName.boundingBox();
        expect(firstNameBox).not.toBeNull();
        expect(firstNameBox!.height).toBeGreaterThanOrEqual(40);

        await assertNoHorizontalOverflow(page);
      }
    });
  }

  test("shared review cue moves every LP to its measurement journey without layout drift", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });

    for (const route of routes) {
      await page.goto(route);
      await hideExternalOverlays(page);

      await page.locator("[data-tracking-audit-review-cue]").click();
      await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#measurement-journey");
      await expect(page.locator("#measurement-journey")).toBeVisible();
      await assertNoHorizontalOverflow(page);
    }
  });
});
