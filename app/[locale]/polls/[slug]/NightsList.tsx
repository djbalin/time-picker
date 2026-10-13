"use client";

import { useTranslations } from "next-intl";
import { Fragment } from "react";
import { AvailabilityBar, Chip, SlotToggle } from "@/components/ui";
import { heatTokens } from "@/lib/availability-heat";
import { formatDateKey, fromDateKey } from "@/lib/date-keys";
import type { DateSummary } from "@/lib/poll-summary";
import { monthLabel } from "./MonthCalendar";
import { ResponsesChip } from "./ResponsesChip";

/**
 * Screen 2b — the same nights as the calendar, as rows in date order, split
 * by month, with your own tick on the right.
 */
export function NightsList({
  days,
  locale,
  totalParticipants,
  mineDates,
  canAnswer,
  onToggleMine,
}: {
  days: DateSummary[];
  locale: string;
  totalParticipants: number;
  mineDates: Set<string>;
  canAnswer: boolean;
  onToggleMine: (dateKey: string) => void;
}) {
  const t = useTranslations("SelectDates");
  const ordered = [...days].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-[--gap-slot]">
      {ordered.map((day, index) => {
        const heat = heatTokens(day.yesCount, totalParticipants);
        const everyone =
          totalParticipants > 0 && day.yesCount >= totalParticipants;
        const date = fromDateKey(day.date);
        const dayNum = date.getDate();
        // "YYYY-MM" — a new one starts a new month section.
        const month = day.date.slice(0, 7);
        const newMonth =
          index === 0 || ordered[index - 1].date.slice(0, 7) !== month;

        return (
          <Fragment key={day.date}>
            {newMonth ? (
              <div
                className={`flex items-center gap-3 px-0.5 ${index === 0 ? "" : "pt-3"}`}
              >
                <span className="font-display text-lg tracking-display text-strong first-letter:uppercase">
                  {monthLabel(date, locale)}
                </span>
                <span className="h-px flex-1 bg-hairline" />
              </div>
            ) : null}
            <div
              className={`grid grid-cols-[minmax(0,1fr)_auto_34px] items-center gap-3 rounded-row px-3 py-2 sm:grid-cols-[minmax(0,1fr)_100px_auto_34px] sm:gap-5 sm:p-[15px_18px] transition-[background-color,box-shadow] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] bg-surface-card shadow-rest hover:shadow-lift`}
            >
              <button
                type="button"
                onClick={() => {
                  if (canAnswer) onToggleMine(day.date);
                }}
                aria-pressed={canAnswer && mineDates.has(day.date)}
                className="grid cursor-pointer grid-cols-subgrid items-center gap-3 text-left sm:col-span-2 sm:gap-5"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-sm font-display text-lg sm:h-[42px] sm:w-[42px] ${heat.tileBg} ${heat.tileFg}`}
                  >
                    {dayNum}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-sans text-md font-bold tracking-tight text-strong first-letter:uppercase sm:text-lg">
                      {weekdayName(day.date, locale)}
                    </span>
                  </span>
                  {everyone ? (
                    <span className="hidden shrink-0 sm:block">
                      <Chip tone="yes" size="sm">
                        {t("everyone")}
                      </Chip>
                    </span>
                  ) : null}
                </span>

                <span className="hidden sm:block">
                  <AvailabilityBar
                    yes={day.yesCount}
                    total={totalParticipants}
                    showCount={false}
                  />
                </span>
              </button>

              <span className="relative">
                <ResponsesChip
                  day={day}
                  total={totalParticipants}
                  countClass={heat.count}
                  className="px-1.5 py-1 text-xs"
                  popoverClassName="right-0 top-full mt-1.5"
                />
              </span>

              <span className={canAnswer ? "" : "opacity-45"}>
                <SlotToggle
                  value={canAnswer && mineDates.has(day.date) ? "yes" : null}
                  onChange={() => onToggleMine(day.date)}
                  mode="binary"
                  yesClassName="bg-blue-100 text-blue-600"
                  size={34}
                  label={t("yourAnswerFor", {
                    date: formatDateKey(day.date, locale),
                  })}
                />
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

function weekdayName(dateKey: string, locale: string): string {
  return fromDateKey(dateKey).toLocaleDateString(locale, { weekday: "long" });
}
