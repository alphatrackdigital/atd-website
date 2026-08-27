import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ExitIntentPopup from "@/components/shared/ExitIntentPopup";
import { renderWithPageProviders } from "./renderWithPageProviders";

const openPopup = () => {
  fireEvent.mouseOut(document, {
    clientY: -1,
    relatedTarget: null,
  });
};

describe("ExitIntentPopup", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.dataLayer = [];
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("opens on desktop exit intent and validates required fields", async () => {
    renderWithPageProviders(<ExitIntentPopup />);

    openPopup();

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Get My Free Growth Audit" }));

    expect(await screen.findByText("First name is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid work email.")).toBeInTheDocument();
    expect(window.dataLayer).toContainEqual({ event: "exit_popup_view" });
  });

  it("submits a valid lead and suppresses future views after success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderWithPageProviders(<ExitIntentPopup />);
    openPopup();

    fireEvent.change(await screen.findByLabelText("First name"), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText(/Website URL/i), { target: { value: "alphatrack.digital" } });
    fireEvent.click(screen.getByRole("button", { name: "Get My Free Growth Audit" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/brevo-subscribe", expect.any(Object));
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      firstName: "Ada",
      email: "ada@example.com",
      website: "alphatrack.digital",
      websiteRoute: "/",
      optIn: false,
      attribution: { landingPage: "/" },
      metaEventId: expect.stringMatching(/^atd-/),
    });
    expect(await screen.findByText("Your audit request is in.")).toBeInTheDocument();
    expect(window.localStorage.getItem("atd_exit_popup_submitted")).toBe("true");
    expect(window.dataLayer).toContainEqual({ event: "exit_popup_submit" });
    expect(window.dataLayer).toContainEqual(expect.objectContaining({
      event: "exit_popup_success",
      form_id: "exit-intent-popup-form",
      lead_source: "exit_popup",
      event_id: expect.stringMatching(/^atd-/),
      eventID: expect.stringMatching(/^atd-/),
    }));
  });

  it("suppresses the popup for 7 days after close", async () => {
    renderWithPageProviders(<ExitIntentPopup />);
    openPopup();

    fireEvent.click(await screen.findByLabelText("Close growth audit popup"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    window.sessionStorage.clear();
    openPopup();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(Number(window.localStorage.getItem("atd_exit_popup_dismissed_until"))).toBeGreaterThan(Date.now());
    expect(window.dataLayer).toContainEqual({ event: "exit_popup_close" });
  });

  it("closes on Escape key press", async () => {
    renderWithPageProviders(<ExitIntentPopup />);
    openPopup();

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.dataLayer).toContainEqual({ event: "exit_popup_close" });
  });

  it("closes when clicking the backdrop", async () => {
    renderWithPageProviders(<ExitIntentPopup />);
    openPopup();

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(dialog);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.dataLayer).toContainEqual({ event: "exit_popup_close" });
  });

  it("does not close when clicking inside the modal panel", async () => {
    renderWithPageProviders(<ExitIntentPopup />);
    openPopup();

    fireEvent.click(await screen.findByText("Before you go, get a free growth audit."));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render on excluded pages", () => {
    renderWithPageProviders(<ExitIntentPopup />, { route: "/contact-us" });

    openPopup();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not compete with the Tracking Audit application", () => {
    renderWithPageProviders(<ExitIntentPopup />, { route: "/offer/tracking-audit" });

    openPopup();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.dataLayer).not.toContainEqual({ event: "exit_popup_view" });
  });

  it("opens on mobile after 60 seconds", async () => {
    vi.useFakeTimers();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("pointer: coarse"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    });

    renderWithPageProviders(<ExitIntentPopup />);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
