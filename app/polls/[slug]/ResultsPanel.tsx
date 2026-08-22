"use client";

import { useState, useTransition } from "react";
import { finalizePoll } from "@/app/actions/polls";
import { SpinnerIcon, TrophyIcon } from "@/components/icons";
import { formatDateKeyLong } from "@/lib/date-keys";
import { pluralize } from "@/lib/format";
import type { DateSummary, PollSummary } from "@/lib/poll-summary";
import { buttonClass } from "@/lib/ui";

/** How many runners-up to list under the winner. */
const RUNNERS_UP = 3;

/**
 * Answers the question the poll exists to answer: which date wins, and who
 * can't make it. Only the creator's device sees the "Lock this in" buttons —
 * `adminToken` is null for everyone else.
 */
export function ResultsPanel({
  summary,
  finalizedDate,
  slug,
  adminToken,
}: {
  summary: PollSummary;
  finalizedDate: string | null;
  slug: string;
  adminToken: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [lockingDate, setLockingDate] = useState<string | null>(null);

  const ranked = [...summary.byDate].sort(
    (a, b) => b.yesCount - a.yesCount || a.date.localeCompare(b.date),
  );
  const winner = summary.topDates[0] ?? null;
  const runnersUp = ranked
    .filter((day) => day.date !== winner?.date && day.yesCount > 0)
    .slice(0, RUNNERS_UP);

  function lockIn(date: string) {
    if (!adminToken) return;
    setLockingDate(date);
    startTransition(async () => {
      const result = await finalizePoll(slug, adminToken, date);
      setLockingDate(null);
      setError(result.ok ? null : result.message);
    });
  }

  if (summary.respondedCount === 0) {
    return (
      <section className="rounded-lg border border-dashed border-line bg-white p-6 text-center">
        <p className="font-display text-base font-semibold text-ink">
          No answers yet
        </p>
        <p className="mt-1 text-sm font-semibold text-slate">
          Share the link above — the best date shows up here as replies come in.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-ink">Results</h2>
        <p className="text-xs font-bold text-mist">
          {summary.respondedCount} of {summary.totalCount} answered
          {summary.respondedCount < summary.totalCount &&
            ` · waiting on ${summary.totalCount - summary.respondedCount}`}
        </p>
      </div>

      {winner && (
        <div className="mt-4 rounded-md border border-line bg-paper p-5">
          <div className="flex items-center gap-2">
            <TrophyIcon
              className={`h-4 w-4 ${
                winner.worksForEveryone ? "text-green-deep" : "text-sky-deep"
              }`}
            />
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate">
              {summary.topDates.length > 1
                ? `${summary.topDates.length} dates tied for best`
                : winner.worksForEveryone
                  ? "Works for everyone"
                  : "Best so far"}
            </span>
          </div>

          <p className="mt-2 font-display text-xl font-semibold text-ink">
            {formatDateKeyLong(winner.date)}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate">
            {winner.yesCount} of {winner.totalCount}{" "}
            {pluralize(winner.totalCount, "person", "people")} available
          </p>

          <Attendance day={winner} />

          {adminToken && finalizedDate !== winner.date && (
            <button
              type="button"
              onClick={() => lockIn(winner.date)}
              disabled={pending}
              className={buttonClass({ variant: "accent", className: "mt-4" })}
            >
              {pending && lockingDate === winner.date && (
                <SpinnerIcon className="h-4 w-4" />
              )}
              Lock in this date
            </button>
          )}
        </div>
      )}

      {runnersUp.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate">
            Other options
          </h3>
          <ul className="mt-2 divide-y divide-line">
            {runnersUp.map((day) => (
              <li
                key={day.date}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <span className="text-sm font-extrabold text-ink">
                  {formatDateKeyLong(day.date)}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs font-bold text-mist">
                    {day.yesCount}/{day.totalCount}
                  </span>
                  {adminToken && finalizedDate !== day.date && (
                    <button
                      type="button"
                      onClick={() => lockIn(day.date)}
                      disabled={pending}
                      className={buttonClass({
                        variant: "secondary",
                        size: "sm",
                      })}
                    >
                      Lock in
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-4 text-xs font-bold text-red-deep" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function Attendance({ day }: { day: DateSummary }) {
  return (
    <dl className="mt-4 grid gap-2 text-sm">
      <NameRow
        label="Can make it"
        names={day.available}
        tone="text-green-deep"
      />
      <NameRow
        label="Can't make it"
        names={day.unavailable}
        tone="text-red-deep"
      />
      <NameRow label="Haven't answered" names={day.pending} tone="text-mist" />
    </dl>
  );
}

function NameRow({
  label,
  names,
  tone,
}: {
  label: string;
  names: { id: number; name: string }[];
  tone: string;
}) {
  if (names.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1">
      <dt className={`text-xs font-extrabold uppercase tracking-wide ${tone}`}>
        {label}
      </dt>
      <dd className="text-sm font-semibold text-slate">
        {names.map((person) => person.name).join(", ")}
      </dd>
    </div>
  );
}
