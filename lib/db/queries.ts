import { asc, desc, eq, inArray } from "drizzle-orm";
import { connection } from "next/server";
import type { AvailabilityByParticipant } from "@/lib/poll-summary";
import { db } from "./db";
import {
  availabilitiesTable,
  type Poll,
  participantsTable,
  pollsTable,
} from "./schema";

/**
 * Reads live here rather than in `app/actions/polls.ts` on purpose: every
 * export of a `"use server"` module becomes a callable POST endpoint, so a
 * `getPolls()` sitting next to the mutations would hand anyone the whole
 * database. Server Components import these directly.
 */

/** A poll as it is safe to send to any visitor — `adminToken` is stripped. */
export type PublicPoll = Omit<Poll, "adminToken">;

export type PollParticipant = {
  id: number;
  name: string;
  /** False until they save an answer, which is not the same as "no dates". */
  hasResponded: boolean;
};

export type PollDetail = PublicPoll & {
  participants: PollParticipant[];
  availability: AvailabilityByParticipant;
};

export type PollSummaryRow = PublicPoll & {
  participantCount: number;
  respondedCount: number;
};

function toPublicPoll(poll: Poll): PublicPoll {
  const { adminToken: _adminToken, ...rest } = poll;
  return rest;
}

export async function getPollBySlug(slug: string): Promise<PollDetail | null> {
  // Poll pages are per-request by definition; without this the build tries to
  // prerender them and fails against an empty (or absent) database.
  await connection();

  const [poll] = await db
    .select()
    .from(pollsTable)
    .where(eq(pollsTable.slug, slug))
    .limit(1);

  if (!poll) return null;

  // Left join so participants who haven't answered still come back, with a
  // null availability row.
  const rows = await db
    .select({
      id: participantsTable.id,
      name: participantsTable.name,
      dates: availabilitiesTable.dates,
      availabilityId: availabilitiesTable.id,
    })
    .from(participantsTable)
    .leftJoin(
      availabilitiesTable,
      eq(availabilitiesTable.participantId, participantsTable.id),
    )
    .where(eq(participantsTable.pollId, poll.id))
    .orderBy(asc(participantsTable.id));

  const participants: PollParticipant[] = [];
  const availability: AvailabilityByParticipant = {};

  for (const row of rows) {
    participants.push({
      id: row.id,
      name: row.name,
      hasResponded: row.availabilityId !== null,
    });
    availability[row.id] = row.dates ?? [];
  }

  return { ...toPublicPoll(poll), participants, availability };
}

/**
 * Backs the "my polls" list. The browser remembers which slugs it has seen, so
 * a visitor only ever gets back polls they already hold links to.
 */
export async function getPollsBySlugs(
  slugs: string[],
): Promise<PollSummaryRow[]> {
  if (slugs.length === 0) return [];

  const polls = await db
    .select()
    .from(pollsTable)
    .where(inArray(pollsTable.slug, slugs))
    .orderBy(desc(pollsTable.createdAt));

  if (polls.length === 0) return [];

  const pollIds = polls.map((poll) => poll.id);
  const counts = await db
    .select({
      pollId: participantsTable.pollId,
      participantId: participantsTable.id,
      availabilityId: availabilitiesTable.id,
    })
    .from(participantsTable)
    .leftJoin(
      availabilitiesTable,
      eq(availabilitiesTable.participantId, participantsTable.id),
    )
    .where(inArray(participantsTable.pollId, pollIds));

  const tally = new Map<number, { participants: number; responded: number }>();
  for (const row of counts) {
    const entry = tally.get(row.pollId) ?? { participants: 0, responded: 0 };
    entry.participants += 1;
    if (row.availabilityId !== null) entry.responded += 1;
    tally.set(row.pollId, entry);
  }

  return polls.map((poll) => ({
    ...toPublicPoll(poll),
    participantCount: tally.get(poll.id)?.participants ?? 0,
    respondedCount: tally.get(poll.id)?.responded ?? 0,
  }));
}

/** Slug lookup that keeps the admin token, for authorizing owner-only writes. */
export async function getPollWithTokenBySlug(
  slug: string,
): Promise<Poll | null> {
  const [poll] = await db
    .select()
    .from(pollsTable)
    .where(eq(pollsTable.slug, slug))
    .limit(1);
  return poll ?? null;
}
