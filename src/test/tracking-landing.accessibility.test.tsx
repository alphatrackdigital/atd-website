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

  it("rejects a hostname without a public suffix and validates the website on blur", async () => {
    renderWithPageProviders(<TrackingLandingPage />, { route: "/offer/tracking-audit" });

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Work Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Example Ltd" } });

    const website = screen.getByLabelText("Website");
    fireEvent.change(website, { target: { value: "AlphaTrackDigital" } });
    fireEvent.blur(website);

    expect(await screen.findByText("Enter a valid website, e.g. company.com")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByLabelText("Industry")).not.toBeInTheDocument();
  });

  it("moves to the compact fit-and-spend step after valid step one", async () => {
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
    expect(screen.getByLabelText("Monthly ad spend")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Where do you advertise?" })).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByText("Business context")).toBeInTheDocument();
    expect(screen.getByText("Decision & spend")).toBeInTheDocument();
    expect(screen.getByText("Advertising")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "How confident are you in your tracking?" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Send me occasional ATD marketing insights.")).not.toBeInTheDocument();
  });

  it("presents the application-first audit scope and links the final call to action to the form", () => {
    renderWithPageProviders(<TrackingLandingPage />, { route: "/offer/tracking-audit" });

    expect(
      screen.getByRole("heading", { name: "Know what your marketing is actually producing." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your marketing results pass through several steps." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "We check five parts of your tracking." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Illustrative scorecard finding")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "We start with the least access possible." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Here’s how the audit works." })).toBeInTheDocument();
    expect(screen.queryByText("Illustrative preview")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See what we review" })).toHaveAttribute(
      "href",
      "#measurement-journey",
    );
    expect(screen.getByRole("heading", { name: "Common questions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request My Free Audit" })).toHaveAttribute(
      "href",
      "/offer/tracking-audit#claim",
    );
  });
});
