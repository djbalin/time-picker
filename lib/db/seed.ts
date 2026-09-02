import "./load-env";
import { toDateKey } from "../date-keys";
import { generateAdminToken, generateSlug } from "../ids";
import { db } from "./db";
import { availabilitiesTable, participantsTable, pollsTable } from "./schema";

type PollInsert = typeof pollsTable.$inferInsert;
type ParticipantsInsert = typeof participantsTable.$inferInsert;
type AvailabilityInsert = typeof availabilitiesTable.$inferInsert;

const danishNames = [
  "Freja",
  "Ida",
  "Emma",
  "Sofie",
  "Laura",
  "William",
  "Noah",
  "Alfred",
  "Oliver",
  "Lucas",
  "Mikkel",
  "Rasmus",
];

type PollTemplate = Pick<PollInsert, "title" | "description"> & {
  /** How many proposed dates to generate (default 10). */
  dateCount?: number;
  /** Fixed participant count (default: random 3–6). */
  participantCount?: number;
  /**
   * Spread yes-rates evenly from 0% to 100% across the dates instead of
   * random per-participant picks. Everyone answers.
   */
  spreadAvailability?: boolean;
};

const pollTemplates: PollTemplate[] = [
  {
    description: "Hvornår skal vi spille The Band?",
    title: "EL GRUPO",
  },
  {
    title: "Sapph Honey Langeland",
    description: "Vi skal have en weekend til Langeland",
  },
  {
    title: "Drikke dejlige øl",
    description: "Læng siden gutter",
  },
  {
    title: "Big availability spread",
    description: "50 datoer, 5 deltagere, alt fra 0% til 100%",
    dateCount: 50,
    participantCount: 5,
    spreadAvailability: true,
  },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomNames(count = randomInt(3, 6)) {
  const shuffled = [...danishNames].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function pickRandomAvailableDates(pollDates: string[]) {
  const shuffled = [...pollDates].sort(() => Math.random() - 0.5);
  const count = randomInt(1, pollDates.length);
  return shuffled.slice(0, count).sort();
}

function generateRandomDates(count = 10) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 2);

  const msPerDay = 24 * 60 * 60 * 1000;
  const maxOffsetDays = Math.max(
    1,
    Math.floor((maxDate.getTime() - today.getTime()) / msPerDay),
  );

  const dateSet = new Set<string>();
  while (dateSet.size < Math.min(count, maxOffsetDays)) {
    const dayOffset = randomInt(1, maxOffsetDays);
    const candidate = new Date(today);
    candidate.setDate(candidate.getDate() + dayOffset);
    dateSet.add(toDateKey(candidate));
  }

  return [...dateSet].sort();
}

const SEED_CREATOR_EMAIL = "seed@example.com";

const seedPolls: PollInsert[] = pollTemplates.map(
  ({ dateCount, participantCount, spreadAvailability, ...poll }) => ({
    ...poll,
    slug: generateSlug(),
    adminToken: generateAdminToken(),
    creatorEmail: SEED_CREATOR_EMAIL,
    dates: generateRandomDates(dateCount),
  }),
);

/** Spread yes-counts evenly across the dates, from nobody to everybody. */
function spreadAvailabilities(
  pollDates: string[],
  participantIds: number[],
): AvailabilityInsert[] {
  const n = participantIds.length;
  const target = pollDates.map((_, i) =>
    n <= 1 ? n : Math.round((i / (pollDates.length - 1)) * n),
  );
  return participantIds.map((participantId, rank) => ({
    participantId,
    // Participant `rank` says yes to a date when its target yes-count is
    // greater than `rank` — so date 0 gets nobody, the last date gets all.
    dates: pollDates.filter((_, i) => target[i] > rank).sort(),
  }));
}

const seed = async () => {
  console.warn("Deleting existing data...");
  await db.delete(availabilitiesTable);
  await db.delete(participantsTable);
  await db.delete(pollsTable);
  console.log("Seeding ...");
  const newPolls = await db.insert(pollsTable).values(seedPolls).returning();

  for (const [index, poll] of newPolls.entries()) {
    const template = pollTemplates[index];
    const names = pickRandomNames(template?.participantCount);
    const participantObjects: ParticipantsInsert[] = names.map((name) => ({
      name: name,
      pollId: poll.id,
    }));
    const newParticipants = await db
      .insert(participantsTable)
      .values(participantObjects)
      .returning();

    let availabilityObjects: AvailabilityInsert[];
    if (template?.spreadAvailability) {
      // Everyone answers; yes-counts fan out evenly from 0% to 100%.
      availabilityObjects = spreadAvailabilities(
        poll.dates,
        newParticipants.map((p) => p.id),
      );
    } else {
      // Leave the last participant unanswered so the "waiting on someone"
      // state is visible without having to click around.
      availabilityObjects = newParticipants.slice(0, -1).map((participant) => ({
        participantId: participant.id,
        dates: pickRandomAvailableDates(poll.dates),
      }));
    }
    await db.insert(availabilitiesTable).values(availabilityObjects);
  }

  console.log(`Seeding done. "My polls" email: ${SEED_CREATOR_EMAIL}`);
  console.log("Open one of these polls:");
  for (const poll of newPolls) {
    console.log(`  ${poll.title} -> /polls/${poll.slug}`);
  }
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
