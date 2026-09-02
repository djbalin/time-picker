import { sql } from "drizzle-orm";
import { integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const pollsTable = pgTable("polls", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  /** Public, unguessable id — every poll URL is built from this, never `id`. */
  slug: text().notNull().unique(),
  /** Held only by the creator; required to finalize or delete. Never read out. */
  adminToken: text().notNull(),
  title: text().notNull(),
  description: text(),
  /** Candidate days as "YYYY-MM-DD" keys, sorted ascending. */
  dates: json("dates").notNull().$type<string[]>().default(sql`'[]'::json`),
  /** The day the organizer locked in, or null while the poll is still open. */
  finalizedDate: text(),
  createdAt: timestamp({ mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp({ mode: "date" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const participantsTable = pgTable("participants", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  pollId: integer()
    .notNull()
    .references(() => pollsTable.id, { onDelete: "cascade" }),
  name: text().notNull(),
  createdAt: timestamp({ mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * One row per participant, created the first time they answer. A participant
 * with no row here hasn't replied yet, which is a different thing from
 * replying "none of these dates" (a row holding an empty array).
 */
export const availabilitiesTable = pgTable("availabilities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  participantId: integer()
    .notNull()
    .unique()
    .references(() => participantsTable.id, { onDelete: "cascade" }),
  dates: json("dates").notNull().$type<string[]>().default(sql`'[]'::json`),
  updatedAt: timestamp({ mode: "date" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export type Poll = typeof pollsTable.$inferSelect;
export type Participant = typeof participantsTable.$inferSelect;
export type Availability = typeof availabilitiesTable.$inferSelect;
