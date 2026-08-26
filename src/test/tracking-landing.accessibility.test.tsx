import { fireEvent, screen, waitFor } from "@testing-library/react";
import TrackingLandingPage from "@/pages/TrackingLandingPage";
import { renderWithPageProviders } from "@/test/renderWithPageProviders";

describe("TrackingLandingPage accessibility", () => {
  it("associates visible step-one labels with form controls", () => {
    renderWithPageProviders(<TrackingLandingPage />, { route: "/offer/tracking-audit" });

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Work Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toBeInTheDocument();
    expect(screen.getByLabelText("Website")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("moves to the structured measurement-context step after valid step one", async () => {
    renderWithPageProviders(<TrackingLandingPage />, { route: "/offer/tracking-audit" });

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Work Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Example Ltd" } });
    fireEvent.change(screen.getByLabelText("Website"), { target: { value: "https://example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Industry")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Your Role")).toBeInTheDocument();
    expect(screen.getByLabelText("Decision Influence")).toBeInTheDocument();
    expect(screen.getByLabelText("Monthly Paid-Media Spend")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Paid Channels" })).toBeInTheDocument();
    expect(screen.getByLabelText("Tracking Maturity")).toBeInTheDocument();
    expect(screen.getByLabelText("Primary Conversion")).toBeInTheDocument();
    expect(screen.getByLabelText("Biggest Measurement Problem")).toBeInTheDocument();
    expect(screen.getByLabelText("Timing / Urgency")).toBeInTheDocument();
    expect(screen.getByLabelText("Send me occasional ATD marketing insights and updates.")).toBeInTheDocument();
  });

  it("presents the application-first audit scope and links the final call to action to the form", () => {
    renderWithPageProviders(<TrackingLandingPage />, { route: "/offer/tracking-audit" });

    expect(
      screen.getByRole("heading", { name: "You should know what your marketing is actually producing." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Five dimensions of measurement confidence" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Common questions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request a Free Tracking Audit" })).toHaveAttribute(
      "href",
      "/offer/tracking-audit#claim",
    );
  });
});
