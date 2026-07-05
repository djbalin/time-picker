import { db } from "./db";
import { pollsTable } from "./schema";

type PollInsert = typeof pollsTable.$inferInsert;

const seedPolls: PollInsert[] = [
  {
    description: "Hvornår skal vi spille The Band?",
    title: "EL GRUPO",
  },
  {
    title: "Sapph Honey Langeland",
    description: "Vi skal have en weekend til Langeland",
  },
];

const seed = async () => {
  // await db.delete(pollsTable);
  console.log("Seeding ...");
  await db.insert(pollsTable).values(seedPolls);
  console.log("Seeding done");
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
