import { screen } from "@testing-library/react";
import TrackingLandingPage from "@/pages/TrackingLandingPage";
import { renderWithPageProviders } from "@/test/renderWithPageProviders";

describe("TrackingLandingPage accessibility", () => {
  it("associates visible labels with form controls", () => {
    renderWithPageProviders(<TrackingLandingPage />, { route: "/offer/tracking-audit" });

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Work Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Website URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Monthly Ad Spend Level")).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Which ad platforms are active right now?" }),
    ).toBeInTheDocument();
  });

  it("presents the audit scope and links the final call to action to the form", () => {
    renderWithPageProviders(<TrackingLandingPage />, { route: "/offer/tracking-audit" });

    expect(
      screen.getByRole("heading", { name: "What we check before you scale" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Clear findings you can act on" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Common questions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See what we check" })).toHaveAttribute(
      "href",
      "#audit-coverage",
    );
    expect(screen.getByRole("link", { name: "Request Your Free Audit" })).toHaveAttribute(
      "href",
      "/offer/tracking-audit#claim",
    );
  });
});
