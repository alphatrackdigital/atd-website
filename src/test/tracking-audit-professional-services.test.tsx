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
        name: "We answer three practical questions.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Request My Free Audit" })).toHaveAttribute(
      "href",
      "/offer/tracking-audit/professional-services#claim",
    );
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
    expect(screen.getByLabelText("Your role in decisions like this")).toBeInTheDocument();
    expect(screen.getByLabelText("Rough monthly ad spend")).toBeInTheDocument();
    expect(screen.getByLabelText("Main ad platform")).toBeInTheDocument();
    expect(screen.queryByLabelText("Second platform (optional)")).not.toBeInTheDocument();
  });
});
