// @vitest-environment node

import { render } from "@/entry-server";

describe("Professional Services Tracking Audit prerender", () => {
  it("renders the vertical landing page directly instead of homepage content", async () => {
    const { html, head } = await render("/offer/tracking-audit/professional-services");

    expect(html).toContain("Know which ads drive");
    expect(html).toContain("real enquiries");
    expect(html).toContain("and booked calls.");
    expect(html).toContain("Book A Free Strategy Call");
    expect(html).toContain("Services");
    expect(html).not.toContain("Growth should never");

    expect(head).toContain(
      'rel="canonical" href="https://alphatrack.digital/offer/tracking-audit/professional-services"',
    );
    expect(head).toContain("Free Conversion Tracking Audit");
  });
});
