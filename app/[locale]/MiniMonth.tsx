import { Icon } from "@/components/ui";
import { heatTokens } from "@/lib/availability-heat";

/** A proposed day: no `yes` means nobody has answered it yet. */
export type DemoDay = { yes?: number; mine?: boolean };

/**
 * A small month for the landing page's sample polls, drawn with the same heat
 * colours as the real calendar. Proposed days are keyed by day of month.
 * Passing `onToggle` makes them tappable; without it the month is a static
 * illustration and has no hooks, so server components can render it too.
 */
export function MiniMonth({
  year,
  month,
  locale,
  days,
  total,
  winner,
  onToggle,
  dayLabel,
  size = "lg",
}: {
  year: number;
  /** 0-based, as `Date` counts months. */
  month: number;
  locale: string;
  days: Record<number, DemoDay>;
  total: number;
  winner?: number;
  onToggle?: (day: number) => void;
  /** Accessible name for a tappable day. */
  dayLabel?: (day: number, yes: number) => string;
  size?: "sm" | "lg";
}) {
  const large = size === "lg";
  // A fixed reference week starting Monday, formatted in the page locale.
  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    weekdayFormat.format(new Date(2024, 8, 2 + i)),
  );
  // getDay() counts from Sunday; shift so the week starts on Monday.
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const gap = large ? "gap-1.5 sm:gap-2" : "gap-1";
  const cellBase = large
    ? "min-h-[46px] rounded-[10px] p-1.5 sm:min-h-[58px] sm:p-2"
    : "aspect-square rounded-[5px] p-0.5";
  const number = large
    ? "font-display text-base leading-none sm:text-lg"
    : "font-display text-[11px] leading-none";

  return (
    <div>
      <div className={`grid grid-cols-7 ${gap} pb-1.5`}>
        {weekdays.map((label, i) => (
          <span
            // Narrow weekday labels repeat (T, S), so the index is the key.
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed 7-day header
            key={i}
            className={`text-center font-semibold uppercase text-ink-400 ${
              large ? "text-2xs tracking-label" : "text-[9px]"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      <div className={`grid grid-cols-7 ${gap}`}>
        {cells.map((day, index) => {
          if (day === null) {
            // biome-ignore lint/suspicious/noArrayIndexKey: padding cells have no identity
            return <span key={`pad-${index}`} />;
          }
          const demo = days[day];

          if (!demo) {
            return (
              <div
                key={day}
                className={`${cellBase} bg-paper-2 text-ink-300 ${
                  large ? "" : "text-center"
                }`}
              >
                <span className={number}>{day}</span>
              </div>
            );
          }

          if (demo.yes === undefined) {
            return (
              <div
                key={day}
                className={`${cellBase} border-2 border-dashed border-ink-300 bg-paper text-strong ${
                  large ? "" : "text-center"
                }`}
              >
                <span className={number}>{day}</span>
              </div>
            );
          }

          const heat = heatTokens(demo.yes, total);
          const isWinner = winner === day;
          const content = (
            <>
              <span className={number}>{day}</span>
              {large ? (
                <span className="absolute right-1.5 bottom-1 text-[10px] font-bold sm:right-2 sm:bottom-1.5 sm:text-xs">
                  {demo.yes}/{total}
                </span>
              ) : null}
              {large && onToggle ? (
                <span
                  aria-hidden="true"
                  className={`absolute top-1.5 right-1.5 grid size-[17px] place-items-center rounded-full transition-colors sm:top-2 sm:right-2 ${
                    demo.mine
                      ? "bg-plum-600 text-apricot-50"
                      : "bg-white/60 text-transparent"
                  }`}
                >
                  <Icon name="check" size={12} color="currentColor" />
                </span>
              ) : null}
            </>
          );
          const cellClass = `relative flex ${cellBase} ${heat.bg} ${heat.fg} ${
            large ? "items-start" : "items-center justify-center"
          } ${isWinner ? "ring-2 ring-plum-600 ring-offset-2 ring-offset-paper" : ""}`;

          if (!onToggle) {
            return (
              <div key={day} className={cellClass}>
                {content}
              </div>
            );
          }

          return (
            <button
              key={day}
              type="button"
              onClick={() => onToggle(day)}
              aria-pressed={Boolean(demo.mine)}
              aria-label={dayLabel?.(day, demo.yes)}
              className={`${cellClass} transition-[background-color,transform] duration-[220ms] ease-(--ease-bounce) hover:-translate-y-0.5 active:scale-95`}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
