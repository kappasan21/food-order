import "dotenv/config";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });

import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is not set");
}

const isLocalFile = url.startsWith("file:");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: isLocalFile ? "sqlite" : "turso",
  dbCredentials: isLocalFile
    ? { url }
    : {
        url,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      },
});
