import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import { users } from "./schema";

async function seedAdmin() {
  const url = process.env.TURSO_DATABASE_URL;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }

  if (!email || !password) {
    console.log("ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin seed.");
    return;
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client);

  const normalizedEmail = email.toLowerCase();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    if (existing.role !== "admin") {
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, existing.id));
      console.log(`Promoted ${normalizedEmail} to admin.`);
    } else {
      console.log(`Admin account ${normalizedEmail} already exists.`);
    }
    return;
  }

  await db.insert(users).values({
    id: crypto.randomUUID(),
    name: "Restaurant Admin",
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    createdAt: new Date().toISOString(),
  });

  console.log(`Created admin account: ${normalizedEmail}`);
}

seedAdmin().catch((error) => {
  console.error("Admin seed failed:", error);
  process.exit(1);
});
