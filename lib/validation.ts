import { z } from "zod";
import { isDateKey } from "./date-keys";

export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_NAME_LENGTH = 60;
export const MAX_DATES = 180;
export const MAX_PARTICIPANTS = 60;

const dateKeySchema = z
  .string()
  .refine(isDateKey, "That doesn't look like a valid date.");

export const participantNameSchema = z
  .string()
  .trim()
  .min(1, "Enter a name.")
  .max(MAX_NAME_LENGTH, `Keep names under ${MAX_NAME_LENGTH} characters.`);

/** Used both when creating a poll and when looking up "my polls" by email. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

export const createPollSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give your poll a title.")
    .max(
      MAX_TITLE_LENGTH,
      `Keep the title under ${MAX_TITLE_LENGTH} characters.`,
    ),
  description: z
    .string()
    .trim()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Keep the description under ${MAX_DESCRIPTION_LENGTH} characters.`,
    )
    .default(""),
  creatorEmail: emailSchema,
  dates: z
    .array(dateKeySchema)
    .min(1, "Pick at least one date.")
    .max(
      MAX_DATES,
      `That's more than ${MAX_DATES} dates — try narrowing it down.`,
    ),
  participants: z
    .array(participantNameSchema)
    .min(1, "Add at least one person.")
    .max(MAX_PARTICIPANTS, `Polls are capped at ${MAX_PARTICIPANTS} people.`),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type CreatePollFieldErrors = Partial<
  Record<keyof CreatePollInput, string>
>;

/** Collapses Zod's per-field arrays into the one message the form renders. */
export function firstFieldErrors(
  error: z.ZodError<CreatePollInput>,
): CreatePollFieldErrors {
  const { fieldErrors } = z.flattenError(error);
  return {
    title: fieldErrors.title?.[0],
    description: fieldErrors.description?.[0],
    creatorEmail: fieldErrors.creatorEmail?.[0],
    dates: fieldErrors.dates?.[0],
    participants: fieldErrors.participants?.[0],
  };
}

/**
 * Two people picking "Freja" off the identify screen would answer as each
 * other, so names are unique per poll. Compared case-insensitively; the first
 * spelling entered is the one kept.
 */
export function dedupeNames(names: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of names) {
    const trimmed = name.trim();
    const key = trimmed.toLocaleLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    unique.push(trimmed);
  }
  return unique;
}

export function nameIsTaken(name: string, existing: string[]): boolean {
  const key = name.trim().toLocaleLowerCase();
  return existing.some((other) => other.trim().toLocaleLowerCase() === key);
}

/** Sorted, de-duplicated, and stripped of anything that isn't a date key. */
export function normalizeDateKeys(values: unknown[]): string[] {
  return [...new Set(values.filter(isDateKey))].sort();
}
