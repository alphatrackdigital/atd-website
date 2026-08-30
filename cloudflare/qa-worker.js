const NOINDEX = "noindex, nofollow, noarchive, nosnippet";
const QA_LEADS_PATH = "/api/leads";

const withQaHeaders = (response, pathname) => {
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", NOINDEX);
  headers.set("X-Content-Type-Options", "nosniff");

  const contentType = headers.get("content-type") || "";
  if (contentType.includes("text/html") || pathname === "/__atd/deployment.json" || pathname === QA_LEADS_PATH) {
    headers.set("Cache-Control", "private, no-store");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const proxyQaLead = async (request, env) => {
  if (!env.QA_LEADS_ENDPOINT) {
    return new Response(JSON.stringify({ ok: false, message: "QA leads endpoint is not configured." }), {
      status: 503,
      headers: { "content-type": "application/json", "Cache-Control": "private, no-store" },
    });
  }

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("origin", "https://atd-website-qa.alphatrackdigital.workers.dev");
  headers.set("x-atd-qa-proxy", "tracking-audit-e2e");

  const upstreamRequest = new Request(env.QA_LEADS_ENDPOINT, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });

  const response = await fetch(upstreamRequest);
  return withQaHeaders(response, QA_LEADS_PATH);
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === QA_LEADS_PATH) {
      return proxyQaLead(request, env);
    }

    const response = await env.ASSETS.fetch(request);
    return withQaHeaders(response, url.pathname);
  },
};
