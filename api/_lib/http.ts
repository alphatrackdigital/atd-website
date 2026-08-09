import type { VercelRequest, VercelResponse } from "@vercel/node";

// Mirrors the origin allowlist used by the public lead handlers in api/leads.ts.
// Admin routes are authenticated, so a wildcard origin is deliberately avoided.
const allowedHostnames = new Set([
  "alphatrack.digital",
  "www.alphatrack.digital",
  "alphatrackdigital.com",
  "www.alphatrackdigital.com",
  "alphatrackdigital.netlify.app",
  "alphatra-serv.netlify.app",
  "backend--alphatra-serv.netlify.app",
  "website-internal-test.vercel.app",
  "atd-website-test.vercel.app",
  "atd-website-test-alphatrackdigitals-projects.vercel.app",
]);

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return false;

  try {
    const url = new URL(origin);
    if (url.protocol !== "https:") return false;
    if (allowedHostnames.has(url.hostname)) return true;
    return (
      url.hostname.endsWith("-alphatrackdigitals-projects.vercel.app") ||
      url.hostname.endsWith("--alphatrackdigital.netlify.app")
    );
  } catch {
    return false;
  }
};

export function setCorsHeaders(res: VercelResponse, req?: VercelRequest): void {
  const origin = Array.isArray(req?.headers.origin)
    ? req?.headers.origin[0]
    : req?.headers.origin;

  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin as string);
    res.setHeader("Vary", "Origin");
  }
}
