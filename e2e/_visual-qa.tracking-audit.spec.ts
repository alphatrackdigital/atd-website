import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const outputDir = "qa-artifacts/tracking-audit";

test.beforeAll(async () => {
  await mkdir(outputDir, { recursive: true });
});

test("capture mobile step one and step two", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/offer/tracking-audit");
  await expect(page.getByRole("heading", { name: /Know whether your marketing data can be trusted/i })).toBeVisible();
  await page.screenshot({ path: `${outputDir}/mobile-step-1.png`, fullPage: true });

  await page.getByLabel("First Name").fill("Jane");
  await page.getByLabel("Last Name").fill("Smith");
  await page.getByLabel("Work Email").fill("jane@example.com");
  await page.getByLabel("Company").fill("Example Company");
  await page.getByLabel("Website").fill("https://example.com");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("2 of 2")).toBeVisible();
  await page.screenshot({ path: `${outputDir}/mobile-step-2.png`, fullPage: true });
});

test("capture desktop step one", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/offer/tracking-audit");
  await expect(page.getByRole("form", { name: "Request a Free Tracking Audit" })).toBeVisible();
  await page.screenshot({ path: `${outputDir}/desktop-step-1.png`, fullPage: true });
});
