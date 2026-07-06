"use server";

import { db } from "@/lib/db/db";
import { pollsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { refresh } from "next/cache";

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
      participants: parsedParticipants,
    })
    .returning();
  refresh();
  return inserted;
}

export async function getPolls() {
  const result = await db.select().from(pollsTable);
  return result;
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
