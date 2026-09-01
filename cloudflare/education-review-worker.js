const NOINDEX = "noindex, nofollow, noarchive, nosnippet";

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": NOINDEX,
      "x-content-type-options": "nosniff",
    },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/leads") {
      return json(
        {
          ok: false,
          message: "Form submission is disabled on the Education premium landing-page review preview.",
          reviewOnly: true,
        },
        403,
      );
    }

    let response = await env.ASSETS.fetch(request);

    const acceptsHtml = (request.headers.get("accept") || "").includes("text/html");
    if (
      response.status === 404 &&
      (request.method === "GET" || request.method === "HEAD") &&
      acceptsHtml
    ) {
      const fallbackUrl = new URL("/", request.url);
      response = await env.ASSETS.fetch(new Request(fallbackUrl, request));
    }

    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", NOINDEX);
    headers.set("X-Content-Type-Options", "nosniff");

    const contentType = headers.get("content-type") || "";
    if (contentType.includes("text/html") || url.pathname === "/__atd/deployment.json") {
      headers.set("Cache-Control", "private, no-store");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
