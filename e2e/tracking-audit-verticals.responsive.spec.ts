import { expect, test, type Page } from "@playwright/test";

const assertNoHorizontalOverflow = async (page: Page) => {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
};

const completeStepOne = async (page: Page) => {
  await page.getByLabel("First Name").fill("Jane");
  await page.getByLabel("Last Name").fill("Smith");
  await page.getByLabel("Work Email").fill("jane@example.com");
  await page.getByLabel("Company").fill("Example Company");
  await page.getByLabel("Website").fill("https://example.com");
  await page.getByRole("button", { name: "Continue" }).click();
};

const verticals = [
  {
    path: "/offer/tracking-audit/professional-services",
    heading: /Can you prove which campaigns generate your valuable enquiries\?/i,
    industryLabel: "Professional Services",
  },
  {
    path: "/offer/tracking-audit/education",
    heading: /Can you trace an ad click through enquiry, application and enrolment\?/i,
    industryLabel: "Education / Training",
  },
  {
    path: "/offer/tracking-audit/real-estate",
    heading: /Can you trace an ad click through enquiry, viewing and closed deal\?/i,
    industryLabel: "Real Estate",
  },
] as const;

for (const vertical of verticals) {
  test.describe(`Tracking Audit vertical - ${vertical.path}`, () => {
    test("direct load renders the approved hero and auto-sets Industry on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(vertical.path);

      await expect(page.getByRole("heading", { name: vertical.heading })).toBeVisible();
      await expect(page.getByText("1 of 2")).toBeVisible();
      await assertNoHorizontalOverflow(page);

      await completeStepOne(page);

      await expect(page.getByText("2 of 2")).toBeVisible();
      await expect(page.getByRole("combobox", { name: "Industry" })).toHaveText(vertical.industryLabel);
      await assertNoHorizontalOverflow(page);
    });

    test("direct load keeps hero and application card side by side on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(vertical.path);

      const heroHeading = page.getByRole("heading", { name: vertical.heading });
      const form = page.getByRole("form", { name: "Request a Free Tracking Audit" });

      await expect(heroHeading).toBeVisible();
      await expect(form).toBeVisible();
      await assertNoHorizontalOverflow(page);

      const heroBox = await heroHeading.boundingBox();
      const formBox = await form.boundingBox();
      expect(heroBox).not.toBeNull();
      expect(formBox).not.toBeNull();
      expect(heroBox!.x).toBeLessThan(formBox!.x);
    });

    test("resolves through client-side (SPA) navigation without a full page reload", async ({ page }) => {
      await page.goto("/");
      await page.evaluate((path) => {
        window.history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, vertical.path);

      await expect(page.getByRole("heading", { name: vertical.heading })).toBeVisible();
      await expect(page).toHaveURL(vertical.path);
    });
  });
}

test("the General Tracking Audit page is unaffected", async ({ page }) => {
  await page.goto("/offer/tracking-audit");

  await expect(
    page.getByRole("heading", { name: /Know whether your marketing data can be trusted/i }),
  ).toBeVisible();
});
