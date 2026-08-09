import { expect, test } from "@playwright/test";

/**
 * Drives the admin console against the real backend
 * (VITE_ADMIN_API_BASE_URL). No valid credentials are used or needed - the
 * rejected-login path still proves the whole chain: browser -> CORS ->
 * backend -> database -> error surfaced in the UI.
 *
 * Serial: these share one Vite dev server, and parallel workers racing its
 * on-demand compilation of the lazily-loaded admin chunks causes navigation
 * timeouts that are not product failures.
 */
test.describe.configure({ mode: "serial" });

test("unauthenticated /admin redirects to the login screen", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: /AlphaTrack Admin/i })).toBeVisible();
});

test("unauthenticated deep links redirect to login", async ({ page }) => {
  await page.goto("/admin/contacts");
  await expect(page).toHaveURL(/\/admin\/login$/);

  await page.goto("/admin/blog");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("the console renders without the marketing header or footer", async ({ page }) => {
  await page.goto("/admin/login");

  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();

  // The marketing nav must not leak into the internal console.
  await expect(page.getByRole("link", { name: /^Book a free strategy call$/i })).toHaveCount(0);
});

test("the login screen is marked noindex", async ({ page }) => {
  await page.goto("/admin/login");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/i,
  );
});

test("rejected credentials surface the backend error", async ({ page }) => {
  await page.goto("/admin/login");

  await page.getByLabel("Email").fill("probe@invalid.test");
  await page.getByLabel("Password").fill("definitely-not-the-password");

  const loginResponse = page.waitForResponse(
    (response) => response.url().includes("/api/auth/login") && response.request().method() === "POST",
  );

  await page.getByRole("button", { name: /^Sign in$/i }).click();

  const response = await loginResponse;
  expect(response.status()).toBe(401);

  // The message comes from the backend, so this also proves CORS is working:
  // a blocked cross-origin request would fail before yielding a body.
  await expect(page.getByRole("alert")).toHaveText(/invalid credentials/i);

  // A failed sign-in must not leave a token behind.
  const token = await page.evaluate(() => window.localStorage.getItem("atd_admin_token"));
  expect(token).toBeNull();

  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("admin routes emit no marketing route views", async ({ page }) => {
  const countRouteViews = () =>
    page.evaluate(
      () =>
        (window.dataLayer ?? []).filter(
          (entry: Record<string, unknown>) => entry?.event === "atd_route_view",
        ).length,
    );

  await page.goto("/admin/login");
  // Waiting on a rendered element rather than networkidle: the support chat
  // widget holds connections open, so the network never goes idle.
  await expect(page.getByRole("heading", { name: /AlphaTrack Admin/i })).toBeVisible();

  expect(await countRouteViews()).toBe(0);

  // Control: a public route still reports normally, so the exclusion is
  // targeted rather than tracking being broken outright.
  await page.goto("/about-us");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

  expect(await countRouteViews()).toBeGreaterThan(0);
});
