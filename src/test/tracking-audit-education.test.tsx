import { fireEvent, screen, waitFor } from "@testing-library/react";
import TrackingAuditEducation from "@/pages/TrackingAuditEducation";
import { renderWithPageProviders } from "@/test/renderWithPageProviders";

describe("TrackingAuditEducation", () => {
  it("renders the premium education positioning and scoped recruitment diagnostic", () => {
    renderWithPageProviders(<TrackingAuditEducation />, {
      route: "/offer/tracking-audit/education",
    });

    expect(
      screen.getByRole("heading", {
        name: "Know which campaigns drive applications and enrolments.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "An application can lose its source before your admissions team ever sees it.",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "One institution. One website. One recruitment journey.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("One core recruitment journey")).toBeInTheDocument();
    expect(screen.getByText("Up to two paid platforms")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "The application arrives. The source doesn’t.",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Three systems. Three answers.")).toBeInTheDocument();
    expect(screen.getByText("Reports 18 leads.")).toBeInTheDocument();
    expect(screen.getByText("Shows 12 applications.")).toBeInTheDocument();
    expect(screen.getByText("Receives 15 applications.")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "We follow one recruitment journey from click to admissions handoff.",
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
      "/offer/tracking-audit/education#claim",
    );
  });

  it("switches between dark and light themes without changing the application flow", () => {
    window.localStorage.removeItem("atd-tracking-audit-theme");

    renderWithPageProviders(<TrackingAuditEducation />, {
      route: "/offer/tracking-audit/education",
    });

    const lightToggle = screen.getByRole("button", { name: "Switch to light theme" });
    expect(document.querySelector(".tracking-audit-light")).not.toBeInTheDocument();

    fireEvent.click(lightToggle);

    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
    expect(document.querySelector(".tracking-audit-light")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("preserves the three-step form with education-specific recruitment choices", async () => {
    renderWithPageProviders(<TrackingAuditEducation />, {
      route: "/offer/tracking-audit/education",
    });

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Work Email"), { target: { value: "jane@example.edu" } });
    fireEvent.change(screen.getByLabelText("Institution / Organisation"), { target: { value: "Example College" } });
    fireEvent.change(screen.getByLabelText("Website"), { target: { value: "example.edu" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    });

    expect(screen.queryByLabelText("Industry")).not.toBeInTheDocument();
    expect(screen.getByText("Organisation context")).toBeInTheDocument();
    expect(screen.getByLabelText("Are you involved in choosing a provider?")).toBeInTheDocument();
    expect(screen.getByLabelText("Rough monthly ad spend")).toBeInTheDocument();
    expect(screen.getByLabelText("Main ad platform")).toBeInTheDocument();
  });
});
