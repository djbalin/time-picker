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

const pollTemplates: Pick<PollInsert, "title" | "description">[] = [
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
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomNames() {
  const shuffled = [...danishNames].sort(() => Math.random() - 0.5);
  const count = randomInt(3, 6);
  return shuffled.slice(0, count);
}

function pickRandomAvailableDates(pollDates: string[]) {
  const shuffled = [...pollDates].sort(() => Math.random() - 0.5);
  const count = randomInt(1, pollDates.length);
  return shuffled.slice(0, count).sort();
}

function generateRandomDates() {
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
  while (dateSet.size < 10) {
    const dayOffset = randomInt(1, maxOffsetDays);
    const candidate = new Date(today);
    candidate.setDate(candidate.getDate() + dayOffset);
    dateSet.add(toDateKey(candidate));
  }

  return [...dateSet].sort();
}

const SEED_CREATOR_EMAIL = "seed@example.com";

const seedPolls: PollInsert[] = pollTemplates.map((poll) => ({
  ...poll,
  slug: generateSlug(),
  adminToken: generateAdminToken(),
  creatorEmail: SEED_CREATOR_EMAIL,
  dates: generateRandomDates(),
}));

const seed = async () => {
  console.warn("Deleting existing data...");
  await db.delete(availabilitiesTable);
  await db.delete(participantsTable);
  await db.delete(pollsTable);
  console.log("Seeding ...");
  const newPolls = await db.insert(pollsTable).values(seedPolls).returning();

  for (const poll of newPolls) {
    const randomNames = pickRandomNames();
    const participantObjects: ParticipantsInsert[] = randomNames.map(
      (name) => ({
        name: name,
        pollId: poll.id,
      }),
    );
    const newParticipants = await db
      .insert(participantsTable)
      .values(participantObjects)
      .returning();

    // Leave the last participant unanswered so the "waiting on someone"
    // state is visible without having to click around.
    const responders = newParticipants.slice(0, -1);
    const availabilityObjects: AvailabilityInsert[] = responders.map(
      (participant) => ({
        participantId: participant.id,
        dates: pickRandomAvailableDates(poll.dates),
      }),
    );
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
