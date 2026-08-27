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
    fireEvent.change(screen.getByLabelText("Website"), { target: { value: "example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Industry")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Your role")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Your role in this decision" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Monthly ad spend" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Where do you advertise?" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "How confident are you in your tracking?" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "What matters most?" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "What’s going wrong?" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "How soon do you want this addressed?" })).toBeInTheDocument();
    expect(screen.getByLabelText("Send me occasional ATD marketing insights.")).toBeInTheDocument();
  });

  it("presents the application-first audit scope and links the final call to action to the form", () => {
    renderWithPageProviders(<TrackingLandingPage />, { route: "/offer/tracking-audit" });

    expect(
      screen.getByRole("heading", { name: "Know what your marketing is actually producing." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Five parts of your tracking." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Common questions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request a Free Tracking Audit" })).toHaveAttribute(
      "href",
      "/offer/tracking-audit#claim",
    );
  });
});
