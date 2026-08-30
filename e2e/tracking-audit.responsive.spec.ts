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
  test("mobile website validation rejects a hostname without a public suffix", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/offer/tracking-audit");

    await page.getByLabel("First Name").fill("Jane");
    await page.getByLabel("Last Name").fill("Smith");
    await page.getByLabel("Work Email").fill("jane@example.com");
    await page.getByLabel("Company").fill("Example Company");
    await page.getByLabel("Website").fill("AlphaTrackDigital");
    await page.getByLabel("Website").blur();

    await expect(page.getByText("Enter a valid website, e.g. company.com")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Step 1 of 3")).toBeVisible();
    await expect(page.getByLabel("Industry")).not.toBeVisible();
  });

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
    const stepTwoBack = page.getByRole("button", { name: "Back" });
    await expect(stepTwoBack).toBeVisible();
    await expect(page.getByText("Business context")).toBeVisible();
    await expect(page.getByText("Decision & spend")).toBeVisible();
    await expect(page.getByText("Advertising")).toBeVisible();
    const stepTwoBackBox = await stepTwoBack.boundingBox();
    const stepTwoHeadingBox = await page.getByRole("heading", { name: "A little about your marketing." }).boundingBox();
    expect(stepTwoBackBox).not.toBeNull();
    expect(stepTwoHeadingBox).not.toBeNull();
    expect(stepTwoBackBox!.y).toBeLessThan(stepTwoHeadingBox!.y);
    await assertNoHorizontalOverflow(page);

    await completeStepTwo(page);
    await expect(page.getByText("Step 3 of 3")).toBeVisible();
    await expect(page.getByRole("group", { name: "How confident are you in your tracking?" })).toBeVisible();
    await expect(page.getByText("Tracking", { exact: true })).toBeVisible();
    await expect(page.getByText("Conversion", { exact: true })).toBeVisible();
    await expect(page.getByText("Main issue", { exact: true })).toBeVisible();
    await expect(page.getByText("Timing", { exact: true })).toBeVisible();
    const stepThreeBack = page.getByRole("button", { name: "Back" });
    const stepThreeBackBox = await stepThreeBack.boundingBox();
    const stepThreeHeadingBox = await page.getByRole("heading", { name: "What do you want to understand?" }).boundingBox();
    expect(stepThreeBackBox).not.toBeNull();
    expect(stepThreeHeadingBox).not.toBeNull();
    expect(stepThreeBackBox!.y).toBeLessThan(stepThreeHeadingBox!.y);
    await page.getByRole("button", { name: "Request My Free Audit" }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Request My Free Audit" })).toBeVisible();
    await expect(page.getByText("No passwords, API keys or admin credentials.", { exact: true })).not.toBeVisible();
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
    const continueBelow = page.getByRole("link", { name: "See what we review" });
    await expect(continueBelow).toBeVisible();
    await expect(continueBelow).toHaveAttribute("href", "#measurement-journey");
    await expect(page.getByText("Illustrative preview")).not.toBeVisible();
    await expect(page.getByText("Illustrative scorecard finding")).not.toBeVisible();
    await assertNoHorizontalOverflow(page);

    const heroBox = await heroHeading.boundingBox();
    const formBox = await form.boundingBox();
    const claimBox = await page.locator("#claim").boundingBox();
    const cueBox = await continueBelow.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(formBox).not.toBeNull();
    expect(claimBox).not.toBeNull();
    expect(cueBox).not.toBeNull();
    expect(heroBox!.x).toBeLessThan(formBox!.x);
    expect(cueBox!.y).toBeGreaterThanOrEqual(claimBox!.y + claimBox!.height);
  });
});
