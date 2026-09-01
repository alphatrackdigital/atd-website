import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /production-postdeploy\.spec\.ts/,
  fullyParallel: false,
  workers: 2,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 12_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report-production", open: "never" }],
  ],
  use: {
    baseURL: "https://alphatrack.digital",
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});
