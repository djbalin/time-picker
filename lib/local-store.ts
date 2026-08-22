/**
 * The app has no accounts, so the browser is the only place that knows who you
 * are and which polls are yours. Every access is guarded: storage throws
 * outright in some privacy modes, and a failure here must never take a page
 * down with it.
 *
 * Callers must only reach these from effects or event handlers — reading
 * during render would make the server and client markup disagree.
 */

const KNOWN_POLLS_KEY = "time-picker:polls";
const identityKey = (slug: string) => `time-picker:identity:${slug}`;
const adminKey = (slug: string) => `time-picker:admin:${slug}`;

export type KnownPoll = {
  slug: string;
  title: string;
  /** Epoch ms of the last visit, newest first in `getKnownPolls`. */
  seenAt: number;
};

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Full or blocked storage — the app still works, it just forgets.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to do; see `write`.
  }
}

export function getKnownPolls(): KnownPoll[] {
  const raw = read(KNOWN_POLLS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is KnownPoll =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as KnownPoll).slug === "string" &&
          typeof (entry as KnownPoll).title === "string" &&
          typeof (entry as KnownPoll).seenAt === "number",
      )
      .sort((a, b) => b.seenAt - a.seenAt);
  } catch {
    return [];
  }
}

/** Records a visit, moving the poll to the top of the list. */
export function rememberPoll(slug: string, title: string): void {
  const others = getKnownPolls().filter((poll) => poll.slug !== slug);
  const next: KnownPoll[] = [{ slug, title, seenAt: Date.now() }, ...others];
  write(KNOWN_POLLS_KEY, JSON.stringify(next.slice(0, 100)));
}

export function forgetPoll(slug: string): void {
  const next = getKnownPolls().filter((poll) => poll.slug !== slug);
  write(KNOWN_POLLS_KEY, JSON.stringify(next));
  remove(identityKey(slug));
  remove(adminKey(slug));
}

export function getIdentity(slug: string): number | null {
  const raw = read(identityKey(slug));
  if (!raw) return null;
  const participantId = Number.parseInt(raw, 10);
  return Number.isInteger(participantId) ? participantId : null;
}

export function setIdentity(slug: string, participantId: number): void {
  write(identityKey(slug), String(participantId));
}

export function clearIdentity(slug: string): void {
  remove(identityKey(slug));
}

/** Present only on the device that created the poll. */
export function getAdminToken(slug: string): string | null {
  return read(adminKey(slug));
}

export function setAdminToken(slug: string, token: string): void {
  write(adminKey(slug), token);
}
