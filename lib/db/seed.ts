import { db } from "./db";
import { pollsTable } from "./schema";

type Poll = typeof pollsTable.$inferInsert;

const seedPolls: Poll[] = [
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
  await db.insert(pollsTable).values(seedPolls);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
