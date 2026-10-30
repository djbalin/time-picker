"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { type DemoDay, MiniMonth } from "./MiniMonth";

// A made-up poll the visitor can answer: five friends have already ticked
// their days, and the visitor plays the sixth. Most days are one tick short
// of everyone, so the visitor's tick turns them green; others climb from
// "few" to "most", and a couple stay out of reach. The 21st to the 24th is a
// long weekend proposed as a run of days.
const YEAR = 2027;
const MONTH = 0; // January
const TOTAL = 6;
const FRIENDS_ANSWERED = 5;
const FRIENDS_YES: Record<number, number> = {
  8: 5,
  9: 5,
  15: 3,
  16: 5,
  21: 3,
  22: 5,
  23: 5,
  24: 2,
  29: 3,
  30: 1,
};

/**
 * The landing page's hero: a sample poll that answers back. Tapping a day
 * adds the visitor's tick, recolours it, and re-ranks the best date.
 */
export function SamplePoll() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [mine, setMine] = useState<ReadonlySet<number>>(new Set());

  const days: Record<number, DemoDay> = {};
  for (const [day, yes] of Object.entries(FRIENDS_YES)) {
    const ticked = mine.has(Number(day));
    days[Number(day)] = { yes: yes + (ticked ? 1 : 0), mine: ticked };
  }

  // Most yeses wins; ties go to the earlier date.
  let best = 0;
  for (const [day, { yes = 0 }] of Object.entries(days)) {
    if (best === 0 || yes > (days[best].yes ?? 0)) best = Number(day);
  }
  const bestYes = days[best].yes ?? 0;
  const everyone = bestYes === TOTAL;

  const dayFormat = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const formatDay = (day: number) =>
    dayFormat.format(new Date(YEAR, MONTH, day));
  const monthName = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(YEAR, MONTH, 1));

  function toggle(day: number) {
    setMine((previous) => {
      const next = new Set(previous);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  const bold = (chunks: React.ReactNode) => (
    <strong className="font-bold">{chunks}</strong>
  );

  return (
    <div className="relative">
      <p className="mb-3 flex items-end gap-2 font-display text-lg text-plum-700 sm:mb-4 sm:ml-10 sm:-rotate-2">
        {t("demoHint")}
        <ArrowDown />
      </p>

      <div className="rounded-[18px] border border-apricot-300 bg-paper p-4 shadow-warm sm:p-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-strong">
              {t("demoTitle")}
            </h2>
            <p className="text-sm text-body capitalize">{monthName}</p>
          </div>
          <p className="text-right text-sm font-semibold text-body">
            {t("demoAnswered", {
              answered: FRIENDS_ANSWERED + (mine.size > 0 ? 1 : 0),
              total: TOTAL,
            })}
          </p>
        </div>

        <MiniMonth
          year={YEAR}
          month={MONTH}
          locale={locale}
          days={days}
          total={TOTAL}
          winner={everyone ? best : undefined}
          onToggle={toggle}
          dayLabel={(day, yes) =>
            t("demoDayLabel", { date: formatDay(day), yes, total: TOTAL })
          }
        />

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-body">
          <LegendSwatch className="bg-mint-300" label={t("legendEveryone")} />
          <LegendSwatch className="bg-butter-200" label={t("legendMost")} />
          <LegendSwatch className="bg-coral-100" label={t("legendFew")} />
          <span className="ml-auto text-ink-400">{t("demoSample")}</span>
        </div>

        <p
          aria-live="polite"
          className={`mt-4 rounded-[10px] px-4 py-3 text-sm transition-colors duration-300 sm:text-base ${
            everyone ? "bg-mint-300 text-mint-600" : "bg-apricot-50 text-body"
          }`}
        >
          {everyone
            ? t.rich("demoEveryone", { date: formatDay(best), b: bold })
            : t.rich("demoBest", {
                date: formatDay(best),
                yes: bestYes,
                total: TOTAL,
                b: bold,
              })}
        </p>
      </div>
    </div>
  );
}

function LegendSwatch({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

/** A hand-drawn arrow from the hint down into the calendar. */
function ArrowDown() {
  return (
    <svg
      viewBox="0 0 40 36"
      width="34"
      height="30"
      aria-hidden="true"
      className="shrink-0 translate-y-2 text-plum-500"
    >
      <path
        d="M4 4c14 0 26 6 27 24M24 22l7 7 6-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
