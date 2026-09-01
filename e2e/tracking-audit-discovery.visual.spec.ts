import { expect, test, type Page } from "@playwright/test";

const openPage = async (page: Page, path: string) => {
  await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
  await page.goto(path);
  await page.addStyleTag({
    content: "#lanyard_root, [data-ketch-backdrop='true'] { display: none !important; pointer-events: none !important; }",
  });
};

test.describe("Tracking Audit discovery linkage", () => {
  test("General Tracking Audit restores standard navigation and exposes industry audits", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openPage(page, "/offer/tracking-audit?utm_source=beta&utm_campaign=discovery");

    await expect(page.getByText("Services", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Expertise", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Results", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Book A Free Strategy Call/i }).first()).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Choose the audit built around your lead journey." }),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: /Professional Services/i })).toHaveAttribute(
      "href",
      "/offer/tracking-audit/professional-services?utm_source=beta&utm_campaign=discovery",
    );
    await expect(page.getByRole("link", { name: /Education & Training/i })).toHaveAttribute(
      "href",
      "/offer/tracking-audit/education?utm_source=beta&utm_campaign=discovery",
    );
    await expect(page.getByRole("link", { name: /Real Estate/i })).toHaveAttribute(
      "href",
      "/offer/tracking-audit/real-estate?utm_source=beta&utm_campaign=discovery",
    );
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

  test("Education and Real Estate expertise pages link to their industry audits", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    await openPage(page, "/expertise/education?utm_source=organic&utm_campaign=expertise");
    await expect(
      page.getByRole("heading", { name: "See where your enrolment tracking loses the source." }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore the Education Tracking Audit/i })).toHaveAttribute(
      "href",
      "/offer/tracking-audit/education?utm_source=organic&utm_campaign=expertise",
    );

    await openPage(page, "/expertise/real-estate");
    await expect(
      page.getByRole("heading", { name: "See where your property lead tracking loses the source." }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Explore the Real Estate Tracking Audit/i })).toHaveAttribute(
      "href",
      "/offer/tracking-audit/real-estate",
    );
  });

  test("homepage receives no vertical Tracking Audit links", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openPage(page, "/");

    await expect(page.locator('a[href^="/offer/tracking-audit/professional-services"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/offer/tracking-audit/education"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/offer/tracking-audit/real-estate"]')).toHaveCount(0);
  });
});
