import { expect, test } from "@playwright/test";

const route = "/offer/tracking-audit/professional-services";

test.describe("Professional Services visual stability", () => {
  test("light theme stays legible and opening selects does not shift the page shell", async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => window.localStorage.removeItem("atd-tracking-audit-theme"));
    await page.reload();

    await page.addStyleTag({
      content: "#lanyard_root, [data-ketch-backdrop='true'] { display: none !important; pointer-events: none !important; }",
    });

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();

    const themeRoot = page.locator(".tracking-audit-light");
    await expect(themeRoot).toBeVisible();

    const background = await themeRoot.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(background).not.toBe("rgb(7, 10, 16)");

    await page.getByLabel("First Name").fill("Jane");
    await page.getByLabel("Last Name").fill("Smith");
    await page.getByLabel("Work Email").fill("jane@example.com");
    await page.getByLabel("Firm / Company").fill("Example Advisory");
    await page.getByLabel("Website").fill("example.com");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Step 2 of 3")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Your role", exact: true })).toBeVisible();

    const roleTrigger = page.getByRole("combobox", { name: "Your role", exact: true });
    await roleTrigger.click();
    await page.getByRole("option", { name: "Founder / Managing Partner" }).click();

    await expect(roleTrigger).toContainText("Founder / Managing Partner");

    const header = page.locator("header");
    const heroHeading = page.locator(".tracking-audit-hero h1");

    const before = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyWidth: document.body.getBoundingClientRect().width,
      scrollLocked: document.body.hasAttribute("data-scroll-locked"),
    }));
    const headerBefore = await header.boundingBox();
    const heroBefore = await heroHeading.boundingBox();

    await page.getByLabel("Are you involved in choosing a provider?").click();
    await expect(page.getByRole("option", { name: "I make the decision" })).toBeVisible();

    const during = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyWidth: document.body.getBoundingClientRect().width,
      scrollLocked: document.body.hasAttribute("data-scroll-locked"),
    }));
    const headerDuring = await header.boundingBox();
    const heroDuring = await heroHeading.boundingBox();

    expect(Math.abs(during.innerWidth - before.innerWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(during.clientWidth - before.clientWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(during.bodyWidth - before.bodyWidth)).toBeLessThanOrEqual(1);

    expect(headerBefore).not.toBeNull();
    expect(headerDuring).not.toBeNull();
    expect(heroBefore).not.toBeNull();
    expect(heroDuring).not.toBeNull();

    expect(Math.abs((headerDuring?.x ?? 0) - (headerBefore?.x ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((headerDuring?.width ?? 0) - (headerBefore?.width ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((heroDuring?.x ?? 0) - (heroBefore?.x ?? 0))).toBeLessThanOrEqual(1);

    await page.keyboard.press("Escape");
  });
});
