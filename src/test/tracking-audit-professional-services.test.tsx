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
        name: "Know which campaigns are generating your valuable enquiries.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "The lead is only useful if its source survives.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Focused enough to be useful." })).toBeInTheDocument();
    expect(screen.getByText("One core enquiry journey")).toBeInTheDocument();
    expect(screen.getByText("Up to two paid platforms")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Five checks determine whether you can trust lead attribution.",
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
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Example Advisory" } });
    fireEvent.change(screen.getByLabelText("Website"), { target: { value: "example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Industry")).toHaveTextContent("Professional services");
    expect(screen.getByRole("group", { name: "Your role in this decision" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Where do you advertise?" })).toBeInTheDocument();
  });
});
