const BACKEND_ORIGIN = "https://alphatra-serv.netlify.app";

const LOCAL_HOSTS = new Set(["", "localhost", "127.0.0.1", "::1"]);

const isLocalHostname = (hostname: string) =>
  LOCAL_HOSTS.has(hostname) || hostname.endsWith(".localhost");

const isVercelHostname = (hostname: string) =>
  hostname === "website-internal-test.vercel.app" ||
  hostname === "atd-website-test.vercel.app" ||
  hostname === "atd-website-test-alphatrackdigitals-projects.vercel.app" ||
  hostname.endsWith("-alphatrackdigitals-projects.vercel.app");

export const resolveApiEndpoint = (
  path: string,
  configuredEndpoint?: string,
  hostname = typeof window !== "undefined" ? window.location.hostname : "",
) => {
  if (configuredEndpoint) return configuredEndpoint;

  if (isLocalHostname(hostname) || isVercelHostname(hostname)) {
    return path;
  }

  return `${BACKEND_ORIGIN}${path}`;
};

export const getLeadsEndpoint = () =>
  resolveApiEndpoint("/api/leads", import.meta.env.VITE_LEADS_ENDPOINT);

export const getBrevoSubscribeEndpoint = () =>
  resolveApiEndpoint("/api/brevo-subscribe", import.meta.env.VITE_BREVO_SUBSCRIBE_ENDPOINT);

/**
 * Admin API routes live alongside the public handlers in `api/`. When
 * VITE_ADMIN_API_BASE_URL is set the whole admin surface is pointed at that
 * origin; otherwise it follows the same same-origin/backend resolution as the
 * public endpoints.
 */
export const getAdminEndpoint = (path: string) => {
  const base = import.meta.env.VITE_ADMIN_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, "")}${path}`;
  return resolveApiEndpoint(path);
};
