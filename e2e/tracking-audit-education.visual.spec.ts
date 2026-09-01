import { expect, test } from "@playwright/test";

const route = "/offer/tracking-audit/education";

const hideExternalOverlays = async (page: import("@playwright/test").Page) => {
  await page.addStyleTag({
    content: "#lanyard_root, [data-ketch-backdrop='true'] { display: none !important; pointer-events: none !important; }",
  });
};

const fillStepOne = async (page: import("@playwright/test").Page) => {
  await page.getByLabel("First Name").fill("Jane");
  await page.getByLabel("Last Name").fill("Smith");
  await page.getByLabel("Work Email").fill("jane@example.edu");
  await page.getByLabel("Institution / Organisation").fill("Example College");
  await page.getByLabel("Website").fill("example.edu");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Step 2 of 3")).toBeVisible();
};

const choose = async (page: import("@playwright/test").Page, label: string, option: string) => {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
};

const advanceToStepThree = async (page: import("@playwright/test").Page) => {
  await fillStepOne(page);
  await choose(page, "Your role", "Founder / Director");
  await choose(page, "Are you involved in choosing a provider?", "I help choose");
  await choose(page, "Rough monthly ad spend", "GHS 3k–6k");
  await choose(page, "Main ad platform", "Google");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Step 3 of 3")).toBeVisible();
};

test.describe("Education Tracking Audit visual stability", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("https://global.ketchcdn.com/**", (route) => route.abort());
    await page.goto(route);
    await hideExternalOverlays(page);
  });

  test("light theme keeps site chrome and custom dropdowns stable", async ({ page }) => {
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
    await choose(page, "Your role", "Founder / Director");
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

  test("education story stays aligned, sequential and unclipped across breakpoints", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => window.localStorage.setItem("atd-tracking-audit-theme", "light"));
    await page.reload();
    await hideExternalOverlays(page);

    await expect(page.getByText("Human-reviewed audit")).toBeVisible();
    await expect(page.getByText("Not an automated report")).toBeVisible();
    await expect(page.getByText("Reports 18 leads.", { exact: true })).toBeVisible();
    await expect(page.getByText("Shows 12 applications.", { exact: true })).toBeVisible();
    await expect(page.getByText("Receives 15 applications.", { exact: true })).toBeVisible();

    const journeyBreaks = page.locator("[data-journey-break]");
    const journeyNodes = page.locator("[data-journey-node]");
    await expect(journeyBreaks).toHaveCount(3);
    await expect(journeyNodes).toHaveCount(4);

    for (let index = 0; index < 3; index += 1) {
      const breakBox = await journeyBreaks.nth(index).boundingBox();
      const chipBox = await journeyBreaks.nth(index).locator("[data-journey-chip]").boundingBox();
      const diamondBox = await journeyBreaks.nth(index).locator("[data-journey-diamond]").boundingBox();
      const leftNode = await journeyNodes.nth(index).boundingBox();
      const rightNode = await journeyNodes.nth(index + 1).boundingBox();

      expect(breakBox).not.toBeNull();
      expect(chipBox).not.toBeNull();
      expect(diamondBox).not.toBeNull();
      expect(leftNode).not.toBeNull();
      expect(rightNode).not.toBeNull();

      const leftCenter = (leftNode?.x ?? 0) + (leftNode?.width ?? 0) / 2;
      const rightCenter = (rightNode?.x ?? 0) + (rightNode?.width ?? 0) / 2;
      const expectedMidpoint = (leftCenter + rightCenter) / 2;
      const breakCenter = (breakBox?.x ?? 0) + (breakBox?.width ?? 0) / 2;
      const chipCenter = (chipBox?.x ?? 0) + (chipBox?.width ?? 0) / 2;
      const diamondCenter = (diamondBox?.x ?? 0) + (diamondBox?.width ?? 0) / 2;

      expect(Math.abs(breakCenter - expectedMidpoint)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(chipCenter - expectedMidpoint)).toBeLessThanOrEqual(1.5);
      expect(Math.abs(diamondCenter - expectedMidpoint)).toBeLessThanOrEqual(1.5);
    }

    const heroHeading = page.getByRole("heading", {
      name: "Know which campaigns drive applications and enrolments.",
    });
    const heroGradientLines = heroHeading.locator(".text-gradient-atd-hero");
    await expect(heroGradientLines).toHaveCount(2);

    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await heroHeading.scrollIntoViewIfNeeded();

      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);

      const heroBox = await heroHeading.boundingBox();
      expect(heroBox).not.toBeNull();

      for (let index = 0; index < 2; index += 1) {
        const gradientLine = heroGradientLines.nth(index);
        const metrics = await gradientLine.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            height: element.getBoundingClientRect().height,
            fontSize: Number.parseFloat(style.fontSize),
            lineHeight: Number.parseFloat(style.lineHeight),
            paddingBottom: Number.parseFloat(style.paddingBottom),
            paddingRight: Number.parseFloat(style.paddingRight),
            overflow: style.overflow,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
          };
        });
        const gradientBox = await gradientLine.boundingBox();

        expect(gradientBox).not.toBeNull();
        expect(metrics.height).toBeGreaterThan(metrics.fontSize);
        expect(metrics.lineHeight).toBeGreaterThanOrEqual(metrics.fontSize * 1.04);
        expect(metrics.paddingBottom).toBeGreaterThan(0);
        expect(metrics.paddingRight).toBeGreaterThan(0);
        expect(metrics.overflow).toBe("visible");
        expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
        expect((gradientBox?.x ?? 0) + (gradientBox?.width ?? 0)).toBeLessThanOrEqual(
          (heroBox?.x ?? 0) + (heroBox?.width ?? 0) + 1,
        );
      }
    }

    await page.setViewportSize({ width: 1440, height: 1000 });

    const measurementHeading = page.getByRole("heading", {
      name: "An application can lose its source before your admissions team ever sees it.",
    });
    const reviewHeading = page.getByRole("heading", {
      name: "We follow one recruitment journey from click to admissions handoff.",
    });

    for (const heading of [measurementHeading, reviewHeading]) {
      const lines = heading.locator(":scope > span");
      await expect(lines).toHaveCount(2);
      const firstLine = await lines.nth(0).boundingBox();
      const secondLine = await lines.nth(1).boundingBox();
      expect(firstLine).not.toBeNull();
      expect(secondLine).not.toBeNull();
      expect(secondLine?.y ?? 0).toBeGreaterThan((firstLine?.y ?? 0) + 8);
    }

    for (const copy of [
      "We check the path from ad to programme page to enquiry or application and into your admissions system or CRM.",
      "The audit stays focused on one real recruitment journey so we can answer three practical questions without burying your marketing or admissions team in technical detail.",
      "You get a short Tracking Health Scorecard that shows what we found, why it matters and what should be checked or fixed first.",
    ]) {
      const subtitle = page.getByText(copy, { exact: true });
      const subtitleBox = await subtitle.boundingBox();
      expect(subtitleBox).not.toBeNull();
      expect(subtitleBox?.width ?? 9999).toBeLessThanOrEqual(832);
    }

    const familiarProblemLine = page.locator("[data-familiar-problem-line]");
    const familiarMetrics = await familiarProblemLine.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        lineHeight: Number.parseFloat(style.lineHeight),
      };
    });
    expect(familiarMetrics.height).toBeLessThanOrEqual(familiarMetrics.lineHeight * 1.15);

    const attributionQuestion = page.locator('[data-health-dimension-title="1"]');
    const attributionMetrics = await attributionQuestion.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        lineHeight: Number.parseFloat(style.lineHeight),
      };
    });
    expect(attributionMetrics.height).toBeLessThanOrEqual(attributionMetrics.lineHeight * 1.15);

    await advanceToStepThree(page);
    await expect(page.getByText(/Review and recommendations are included\. Implementation is separate\./)).toBeVisible();

    await expect(page.getByText("Example preview", { exact: true })).toHaveCount(0);

    const scorecard = page
      .getByText("Tracking Health Scorecard", { exact: true })
      .locator("xpath=ancestor::div[contains(@class,'max-w-[46rem]')]");
    const scorecardBox = await scorecard.boundingBox();
    const scorecardShellBox = await scorecard.locator("..").boundingBox();
    expect(scorecardBox).not.toBeNull();
    expect(scorecardShellBox).not.toBeNull();
    expect(scorecardBox?.width ?? 0).toBeGreaterThanOrEqual(680);
    expect(scorecardBox?.width ?? 999).toBeLessThanOrEqual(736);
    const scorecardCenter = (scorecardBox?.x ?? 0) + (scorecardBox?.width ?? 0) / 2;
    const shellCenter = (scorecardShellBox?.x ?? 0) + (scorecardShellBox?.width ?? 0) / 2;
    expect(Math.abs(scorecardCenter - shellCenter)).toBeLessThanOrEqual(2);

    const formCard = page.locator(".tracking-audit-form-card");
    const reviewBadge = page.locator("[data-human-review-badge]");
    await expect(reviewBadge).toBeVisible();
    expect(await formCard.evaluate((element) => element.contains(document.querySelector("[data-human-review-badge]")))).toBe(false);

    await expect(page.getByRole("heading", { name: "From application to scorecard in four steps." })).toBeVisible();
    await expect(page.locator("[data-process-sequence]")).toHaveCount(1);
    await expect(page.locator("[data-process-sequence]")).toHaveAttribute("data-process-pace", "deliberate");
    await expect(page.locator("[data-process-step]")).toHaveCount(4);
    await expect(page.locator("[data-process-path]")).toHaveCount(1);

    const ctaHeading = page.getByRole("heading", {
      name: "Know which recruitment campaigns are actually producing applications.",
    });

    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await ctaHeading.scrollIntoViewIfNeeded();
      const box = await ctaHeading.boundingBox();
      const viewport = page.viewportSize();
      expect(box).not.toBeNull();
      expect(viewport).not.toBeNull();
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport?.width ?? 0);
    }
  });

  test("submits the education preset and application conversion through the canonical contract", async ({ page }) => {
    let submitted: Record<string, unknown> | null = null;

    await page.route("**/api/leads", async (requestRoute) => {
      submitted = JSON.parse(requestRoute.request().postData() || "{}") as Record<string, unknown>;
      await requestRoute.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, duplicate: false, metaEventId: "education-e2e" }),
      });
    });

    await advanceToStepThree(page);
    await choose(page, "How clear are you on where enquiries and applications come from?", "Partly clear");
    await choose(page, "What recruitment action matters most?", "Application / enrolment");
    await choose(page, "What’s unclear?", "I can’t tell which ads bring applicants");
    await choose(page, "When do you want clarity?", "Within 30 days");

    await page.waitForTimeout(1600);
    await page.getByRole("button", { name: "Request My Free Audit" }).click();
    await expect(page.getByRole("heading", { name: "Application received." })).toBeVisible();

    expect(submitted).not.toBeNull();
    expect(submitted?.industry).toBe("education_training");
    expect(submitted?.primaryConversionType).toBe("application_enrolment");
    expect(submitted?.company).toBe("Example College");
  });

  test("dark mode dropdown remains readable without body scroll locking", async ({ page }) => {
    await page.evaluate(() => window.localStorage.setItem("atd-tracking-audit-theme", "dark"));
    await page.reload();
    await hideExternalOverlays(page);
    await fillStepOne(page);

    await page.getByRole("combobox", { name: "Your role", exact: true }).click();
    const menu = page.getByRole("listbox", { name: "Your role" });
    const option = page.getByRole("option", { name: "Founder / Director", exact: true });

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
