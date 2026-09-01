import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ExpertiseDetail from "@/pages/ExpertiseDetail";

const renderExpertise = (route: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter
        initialEntries={[route]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/expertise/:slug" element={<ExpertiseDetail />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("Expertise tracking-audit discovery links", () => {
  it("links Education expertise to the Education Tracking Audit and preserves attribution", () => {
    renderExpertise("/expertise/education?utm_source=organic&utm_campaign=expertise");

    expect(
      screen.getByRole("heading", { name: "See where your enrolment tracking loses the source." }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Explore the Education Tracking Audit/i }),
    ).toHaveAttribute(
      "href",
      "/offer/tracking-audit/education?utm_source=organic&utm_campaign=expertise",
    );
  });

  it("links Real Estate expertise to the Real Estate Tracking Audit", () => {
    renderExpertise("/expertise/real-estate");

    expect(
      screen.getByRole("heading", { name: "See where your property lead tracking loses the source." }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Explore the Real Estate Tracking Audit/i }),
    ).toHaveAttribute("href", "/offer/tracking-audit/real-estate");
  });

  it("does not add an industry-audit callout to unrelated expertise pages", () => {
    renderExpertise("/expertise/saas");

    expect(screen.queryByText(/Free Education Tracking Audit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Free Real Estate Tracking Audit/i)).not.toBeInTheDocument();
  });
});
