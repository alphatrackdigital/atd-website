import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { connectDB } from "../_lib/db.js";
import { AdminUser } from "../_lib/models/AdminUser.js";
import { signAdminToken } from "../_lib/jwt.js";
import { setCorsHeaders } from "../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res, req);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed." });

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "Email and password are required." });
  }

  try {
    await connectDB();

    const admin = await AdminUser.findOne({ email: String(email).toLowerCase() }).select("+passwordHash");
    const dummyHash = "$2a$12$invalidhashpadding000000000000000000000000000000000000";
    const passwordMatch = await bcrypt.compare(String(password), admin?.passwordHash ?? dummyHash);

    if (!admin || !passwordMatch) {
      return res.status(401).json({ ok: false, message: "Invalid credentials." });
    }

    const token = signAdminToken(admin.email);
    return res.status(200).json({ ok: true, token });
  } catch (err) {
    console.error("[auth] Error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error." });
  }
}
