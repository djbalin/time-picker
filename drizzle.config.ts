import "./lib/db/load-env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  // Only ever touch our own tables in `public`. Without this, `drizzle-kit push`
  // introspects Supabase's managed schemas (auth, storage, realtime, …) and
  // offers to drop them. Roles are left unmanaged (the default).
  schemaFilter: ["public"],
});
