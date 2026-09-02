"use client";

import { useTranslations } from "next-intl";
import { AvailabilityBar, Chip, SlotToggle } from "@/components/ui";
import { heatTokens } from "@/lib/availability-heat";
import { formatDateKey, fromDateKey } from "@/lib/date-keys";

export type RankedNight = {
  dateKey: string;
  yes: number;
};

/**
 * Screen 2b — the same nights as rows, best first, with your own tick on the
 * right.
 */
export function NightsList({
  nights,
  locale,
  totalParticipants,
  mineDates,
  selectedDate,
  canAnswer,
  onSelect,
  onToggleMine,
}: {
  nights: RankedNight[];
  locale: string;
  totalParticipants: number;
  mineDates: Set<string>;
  selectedDate: string | null;
  canAnswer: boolean;
  onSelect: (dateKey: string) => void;
  onToggleMine: (dateKey: string) => void;
}) {
  const t = useTranslations("SelectDates");
  const ranked = [...nights].sort(
    (a, b) => b.yes - a.yes || a.dateKey.localeCompare(b.dateKey),
  );

  return (
    <div className="flex flex-col gap-[--gap-slot] rounded-sheet bg-surface-card px-6 py-6 shadow-sheet">
      <div className="flex items-center justify-between gap-3 px-0.5 pb-1">
        <span className="text-2xs font-semibold uppercase tracking-label text-muted">
          {t("allNights", { count: nights.length })}
        </span>
        <span className="text-xs text-muted">{t("whoCanYourAnswer")}</span>
      </div>

      {ranked.map((night) => {
        const heat = heatTokens(night.yes, totalParticipants);
        const selected = selectedDate === night.dateKey;
        const everyone =
          totalParticipants > 0 && night.yes >= totalParticipants;
        const date = fromDateKey(night.dateKey);
        const dayNum = date.getDate();

        return (
          <div
            key={night.dateKey}
            className={`grid grid-cols-[minmax(0,1fr)_100px_34px] items-center gap-5 rounded-row p-[15px_18px] transition-[background-color,box-shadow] duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              selected
                ? "shadow-lift ring-2 ring-inset ring-accent [background:var(--grad-selected)]"
                : "bg-surface-card shadow-rest hover:shadow-lift"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onSelect(night.dateKey);
                if (canAnswer) onToggleMine(night.dateKey);
              }}
              aria-pressed={selected}
              className="col-span-2 grid cursor-pointer grid-cols-subgrid items-center gap-5 text-left"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-sm font-display text-lg ${heat.tileBg} ${heat.tileFg}`}
                >
                  {dayNum}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-sans text-lg font-bold tracking-tight text-strong">
                    {formatDateKey(night.dateKey, locale)}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {t("canPlayCount", {
                      yes: night.yes,
                      total: totalParticipants,
                    })}
                  </span>
                </span>
                {everyone ? (
                  <Chip tone="yes" size="sm" className="shrink-0">
                    {t("everyone")}
                  </Chip>
                ) : null}
              </span>

              <AvailabilityBar
                yes={night.yes}
                total={totalParticipants}
                showCount={false}
              />
            </button>

            <span className={canAnswer ? "" : "opacity-45"}>
              <SlotToggle
                value={canAnswer && mineDates.has(night.dateKey) ? "yes" : null}
                onChange={() => onToggleMine(night.dateKey)}
                mode="binary"
                size={34}
                label={t("yourAnswerFor", {
                  date: formatDateKey(night.dateKey, locale),
                })}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}
