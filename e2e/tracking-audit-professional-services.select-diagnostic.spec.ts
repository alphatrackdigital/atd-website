import { test, expect } from "@playwright/test";

const route = "/offer/tracking-audit/professional-services";

test("diagnose mobile select scroll-lock lifecycle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await page.addStyleTag({
    content: "#lanyard_root, [data-ketch-backdrop='true'], .brevo-conversations, [class*='brevo-conversations'] { display:none!important; pointer-events:none!important; }",
  });

  await page.getByLabel("First Name").fill("Jane");
  await page.getByLabel("Last Name").fill("Smith");
  await page.getByLabel("Work Email").fill("jane@example.com");
  await page.getByLabel("Firm / Company").fill("Example Advisory");
  await page.getByLabel("Website").fill("example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Step 2 of 3")).toBeVisible();

  const state = async (label: string) => {
    const value = await page.evaluate(() => ({
      label: document.activeElement?.getAttribute("aria-label") || document.activeElement?.id || document.activeElement?.tagName,
      bodyStyle: document.body.getAttribute("style"),
      bodyPointerEvents: getComputedStyle(document.body).pointerEvents,
      bodyOverflow: getComputedStyle(document.body).overflow,
      htmlPointerEvents: getComputedStyle(document.documentElement).pointerEvents,
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      dataScrollLocked: document.body.getAttribute("data-scroll-locked"),
      openSelects: document.querySelectorAll('[role="listbox"]').length,
      openStates: document.querySelectorAll('[data-state="open"]').length,
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      primaryTop: document.getElementById("f-primary-platform")?.getBoundingClientRect().top,
      continueTop: document.querySelector('#tracking-audit-form button[type="button"].mt-6')?.getBoundingClientRect().top,
    }));
    console.log("SELECT_STATE", label, JSON.stringify(value));
  };

  const choose = async (label: string, option: string) => {
    const trigger = page.getByRole("combobox", { name: label, exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await state(label + ":open");
    await page.getByRole("option", { name: option, exact: true }).click();
    await page.waitForTimeout(300);
    await state(label + ":closed");
  };

  await state("step2-start");
  await choose("Your role", "Founder / Managing Partner");
  await choose("Your role in decisions like this", "I make the decision");
  await choose("Rough monthly ad spend", "GHS 1.5k–3k");

  const primary = page.getByRole("combobox", { name: "Main ad platform", exact: true });
  await primary.scrollIntoViewIfNeeded();
  await state("before-primary");
  await primary.click({ timeout: 5000 });
  await state("primary-open");
});
