#!/usr/bin/env node
/**
 * Creates or updates an admin console user.
 *
 * This is deliberately a local script rather than an HTTP endpoint - there is
 * no public registration route for the admin console, and there should not be.
 *
 * It writes to the database used by the backend that serves the admin API
 * (repo: alphatrackdigital/atd-backend-test). Pass that backend's connection
 * string; this frontend build has no database of its own.
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/create-admin-user.mjs you@alphatrack.digital
 *
 * The password is read from stdin (or the ADMIN_PASSWORD env var) so it never
 * appears in shell history or the process list.
 */

import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const MIN_PASSWORD_LENGTH = 12;
const BCRYPT_ROUNDS = 12;

const AdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

const readPasswordFromStdin = () =>
  new Promise((resolve) => {
    if (process.env.ADMIN_PASSWORD) {
      resolve(process.env.ADMIN_PASSWORD);
      return;
    }

    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Password: ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });

const fail = (message) => {
  console.error(`Error: ${message}`);
  process.exit(1);
};

const main = async () => {
  const email = process.argv[2]?.trim().toLowerCase();
  const uri = process.env.MONGODB_URI;

  if (!email) fail("Provide an email address: node scripts/create-admin-user.mjs <email>");
  if (!email.includes("@")) fail(`"${email}" does not look like an email address.`);
  if (!uri) fail("MONGODB_URI is not set.");

  const password = await readPasswordFromStdin();
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  await mongoose.connect(uri, { dbName: "alphatrack" });

  const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const existing = await AdminUser.findOne({ email });
  await AdminUser.findOneAndUpdate(
    { email },
    { $set: { email, passwordHash } },
    { upsert: true, new: true },
  );

  console.log(existing ? `Password updated for ${email}.` : `Admin user ${email} created.`);

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error("Failed to create admin user:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
