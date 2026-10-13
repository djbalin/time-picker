"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { heatTokens } from "@/lib/availability-heat";
import { formatDateKey, toDateKey } from "@/lib/date-keys";
import type { DateSummary } from "@/lib/poll-summary";

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
  // The count whose responses are pinned open — how touch reaches them.
  const [openDate, setOpenDate] = useState<string | null>(null);
  const pointerType = useRef("");

  useEffect(() => {
    if (openDate === null) return;
    function onPointerDown(e: PointerEvent) {
      if (!(e.target as Element).closest(`[data-responses="${openDate}"]`)) {
        setOpenDate(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenDate(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openDate]);

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
        {cells.map((cell, index) => {
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

          const day = days[dateKey];
          const yes = day?.yesCount ?? 0;
          const heat = heatTokens(yes, totalParticipants);
          const mine = mineDates.has(dateKey);
          const open = openDate === dateKey;
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
                className={`flex min-h-[84px] w-full flex-col justify-between gap-2 rounded-md p-2.5 text-left transition-[background-color,box-shadow,transform] duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-rest hover:-translate-y-0.5 ${heat.bg} ${heat.fg}`}
              >
                <span className="font-display text-xl leading-none">
                  {cell.num as number}
                </span>
              </button>
              {canAnswer ? (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-2.5 top-2.5 grid h-[19px] w-[19px] place-items-center rounded-full transition-colors ${
                    mine
                      ? "bg-blue-100 text-blue-600"
                      : "bg-white/55 text-transparent"
                  }`}
                >
                  <Icon name="check" size={13} color="currentColor" />
                </span>
              ) : null}
              <button
                type="button"
                data-responses={dateKey}
                onPointerDown={(e) => {
                  pointerType.current = e.pointerType;
                }}
                onClick={() => {
                  // A mouse already sees the responses on hover, so a click
                  // stays a click on the tile. Touch and keyboard pin them.
                  if (pointerType.current === "mouse") activate();
                  else setOpenDate(open ? null : dateKey);
                  pointerType.current = "";
                }}
                aria-expanded={open}
                aria-describedby={`responses-${dateKey}`}
                aria-label={t("responsesFor", {
                  date: formatDateKey(dateKey, locale),
                })}
                className={`peer/count absolute bottom-1.5 right-1.5 inline-flex cursor-help items-center gap-0.5 rounded-pill py-0.5 pl-1 pr-1.5 text-xs font-bold shadow-rest transition-colors hover:bg-white ${heat.count} ${
                  open ? "bg-white" : "bg-white/55"
                }`}
              >
                <Icon name="group" size={13} color="currentColor" />
                {yes}/{totalParticipants}
              </button>
              {day ? (
                <DayResponses
                  id={`responses-${dateKey}`}
                  day={day}
                  className={`${open ? "block" : "hidden peer-hover/count:block"} ${
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

function DayResponses({
  id,
  day,
  className,
}: {
  id: string;
  day: DateSummary;
  className: string;
}) {
  const t = useTranslations("SelectDates");
  const people = [
    ...day.available.map((p) => ({ ...p, mark: "yes" as const })),
    ...day.unavailable.map((p) => ({ ...p, mark: "no" as const })),
    ...day.pending.map((p) => ({ ...p, mark: "pending" as const })),
  ];
  const MARK = {
    yes: { icon: "check", color: "var(--color-yes)", label: t("responseYes") },
    no: { icon: "close", color: "var(--color-no)", label: t("responseNo") },
    pending: {
      icon: "schedule",
      color: "var(--color-ink-200)",
      label: t("responsePending"),
    },
  };

  return (
    <span
      id={id}
      role="tooltip"
      className={`pointer-events-none absolute z-30 w-max min-w-[140px] max-w-[220px] rounded-md bg-surface-card p-2.5 shadow-pop ${className}`}
    >
      {people.map((person) => {
        const mark = MARK[person.mark];
        return (
          <span key={person.id} className="flex items-center gap-2 py-0.5">
            <span
              className={`min-w-0 flex-1 truncate text-xs font-semibold ${
                person.mark === "pending" ? "text-muted" : "text-strong"
              }`}
            >
              {person.name}
            </span>
            <Icon name={mark.icon} size={16} color={mark.color} />
            <span className="sr-only">{mark.label}</span>
          </span>
        );
      })}
    </span>
  );
}

export function monthLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}
