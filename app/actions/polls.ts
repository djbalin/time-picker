"use server";

import { db } from "@/lib/db/db";
import { pollsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { refresh } from "next/cache";

var counter = 0;

export async function addPoll() {
  await db.insert(pollsTable).values({
    description: `Test ${counter++}`,
    title: `Title ${counter}`,
  });
  refresh();
}

export async function getPolls() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const result = await db.select().from(pollsTable);
  return result;
}

export async function getPollById(id: number) {
  const [poll] = await db.select().from(pollsTable).where(eq(pollsTable.id, id));
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
