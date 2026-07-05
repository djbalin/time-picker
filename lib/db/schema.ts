import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pollsTable = sqliteTable("polls", {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text().notNull(),
  createdAt: integer()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  dates: text("dates", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default(sql`(json_array())`),
});

export type Poll = typeof pollsTable.$inferSelect;
