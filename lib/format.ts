/**
 * Timestamps come back from Drizzle as real `Date`s (the columns are
 * `timestamp_ms`), so these only have to worry about presentation.
 */

export function formatTimestamp(value: Date): string {
  return value.toLocaleDateString(undefined, {
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

/** "3 days ago", "just now" — friendlier than a date on a list of fresh polls. */
export function formatRelative(value: Date, now: Date = new Date()): string {
  const elapsed = value.getTime() - now.getTime();
  const absolute = Math.abs(elapsed);

  if (absolute < 60 * 1000) {
    return "just now";
  }

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (absolute >= ms) {
      return formatter.format(Math.round(elapsed / ms), unit);
    }
  }
  return "just now";
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
