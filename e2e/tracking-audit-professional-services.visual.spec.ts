import { expect, test } from "@playwright/test";

const route = "/offer/tracking-audit/professional-services";

const hideExternalOverlays = async (page: import("@playwright/test").Page) => {
  await page.addStyleTag({
    content: "#lanyard_root, [data-ketch-backdrop='true'] { display: none !important; pointer-events: none !important; }",
  });
};

const fillStepOne = async (page: import("@playwright/test").Page) => {
  await page.getByLabel("First Name").fill("Jane");
  await page.getByLabel("Last Name").fill("Smith");
  await page.getByLabel("Work Email").fill("jane@example.com");
  await page.getByLabel("Business / Company").fill("Example Advisory");
  await page.getByLabel("Website").fill("example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Step 2 of 3")).toBeVisible();
};

const choose = async (page: import("@playwright/test").Page, label: string, option: string) => {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};

const advanceToStepThree = async (page: import("@playwright/test").Page) => {
  await fillStepOne(page);
  await choose(page, "Your role", "Founder / Managing Partner");
  await choose(page, "Are you involved in choosing a provider?", "I help choose");
  await choose(page, "Rough monthly ad spend", "GHS 3k–6k");
  await choose(page, "Main ad platform", "Google");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Step 3 of 3")).toBeVisible();
};

test.describe("Professional Services visual stability", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
    await page.goto(route);
    await hideExternalOverlays(page);
  });

  test("light theme keeps solid site chrome and custom dropdowns preserve the page shell", async ({ page }) => {
    await page.evaluate(() => window.localStorage.removeItem("atd-tracking-audit-theme"));
    await page.reload();
    await hideExternalOverlays(page);

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.locator(".tracking-audit-light")).toBeVisible();

    const headerBackground = await page.locator("header > div").first().evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    const footerBackground = await page.locator("footer").evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );

    expect(headerBackground).toBe("rgb(7, 10, 16)");
    expect(footerBackground).toBe("rgb(7, 10, 16)");

    await fillStepOne(page);
    await choose(page, "Your role", "Founder / Managing Partner");
    await choose(page, "Are you involved in choosing a provider?", "I help choose");
    await choose(page, "Rough monthly ad spend", "GHS 3k–6k");

    const before = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyWidth: document.body.getBoundingClientRect().width,
      bodyPosition: getComputedStyle(document.body).position,
      dataScrollLocked: document.body.getAttribute("data-scroll-locked"),
    }));

    await page.getByRole("combobox", { name: "Main ad platform", exact: true }).click();
    await expect(page.getByRole("listbox", { name: "Main ad platform" })).toBeVisible();

    const during = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyWidth: document.body.getBoundingClientRect().width,
      bodyPosition: getComputedStyle(document.body).position,
      dataScrollLocked: document.body.getAttribute("data-scroll-locked"),
    }));

    expect(during.innerWidth).toBe(before.innerWidth);
    expect(during.clientWidth).toBe(before.clientWidth);
    expect(Math.abs(during.bodyWidth - before.bodyWidth)).toBeLessThanOrEqual(1);
    expect(during.bodyPosition).not.toBe("fixed");
    expect(during.dataScrollLocked).toBeNull();

    await page.getByRole("option", { name: "Google", exact: true }).click();
    await expect(page.getByRole("combobox", { name: "Second platform (optional)", exact: true })).toBeVisible();
  });

  test("story refinements stay aligned, scoped and unclipped", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => window.localStorage.setItem("atd-tracking-audit-theme", "light"));
    await page.reload();
    await hideExternalOverlays(page);

    await expect(page.getByText("Human-reviewed audit")).toBeVisible();
    await expect(page.getByText("Not an automated report")).toBeVisible();
    await expect(page.getByText(/Review and recommendations are included\. Implementation is separate\./)).toHaveCount(0);

    await expect(page.getByText(/You may still receive the lead/)).toHaveCount(0);
    await expect(page.getByText(/budget decisions become guesswork/)).toHaveCount(0);
    await expect(page.getByText("Reviewed by people, not an automated report.")).toHaveCount(0);
    await expect(page.getByText("Example only. The findings shown here are fictional and do not represent a client.")).toHaveCount(0);

    const journeyBreaks = page.locator("[data-journey-break]");
    await expect(journeyBreaks).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      const breakBox = await journeyBreaks.nth(index).boundingBox();
      const diamondBox = await journeyBreaks.nth(index).locator("[data-journey-diamond]").boundingBox();
      expect(breakBox).not.toBeNull();
      expect(diamondBox).not.toBeNull();
      const breakCenter = (breakBox?.x ?? 0) + (breakBox?.width ?? 0) / 2;
      const diamondCenter = (diamondBox?.x ?? 0) + (diamondBox?.width ?? 0) / 2;
      expect(Math.abs(breakCenter - diamondCenter)).toBeLessThanOrEqual(1.5);
    }

    await advanceToStepThree(page);
    await expect(page.getByText(/Review and recommendations are included\. Implementation is separate\./)).toBeVisible();

    const ctaHeading = page.getByRole("heading", { name: "Know which marketing is actually producing enquiries." });
    for (const width of [1440, 1024, 768]) {
      await page.setViewportSize({ width, height: 1000 });
      await ctaHeading.scrollIntoViewIfNeeded();
      await expect(ctaHeading).toBeVisible();

      const box = await ctaHeading.boundingBox();
      const viewport = page.viewportSize();
      expect(box).not.toBeNull();
      expect(viewport).not.toBeNull();
      expect((box?.x ?? 0)).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport?.width ?? 0);
    }

    await expect(page.getByText("9 conversions", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "From application to scorecard in four steps." })).toBeVisible();
  });

  test("dark mode dropdown menu remains readable without browser-native white menu", async ({ page }) => {
    await page.evaluate(() => window.localStorage.setItem("atd-tracking-audit-theme", "dark"));
    await page.reload();
    await hideExternalOverlays(page);
    await fillStepOne(page);

    await page.getByRole("combobox", { name: "Your role", exact: true }).click();
    const menu = page.getByRole("listbox", { name: "Your role" });
    const option = page.getByRole("option", { name: "Founder / Managing Partner", exact: true });

    await expect(menu).toBeVisible();
    await expect(option).toBeVisible();

    const styles = await option.evaluate((element) => {
      const optionStyle = getComputedStyle(element);
      const menuStyle = getComputedStyle(element.parentElement as HTMLElement);
      return {
        optionColor: optionStyle.color,
        menuBackground: menuStyle.backgroundColor,
      };
    });

    expect(styles.optionColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(styles.menuBackground).not.toBe("rgb(255, 255, 255)");
    expect(await page.evaluate(() => document.body.getAttribute("data-scroll-locked"))).toBeNull();
  });
});
