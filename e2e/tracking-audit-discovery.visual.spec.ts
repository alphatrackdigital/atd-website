import { expect, test, type Page } from "@playwright/test";

const openPage = async (page: Page, path: string) => {
  await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
  await page.goto(path);
  await page.addStyleTag({
    content: "#lanyard_root, [data-ketch-backdrop='true'] { display: none !important; pointer-events: none !important; }",
  });
};

test.describe("Tracking Audit navigation restoration", () => {
  test("General Tracking Audit uses the standard desktop navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openPage(page, "/offer/tracking-audit");

    await expect(page.getByText("Services", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Expertise", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Results", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("About Us", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Blog", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Book A Free Strategy Call/i }).first()).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Choose the audit built around your lead journey." }),
    ).toHaveCount(0);
    await expect(page.getByText("Tracking Audit by industry", { exact: true })).toHaveCount(0);
  });

  test("General Tracking Audit keeps the standard mobile menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, "/offer/tracking-audit");

    const toggle = page.getByRole("button", { name: /toggle menu/i });
    await expect(toggle).toBeVisible();
    await toggle.click();

    await expect(page.getByTestId("mobile-services-trigger")).toBeVisible();
    await expect(page.getByTestId("mobile-expertise-trigger")).toBeVisible();
  });

  test("Education and Real Estate expertise pages do not include Tracking Audit callouts", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    await openPage(page, "/expertise/education");
    await expect(page.getByText("Free Education Tracking Audit", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Explore the Education Tracking Audit/i })).toHaveCount(0);

    await openPage(page, "/expertise/real-estate");
    await expect(page.getByText("Free Real Estate Tracking Audit", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Explore the Real Estate Tracking Audit/i })).toHaveCount(0);
  });

  test("homepage remains unchanged with no vertical Tracking Audit links", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openPage(page, "/");

    await expect(page.locator('a[href^="/offer/tracking-audit/professional-services"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/offer/tracking-audit/education"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/offer/tracking-audit/real-estate"]')).toHaveCount(0);
  });
});
