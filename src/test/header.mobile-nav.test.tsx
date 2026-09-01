import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "@/components/layout/Header";

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

describe("Header mobile nav", () => {
  it.each([
    "/offer/tracking-audit",
    "/offer/tracking-audit/",
    "/offer/tracking-audit/professional-services",
  ])("uses the full site navigation on Tracking Audit pages at %s", (route) => {
    render(
      <MemoryRouter initialEntries={[route]} future={routerFuture}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "AlphaTrack Digital Home" })).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Expertise")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /book a free strategy call/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /toggle menu/i })).toBeInTheDocument();
  });

  it("locks body scroll when open and closes on Escape", async () => {
    render(
      <MemoryRouter future={routerFuture}>
        <Header />
      </MemoryRouter>,
    );

    const toggleButton = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    });
    expect(document.body.style.overflow).toBe("");
  });

  it("opens a grouped services mega menu on desktop", async () => {
    render(
      <MemoryRouter future={routerFuture}>
        <Header />
      </MemoryRouter>,
    );

    const trigger = screen.getByTestId("desktop-services-trigger");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const menu = await screen.findByTestId("desktop-services-menu");

    expect(within(menu).getByText("Core Services")).toBeInTheDocument();
    expect(within(menu).getByText("Conversion Tracking & Measurement")).toBeInTheDocument();
    expect(within(menu).getByText("Marketing Automation & CRM")).toBeInTheDocument();
    expect(within(menu).getByRole("link", { name: /view all services/i })).toBeInTheDocument();
  });

  it("opens the expertise menu on desktop", async () => {
    render(
      <MemoryRouter future={routerFuture}>
        <Header />
      </MemoryRouter>,
    );

    const trigger = screen.getByTestId("desktop-expertise-trigger");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const menu = await screen.findByTestId("desktop-expertise-menu");

    expect(within(menu).getByText("SaaS")).toBeInTheDocument();
    expect(within(menu).getByText("Education")).toBeInTheDocument();
    expect(within(menu).getByText("Ecommerce & Retail")).toBeInTheDocument();
  });

  it("expands grouped service links inside the mobile menu", async () => {
    render(
      <MemoryRouter future={routerFuture}>
        <Header />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));

    const servicesTrigger = screen.getByTestId("mobile-services-trigger");
    fireEvent.click(servicesTrigger);

    expect(servicesTrigger).toHaveAttribute("aria-expanded", "true");

    await waitFor(() => {
      expect(screen.getByText("Core Services")).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /all services/i })).toBeInTheDocument();
    expect(screen.getByText("Marketing Automation & CRM")).toBeInTheDocument();
    expect(screen.getByText("Paid Media Management")).toBeInTheDocument();
  });

  it("expands expertise links inside the mobile menu", async () => {
    render(
      <MemoryRouter future={routerFuture}>
        <Header />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));

    const expertiseTrigger = screen.getByTestId("mobile-expertise-trigger");
    fireEvent.click(expertiseTrigger);

    expect(expertiseTrigger).toHaveAttribute("aria-expanded", "true");

    await waitFor(() => {
      expect(screen.getByText("SaaS")).toBeInTheDocument();
    });

    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("Real Estate")).toBeInTheDocument();
  });
});
