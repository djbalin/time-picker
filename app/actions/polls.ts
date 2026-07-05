"use server";

import { db } from "@/lib/db/db";
import { pollsTable } from "@/lib/db/schema";

var counter = 0;

export async function addPoll() {
  await db.insert(pollsTable).values({
    description: `Test ${counter++}`,
    title: `Title ${counter}`,
  });
}

export async function getPolls() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const result = await db.select().from(pollsTable);
  return result;
}
