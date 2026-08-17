/**
 * Routes belonging to the internal admin console.
 *
 * Shared so that everything which must treat the console as non-public -
 * analytics route views, the support chat widget - agrees on what "admin"
 * means. A marketing route that merely starts with the letters "admin"
 * (e.g. /administration-services) is not the console.
 */
export const isAdminPath = (pathname: string) =>
  pathname === "/admin" || pathname.startsWith("/admin/");
