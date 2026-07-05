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
});
