import { fireEvent, screen, waitFor } from "@testing-library/react";
import TrackingAuditProfessionalServices from "@/pages/TrackingAuditProfessionalServices";
import TrackingAuditEducation from "@/pages/TrackingAuditEducation";
import { renderWithPageProviders } from "@/test/renderWithPageProviders";

const completeStepOne = () => {
  fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Jane" } });
  fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Smith" } });
  fireEvent.change(screen.getByLabelText("Work Email"), { target: { value: "jane@example.com" } });
  fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Example Ltd" } });
  fireEvent.change(screen.getByLabelText("Website"), { target: { value: "https://example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
};

describe("Tracking Audit vertical pages", () => {
  it("Professional Services page shows its approved hero copy and auto-sets Industry", async () => {
    renderWithPageProviders(<TrackingAuditProfessionalServices />, {
      route: "/offer/tracking-audit/professional-services",
    });

    expect(
      screen.getByRole("heading", { name: "Can you prove which campaigns generate your valuable enquiries?" }),
    ).toBeInTheDocument();

    completeStepOne();

    await waitFor(() => {
      expect(screen.getByLabelText("Industry")).toBeInTheDocument();
    });
    expect(screen.getByRole("combobox", { name: "Industry" })).toHaveTextContent("Professional Services");

    expect(screen.getByRole("link", { name: "Request a Free Tracking Audit" })).toHaveAttribute(
      "href",
      "/offer/tracking-audit/professional-services#claim",
    );
  });

  it("Education page shows its approved hero copy and auto-sets Industry", async () => {
    renderWithPageProviders(<TrackingAuditEducation />, {
      route: "/offer/tracking-audit/education",
    });

    expect(
      screen.getByRole("heading", { name: "Can you trace an ad click through enquiry, application and enrolment?" }),
    ).toBeInTheDocument();

    completeStepOne();

    await waitFor(() => {
      expect(screen.getByLabelText("Industry")).toBeInTheDocument();
    });
    expect(screen.getByRole("combobox", { name: "Industry" })).toHaveTextContent("Education / Training");

    expect(screen.getByRole("link", { name: "Request a Free Tracking Audit" })).toHaveAttribute(
      "href",
      "/offer/tracking-audit/education#claim",
    );
  });

  it("does not alter the General Tracking Audit page", async () => {
    const { default: TrackingLandingPage } = await import("@/pages/TrackingLandingPage");
    renderWithPageProviders(<TrackingLandingPage />, { route: "/offer/tracking-audit" });

    expect(
      screen.getByRole("heading", { name: /Know whether your marketing data can be trusted/i }),
    ).toBeInTheDocument();
  });
});
