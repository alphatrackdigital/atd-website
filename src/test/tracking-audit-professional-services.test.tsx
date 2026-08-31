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

    expect(screen.getByRole("heading", { name: "One business. One website. One enquiry journey." })).toBeInTheDocument();
    expect(screen.getByText("One core enquiry journey")).toBeInTheDocument();
    expect(screen.getByText("Up to two paid platforms")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "The enquiry arrives. The source doesn’t.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Three systems. Three answers.")).toBeInTheDocument();
    expect(screen.queryByText("Illustrative example — not client data.")).not.toBeInTheDocument();
    expect(screen.getByText("Reports 14 leads.")).toBeInTheDocument();
    expect(screen.getByText("Shows 9 conversions.")).toBeInTheDocument();
    expect(screen.getByText("Receives 11 enquiries.")).toBeInTheDocument();

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

    expect(screen.queryByText("Illustrative preview")).not.toBeInTheDocument();
    expect(screen.getByText("Human-reviewed audit")).toBeInTheDocument();
    expect(screen.getByText("Not an automated report")).toBeInTheDocument();
    expect(screen.queryByText(/The free audit includes the review and recommendations/)).not.toBeInTheDocument();
    expect(screen.queryByText("Human-reviewed")).not.toBeInTheDocument();

    expect(screen.queryByText("Example only. The findings shown here are fictional and do not represent a client.")).not.toBeInTheDocument();
    expect(screen.getByText("The scorecard gives you three things.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "From application to scorecard in four steps." })).toBeInTheDocument();

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
    fireEvent.change(screen.getByLabelText("Business / Company"), { target: { value: "Example Advisory" } });
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
