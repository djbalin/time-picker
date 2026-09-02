"use client";

import { useTranslations } from "next-intl";
import { Avatar, Chip, Icon } from "@/components/ui";
import { formatDateKey, formatDateKeyLong } from "@/lib/date-keys";
import type { DateSummary } from "@/lib/poll-summary";

/**
 * The right rail: who's in for the night you've selected, and the one
 * action you can take on it.
 */
export function SelectionRail({
  day,
  locale,
}: {
  day: DateSummary | null;
  locale: string;
}) {
  const t = useTranslations("SelectDates");

  if (!day) {
    return (
      <div className="rounded-sheet bg-surface-card p-6 text-center shadow-sheet">
        <Icon
          name="event"
          size="lg"
          className="mx-auto mb-2 block text-muted"
        />
        <p className="text-sm text-body">{t("railEmpty")}</p>
      </div>
    );
  }

  const everyone = day.worksForEveryone;
  const people = [
    ...day.available.map((p) => ({ ...p, mark: "yes" as const })),
    ...day.unavailable.map((p) => ({ ...p, mark: "no" as const })),
    ...day.pending.map((p) => ({ ...p, mark: "pending" as const })),
  ];

  const MARK = {
    yes: { icon: "check", color: "var(--color-yes)" },
    no: { icon: "close", color: "var(--color-no)" },
    pending: { icon: "schedule", color: "var(--color-ink-200)" },
  };

  return (
    <div className="rounded-sheet bg-surface-card p-6 shadow-sheet">
      <div className="flex items-start justify-between gap-2.5">
        <span className="min-w-0 flex-1">
          <span className="block whitespace-nowrap font-display text-2xl leading-tight text-strong">
            {formatDateKey(day.date, locale)}
          </span>
          <span className="mt-1.5 block text-xs text-muted">
            {formatDateKeyLong(day.date, locale)}
          </span>
        </span>
        <Chip tone={everyone ? "yes" : "accent"} className="mt-1 shrink-0">
          {t("canCount", { yes: day.yesCount, total: day.totalCount })}
        </Chip>
      </div>

      <p className="mt-5 text-2xs font-semibold uppercase tracking-label text-muted">
        {t("whosIn")}
      </p>
      <div className="mt-2.5 flex flex-col gap-1">
        {people.map((person) => {
          const mark = MARK[person.mark];
          return (
            <div
              key={person.id}
              className="flex items-center gap-3 px-0.5 py-1.5"
            >
              <Avatar name={person.name} size="md" />
              <span
                className={`flex-1 text-md font-semibold ${
                  person.mark === "pending" ? "text-muted" : "text-strong"
                }`}
              >
                {person.name}
              </span>
              <Icon name={mark.icon} size={20} color={mark.color} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
