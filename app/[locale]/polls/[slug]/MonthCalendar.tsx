"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Icon } from "@/components/ui";
import { heatTokens } from "@/lib/availability-heat";
import { toDateKey } from "@/lib/date-keys";

/**
 * Screen 2a — the month. Every proposed night sits in the calendar coloured
 * by how many of the group can play; the rest of the month is muted. Tap a
 * night to see who's in.
 */
export function MonthCalendar({
  monthDate,
  locale,
  proposed,
  yesCountByDate,
  totalParticipants,
  mineDates,
  selectedDate,
  canAnswer,
  onSelect,
  onToggleMine,
}: {
  monthDate: Date;
  locale: string;
  proposed: Set<string>;
  yesCountByDate: Record<string, number>;
  totalParticipants: number;
  mineDates: Set<string>;
  selectedDate: string | null;
  canAnswer: boolean;
  onSelect: (dateKey: string) => void;
  onToggleMine: (dateKey: string) => void;
}) {
  const t = useTranslations("SelectDates");

  const weekdays = useMemo(() => {
    // A fixed reference week starting Sunday, formatted in the page locale.
    const base = new Date(2024, 8, 1); // Sun 1 Sep 2024
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(base.getFullYear(), base.getMonth(), 1 + i)),
    );
  }, [locale]);

  const cells = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
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
    <div className="rounded-sheet bg-surface-card p-[18px] pb-5 shadow-sheet">
      <div className="grid grid-cols-7 gap-2 px-1 pb-2.5">
        {weekdays.map((label) => (
          <span
            key={label}
            className="text-center text-2xs font-semibold uppercase tracking-label text-muted"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => {
          if (!cell.dateKey) return <span key={cell.key} />;

          const dateKey = cell.dateKey;
          const isProposed = proposed.has(dateKey);

          if (!isProposed) {
            return (
              <div
                key={cell.key}
                className="min-h-[84px] rounded-md bg-paper-2 p-2.5 text-ink-300"
              >
                <span className="font-display text-xl leading-none">
                  {cell.num as number}
                </span>
              </div>
            );
          }

          const yes = yesCountByDate[dateKey] ?? 0;
          const heat = heatTokens(yes, totalParticipants);
          const mine = mineDates.has(dateKey);
          const selected = selectedDate === dateKey;

          return (
            <div key={cell.key} className="relative">
              <button
                type="button"
                onClick={() => onSelect(dateKey)}
                aria-pressed={selected}
                aria-label={dateKey}
                className={`flex min-h-[84px] w-full flex-col justify-between gap-2 rounded-md p-2.5 text-left transition-[background-color,box-shadow,transform] duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 ${heat.bg} ${heat.fg} ${
                  selected
                    ? "shadow-lift ring-2 ring-inset ring-accent"
                    : "shadow-rest"
                }`}
              >
                <span className="font-display text-xl leading-none">
                  {cell.num as number}
                </span>
                <span className={`text-right text-xs font-bold ${heat.count}`}>
                  {yes}/{totalParticipants}
                </span>
              </button>
              {canAnswer ? (
                <button
                  type="button"
                  aria-pressed={mine}
                  aria-label={t("yourAnswerFor", { date: dateKey })}
                  onClick={() => onToggleMine(dateKey)}
                  className={`absolute right-2.5 top-2.5 grid h-[19px] w-[19px] place-items-center rounded-full transition-colors ${
                    mine
                      ? "bg-accent text-on-accent"
                      : "bg-white/55 text-transparent hover:bg-white/80"
                  }`}
                >
                  <Icon name="check" size={13} color="currentColor" />
                </button>
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
