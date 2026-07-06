/**
 * `createdAt`/`updatedAt` are typed as integers in the Drizzle schema, but
 * their SQLite `CURRENT_TIMESTAMP` default actually stores a UTC
 * "YYYY-MM-DD HH:MM:SS" string (SQLite's flexible typing lets it through).
 * Accept both that string form and real epoch seconds.
 */
export function parseSqlTimestamp(value: number | string): Date {
  if (typeof value === "number") {
    return new Date(value * 1000);
  }
  return new Date(`${value.replace(" ", "T")}Z`);
}

export function formatTimestamp(value: number | string): string {
  return parseSqlTimestamp(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Poll candidate dates are "YYYY-MM-DD" keys (pollsTable.dates). */
export function formatDateKey(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
