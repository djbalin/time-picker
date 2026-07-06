"use server";

import { db } from "@/lib/db/db";
import {
  availabilitiesTable,
  Availability,
  Participant,
  participantsTable,
  pollsTable,
} from "@/lib/db/schema";
import { eq, getColumns, sql } from "drizzle-orm";
import { refresh } from "next/cache";

export type ParticipantEnriched = typeof participantsTable.$inferSelect & {
  availabilities: (typeof availabilitiesTable.$inferSelect)[];
};

export type PollEnriched = typeof pollsTable.$inferSelect & {
  participants: ParticipantEnriched[];
};

const parseJsonStringArray = (jsonArray: string): any[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonArray);
  } catch {
    throw new Error(`Input must be a valid JSON array`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Input must be an array");
  }
  return parsed;
};

export async function addPoll(
  _prevState: typeof pollsTable.$inferSelect | null,
  formData: FormData,
) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const rawDates = formData.get("dates");
  const rawParticipants = formData.get("participants");

  console.log(rawParticipants);

  if (
    !title ||
    !description ||
    typeof rawDates !== "string" ||
    typeof rawParticipants !== "string"
  ) {
    throw new Error("Title, participants, and dates are required");
  }

  const parsedDates = parseJsonStringArray(rawDates);
  const parsedParticipants = parseJsonStringArray(rawParticipants);

  console.log("Parsed participants;", parsedParticipants);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDates = [...new Set(parsedDates)]
    .filter((date): date is string => typeof date === "string")
    .sort();

  if (uniqueDates.length === 0) {
    throw new Error("At least one future date is required");
  }

  for (const date of uniqueDates) {
    const parsedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate <= today) {
      throw new Error("All dates must be in the future");
    }
  }

  const [inserted] = await db
    .insert(pollsTable)
    .values({
      description,
      title,
      dates: uniqueDates,
    })
    .returning();
  refresh();
  return inserted;
}

async function getAvailabilitiesByParticipant(
  participantId: number,
): Promise<Availability[]> {
  return await db
    .select()
    .from(availabilitiesTable)
    .where(eq(availabilitiesTable.participantId, participantId));
}

export async function getParticipantsByPollId(
  pollId: number,
): Promise<Participant[]> {
  return await db
    .select()
    .from(participantsTable)
    .where(eq(participantsTable.pollId, pollId));
}

async function enrichParticipantWithAvailabilities(
  participant: typeof participantsTable.$inferSelect,
): Promise<ParticipantEnriched> {
  const availabilities = await getAvailabilitiesByParticipant(participant.id);
  return {
    ...participant,
    availabilities: availabilities,
  };
}

async function enrichPoll(
  poll: typeof pollsTable.$inferSelect,
): Promise<PollEnriched> {
  const participants = await getParticipantsByPollId(poll.id);
  const participantsEnriched = await Promise.all(
    participants.map(async (part) => enrichParticipantWithAvailabilities(part)),
  );
  return {
    ...poll,
    participants: participantsEnriched,
  };
}

export async function getPolls() {
  const polls = await db.select().from(pollsTable);

  const pollsEnriched = await Promise.all(
    polls.map(async (poll) => {
      return enrichPoll(poll);
    }),
  );

  return pollsEnriched;
}

export async function getPollById(id: number) {
  const [poll] = await db
    .select()
    .from(pollsTable)
    .where(eq(pollsTable.id, id));
  return poll ?? null;
}

export async function deletePoll(id: number) {
  const deleted = await db
    .delete(pollsTable)
    .where(eq(pollsTable.id, id))
    .returning();
  refresh();
  return deleted;
}
