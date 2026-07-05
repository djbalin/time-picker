import { drizzle } from "drizzle-orm/libsql";
import { pollsTable } from "./schema";

const url = process.env.DATABASE_URL ?? "file:./db.sqlite";
const authToken = process.env.DATABASE_AUTH_TOKEN;

export const db = drizzle({
  connection: {
    url,
    ...(authToken ? { authToken } : {}),
  },
});
