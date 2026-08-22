"use client";

import { useLocale, useTranslations } from "next-intl";
import { TrophyIcon } from "@/components/icons";
import { formatDateKeyLong } from "@/lib/date-keys";
import type { DateSummary, PollSummary } from "@/lib/poll-summary";

/** How many runners-up to list under the winner. */
const RUNNERS_UP = 3;

/**
 * Answers the question the poll exists to answer: which date wins, and who
 * can't make it.
 */
export function ResultsPanel({ summary }: { summary: PollSummary }) {
  const t = useTranslations("ResultsPanel");
  const locale = useLocale();

  const ranked = [...summary.byDate].sort(
    (a, b) => b.yesCount - a.yesCount || a.date.localeCompare(b.date),
  );
  const winner = summary.topDates[0] ?? null;
  const runnersUp = ranked
    .filter((day) => day.date !== winner?.date && day.yesCount > 0)
    .slice(0, RUNNERS_UP);

  if (summary.respondedCount === 0) {
    return (
      <section className="rounded-lg border border-dashed border-line bg-white p-6 text-center">
        <p className="font-display text-base font-semibold text-ink">
          {t("noAnswersTitle")}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate">
          {t("noAnswersBody")}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("heading")}
        </h2>
        <p className="text-xs font-bold text-mist">
          {t("respondedCount", {
            answered: summary.respondedCount,
            total: summary.totalCount,
          })}
          {summary.respondedCount < summary.totalCount &&
            ` · ${t("waitingOn", { count: summary.totalCount - summary.respondedCount })}`}
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
                ? t("tiedForBest", { count: summary.topDates.length })
                : winner.worksForEveryone
                  ? t("worksForEveryone")
                  : t("bestSoFar")}
            </span>
          </div>

          <p className="mt-2 font-display text-xl font-semibold text-ink">
            {formatDateKeyLong(winner.date, locale)}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate">
            {t("availableCount", {
              available: winner.yesCount,
              total: winner.totalCount,
            })}
          </p>

          <Attendance day={winner} />
        </div>
      )}

      {runnersUp.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate">
            {t("otherOptions")}
          </h3>
          <ul className="mt-2 divide-y divide-line">
            {runnersUp.map((day) => (
              <li
                key={day.date}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <span className="text-sm font-extrabold text-ink">
                  {formatDateKeyLong(day.date, locale)}
                </span>
                <span className="text-xs font-bold text-mist">
                  {day.yesCount}/{day.totalCount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Attendance({ day }: { day: DateSummary }) {
  const t = useTranslations("ResultsPanel");
  return (
    <dl className="mt-4 grid gap-2 text-sm">
      <NameRow
        label={t("canMakeIt")}
        names={day.available}
        tone="text-green-deep"
      />
      <NameRow
        label={t("cantMakeIt")}
        names={day.unavailable}
        tone="text-red-deep"
      />
      <NameRow label={t("notAnswered")} names={day.pending} tone="text-mist" />
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
