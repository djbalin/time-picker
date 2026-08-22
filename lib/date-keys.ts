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

/**
 * Every formatter below takes the app's current locale explicitly — get it
 * from `useLocale()` (client components) or `getLocale()` (server
 * components), both from `next-intl`. `toLocaleDateString(undefined, ...)`
 * would instead follow the visitor's OS/browser locale, which usually
 * matches the page language but can silently disagree with it.
 */

export function formatDateKey(key: string, locale: string): string {
  return fromDateKey(key).toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Full weekday name — "Sunday" — for the grid's fixed-width day column. */
export function formatWeekdayLong(key: string, locale: string): string {
  const weekDay = fromDateKey(key).toLocaleDateString(locale, {
    weekday: "long",
  });
  // Capitalize first letter
  return weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
}

/** "MM/DD", zero-padded, for the grid's fixed-width date column. */
export function formatDateShort(key: string): string {
  const [, month, day] = key.split("-");
  return `${month}/${day}`;
}

export function formatDateKeyLong(key: string, locale: string): string {
  return fromDateKey(key).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
