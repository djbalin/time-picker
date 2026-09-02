/**
 * Per-poll secrets the browser holds because there are no accounts yet: which
 * participant you answered as, and (on the creating device) the admin token.
 * Every access is guarded: storage throws outright in some privacy modes, and
 * a failure here must never take a page down with it.
 *
 * Callers must only reach these from effects or event handlers — reading
 * during render would make the server and client markup disagree.
 */

const identityKey = (slug: string) => `time-picker:identity:${slug}`;
const adminKey = (slug: string) => `time-picker:admin:${slug}`;

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

/** Wipes everything this device remembered about a poll, e.g. after deleting it. */
export function forgetPoll(slug: string): void {
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
