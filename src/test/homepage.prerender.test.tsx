// @vitest-environment node

import { render } from "@/entry-server";

describe("Route prerendering", () => {
  it("renders homepage content and SEO head tags on the server", async () => {
    const { html, head } = await render("/");

    expect(html).toContain("Growth should never");
    expect(html).toContain("Toggle menu");
    expect(html).toContain("Book A Free Strategy Call");

    expect(head).toContain("<title");
    expect(head).toContain("AlphaTrack Digital | Data-Driven Performance Marketing Agency");
    expect(head).toContain('rel="canonical" href="https://alphatrack.digital"');
    expect(head).toContain('name="description"');
    expect(head).toContain("Data-driven marketing, creative strategy, and growth systems");
  });

  it("renders route-specific content and metadata before JavaScript runs", async () => {
    const { html, head } = await render("/service");

    expect(html).toContain("Marketing Systems That");
    expect(head).toContain('rel="canonical" href="https://alphatrack.digital/service"');
    expect(head).not.toContain("Data-Driven Performance Marketing Agency</title>");
  });

  it("renders unknown routes as noindex pages", async () => {
    const { html, head } = await render("/__static-404__");

    expect(html).toContain("Page Not Found");
    expect(head).toContain('name="robots" content="noindex, nofollow"');
    expect(head).not.toContain('rel="canonical"');
    expect(head).not.toContain('property="og:url"');
  });
});
