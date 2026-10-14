"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Icon } from "@/components/ui";
import { heatTokens } from "@/lib/availability-heat";
import { toDateKey } from "@/lib/date-keys";
import type { DateSummary } from "@/lib/poll-summary";
import { ResponsesChip } from "./ResponsesChip";

/**
 * Screen 2a — the month. Every proposed night sits in the calendar coloured
 * by how many of the group can play; the rest of the month is muted. Tap a
 * night to toggle your own availability; hover its count (or tap it on touch)
 * to see how each person answered.
 */
export function MonthCalendar({
  monthDate,
  locale,
  proposed,
  days,
  totalParticipants,
  mineDates,
  canAnswer,
  onToggleMine,
}: {
  monthDate: Date;
  locale: string;
  proposed: Set<string>;
  days: Record<string, DateSummary>;
  totalParticipants: number;
  mineDates: Set<string>;
  canAnswer: boolean;
  onToggleMine: (dateKey: string) => void;
}) {
  const t = useTranslations("SelectDates");
  const weekdays = useMemo(() => {
    // A fixed reference week starting Monday, formatted in the page locale.
    const base = new Date(2024, 8, 2); // Mon 2 Sep 2024
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(
        new Date(base.getFullYear(), base.getMonth(), base.getDate() + i),
      ),
    );
  }, [locale]);

  const cells = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    // getDay() counts from Sunday; shift so the week starts on Monday.
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const out: ({ key: string; dateKey: string | null } & Record<
      string,
      unknown
    >)[] = [];
    for (let i = 0; i < firstWeekday; i++) {
      out.push({ key: `blank-${i}`, dateKey: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = toDateKey(new Date(year, month, day));
      out.push({ key: dateKey, dateKey, num: day });
    }
    while (out.length % 7 !== 0) {
      out.push({ key: `tail-${out.length}`, dateKey: null });
    }
    return out;
  }, [monthDate]);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 px-1 pb-2.5 sm:gap-2">
        {weekdays.map((label) => (
          <span
            key={label}
            className="text-center text-2xs font-semibold uppercase tracking-label text-muted"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((cell, index) => {
          if (!cell.dateKey) return <span key={cell.key} />;

          const dateKey = cell.dateKey;
          const isProposed = proposed.has(dateKey);

          if (!isProposed) {
            return (
              <div
                key={cell.key}
                className="min-h-[68px] rounded-md bg-paper-2 p-1.5 text-center text-ink-300 sm:min-h-[84px] sm:p-2.5 sm:text-left"
              >
                <span className="font-display text-base leading-none sm:text-xl">
                  {cell.num as number}
                </span>
              </div>
            );
          }

          const day = days[dateKey];
          const yes = day?.yesCount ?? 0;
          const heat = heatTokens(yes, totalParticipants);
          const mine = mineDates.has(dateKey);
          const activate = () => {
            if (canAnswer) onToggleMine(dateKey);
          };
          // Keep the popover inside the calendar: open towards the middle.
          const column = index % 7;
          const row = Math.floor(index / 7);
          const opensUp = row >= cells.length / 7 / 2;

          return (
            <div key={cell.key} className="relative">
              <button
                type="button"
                onClick={activate}
                aria-pressed={mine}
                aria-label={
                  canAnswer ? t("yourAnswerFor", { date: dateKey }) : dateKey
                }
                className={`flex min-h-[68px] w-full flex-col items-center gap-2 rounded-md p-1.5 transition-[background-color,box-shadow,transform] duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-rest hover:-translate-y-0.5 sm:min-h-[84px] sm:items-start sm:p-2.5 ${heat.bg} ${heat.fg}`}
              >
                <span className="font-display text-base leading-none sm:text-xl">
                  {cell.num as number}
                </span>
              </button>
              {canAnswer ? (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 top-1/2 grid h-[19px] w-[19px] -translate-x-1/2 -translate-y-1/2 sm:left-auto sm:right-2.5 sm:top-2.5 sm:translate-x-0 sm:translate-y-0 place-items-center rounded-full transition-colors ${
                    mine
                      ? "bg-blue-100 text-blue-600"
                      : "bg-white/55 text-transparent"
                  }`}
                >
                  <Icon name="check" size={13} color="currentColor" />
                </span>
              ) : null}
              {day ? (
                <ResponsesChip
                  day={day}
                  total={totalParticipants}
                  countClass={heat.count}
                  hideIconOnMobile
                  onMouseClick={activate}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.5 text-[10px] sm:bottom-1.5 sm:left-auto sm:right-1.5 sm:translate-x-0 sm:pr-1.5 sm:text-xs"
                  popoverClassName={`${
                    opensUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
                  } ${
                    column < 3
                      ? "left-0"
                      : column > 3
                        ? "right-0"
                        : "left-1/2 -translate-x-1/2"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function monthLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}
