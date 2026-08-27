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
  await page.getByLabel("Website").fill("example.com");
  await page.getByRole("button", { name: "Continue" }).click();
};

const selectOption = async (page: Page, label: string, option: string) => {
  await page.getByLabel(label).click();
  await page.getByRole("option", { name: option }).click();
};

const completeStepTwo = async (page: Page) => {
  await selectOption(page, "Industry", "Professional services");
  await selectOption(page, "Your role", "Founder / CEO");
  await page.getByText("Final decision maker", { exact: true }).click();
  await selectOption(page, "Monthly ad spend", "GHS 3k–6k");
  await page.getByText("Meta", { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
};

test.describe("General Tracking Audit responsive application", () => {
  test("mobile step one is usable without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/offer/tracking-audit");

    await expect(
      page.getByRole("heading", { name: /Know what your marketing is actually producing/i }),
    ).toBeVisible();
    await expect(page.getByText("Step 1 of 3")).toBeVisible();
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Website")).toBeVisible();

    await assertNoHorizontalOverflow(page);

    const continueButton = page.getByRole("button", { name: "Continue" });
    const buttonBox = await continueButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(buttonBox!.height).toBeGreaterThanOrEqual(40);
  });

  test("mobile step transition opens with the first second-step control in view", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/offer/tracking-audit");

    await completeStepOne(page);

    await expect(page.getByText("Step 2 of 3")).toBeVisible();
    const claim = page.locator("#claim");
    await expect.poll(async () => (await claim.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(64);
    const claimBox = await claim.boundingBox();
    expect(claimBox).not.toBeNull();
    expect(claimBox!.y).toBeLessThanOrEqual(120);

    const industry = page.getByLabel("Industry");
    await expect(industry).toBeVisible();

    const industryBox = await industry.boundingBox();
    const viewport = page.viewportSize();
    expect(industryBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(industryBox!.y).toBeGreaterThanOrEqual(0);
    expect(industryBox!.y + industryBox!.height).toBeLessThanOrEqual(viewport!.height);
    expect(industryBox!.width).toBeLessThanOrEqual(390);
    expect(industryBox!.height).toBeGreaterThanOrEqual(40);

    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await completeStepTwo(page);
    await expect(page.getByText("Step 3 of 3")).toBeVisible();
    await expect(page.getByRole("group", { name: "How confident are you in your tracking?" })).toBeVisible();
    await page.getByRole("button", { name: "Request My Free Audit" }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Request My Free Audit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("desktop hero and application card remain readable side by side", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/offer/tracking-audit");

    const heroHeading = page.getByRole("heading", {
      name: /Know what your marketing is actually producing/i,
    });
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
});
