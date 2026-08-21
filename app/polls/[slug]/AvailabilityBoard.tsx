"use client";

import { useMemo } from "react";
import { CheckIcon } from "@/components/icons";
import { formatDateKey, formatMonthLabel } from "@/lib/date-keys";
import type { PollParticipant } from "@/lib/db/queries";
import { participantColor } from "@/lib/participant-colors";
import type { DateSummary, PollSummary } from "@/lib/poll-summary";
import { buttonClass } from "@/lib/ui";
import { SaveIndicator, type SaveState } from "./PollWorkspace";

/** Avatars shown per row before collapsing the rest into "+n". */
const MAX_AVATARS = 5;

/**
 * The answering surface: one row per proposed date, grouped by month.
 *
 * Deliberately not a participant-per-column table — that runs off the side of
 * a phone as soon as a poll has more than three or four people. Here the row
 * is the user's own toggle, and everyone else's answers ride along as a
 * compact tally.
 */
export function AvailabilityBoard({
  summary,
  current,
  participants,
  myAnswer,
  onChange,
  onSwitchIdentity,
  saveState,
  saveError,
}: {
  summary: PollSummary;
  current: PollParticipant;
  participants: PollParticipant[];
  myAnswer: string[];
  onChange: (dates: string[]) => void;
  onSwitchIdentity: () => void;
  saveState: SaveState;
  saveError: string | null;
}) {
  // Colour is assigned by position in the poll's participant list, so the same
  // person keeps the same colour on every screen.
  const colorIndex = useMemo(
    () =>
      new Map(participants.map((person, index) => [person.id, index] as const)),
    [participants],
  );

  const months = useMemo(() => groupByMonth(summary.byDate), [summary.byDate]);
  const selected = new Set(myAnswer);
  const allDates = summary.byDate.map((day) => day.date);
  const currentColor = participantColor(colorIndex.get(current.id) ?? 0);

  function toggle(date: string) {
    const next = selected.has(date)
      ? myAnswer.filter((value) => value !== date)
      : [...myAnswer, date].sort();
    onChange(next);
  }

  return (
    <section className="rounded-lg border border-line bg-white shadow-soft">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate">Answering as</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-extrabold ${currentColor.bg} ${currentColor.text}`}
          >
            {current.name}
          </span>
          <button
            type="button"
            onClick={onSwitchIdentity}
            className="text-xs font-extrabold text-mist underline-offset-2 transition hover:text-ink hover:underline"
          >
            Not you?
          </button>
        </div>
        <SaveIndicator state={saveState} error={saveError} />
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-5 py-3 sm:px-6">
        <p className="text-xs font-extrabold uppercase tracking-wide text-slate">
          Tick every date you can make
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(allDates)}
            disabled={myAnswer.length === allDates.length}
            className={buttonClass({ variant: "quiet", size: "sm" })}
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={myAnswer.length === 0}
            className={buttonClass({ variant: "quiet", size: "sm" })}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="px-2 pb-3 sm:px-3">
        {months.map((month) => (
          <div key={month.label}>
            <h3 className="px-3 pt-4 pb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-mist">
              {month.label}
            </h3>
            <ul>
              {month.days.map((day) => (
                <DateRow
                  key={day.date}
                  day={day}
                  checked={selected.has(day.date)}
                  onToggle={() => toggle(day.date)}
                  colorIndex={colorIndex}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function DateRow({
  day,
  checked,
  onToggle,
  colorIndex,
}: {
  day: DateSummary;
  checked: boolean;
  onToggle: () => void;
  colorIndex: Map<number, number>;
}) {
  const overflow = day.available.length - MAX_AVATARS;

  return (
    <li>
      <label
        className={`group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-cloud ${
          day.worksForEveryone ? "bg-green-tint/50 hover:bg-green-tint" : ""
        }`}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={onToggle}
        />
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-sky peer-focus-visible:ring-offset-1 ${
            checked
              ? "border-sky bg-sky"
              : "border-line bg-white group-hover:border-sky"
          }`}
        >
          <CheckIcon
            className={`h-4 w-4 text-white transition-opacity ${
              checked ? "opacity-100" : "opacity-0"
            }`}
          />
        </span>

        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold text-ink">
            {formatDateKey(day.date)}
          </span>
          {day.worksForEveryone ? (
            <span className="rounded-full bg-green-deep px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
              Everyone
            </span>
          ) : (
            day.isTop && (
              <span className="rounded-full bg-sky-tint px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-sky-deep">
                Best so far
              </span>
            )
          )}
        </span>

        <span className="flex shrink-0 items-center -space-x-1.5">
          {day.available.slice(0, MAX_AVATARS).map((person) => {
            const { bg, text } = participantColor(
              colorIndex.get(person.id) ?? 0,
            );
            return (
              <span
                key={person.id}
                title={person.name}
                className={`grid h-6 w-6 place-items-center rounded-full border-2 border-white text-[10px] font-extrabold ${bg} ${text}`}
              >
                {person.name.charAt(0).toUpperCase()}
              </span>
            );
          })}
          {overflow > 0 && (
            <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-cloud text-[10px] font-extrabold text-slate">
              +{overflow}
            </span>
          )}
        </span>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums ${
            day.worksForEveryone
              ? "bg-green-deep text-white"
              : day.isTop
                ? "bg-sky-tint text-sky-deep"
                : "bg-cloud text-slate"
          }`}
        >
          {day.yesCount}/{day.totalCount}
        </span>
      </label>
    </li>
  );
}

function groupByMonth(days: DateSummary[]) {
  const groups: { label: string; days: DateSummary[] }[] = [];
  for (const day of days) {
    const label = formatMonthLabel(day.date);
    const last = groups.at(-1);
    if (last && last.label === label) {
      last.days.push(day);
    } else {
      groups.push({ label, days: [day] });
    }
  }
  return groups;
}
