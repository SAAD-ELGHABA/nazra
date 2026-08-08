#!/usr/bin/env node
/**
 * Creates the first superadmin.
 *
 * `POST /api/auth/register` is correctly gated behind an existing superadmin,
 * which leaves a bootstrap problem: on a fresh database there is no way in.
 * This script is that way in, and it is the only place an account is created
 * without an authenticated caller.
 *
 * Usage:
 *   node scripts/createSuperadmin.js --email you@example.com --name "Your Name"
 *
 * The password is read from the SUPERADMIN_PASSWORD environment variable so it
 * never appears in shell history or a process listing:
 *   SUPERADMIN_PASSWORD='...' node scripts/createSuperadmin.js --email ... --name ...
 *
 * Safe to re-run: it refuses to touch an existing account rather than
 * overwriting a password or silently changing a role.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const MIN_PASSWORD_LENGTH = 12;

const readFlag = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
};

const fail = (message) => {
  console.error(`✖ ${message}`);
  process.exit(1);
};

const run = async () => {
  const email = (readFlag("email") || "").trim().toLowerCase();
  const name = (readFlag("name") || "").trim();
  const password = process.env.SUPERADMIN_PASSWORD || "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail("Pass a valid address: --email you@example.com");
  }
  if (name.length < 2 || name.length > 100) {
    fail('Pass a name between 2 and 100 characters: --name "Your Name"');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    fail(`Set SUPERADMIN_PASSWORD to at least ${MIN_PASSWORD_LENGTH} characters before running this.`);
  }
  if (!process.env.MONGO_URI) {
    fail("MONGO_URI is not set.");
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      fail(
        `An account already exists for ${email} (role: ${existing.role}). ` +
        "This script will not modify it — use the password-reset flow instead."
      );
    }

    // The model's pre-save hook hashes the password; it is never stored raw.
    const user = await User.create({ name, email, password, role: "superadmin" });
    console.log(`✔ Superadmin created: ${user.email}`);
    console.log("  Sign in at /login, then create further admins from the dashboard.");
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error("✖ Failed to create the superadmin:", error.message);
  process.exit(1);
});
