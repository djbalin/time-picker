"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/lib/db/db";
import {
  getPollsBySlugs,
  getPollWithTokenBySlug,
  type PollSummaryRow,
} from "@/lib/db/queries";
import {
  availabilitiesTable,
  type Poll,
  participantsTable,
  pollsTable,
} from "@/lib/db/schema";
import { generateAdminToken, generateSlug } from "@/lib/ids";
import {
  type CreatePollFieldErrors,
  createPollSchema,
  dedupeNames,
  firstFieldErrors,
  MAX_PARTICIPANTS,
  nameIsTaken,
  normalizeDateKeys,
  participantNameSchema,
} from "@/lib/validation";

/**
 * Every export here is a public POST endpoint, so this module holds mutations
 * only — reads live in `lib/db/queries.ts`. Actions return a result object
 * instead of throwing, so a validation failure renders as a message next to
 * the field rather than as an error overlay.
 */

export type ActionFailure = {
  ok: false;
  message: string;
  fieldErrors?: CreatePollFieldErrors;
};

export type ActionResult<T> = ({ ok: true } & T) | ActionFailure;

function failure(
  message: string,
  fieldErrors?: CreatePollFieldErrors,
): ActionFailure {
  return { ok: false, message, fieldErrors };
}

export type CreatePollResult = ActionResult<{
  slug: string;
  adminToken: string;
  title: string;
}>;

export async function createPoll(
  _prevState: CreatePollResult | null,
  formData: FormData,
): Promise<CreatePollResult> {
  const parsed = createPollSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    dates: readJsonArray(formData.get("dates")),
    participants: readJsonArray(formData.get("participants")),
  });

  if (!parsed.success) {
    return failure("Some details need fixing.", firstFieldErrors(parsed.error));
  }

  const { title, description } = parsed.data;
  const dates = normalizeDateKeys(parsed.data.dates);
  const participants = dedupeNames(parsed.data.participants);

  if (dates.length === 0) {
    return failure("Pick at least one date.", {
      dates: "Pick at least one date.",
    });
  }
  if (participants.length === 0) {
    return failure("Add at least one person.", {
      participants: "Add at least one person.",
    });
  }

  const slug = generateSlug();
  const adminToken = generateAdminToken();

  const [poll] = await db
    .insert(pollsTable)
    .values({ slug, adminToken, title, description, dates })
    .returning();

  await db.insert(participantsTable).values(
    participants.map((name) => ({
      pollId: poll.id,
      name,
    })),
  );

  refresh();
  return { ok: true, slug: poll.slug, adminToken, title: poll.title };
}

export type JoinPollResult = ActionResult<{ participantId: number }>;

/** Adds someone the organizer didn't list, and answers as them. */
export async function joinPoll(
  slug: string,
  rawName: string,
): Promise<JoinPollResult> {
  const parsed = participantNameSchema.safeParse(rawName);
  if (!parsed.success) {
    return failure(parsed.error.issues[0]?.message ?? "Enter a name.");
  }
  const name = parsed.data;

  const poll = await getPollWithTokenBySlug(slug);
  if (!poll) {
    return failure("That poll no longer exists.");
  }

  const existing = await db
    .select({ id: participantsTable.id, name: participantsTable.name })
    .from(participantsTable)
    .where(eq(participantsTable.pollId, poll.id));

  if (existing.length >= MAX_PARTICIPANTS) {
    return failure(`This poll is full (${MAX_PARTICIPANTS} people max).`);
  }
  if (
    nameIsTaken(
      name,
      existing.map((person) => person.name),
    )
  ) {
    return failure(
      `Someone already answered as "${name}". Pick that name from the list, or use a different one.`,
    );
  }

  const [participant] = await db
    .insert(participantsTable)
    .values({ pollId: poll.id, name })
    .returning();

  refresh();
  return { ok: true, participantId: participant.id };
}

export type SaveAvailabilityResult = ActionResult<{ dates: string[] }>;

/**
 * Replaces a participant's answer wholesale. Last write wins, which is what
 * the toggling UI wants — it always sends the participant's complete set.
 */
export async function saveAvailability(
  slug: string,
  participantId: number,
  rawDates: string[],
): Promise<SaveAvailabilityResult> {
  const poll = await getPollWithTokenBySlug(slug);
  if (!poll) {
    return failure("That poll no longer exists.");
  }

  const [participant] = await db
    .select({ id: participantsTable.id })
    .from(participantsTable)
    .where(
      and(
        eq(participantsTable.id, participantId),
        eq(participantsTable.pollId, poll.id),
      ),
    )
    .limit(1);

  if (!participant) {
    return failure("That person isn't part of this poll.");
  }

  // Only dates the organizer actually proposed can be answered.
  const proposed = new Set(poll.dates);
  const dates = normalizeDateKeys(rawDates).filter((date) =>
    proposed.has(date),
  );

  await db
    .insert(availabilitiesTable)
    .values({ participantId: participant.id, dates })
    .onConflictDoUpdate({
      target: availabilitiesTable.participantId,
      set: { dates, updatedAt: new Date() },
    });

  await touchPoll(poll.id);
  refresh();
  return { ok: true, dates };
}

export type FinalizePollResult = ActionResult<{ finalizedDate: string | null }>;

/** Locks in the chosen day (or reopens the poll when `date` is null). */
export async function finalizePoll(
  slug: string,
  adminToken: string,
  date: string | null,
): Promise<FinalizePollResult> {
  const owned = await requireOwnedPoll(slug, adminToken);
  if (!owned.ok) return failure(owned.error);

  if (date !== null && !owned.poll.dates.includes(date)) {
    return failure("That date isn't one of the options on this poll.");
  }

  await db
    .update(pollsTable)
    .set({ finalizedDate: date, updatedAt: new Date() })
    .where(eq(pollsTable.id, owned.poll.id));

  refresh();
  return { ok: true, finalizedDate: date };
}

export type DeletePollResult = { ok: true } | ActionFailure;

export async function deletePoll(
  slug: string,
  adminToken: string,
): Promise<DeletePollResult> {
  const owned = await requireOwnedPoll(slug, adminToken);
  if (!owned.ok) return failure(owned.error);

  // Cleared explicitly rather than relying on ON DELETE CASCADE, which SQLite
  // only honours when `PRAGMA foreign_keys` is on for the connection.
  const participants = await db
    .select({ id: participantsTable.id })
    .from(participantsTable)
    .where(eq(participantsTable.pollId, owned.poll.id));

  for (const participant of participants) {
    await db
      .delete(availabilitiesTable)
      .where(eq(availabilitiesTable.participantId, participant.id));
  }
  await db
    .delete(participantsTable)
    .where(eq(participantsTable.pollId, owned.poll.id));
  await db.delete(pollsTable).where(eq(pollsTable.id, owned.poll.id));

  refresh();
  return { ok: true };
}

type OwnershipCheck = { ok: false; error: string } | { ok: true; poll: Poll };

async function requireOwnedPoll(
  slug: string,
  adminToken: string,
): Promise<OwnershipCheck> {
  const poll = await getPollWithTokenBySlug(slug);
  if (!poll) {
    return { ok: false, error: "That poll no longer exists." };
  }
  if (!adminToken || poll.adminToken !== adminToken) {
    return {
      ok: false,
      error: "Only the person who created this poll can do that.",
    };
  }
  return { ok: true, poll };
}

/** Keeps the poll's `updatedAt` meaningful when a child row changes. */
async function touchPoll(pollId: number) {
  await db
    .update(pollsTable)
    .set({ updatedAt: new Date() })
    .where(eq(pollsTable.id, pollId));
}

function readJsonArray(value: FormDataEntryValue | null): unknown[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Read used by the "my polls" list. It's an action rather than a query because
 * the browser is the only thing that knows which polls it has seen — and it
 * can only ever ask for slugs it already holds, which are the share secrets.
 */
export async function loadMyPolls(slugs: string[]): Promise<PollSummaryRow[]> {
  const wanted = slugs
    .filter((slug): slug is string => typeof slug === "string")
    .slice(0, 100);
  return getPollsBySlugs(wanted);
}
