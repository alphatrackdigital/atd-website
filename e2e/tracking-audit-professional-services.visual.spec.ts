import { expect, test } from "@playwright/test";

const route = "/offer/tracking-audit/professional-services";

test.describe("Professional Services visual stability", () => {
  test("light theme stays legible and native selects preserve the page shell", async ({ page }) => {
    await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
    await page.goto(route);
    await page.evaluate(() => window.localStorage.removeItem("atd-tracking-audit-theme"));
    await page.reload();

    await page.addStyleTag({
      content: "#lanyard_root, [data-ketch-backdrop='true'] { display: none !important; pointer-events: none !important; }",
    });

    await page.getByRole("button", { name: "Switch to light theme" }).click();
    await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
    await expect(page.locator(".tracking-audit-light")).toBeVisible();

    const headerBackground = await page.locator("header > div").first().evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    const footerBackground = await page.locator("footer").evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );

    expect(headerBackground).toBe("rgb(7, 10, 16)");
    expect(footerBackground).toBe("rgb(7, 10, 16)");
    await expect(page.getByText("Services", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Book A Free Strategy Call/i })).toBeVisible();

    await page.getByLabel("First Name").fill("Jane");
    await page.getByLabel("Last Name").fill("Smith");
    await page.getByLabel("Work Email").fill("jane@example.com");
    await page.getByLabel("Firm / Company").fill("Example Advisory");
    await page.getByLabel("Website").fill("example.com");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Step 2 of 3")).toBeVisible();

    const role = page.locator("select#f-role");
    const decision = page.locator("select#f-decision");
    const spend = page.locator("select#f-spend");
    const platform = page.locator("select#f-primary-platform");

    await expect(role).toBeVisible();
    await role.selectOption("founder_ceo");
    await decision.selectOption("strong_influence");
    await spend.selectOption("3000_5999");

    const before = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.getBoundingClientRect().width,
      bodyPosition: getComputedStyle(document.body).position,
      dataScrollLocked: document.body.getAttribute("data-scroll-locked"),
    }));

    await platform.selectOption("google_ads");

    const after = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.getBoundingClientRect().width,
      bodyPosition: getComputedStyle(document.body).position,
      dataScrollLocked: document.body.getAttribute("data-scroll-locked"),
    }));

    expect(after.innerWidth).toBe(before.innerWidth);
    expect(after.clientWidth).toBe(before.clientWidth);
    expect(after.scrollWidth).toBe(before.scrollWidth);
    expect(Math.abs(after.bodyWidth - before.bodyWidth)).toBeLessThanOrEqual(1);
    expect(after.bodyPosition).not.toBe("fixed");
    expect(after.dataScrollLocked).toBeNull();

    await expect(page.locator("select#f-second-platform")).toBeVisible();
    await page.locator("select#f-second-platform").selectOption("linkedin_ads");
    await expect(page.locator("select#f-second-platform")).toHaveValue("linkedin_ads");
  });
});
