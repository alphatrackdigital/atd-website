// @vitest-environment jsdom

import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "@/App";
import { render } from "@/entry-server";

describe("prerender hydration", () => {
  it("hydrates the homepage without replacing server-rendered content", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { html } = await render("/");
    document.body.innerHTML = `<div id="root">${html}</div>`;
    const rootElement = document.getElementById("root");

    if (!rootElement) throw new Error("Missing hydration root");

    const errors: unknown[][] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args);
    });

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(
        rootElement,
        <HelmetProvider>
          <App />
        </HelmetProvider>,
      );
      await Promise.resolve();
    });

    const hydrationErrors = errors.filter(([message]) =>
      /hydration|did not match|server html/i.test(String(message)),
    );

    expect(hydrationErrors).toEqual([]);

    await act(async () => root?.unmount());
    consoleError.mockRestore();
  });
});
