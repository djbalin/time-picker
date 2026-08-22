/**
 * Unguessable identifiers. Poll URLs are the only access control this app has,
 * so both values come from the CSPRNG rather than SQLite's `randomblob`.
 */

/** Lowercase base32-ish, minus 0/1/i/l/o so slugs survive being read aloud. */
const SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/** ~50 bits of entropy — plenty for a link that is shared, not enumerated. */
export function generateSlug(length = 10): string {
  let slug = "";
  for (const byte of randomBytes(length)) {
    slug += SLUG_ALPHABET[byte % SLUG_ALPHABET.length];
  }
  return slug;
}

/**
 * Proves "I created this poll" for destructive actions. Handed to the creator
 * once and never included in a poll read, so responders can't delete or
 * finalize a poll they were merely invited to.
 */
export function generateAdminToken(): string {
  return Array.from(randomBytes(16), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
