import { getAdminEndpoint } from "./apiEndpoints";

const TOKEN_KEY = "atd_admin_token";

export class AdminAuthError extends Error {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAdminToken = (token: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable (private mode); session stays in-memory only */
  }
};

export const clearAdminToken = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to clear */
  }
};

export const adminLogin = async (email: string, password: string): Promise<string> => {
  const response = await fetch(getAdminEndpoint("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body?.ok || !body?.token) {
    throw new Error(body?.message || "Unable to sign in. Please try again.");
  }

  setAdminToken(body.token);
  return body.token as string;
};

/**
 * Authenticated fetch for admin endpoints. Throws AdminAuthError on 401 so
 * callers can bounce the user back to the login screen.
 */
export const adminFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = getAdminToken();
  if (!token) throw new AdminAuthError("You are not signed in.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(getAdminEndpoint(path), { ...init, headers });

  if (response.status === 401) {
    clearAdminToken();
    throw new AdminAuthError();
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok || body?.ok === false) {
    throw new Error(body?.message || `Request failed (${response.status}).`);
  }

  return body as T;
};
