import { beforeEach, describe, expect, it } from "vitest";

import TrackingEvents from "@/components/shared/TrackingEvents";
import { renderWithPageProviders } from "./renderWithPageProviders";

const getRouteViewEvents = () =>
  (window.dataLayer ?? []).filter(
    (entry) => (entry as { event?: string })?.event === "atd_route_view",
  );

describe("TrackingEvents admin exclusion", () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it("pushes a route view for public marketing routes", () => {
    renderWithPageProviders(<TrackingEvents />, { route: "/about-us" });

    expect(getRouteViewEvents()).toHaveLength(1);
  });

  it.each(["/admin", "/admin/login", "/admin/contacts", "/admin/blog/some-post"])(
    "does not push a route view for %s",
    (route) => {
      renderWithPageProviders(<TrackingEvents />, { route });

      expect(getRouteViewEvents()).toHaveLength(0);
    },
  );

  it("does not treat a marketing route that merely starts with 'admin' as internal", () => {
    renderWithPageProviders(<TrackingEvents />, { route: "/administration-services" });

    expect(getRouteViewEvents()).toHaveLength(1);
  });
});
