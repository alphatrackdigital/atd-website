const NOINDEX = "noindex, nofollow, noarchive, nosnippet";

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", NOINDEX);
    headers.set("X-Content-Type-Options", "nosniff");

    const contentType = headers.get("content-type") || "";
    const pathname = new URL(request.url).pathname;
    if (contentType.includes("text/html") || pathname === "/__atd/deployment.json") {
      headers.set("Cache-Control", "private, no-store");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
