import { writeFileSync } from "node:fs";
import path from "node:path";
import type { FullConfig } from "@playwright/test";
import {
  FIXTURE_ADMIN_TOKEN,
  FIXTURE_CREATOR_EMAIL,
  type FixtureManifest,
  type PollFixtureKey,
  pollFixtures,
} from "./fixtures/polls";

export const MANIFEST_PATH = path.join(__dirname, ".fixtures.json");

/**
 * Runs once before any test: checks the app is up, then (re)creates the
 * fixture polls. Only rows with a `ui-` fixture slug are touched — whatever
 * else is in your dev database stays put.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? "http://localhost:3000";
  await assertServerUp(baseURL);

  // Imported late: load-env must run before anything reads DATABASE_URL.
  await import("../lib/db/load-env");
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Run `pnpm dev` once so it writes .env.development.local, or export DATABASE_URL.",
    );
  }

  const [{ drizzle }, { inArray }, schema] = await Promise.all([
    import("drizzle-orm/postgres-js"),
    import("drizzle-orm"),
    import("../lib/db/schema"),
  ]);
  const db = drizzle({ connection: { url, prepare: false } });
  const { pollsTable, participantsTable, availabilitiesTable } = schema;

  try {
    const entries = Object.entries(pollFixtures) as [
      PollFixtureKey,
      (typeof pollFixtures)[PollFixtureKey],
    ][];
    // Participants and availabilities go with their poll (on delete cascade).
    await db.delete(pollsTable).where(
      inArray(
        pollsTable.slug,
        entries.map(([, f]) => f.slug),
      ),
    );

    const manifest = {} as FixtureManifest;
    for (const [key, fixture] of entries) {
      const [poll] = await db
        .insert(pollsTable)
        .values({
          slug: fixture.slug,
          adminToken: FIXTURE_ADMIN_TOKEN,
          title: fixture.title,
          description: fixture.description || null,
          creatorEmail: FIXTURE_CREATOR_EMAIL,
          dates: fixture.dates,
          finalizedDate:
            "finalizedDate" in fixture ? fixture.finalizedDate : null,
        })
        .returning();

      const participants = await db
        .insert(participantsTable)
        .values(fixture.participants.map((name) => ({ name, pollId: poll.id })))
        .returning();

      const answers = Object.entries(fixture.answers).map(([index, dates]) => ({
        participantId: participants[Number(index)].id,
        dates: [...dates].sort(),
      }));
      if (answers.length > 0) {
        await db.insert(availabilitiesTable).values(answers);
      }

      manifest[key] = {
        slug: fixture.slug,
        meId: participants[fixture.me].id,
        participantIds: participants.map((p) => p.id),
      };
    }

    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  } finally {
    await db.$client.end();
  }
}

async function assertServerUp(baseURL: string) {
  try {
    await fetch(baseURL, { signal: AbortSignal.timeout(5_000) });
  } catch {
    throw new Error(
      `Nothing is answering at ${baseURL}. Start the app first with \`pnpm dev\` (or set BASE_URL).`,
    );
  }
}
