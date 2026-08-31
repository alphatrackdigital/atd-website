import { fireEvent, screen, waitFor } from "@testing-library/react";
import TrackingAuditProfessionalServices from "@/pages/TrackingAuditProfessionalServices";
import { renderWithPageProviders } from "@/test/renderWithPageProviders";

describe("TrackingAuditProfessionalServices", () => {
  it("renders the premium professional-services positioning and scoped diagnostic", () => {
    renderWithPageProviders(<TrackingAuditProfessionalServices />, {
      route: "/offer/tracking-audit/professional-services",
    });

    expect(
      screen.getByRole("heading", {
        name: "Know which ads are bringing you real enquiries and booked calls.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "An enquiry can lose its source before your team ever sees it.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "One firm. One website. One enquiry journey." })).toBeInTheDocument();
    expect(screen.getByText("One core enquiry journey")).toBeInTheDocument();
    expect(screen.getByText("Up to two paid platforms")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "The enquiry arrives. The source doesn’t.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Three systems. Three answers.")).toBeInTheDocument();
    expect(screen.getByText("Illustrative example — not client data.")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "We follow one enquiry from click to handoff.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "A scorecard that turns uncertainty into next steps.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Illustrative preview")).toBeInTheDocument();
    expect(screen.getByAltText("AlphaTrack Digital team")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Request My Free Audit" })).toHaveAttribute(
      "href",
      "/offer/tracking-audit/professional-services#claim",
    );
  });

  it("switches between dark and light themes without changing the application flow", () => {
    window.localStorage.removeItem("atd-tracking-audit-theme");

    renderWithPageProviders(<TrackingAuditProfessionalServices />, {
      route: "/offer/tracking-audit/professional-services",
    });

    const lightToggle = screen.getByRole("button", { name: "Switch to light theme" });
    expect(document.querySelector(".tracking-audit-light")).not.toBeInTheDocument();

    fireEvent.click(lightToggle);

    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
    expect(document.querySelector(".tracking-audit-light")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("preserves the production three-step form and preselects Professional services", async () => {
    renderWithPageProviders(<TrackingAuditProfessionalServices />, {
      route: "/offer/tracking-audit/professional-services",
    });

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Work Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText("Firm / Company"), { target: { value: "Example Advisory" } });
    fireEvent.change(screen.getByLabelText("Website"), { target: { value: "example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    });

    expect(screen.queryByLabelText("Industry")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Are you involved in choosing a provider?")).toBeInTheDocument();
    expect(screen.getByLabelText("Rough monthly ad spend")).toBeInTheDocument();
    expect(screen.getByLabelText("Main ad platform")).toBeInTheDocument();
    expect(screen.queryByLabelText("Second platform (optional)")).not.toBeInTheDocument();
  });
});
