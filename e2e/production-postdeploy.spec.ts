import { expect, test, type Page, type Route } from "@playwright/test";

const ORIGIN = "https://alphatrack.digital";
const BACKEND = "https://alphatra-serv.netlify.app";

const coreResponsiveRoutes = [
  "/",
  "/service",
  "/contact-us",
  "/book-a-call",
  "/offer/tracking-audit",
  "/offer/tracking-audit/professional-services",
  "/offer/tracking-audit/education",
  "/offer/tracking-audit/real-estate",
];

const hideOverlays = async (page: Page) => {
  await page.addStyleTag({
    content: "#lanyard_root, [data-ketch-backdrop='true'] { display:none !important; pointer-events:none !important; }",
  }).catch(() => {});
};

const blockOptionalTracking = async (page: Page) => {
  await page.route(/global\.ketchcdn\.com|googletagmanager\.com|google-analytics\.com|connect\.facebook\.net|facebook\.com\/tr|clarity\.ms/, (route) => route.abort());
};

const assertNoHorizontalOverflow = async (page: Page) => {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth, "horizontal overflow").toBeLessThanOrEqual(dimensions.clientWidth + 2);
};

const installLeadMock = async (page: Page) => {
  let captured: Record<string, unknown> | null = null;
  await page.route("**/api/leads", async (route: Route) => {
    if (route.request().method() !== "POST") return route.continue();
    captured = JSON.parse(route.request().postData() || "{}");
    const metaEventId = String(captured.metaEventId || "prod-qa-event");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, duplicate: false, pendingConfirmation: false, metaEventId }),
    });
  });
  return () => captured;
};

const selectOption = async (page: Page, label: string, option: string) => {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};

const trackingCases = [
  {
    route: "/offer/tracking-audit",
    companyLabel: "Company",
    company: "Production QA General",
    industry: "other",
    primaryConversionType: "lead_form",
    fillStep2: async (page: Page) => {
      await selectOption(page, "Industry", "Other");
      await selectOption(page, "Your role", "Founder / CEO");
      await page.getByText("Final decision maker", { exact: true }).click();
      await selectOption(page, "Monthly ad spend", "GHS 3k–6k");
      await page.getByText("Meta", { exact: true }).click();
    },
    fillStep3: async (page: Page) => {
      await page.getByText("Partly working", { exact: true }).click();
      await page.getByText("Lead form", { exact: true }).click();
      await selectOption(page, "What’s going wrong?", "Lead sources are missing");
      await page.getByText("Within 30 days", { exact: true }).click();
    },
  },
  {
    route: "/offer/tracking-audit/professional-services",
    companyLabel: "Business / Company",
    company: "Production QA Advisory",
    industry: "professional_services",
    primaryConversionType: "booked_call_appointment",
    fillStep2: async (page: Page) => {
      await selectOption(page, "Your role", "Founder / Managing Partner");
      await selectOption(page, "Are you involved in choosing a provider?", "I help choose");
      await selectOption(page, "Rough monthly ad spend", "GHS 3k–6k");
      await selectOption(page, "Main ad platform", "Google");
    },
    fillStep3: async (page: Page) => {
      await selectOption(page, "How clear are you on where enquiries come from?", "Partly clear");
      await selectOption(page, "What enquiry action matters most?", "Booked call / consultation");
      await selectOption(page, "What’s unclear?", "We get leads but lose the source");
      await selectOption(page, "When do you want clarity?", "Within 30 days");
    },
  },
  {
    route: "/offer/tracking-audit/education",
    companyLabel: "Institution / Organisation",
    company: "Production QA College",
    industry: "education_training",
    primaryConversionType: "application_enrolment",
    fillStep2: async (page: Page) => {
      await selectOption(page, "Your role", "Founder / Director");
      await selectOption(page, "Are you involved in choosing a provider?", "I help choose");
      await selectOption(page, "Rough monthly ad spend", "GHS 3k–6k");
      await selectOption(page, "Main ad platform", "Google");
    },
    fillStep3: async (page: Page) => {
      await selectOption(page, "How clear are you on where enquiries and applications come from?", "Partly clear");
      await selectOption(page, "What recruitment action matters most?", "Application / enrolment");
      await selectOption(page, "What’s unclear?", "I can’t tell which ads bring applicants");
      await selectOption(page, "When do you want clarity?", "Within 30 days");
    },
  },
  {
    route: "/offer/tracking-audit/real-estate",
    companyLabel: "Company / Organisation",
    company: "Production QA Realty",
    industry: "real_estate",
    primaryConversionType: "booked_call_appointment",
    fillStep2: async (page: Page) => {
      await selectOption(page, "Your role", "Founder / Director");
      await selectOption(page, "Are you involved in choosing a provider?", "I help choose");
      await selectOption(page, "Rough monthly ad spend", "GHS 3k–6k");
      await selectOption(page, "Main ad platform", "Google");
    },
    fillStep3: async (page: Page) => {
      await selectOption(page, "How clear are you on where property enquiries come from?", "Partly clear");
      await selectOption(page, "What property action matters most?", "Booked viewing / appointment");
      await selectOption(page, "What’s unclear?", "I can’t tell which ads bring qualified property enquiries");
      await selectOption(page, "When do you want clarity?", "Within 30 days");
    },
  },
];

test.describe("ATD production post-deployment QA", () => {
  test("sitemap exposes the complete 42-route production inventory", async ({ request }) => {
    const response = await request.get(`${ORIGIN}/sitemap.xml`);
    expect(response.status()).toBe(200);
    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urls).toHaveLength(42);
    expect(new Set(urls).size).toBe(42);
    for (const required of [
      `${ORIGIN}/offer/tracking-audit`,
      `${ORIGIN}/offer/tracking-audit/professional-services`,
      `${ORIGIN}/offer/tracking-audit/education`,
      `${ORIGIN}/offer/tracking-audit/real-estate`,
    ]) expect(urls).toContain(required);
  });

  test("all sitemap pages render without same-origin HTTP failures or runtime exceptions", async ({ page, request }) => {
    test.setTimeout(300_000);
    const sitemap = await request.get(`${ORIGIN}/sitemap.xml`);
    const xml = await sitemap.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const failures: string[] = [];

    await blockOptionalTracking(page);
    page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
    page.on("response", (response) => {
      try {
        const url = new URL(response.url());
        if (url.origin === ORIGIN && response.status() >= 400) {
          failures.push(`${response.status()} ${url.pathname}`);
        }
      } catch {}
    });

    for (const url of urls) {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      expect(response, url).not.toBeNull();
      expect(response!.status(), url).toBeLessThan(400);
      await hideOverlays(page);
      await expect(page.locator("body")).toBeVisible();
      expect(await page.title(), `title: ${url}`).not.toBe("");
      await expect(page.getByText("Something went wrong", { exact: false })).toHaveCount(0);
      await assertNoHorizontalOverflow(page);
    }

    expect(failures, failures.join("\n")).toEqual([]);
  });

  test("internal same-origin links discovered from core pages do not break", async ({ page, request }) => {
    test.setTimeout(240_000);
    const sources = ["/", "/service", "/expertise", "/blog", "/contact-us", "/offer/tracking-audit"];
    const links = new Set<string>();
    await blockOptionalTracking(page);

    for (const source of sources) {
      await page.goto(source, { waitUntil: "domcontentloaded" });
      const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
        anchors.map((a) => (a as HTMLAnchorElement).href),
      );
      for (const href of hrefs) {
        const url = new URL(href);
        if (url.origin === ORIGIN && !url.pathname.startsWith("/admin")) {
          links.add(url.origin + url.pathname);
        }
      }
    }

    const failures: string[] = [];
    for (const href of links) {
      const response = await request.get(href, { maxRedirects: 5 });
      if (response.status() >= 400) failures.push(`${response.status()} ${href}`);
    }
    expect(links.size).toBeGreaterThan(15);
    expect(failures, failures.join("\n")).toEqual([]);
  });

  test("desktop and mobile primary navigation work", async ({ page }) => {
    await blockOptionalTracking(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByTestId("desktop-services-trigger").hover();
    await expect(page.getByTestId("desktop-services-menu")).toBeVisible();
    await page.getByTestId("desktop-expertise-trigger").hover();
    await expect(page.getByTestId("desktop-expertise-menu")).toBeVisible();
    await expect(page.getByRole("link", { name: /Book.*Strategy Call/i }).first()).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "domcontentloaded" });
    const toggle = page.getByRole("button", { name: "Toggle menu" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.getByTestId("mobile-services-trigger").click();
    await expect(page.locator("#mobile-services-links")).toBeVisible();
    await page.getByTestId("mobile-expertise-trigger").click();
    await expect(page.locator("#mobile-expertise-links")).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test("core production pages have no horizontal overflow across four viewport widths", async ({ page }) => {
    test.setTimeout(240_000);
    await blockOptionalTracking(page);
    for (const route of coreResponsiveRoutes) {
      for (const width of [390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        const response = await page.goto(route, { waitUntil: "domcontentloaded" });
        expect(response?.status(), `${route} @ ${width}`).toBeLessThan(400);
        await hideOverlays(page);
        await assertNoHorizontalOverflow(page);
        await expect(page.locator("h1").first()).toBeVisible();
      }
    }
  });

  for (const current of trackingCases) {
    test(`Tracking Audit production contract: ${current.route}`, async ({ page }) => {
      await blockOptionalTracking(page);
      const getCaptured = await installLeadMock(page);
      const query = "?utm_source=meta&utm_medium=paid_social&utm_campaign=prod_postdeploy_qa&utm_content=route_contract&utm_term=qa&fbclid=prod-qa-click";
      await page.goto(`${current.route}${query}`, { waitUntil: "domcontentloaded" });
      await hideOverlays(page);

      await page.getByLabel("First Name").fill("Production");
      await page.getByLabel("Last Name").fill("QA");
      await page.getByLabel("Work Email").fill("production-qa@example.com");
      await page.getByLabel(current.companyLabel).fill(current.company);
      await page.getByLabel("Website").fill("example.com");
      await page.getByRole("button", { name: "Continue" }).click();

      await current.fillStep2(page);
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await current.fillStep3(page);

      await page.waitForTimeout(1600);
      await page.getByRole("button", { name: "Request My Free Audit" }).click();
      await expect(page.getByRole("heading", { name: "Application received." })).toBeVisible();

      const payload = getCaptured();
      expect(payload).not.toBeNull();
      expect(payload!.source).toBe("tracking_audit_offer");
      expect(payload!.websiteRoute).toBe(current.route);
      expect(payload!.industry).toBe(current.industry);
      expect(payload!.company).toBe(current.company);
      expect(payload!.primaryConversionType).toBe(current.primaryConversionType);
      expect(payload!.metaEventId).toMatch(/^atd-/);
      const attribution = payload!.attribution as Record<string, unknown>;
      expect(attribution.utmSource).toBe("meta");
      expect(attribution.utmMedium).toBe("paid_social");
      expect(attribution.utmCampaign).toBe("prod_postdeploy_qa");
      expect(attribution.landingPage).toContain(current.route);

      const event = await page.evaluate(() =>
        (window.dataLayer || []).filter((item: any) => item?.event === "tracking_audit_submit").at(-1),
      );
      expect(event?.event_id).toBe(payload!.metaEventId);
      expect(event?.page_path).toBe(current.route);
    });
  }

  test("Contact form validates and completes against a mocked production API response", async ({ page }) => {
    await blockOptionalTracking(page);
    const getCaptured = await installLeadMock(page);
    await page.goto("/contact-us", { waitUntil: "domcontentloaded" });
    await hideOverlays(page);

    await page.waitForTimeout(700);
    await page.getByLabel("First Name").fill("Production");
    await page.getByLabel("Last Name").fill("QA");
    await page.getByLabel("Company Email").fill("not-an-email");
    await page.getByRole("button", { name: "Start the Conversation" }).click();
    await expect(page.getByText("Please enter a valid email")).toBeVisible();

    await page.getByLabel("Company Email").fill("production-qa@example.com");
    await page.getByRole("button", { name: "Start the Conversation" }).click();
    await expect(page.getByText("Please select at least one service")).toBeVisible();

    await page.getByText("Analytics & Tracking", { exact: true }).click();
    await page.getByLabel("Your Message").fill("Production post-deployment form contract QA.");
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Start the Conversation" }).click();
    await page.waitForURL("**/contact-us/thank-you");

    const payload = getCaptured();
    expect(payload?.source).toBe("contact_form");
    expect(payload?.serviceInterest).toContain("Analytics/Tracking");
    await expect(page.getByText(/thank|received|message/i).first()).toBeVisible();
  });

  test("footer newsletter validates consent and completes with a mocked lead response", async ({ page }) => {
    await blockOptionalTracking(page);
    const getCaptured = await installLeadMock(page);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await hideOverlays(page);
    await page.waitForTimeout(700);

    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();
    const email = footer.getByRole("textbox", { name: "Email address" });
    const subscribe = footer.getByRole("button", { name: "Subscribe" });
    await subscribe.click();
    await expect(footer.getByText("Please enter a valid email address.")).toBeVisible();

    await email.fill("production-newsletter-qa@example.com");
    await subscribe.click();
    await expect(footer.getByText(/confirm you'd like to receive emails/i)).toBeVisible();

    await footer.getByRole("checkbox").check();
    await subscribe.click();
    await expect(footer.getByText(/You're subscribed|Check your inbox to confirm/i)).toBeVisible();

    const payload = getCaptured();
    expect(payload?.source).toBe("newsletter");
    expect(payload?.optIn).toBe(true);
    const event = await page.evaluate(() =>
      (window.dataLayer || []).filter((item: any) => item?.event === "newsletter_subscribe").at(-1),
    );
    expect(event?.lead_source).toBe("newsletter");
    expect(event?.event_id).toBe(payload?.metaEventId);
  });

  test("desktop exit-intent popup validates and submits through a mocked Brevo endpoint", async ({ page }) => {
    await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
    let captured: Record<string, unknown> | null = null;
    await page.route("**/api/brevo-subscribe", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      captured = JSON.parse(route.request().postData() || "{}");
      const metaEventId = String(captured.metaEventId || "exit-prod-qa");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, duplicate: false, metaEventId }),
      });
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.removeItem("atd_exit_popup_dismissed_until");
      localStorage.removeItem("atd_exit_popup_submitted");
      sessionStorage.removeItem("atd_exit_popup_seen_session");
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      document.dispatchEvent(new MouseEvent("mouseout", {
        bubbles: true,
        clientY: 0,
        relatedTarget: null,
      }));
    });

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /submit|get.*audit|free.*audit/i }).click();
    await expect(dialog.getByText("First name is required.")).toBeVisible();

    await dialog.getByLabel("First name").fill("Production");
    await dialog.getByLabel("Work email").fill("production-exit-qa@example.com");
    await dialog.getByLabel(/Website URL/i).fill("example.com");
    const optin = dialog.getByRole("checkbox");
    if (await optin.count()) await optin.check();
    await dialog.getByRole("button", { name: /submit|get.*audit|free.*audit/i }).click();
    await expect(dialog.getByRole("heading", { name: "Your audit request is in." })).toBeVisible();

    expect(captured?.websiteRoute).toBe("/");
    expect(captured?.metaEventId).toMatch(/^atd-/);
    const event = await page.evaluate(() =>
      (window.dataLayer || []).filter((item: any) => item?.event === "exit_popup_success").at(-1),
    );
    expect(event?.lead_source).toBe("exit_popup");
  });

  test("consent defaults deny optional tracking and GTM is gated until a consent grant", async ({ page }) => {
    await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
    await page.route("https://www.googletagmanager.com/**", (route) => route.abort());
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const initial = await page.evaluate(() => ({
      state: (window as any).__atdConsentState,
      gtmScript: [...document.scripts].some((s) => s.src.includes("googletagmanager.com/gtm.js")),
    }));
    expect(initial.state.analytics_storage).toBe("denied");
    expect(initial.state.ad_storage).toBe("denied");
    expect(initial.state.ad_user_data).toBe("denied");
    expect(initial.state.ad_personalization).toBe("denied");
    expect(initial.gtmScript).toBe(false);

    await page.evaluate(() => {
      (window as any).dataLayer.push({
        event: "ketchPermitChanged",
        analytics___measurement: true,
        targeted_advertising: false,
      });
    });
    await expect.poll(async () => page.evaluate(() =>
      [...document.scripts].some((s) => s.src.includes("googletagmanager.com/gtm.js")),
    )).toBe(true);

    const updated = await page.evaluate(() => (window as any).__atdConsentState);
    expect(updated.analytics_storage).toBe("granted");
    expect(updated.ad_storage).toBe("denied");
  });

  test("booking page exposes the Brevo scheduler and scheduler endpoint is reachable", async ({ page, request }) => {
    const scheduler = await request.get("https://meet.brevo.com/meet-atd/borderless?l=discovery", { maxRedirects: 5 });
    expect(scheduler.status()).toBeLessThan(400);

    await page.goto("/book-a-call", { waitUntil: "domcontentloaded" });
    const iframe = page.locator('iframe[title="Book a Strategy Call"]');
    await expect(iframe).toHaveAttribute("src", /meet\.brevo\.com\/meet-atd\/borderless/);
    await expect(page.getByRole("heading", { name: /Book a.*Strategy.*Call/i })).toBeVisible();
  });

  test("production backend is reachable read-only and CORS preflight accepts the public origin", async ({ request }) => {
    const get = await request.get(`${BACKEND}/api/leads`, {
      headers: { Origin: ORIGIN },
      failOnStatusCode: false,
    });
    expect([400, 405]).toContain(get.status());

    const options = await request.fetch(`${BACKEND}/api/leads`, {
      method: "OPTIONS",
      headers: {
        Origin: ORIGIN,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
      failOnStatusCode: false,
    });
    expect(options.status()).toBeLessThan(400);
    const allowOrigin = options.headers()["access-control-allow-origin"] || "";
    expect([ORIGIN, "*"]).toContain(allowOrigin);
  });

  test("404 and admin access gates render safely", async ({ page }) => {
    await blockOptionalTracking(page);
    const missing = await page.goto("/definitely-not-a-real-atd-route", { waitUntil: "domcontentloaded" });
    expect(missing?.status()).toBe(404);
    await expect(page.getByText(/page.*not found|404/i).first()).toBeVisible();

    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByText("Something went wrong", { exact: false })).toHaveCount(0);

    await page.goto("/admin/contacts", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByText("Something went wrong", { exact: false })).toHaveCount(0);
  });
});
