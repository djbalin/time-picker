/**
 * Poll dates are calendar days, not instants, so they travel as "YYYY-MM-DD"
 * strings and are only ever turned into a `Date` at local midnight. Going
 * through `new Date("2026-08-25")` instead would parse as UTC and render as
 * the previous day for anyone west of Greenwich.
 */

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Local midnight on that calendar day. */
export function fromDateKey(key: string): Date {
  return new Date(`${key}T00:00:00`);
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_KEY_PATTERN.test(value)) {
    return false;
  }
  const parsed = fromDateKey(value);
  // Rejects real-looking-but-invalid days such as "2026-02-31", which JS
  // would otherwise roll forward into March.
  return !Number.isNaN(parsed.getTime()) && toDateKey(parsed) === value;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function isPastDateKey(key: string): boolean {
  return fromDateKey(key) < startOfToday();
}

export function formatDateKey(key: string): string {
  return fromDateKey(key).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateKeyLong(key: string): string {
  return fromDateKey(key).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "Sep 2026" — used to group a long date list into month sections. */
export function formatMonthLabel(key: string): string {
  return fromDateKey(key).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}
