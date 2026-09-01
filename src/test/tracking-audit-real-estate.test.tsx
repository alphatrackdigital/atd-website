import { fireEvent, screen, waitFor } from "@testing-library/react";
import TrackingAuditRealEstate from "@/pages/TrackingAuditRealEstate";
import { renderWithPageProviders } from "@/test/renderWithPageProviders";

describe("TrackingAuditRealEstate", () => {
  it("renders the premium real-estate positioning and scoped property-lead diagnostic", () => {
    renderWithPageProviders(<TrackingAuditRealEstate />, {
      route: "/offer/tracking-audit/real-estate",
    });

    expect(
      screen.getByRole("heading", {
        name: "Know which ads drive real property enquiries and booked viewings.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "A property enquiry can lose its source before your sales team ever sees it.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "One real estate brand. One website. One property lead journey.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("One core property lead journey")).toBeInTheDocument();
    expect(screen.getByText("Up to two paid platforms")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "The enquiry arrives. The source doesn’t.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Three systems. Three answers.")).toBeInTheDocument();
    expect(screen.getByText("Reports 22 leads.")).toBeInTheDocument();
    expect(screen.getByText("Shows 14 enquiries.")).toBeInTheDocument();
    expect(screen.getByText("Receives 17 enquiries.")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "We follow one property lead journey from click to sales handoff.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "A scorecard that turns uncertainty into next steps.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Human-reviewed audit")).toBeInTheDocument();
    expect(screen.getByText("Not an automated report")).toBeInTheDocument();
    expect(screen.queryByText("Illustrative preview")).not.toBeInTheDocument();
    expect(screen.queryByText("Example preview")).not.toBeInTheDocument();
    expect(screen.getByText("The scorecard gives you three things.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "From application to scorecard in four steps." })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Request My Free Audit" })).toHaveAttribute(
      "href",
      "/offer/tracking-audit/real-estate#claim",
    );
  });

  it("switches between dark and light themes without changing the application flow", () => {
    window.localStorage.removeItem("atd-tracking-audit-theme");

    renderWithPageProviders(<TrackingAuditRealEstate />, {
      route: "/offer/tracking-audit/real-estate",
    });

    const lightToggle = screen.getByRole("button", { name: "Switch to light theme" });
    expect(document.querySelector(".tracking-audit-light")).not.toBeInTheDocument();

    fireEvent.click(lightToggle);

    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
    expect(document.querySelector(".tracking-audit-light")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("preserves the three-step form with real-estate-specific lead choices", async () => {
    renderWithPageProviders(<TrackingAuditRealEstate />, {
      route: "/offer/tracking-audit/real-estate",
    });

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Work Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText("Company / Organisation"), { target: { value: "Example Realty" } });
    fireEvent.change(screen.getByLabelText("Website"), { target: { value: "example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    });

    expect(screen.queryByLabelText("Industry")).not.toBeInTheDocument();
    expect(screen.getByText("Business context")).toBeInTheDocument();
    expect(screen.getByLabelText("Are you involved in choosing a provider?")).toBeInTheDocument();
    expect(screen.getByLabelText("Rough monthly ad spend")).toBeInTheDocument();
    expect(screen.getByLabelText("Main ad platform")).toBeInTheDocument();
  });
});
