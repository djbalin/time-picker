import { db } from "./db";
import { pollsTable } from "./schema";

type PollInsert = typeof pollsTable.$inferInsert;

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

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomNames() {
  const shuffled = [...danishNames].sort(() => Math.random() - 0.5);
  const count = randomInt(3, 6);
  return shuffled.slice(0, count);
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

const seedPolls: PollInsert[] = pollTemplates.map((poll) => ({
  ...poll,
  dates: generateRandomDates(),
  participants: pickRandomNames(),
}));

const seed = async () => {
  console.warn("Deleting polls table...");
  await db.delete(pollsTable);
  console.log("Seeding ...");
  await db.insert(pollsTable).values(seedPolls);
  console.log("Seeding done");
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
