"use client";
import { type KeyboardEvent, type SVGProps, useState } from "react";
import { formatDateKey } from "@/lib/format";
import { participantColor } from "@/lib/participant-colors";

/**
 * Data shapes this flow expects (align backend to these):
 * - `dates`: the poll's candidate dates as "YYYY-MM-DD" keys, matching
 *   `pollsTable.dates`.
 * - Participant: `{ id: number; name: string }`, matching
 *   `participantsTable` rows for this poll.
 * - Availability: `Record<participantId, string[]>` — each entry is the
 *   list of date keys that participant can attend, i.e. one
 *   `availabilitiesTable` row (`dates` column) per participant.
 */
export type ResponseParticipant = {
  id: number;
  name: string;
};

export type AvailabilityByParticipant = Record<number, string[]>;

// TODO(backend): replace with the poll's real participants, e.g.
// getParticipantsByPollId(pollId) -> { id: number; name: string }[].
const MOCK_PARTICIPANTS: ResponseParticipant[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Cleo" },
];

// TODO(backend): seed from the poll's real availabilities (one
// availabilitiesTable row per participant: { participantId, dates }).
// Deterministic mock so SSR and client render identically.
function seedMockAvailability(
  participants: ResponseParticipant[],
  dates: string[],
): AvailabilityByParticipant {
  const seeded: AvailabilityByParticipant = {};
  participants.forEach((participant, i) => {
    seeded[participant.id] = dates.filter((_, j) => (i + j) % 3 !== 0);
  });
  return seeded;
}

// TODO(storage): check whether this device already answered this poll
// (e.g. read localStorage key `poll-response:${pollId}` -> participant id)
// and return it so revisits skip the identify screen. Returns null for now.
function getRememberedParticipantId(_pollId: number): number | null {
  return null;
}

// TODO(storage): remember the confirmed identity for this poll on this
// device (e.g. write `poll-response:${pollId}` = participantId). No-op.
function rememberParticipant(_pollId: number, _participantId: number): void {}

// TODO(backend): create the participant on the server
// (INSERT into participantsTable { pollId, name } -> { id, name }).
// Local stand-in mints a temporary client-side id.
function createParticipantPlaceholder(
  name: string,
  existing: ResponseParticipant[],
): ResponseParticipant {
  const nextId = Math.max(0, ...existing.map((p) => p.id)) + 1;
  return { id: nextId, name };
}

// TODO(backend): persist the participant's availability
// (UPSERT availabilitiesTable { participantId, dates: string[] }). No-op.
function saveAvailabilityPlaceholder(
  _participantId: number,
  _dates: string[],
): void {}

export function ResponseFlow({
  pollId,
  dates,
}: {
  pollId: number;
  dates: string[];
}) {
  const [participants, setParticipants] =
    useState<ResponseParticipant[]>(MOCK_PARTICIPANTS);
  const [availability, setAvailability] = useState<AvailabilityByParticipant>(
    () => seedMockAvailability(MOCK_PARTICIPANTS, dates),
  );
  const [currentId, setCurrentId] = useState<number | null>(() =>
    getRememberedParticipantId(pollId),
  );

  function confirmIdentity(participantId: number) {
    rememberParticipant(pollId, participantId);
    setCurrentId(participantId);
  }

  function addParticipant(name: string) {
    const created = createParticipantPlaceholder(name, participants);
    setParticipants((prev) => [...prev, created]);
    setAvailability((prev) => ({ ...prev, [created.id]: [] }));
    confirmIdentity(created.id);
  }

  function toggleDate(dateKey: string) {
    if (currentId === null) return;
    setAvailability((prev) => {
      const mine = prev[currentId] ?? [];
      const next = mine.includes(dateKey)
        ? mine.filter((d) => d !== dateKey)
        : [...mine, dateKey];
      saveAvailabilityPlaceholder(currentId, next);
      return { ...prev, [currentId]: next };
    });
  }

  if (dates.length === 0) {
    return (
      <p className="mt-2 text-sm font-semibold text-slate">
        No dates have been proposed for this poll yet.
      </p>
    );
  }

  const current = participants.find((p) => p.id === currentId);

  if (!current) {
    return (
      <IdentifyScreen
        participants={participants}
        onSelect={confirmIdentity}
        onAdd={addParticipant}
      />
    );
  }

  return (
    <AvailabilityGrid
      dates={dates}
      participants={participants}
      availability={availability}
      current={current}
      onToggle={toggleDate}
      onChangeIdentity={() => setCurrentId(null)}
    />
  );
}

function IdentifyScreen({
  participants,
  onSelect,
  onAdd,
}: {
  participants: ResponseParticipant[];
  onSelect: (participantId: number) => void;
  onAdd: (name: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const trimmed = draft.trim();

  function commit() {
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft("");
    setAdding(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setDraft("");
      setAdding(false);
    }
  }

  return (
    <div>
      <h3 className="font-display text-base font-semibold text-ink">
        Which one are you?
      </h3>
      <p className="mt-1 text-sm font-semibold text-slate">
        Pick your name to fill in your availability.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {participants.map((participant, i) => {
          const { bg, text } = participantColor(i);
          return (
            <button
              key={participant.id}
              type="button"
              onClick={() => onSelect(participant.id)}
              className="flex flex-col items-center gap-3 rounded-lg border border-line bg-white p-5 shadow-soft transition hover:border-sky hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
            >
              <span
                className={`grid h-12 w-12 place-items-center rounded-full text-lg font-extrabold ${bg} ${text}`}
              >
                {participant.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-extrabold text-ink">
                {participant.name}
              </span>
            </button>
          );
        })}

        {adding ? (
          <div className="col-span-2 flex flex-col justify-center gap-2 rounded-lg border border-sky bg-sky-tint/40 p-4 sm:col-span-3">
            <label
              className="text-xs font-extrabold text-slate"
              htmlFor="new-participant-name"
            >
              Your name
            </label>
            <div className="flex gap-2">
              <input
                // biome-ignore lint/a11y/noAutofocus: the card just expanded at the user's request
                autoFocus
                id="new-participant-name"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Freja"
                className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-ink placeholder:font-semibold placeholder:text-mist focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky-tint"
              />
              <button
                type="button"
                onClick={commit}
                disabled={!trimmed}
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-extrabold text-paper shadow-raised transition hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-40"
              >
                That's me
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line bg-paper p-5 transition hover:border-sky hover:bg-sky-tint/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-cloud text-slate">
              <PlusIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-extrabold text-slate">
              Add myself
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function AvailabilityGrid({
  dates,
  participants,
  availability,
  current,
  onToggle,
  onChangeIdentity,
}: {
  dates: string[];
  participants: ResponseParticipant[];
  availability: AvailabilityByParticipant;
  current: ResponseParticipant;
  onToggle: (dateKey: string) => void;
  onChangeIdentity: () => void;
}) {
  const currentColor = participantColor(
    participants.findIndex((p) => p.id === current.id),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate">
          Answering as{" "}
          <span
            className={`rounded-full px-3 py-1 text-xs font-extrabold ${currentColor.bg} ${currentColor.text}`}
          >
            {current.name}
          </span>
        </p>
        <button
          type="button"
          onClick={onChangeIdentity}
          className="text-sm font-extrabold text-slate underline-offset-2 transition hover:text-ink hover:underline"
        >
          Not you? Switch person
        </button>
      </div>

      <div className="mt-4 w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Availability per participant for each proposed date. Only your own
            column can be edited.
          </caption>
          <thead>
            <tr className="border-b border-line">
              <th
                scope="col"
                className="py-3 pr-4 text-left text-xs font-extrabold uppercase tracking-wide text-mist"
              >
                Date
              </th>
              {participants.map((participant, i) => {
                const isCurrent = participant.id === current.id;
                const { bg, text } = participantColor(i);
                return (
                  <th
                    key={participant.id}
                    scope="col"
                    aria-disabled={!isCurrent}
                    className={`px-2 py-3 text-center text-xs font-extrabold ${
                      isCurrent
                        ? "border-x-2 border-t-2 border-sky/50 bg-sky-tint/50"
                        : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {!isCurrent && (
                        <LockIcon
                          className="h-3.5 w-3.5 text-mist"
                          aria-label="locked"
                        />
                      )}
                      <span
                        className={`rounded-full px-2.5 py-1 ${bg} ${text} ${
                          isCurrent ? "" : "opacity-70"
                        }`}
                      >
                        {participant.name}
                        {isCurrent && " (you)"}
                      </span>
                    </span>
                  </th>
                );
              })}
              <th scope="col" className="sr-only">
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {dates.map((dateKey) => {
              const availableCount = participants.filter((p) =>
                (availability[p.id] ?? []).includes(dateKey),
              ).length;
              const state = availabilityState(
                availableCount,
                participants.length,
              );
              return (
                <tr
                  key={dateKey}
                  className={`border-b border-line ${state.row}`}
                >
                  <th
                    scope="row"
                    className="py-2.5 pr-4 pl-2 text-left text-sm font-semibold text-ink"
                  >
                    {formatDateKey(dateKey)}
                  </th>
                  {participants.map((participant) => {
                    const isCurrent = participant.id === current.id;
                    const checked = (
                      availability[participant.id] ?? []
                    ).includes(dateKey);
                    return (
                      <td
                        key={participant.id}
                        className={`px-2 py-2.5 text-center ${
                          isCurrent
                            ? "border-x-2 border-sky/30 bg-sky-tint/30"
                            : ""
                        }`}
                      >
                        <AvailabilityCell
                          checked={checked}
                          locked={!isCurrent}
                          label={
                            isCurrent
                              ? `Your availability for ${formatDateKey(dateKey)}`
                              : `${participant.name}'s availability for ${formatDateKey(dateKey)} (read-only)`
                          }
                          onToggle={() => onToggle(dateKey)}
                        />
                      </td>
                    );
                  })}
                  <td
                    className={`px-3 py-2.5 text-center text-base font-black tabular-nums ${state.countCell}`}
                  >
                    {availableCount}/{participants.length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AvailabilityCell({
  checked,
  locked,
  label,
  onToggle,
}: {
  checked: boolean;
  locked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <label
      className={`inline-flex p-1 ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        aria-label={label}
        aria-disabled={locked}
        tabIndex={locked ? -1 : 0}
        onChange={() => {
          if (!locked) onToggle();
        }}
      />
      <span
        className={`grid h-7 w-7 place-items-center rounded-md border-2 transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-sky peer-focus-visible:ring-offset-1 ${
          locked
            ? checked
              ? "border-silver bg-silver"
              : "border-line bg-cloud"
            : checked
              ? "border-sky bg-sky hover:scale-110 hover:bg-sky-light"
              : "border-line bg-white hover:scale-110 hover:border-sky"
        }`}
      >
        <CheckIcon
          className={`h-4 w-4 text-white transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
        />
      </span>
    </label>
  );
}

/**
 * Row color by how close the date is to working for everyone:
 * all available = green, one short = orange, two or more short = red.
 * Muted tint backgrounds so the grid stays calm.
 */
function availabilityState(count: number, total: number) {
  if (total > 0 && count === total) {
    return {
      row: "bg-green-tint/40",
      countCell: "bg-green-600 text-white",
    };
  }
  if (count === total - 1) {
    return {
      row: "bg-orange-tint/40",
      countCell: "bg-orange-200 text-slate-700",
    };
  }
  return {
    row: "bg-red-tint/40",
    countCell: "bg-red-400 text-slate-700",
  };
}

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 5v14M5 12h14"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M5 13l4 4L19 7"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      role="img"
      {...props}
    >
      <title>Locked</title>
      <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 118 0v4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
