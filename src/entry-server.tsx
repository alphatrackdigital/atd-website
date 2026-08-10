import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import { AppRouter, AppShell } from "./App";

export const render = (url = "/") => new Promise<{ html: string; head: string }>((resolve, reject) => {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const output = new PassThrough();
  const chunks: Buffer[] = [];

  output.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  output.on("error", reject);
  output.on("end", () => {
    const { helmet } = helmetContext;

    resolve({
      html: Buffer.concat(chunks).toString("utf8"),
      head: [
        helmet?.title.toString() ?? "",
        helmet?.meta.toString() ?? "",
        helmet?.link.toString() ?? "",
        helmet?.script.toString() ?? "",
      ].join(""),
    });
  });

  const { pipe } = renderToPipeableStream(
    <HelmetProvider context={helmetContext}>
      <AppShell>
        <StaticRouter location={url}>
          <AppRouter />
        </StaticRouter>
      </AppShell>
    </HelmetProvider>,
    {
      onAllReady() {
        pipe(output);
      },
      onShellError: reject,
      onError(error) {
        console.error("Prerender error:", error);
      },
    },
  );
});
