import { drizzle } from "drizzle-orm/postgres-js";

/**
 * Points at a Postgres connection string — a local Postgres/Supabase instance
 * for dev, or Supabase's pooled connection string in production. Supabase's
 * pooler (port 6543, pgbouncer) doesn't support prepared statements, hence
 * `prepare: false`.
 */
const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is not set");
}

export const db = drizzle({
  connection: {
    url,
    prepare: false,
  },
});
