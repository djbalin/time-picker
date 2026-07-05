"use server";

import { db } from "@/lib/db/db";
import { pollsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { refresh } from "next/cache";

var counter = 0;

export async function addPoll(
  _prevState: typeof pollsTable.$inferSelect | null,
  formData: FormData,
) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const rawDates = formData.get("dates");

  if (!title || !description || typeof rawDates !== "string") {
    throw new Error("Title, description, and dates are required");
  }

  let parsedDates: unknown;
  try {
    parsedDates = JSON.parse(rawDates);
  } catch {
    throw new Error("Dates must be a valid JSON array");
  }

  if (!Array.isArray(parsedDates)) {
    throw new Error("Dates must be an array");
  }

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
