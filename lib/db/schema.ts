import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pollsTable = sqliteTable("polls", {
  id: integer().primaryKey({ autoIncrement: true }),
  /** Public, unguessable id — every poll URL is built from this, never `id`. */
  slug: text().notNull().unique(),
  /** Held only by the creator; required to finalize or delete. Never read out. */
  adminToken: text().notNull(),
  title: text().notNull(),
  description: text(),
  /** Candidate days as "YYYY-MM-DD" keys, sorted ascending. */
  dates: text("dates", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default(sql`(json_array())`),
  /** The day the organizer locked in, or null while the poll is still open. */
  finalizedDate: text(),
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const participantsTable = sqliteTable("participants", {
  id: integer().primaryKey({ autoIncrement: true }),
  pollId: integer()
    .notNull()
    .references(() => pollsTable.id, { onDelete: "cascade" }),
  name: text().notNull(),
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * One row per participant, created the first time they answer. A participant
 * with no row here hasn't replied yet, which is a different thing from
 * replying "none of these dates" (a row holding an empty array).
 */
export const availabilitiesTable = sqliteTable("availabilities", {
  id: integer().primaryKey({ autoIncrement: true }),
  participantId: integer()
    .notNull()
    .unique()
    .references(() => participantsTable.id, { onDelete: "cascade" }),
  dates: text("dates", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default(sql`(json_array())`),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Poll = typeof pollsTable.$inferSelect;
export type Participant = typeof participantsTable.$inferSelect;
export type Availability = typeof availabilitiesTable.$inferSelect;
