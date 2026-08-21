import { drizzle } from "drizzle-orm/libsql";

/**
 * Defaults to a local SQLite file so `pnpm db:seed && pnpm dev` works with no
 * setup. Point `DATABASE_URL` at a libsql/Turso URL (plus
 * `DATABASE_AUTH_TOKEN`) to run against a hosted database.
 */
const url = process.env.DATABASE_URL ?? "file:./db.sqlite";
const authToken = process.env.DATABASE_AUTH_TOKEN;

export const db = drizzle({
  connection: {
    url,
    ...(authToken ? { authToken } : {}),
  },
});
