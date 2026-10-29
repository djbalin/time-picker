"use client";

import { useTranslations } from "next-intl";
import { AvatarStack, Chip, Icon } from "@/components/ui";
import { heatLevel, heatTokens } from "@/lib/availability-heat";
import { formatDateKey, fromDateKey } from "@/lib/date-keys";
import type { DateSummary } from "@/lib/poll-summary";

/**
 * The right rail: every night that works for everyone or most of the group.
 * All-in nights first, then the most people, then the nearest night. Scrolls
 * on its own once it outgrows the calendar beside it. The footer shows who's
 * in the group and how many have answered so far.
 */
export function BestDates({
  days,
  locale,
  participantNames,
  answered,
  className = "",
}: {
  days: DateSummary[];
  locale: string;
  participantNames: string[];
  answered: number;
  className?: string;
}) {
  const t = useTranslations("SelectDates");

  const best = days
    .map((day) => ({ day, level: heatLevel(day.yesCount, day.totalCount) }))
    .filter(({ level }) => level !== "few")
    .sort(
      (a, b) =>
        Number(b.level === "everyone") - Number(a.level === "everyone") ||
        b.day.yesCount - a.day.yesCount ||
        a.day.date.localeCompare(b.day.date),
    );

  return (
    <div
      className={`flex flex-col rounded-[14px] border border-apricot-300 bg-paper ${className}`}
    >
      <p className="px-5 pb-2.5 pt-5 text-sm font-semibold text-strong">
        {t("bestDates")}
      </p>

      {best.length === 0 ? (
        <div className="px-6 pb-6 text-center">
          <Icon
            name="event"
            size="lg"
            className="mx-auto mb-2 mt-2 block text-ink-300"
          />
          <p className="text-sm text-body">{t("bestDatesEmpty")}</p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-4 pb-4">
          {best.map(({ day, level }) => {
            const heat = heatTokens(day.yesCount, day.totalCount);
            return (
              <div
                key={day.date}
                className="flex shrink-0 items-center gap-3 rounded-[10px] p-2.5"
              >
                <span
                  className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[8px] font-display text-lg ${heat.tileBg} ${heat.tileFg}`}
                >
                  {fromDateKey(day.date).getDate()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-md font-bold text-strong">
                    {formatDateKey(day.date, locale)}
                  </span>
                  {level === "everyone" ? (
                    <span className="mt-0.5 block truncate text-xs text-ink-400">
                      {t("canPlayCount", {
                        yes: day.yesCount,
                        total: day.totalCount,
                      })}
                    </span>
                  ) : (
                    <MissingPeople day={day} />
                  )}
                </span>
                {level === "everyone" ? (
                  <Chip tone="yes" size="sm" className="shrink-0">
                    {t("everyone")}
                  </Chip>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-auto flex shrink-0 items-center gap-3 border-t border-apricot-200 px-5 py-4">
        <AvatarStack names={participantNames} size="md" />
        <span className="text-xs font-semibold text-body">
          {t("answeredCount", { answered, total: participantNames.length })}
        </span>
      </div>
    </div>
  );
}

/** Who's missing on a "most" night: can't in red, not answered yet in grey. */
function MissingPeople({ day }: { day: DateSummary }) {
  const t = useTranslations("SelectDates");
  return (
    <span className="mt-1 flex flex-wrap gap-1">
      {day.unavailable.map((person) => (
        <span
          key={person.id}
          className="rounded-[5px] bg-no-soft px-1.5 py-px text-[11px] font-bold text-no-text"
        >
          {person.name}
        </span>
      ))}
      {day.pending.map((person) => (
        <span
          key={person.id}
          title={t("responsePending")}
          className="rounded-[5px] bg-apricot-100 px-1.5 py-px text-[11px] font-bold text-ink-400"
        >
          {person.name}
        </span>
      ))}
    </span>
  );
}
