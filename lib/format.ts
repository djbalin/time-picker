/**
 * Timestamps come back from Drizzle as real `Date`s (the columns are
 * `timestamp_ms`), so these only have to worry about presentation.
 */

export function formatTimestamp(value: Date, locale: string): string {
  return value.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/**
 * "3 days ago", "just now" — friendlier than a date on a list of fresh
 * polls. Takes the app's current locale explicitly — see the note in
 * `lib/date-keys.ts` for why `undefined` isn't used here.
 */
export function formatRelative(
  value: Date,
  locale: string,
  now: Date = new Date(),
): string {
  const elapsed = value.getTime() - now.getTime();
  const absolute = Math.abs(elapsed);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absolute < 60 * 1000) {
    return formatter.format(0, "second");
  }

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (absolute >= ms) {
      return formatter.format(Math.round(elapsed / ms), unit);
    }
  }
  return formatter.format(0, "second");
}
