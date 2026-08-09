import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "8h";

export interface JwtAdminPayload {
  sub: "admin";
  email: string;
  iat?: number;
  exp?: number;
}

export function signAdminToken(email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign({ sub: "admin", email }, secret, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAdminToken(token: string): JwtAdminPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured.");
  const payload = jwt.verify(token, secret) as JwtAdminPayload;
  if (payload.sub !== "admin") throw new Error("Invalid token subject.");
  return payload;
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}
