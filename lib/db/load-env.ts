import { existsSync } from "node:fs";

/**
 * Loads env files the way Next.js does for scripts that run outside Next
 * (`db:seed`, drizzle-kit). Precedence: first match wins, since
 * `process.loadEnvFile` never overrides an already-set variable — so the
 * most specific file is listed first, and a real shell env var beats them all.
 *
 * Import this before anything that reads `process.env.DATABASE_URL`.
 */
for (const file of [
  ".env.development.local",
  ".env.development",
  ".env.local",
  ".env",
]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
