import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pollsTable = sqliteTable("polls", {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
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

export const participantsTable = sqliteTable("participants", {
  id: integer().primaryKey({ autoIncrement: true }),
  pollId: integer().references(() => pollsTable.id),
  name: text().notNull(),
});

export const availabilitiesTable = sqliteTable("availabilities", {
  id: integer().primaryKey({ autoIncrement: true }),
  participantId: integer().references(() => participantsTable.id),
  dates: text("dates", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default(sql`(json_array())`),
});

export type Poll = typeof pollsTable.$inferSelect;
export type Participant = typeof participantsTable.$inferSelect;
export type Availability = typeof availabilitiesTable.$inferSelect;
