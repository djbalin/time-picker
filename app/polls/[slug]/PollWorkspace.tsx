"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveAvailability } from "@/app/actions/polls";
import { CheckIcon, SpinnerIcon } from "@/components/icons";
import type { PollDetail, PollParticipant } from "@/lib/db/queries";
import { formatRelative, pluralize } from "@/lib/format";
import {
  getAdminToken,
  getIdentity,
  rememberPoll,
  setIdentity,
} from "@/lib/local-store";
import { summarizePoll } from "@/lib/poll-summary";
import { AvailabilityBoard } from "./AvailabilityBoard";
import { FinalizedBanner } from "./FinalizedBanner";
import { IdentityPicker } from "./IdentityPicker";
import { OwnerTools } from "./OwnerTools";
import { ResultsPanel } from "./ResultsPanel";
import { ShareCard } from "./ShareCard";

/** How long to sit on a toggle before writing it, so a burst becomes one save. */
const SAVE_DEBOUNCE_MS = 600;

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Owns the answering session for one poll.
 *
 * Server data stays authoritative for everyone except the person answering
 * right now: their toggles are layered on top locally and written in the
 * background, so the grid never waits on a round-trip.
 */
export function PollWorkspace({ poll }: { poll: PollDetail }) {
  const [currentId, setCurrentId] = useState<number | null>(null);
  /** Blocks the identify screen until localStorage has been consulted. */
  const [identityChecked, setIdentityChecked] = useState(false);
  const [adminToken, setAdminTokenState] = useState<string | null>(null);
  /** The answering user's edits; null means "no local edits, use the server's". */
  const [localAnswer, setLocalAnswer] = useState<string[] | null>(null);
  /** People added this session, until the server list catches up. */
  const [addedParticipants, setAddedParticipants] = useState<PollParticipant[]>(
    [],
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const participants = useMemo(() => {
    const known = new Set(poll.participants.map((person) => person.id));
    return [
      ...poll.participants,
      ...addedParticipants.filter((person) => !known.has(person.id)),
    ];
  }, [poll.participants, addedParticipants]);

  const availability = useMemo(() => {
    if (currentId === null || localAnswer === null) return poll.availability;
    return { ...poll.availability, [currentId]: localAnswer };
  }, [poll.availability, currentId, localAnswer]);

  const respondedIds = useMemo(() => {
    const ids = new Set(
      participants.filter((person) => person.hasResponded).map((p) => p.id),
    );
    if (currentId !== null && localAnswer !== null) ids.add(currentId);
    return ids;
  }, [participants, currentId, localAnswer]);

  const summary = useMemo(
    () =>
      summarizePoll({
        dates: poll.dates,
        participants,
        availability,
        respondedIds,
      }),
    [poll.dates, participants, availability, respondedIds],
  );

  const current =
    participants.find((person) => person.id === currentId) ?? null;
  const { save, flush } = useDebouncedSave({
    slug: poll.slug,
    onStateChange: setSaveState,
    onError: setSaveError,
  });

  useEffect(() => {
    rememberPoll(poll.slug, poll.title);
    setAdminTokenState(getAdminToken(poll.slug));
  }, [poll.slug, poll.title]);

  // Resolve the remembered identity once the participant list is known, so a
  // stale id (their row was deleted) falls back to the picker instead of
  // leaving the page stuck on nobody.
  useEffect(() => {
    const remembered = getIdentity(poll.slug);
    const stillExists =
      remembered !== null &&
      poll.participants.some((person) => person.id === remembered);
    if (stillExists) setCurrentId(remembered);
    setIdentityChecked(true);
  }, [poll.slug, poll.participants]);

  const chooseIdentity = useCallback(
    (participantId: number) => {
      flush();
      setIdentity(poll.slug, participantId);
      setLocalAnswer(null);
      setSaveState("idle");
      setSaveError(null);
      setCurrentId(participantId);
    },
    [poll.slug, flush],
  );

  const handleJoined = useCallback(
    (participant: PollParticipant) => {
      setAddedParticipants((previous) => [...previous, participant]);
      chooseIdentity(participant.id);
    },
    [chooseIdentity],
  );

  const setAnswer = useCallback(
    (dates: string[]) => {
      if (currentId === null) return;
      setLocalAnswer(dates);
      save(currentId, dates);
    },
    [currentId, save],
  );

  const myAnswer = currentId === null ? [] : (availability[currentId] ?? []);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {poll.title}
        </h1>
        {poll.description && (
          <p className="mt-1 text-sm font-semibold text-slate">
            {poll.description}
          </p>
        )}
        <p className="mt-2 text-xs font-bold text-mist">
          {poll.dates.length} {pluralize(poll.dates.length, "date")} proposed ·{" "}
          {summary.respondedCount} of {summary.totalCount} answered · updated{" "}
          {formatRelative(poll.updatedAt)}
        </p>
      </header>

      {poll.finalizedDate && <FinalizedBanner date={poll.finalizedDate} />}

      <ShareCard slug={poll.slug} />

      {poll.dates.length === 0 ? (
        <EmptyPoll />
      ) : !identityChecked ? (
        <LoadingCard />
      ) : current === null ? (
        <IdentityPicker
          slug={poll.slug}
          participants={participants}
          onSelect={chooseIdentity}
          onJoined={handleJoined}
        />
      ) : (
        <AvailabilityBoard
          summary={summary}
          current={current}
          participants={participants}
          myAnswer={myAnswer}
          onChange={setAnswer}
          onSwitchIdentity={() => {
            flush();
            setCurrentId(null);
          }}
          saveState={saveState}
          saveError={saveError}
        />
      )}

      {poll.dates.length > 0 && (
        <ResultsPanel
          summary={summary}
          finalizedDate={poll.finalizedDate}
          slug={poll.slug}
          adminToken={adminToken}
        />
      )}

      {adminToken && (
        <OwnerTools
          slug={poll.slug}
          adminToken={adminToken}
          title={poll.title}
          finalizedDate={poll.finalizedDate}
        />
      )}
    </div>
  );
}

/**
 * Collapses a burst of toggles into one write. The pending payload lives in a
 * ref so that leaving the page mid-debounce still sends it rather than
 * silently dropping the answer.
 */
function useDebouncedSave({
  slug,
  onStateChange,
  onError,
}: {
  slug: string;
  onStateChange: (state: SaveState) => void;
  onError: (message: string | null) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ participantId: number; dates: string[] } | null>(
    null,
  );

  const send = useCallback(async () => {
    const payload = pending.current;
    if (!payload) return;
    pending.current = null;

    const result = await saveAvailability(
      slug,
      payload.participantId,
      payload.dates,
    );

    if (result.ok) {
      onStateChange("saved");
      onError(null);
    } else {
      onStateChange("error");
      onError(result.message);
    }
  }, [slug, onStateChange, onError]);

  const save = useCallback(
    (participantId: number, dates: string[]) => {
      pending.current = { participantId, dates };
      onStateChange("saving");
      onError(null);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        void send();
      }, SAVE_DEBOUNCE_MS);
    },
    [send, onStateChange, onError],
  );

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    void send();
  }, [send]);

  useEffect(
    () => () => {
      // Unmounting: fire the outstanding write without awaiting it. The
      // request outlives this component, which is exactly what we want.
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
        void send();
      }
    },
    [send],
  );

  return { save, flush };
}

export function SaveIndicator({
  state,
  error,
}: {
  state: SaveState;
  error: string | null;
}) {
  if (state === "idle") return null;

  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-red-deep">
        {error ?? "Couldn't save."}
      </span>
    );
  }

  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-mist">
        <SpinnerIcon className="h-3.5 w-3.5" />
        Saving…
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-green-deep">
      <CheckIcon className="h-3.5 w-3.5" />
      Saved
    </span>
  );
}

function EmptyPoll() {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center">
      <p className="font-display text-lg font-semibold text-ink">
        No dates yet
      </p>
      <p className="mt-2 text-sm font-semibold text-slate">
        Whoever created this poll hasn't proposed any dates.
      </p>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-lg border border-line bg-white p-10 text-center text-sm font-bold text-mist shadow-soft">
      <SpinnerIcon className="mx-auto mb-2 h-5 w-5" />
      Loading your answers…
    </div>
  );
}
