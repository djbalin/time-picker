import { useLocale, useTranslations } from "next-intl";
import { type KeyboardEvent, memo, useCallback, useMemo } from "react";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { fromDateKey, toDateKey, todayKey } from "@/lib/date-keys";

/** Months shown at once; the strip scrolls horizontally beyond the viewport. */
const MONTHS_SHOWN = 6;

/** Arrow-key steps through the grid, in days. */
const KEY_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

export type DatesUpdate = (previous: string[]) => string[];

type DayCellData = {
  dateKey: string;
  day: number;
  label: string;
};

type WeekData = {
  weekNumber: number;
  /** Seven slots, Monday first; `null` pads days outside the month. */
  days: (DayCellData | null)[];
};

/**
 * A strip of month grids for picking many dates at once.
 *
 * Hand-rolled rather than react-day-picker: that re-rendered all ~250 days on
 * every focus, click and blur, which made each toggle visibly lag. Here focus
 * never touches React state, and each day is memoised on its own selected
 * flag, so a toggle re-renders exactly one cell.
 *
 * `onChange` takes an updater rather than a value so the toggle callbacks
 * stay referentially stable across renders — that is what lets the cells
 * skip re-rendering.
 */
export function DatePicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (update: DatesUpdate) => void;
}) {
  const locale = useLocale();
  const today = todayKey();
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const months = useMemo(() => {
    const now = new Date();
    return Array.from(
      { length: MONTHS_SHOWN },
      (_, offset) => new Date(now.getFullYear(), now.getMonth() + offset, 1),
    );
  }, []);

  const toggleDay = useCallback(
    (dateKey: string) =>
      onChange((previous) =>
        previous.includes(dateKey)
          ? previous.filter((key) => key !== dateKey)
          : [...previous, dateKey],
      ),
    [onChange],
  );

  return (
    <div
      data-date-strip
      className="w-full overflow-x-auto overflow-y-hidden py-1"
    >
      <div className="flex w-max flex-row gap-4">
        {months.map((month) => (
          <MonthGrid
            key={month.getTime()}
            month={month}
            locale={locale}
            today={today}
            selectedSet={selectedSet}
            onToggleDay={toggleDay}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
}

function MonthGrid({
  month,
  locale,
  today,
  selectedSet,
  onToggleDay,
  onChange,
}: {
  month: Date;
  locale: string;
  today: string;
  selectedSet: Set<string>;
  onToggleDay: (dateKey: string) => void;
  onChange: (update: DatesUpdate) => void;
}) {
  const t = useTranslations("DatePicker");
  const { caption, weekdays, weeks } = useMemo(
    () => buildMonth(month, locale),
    [month, locale],
  );

  const remaining = weeks
    .flatMap((week) => week.days)
    .filter((day): day is DayCellData => day !== null && day.dateKey >= today)
    .map((day) => day.dateKey);
  const fullySelected =
    remaining.length > 0 && remaining.every((key) => selectedSet.has(key));
  // One tab stop per month; arrow keys reach the rest.
  const tabStop = remaining.find((key) => selectedSet.has(key)) ?? remaining[0];

  const toggleMonth = () => {
    const inMonth = new Set(remaining);
    onChange((previous) => {
      const others = previous.filter((key) => !inMonth.has(key));
      return fullySelected ? others : [...others, ...remaining];
    });
  };

  return (
    <div className="rounded-md border border-hairline bg-surface-card p-3">
      <div className="mb-3 flex flex-col gap-2">
        <div className="text-center font-display text-sm text-strong">
          {caption}
        </div>
        <button
          type="button"
          onClick={toggleMonth}
          disabled={remaining.length === 0}
          // Labelled by what the click is about to do, not the current state,
          // so there's no ambiguity about which way the toggle is about to go.
          className={`flex w-full items-center justify-center gap-1.5 rounded-sm px-2 py-1 text-xs font-extrabold uppercase tracking-wide transition-colors disabled:opacity-45 ${
            fullySelected
              ? "bg-surface-sunken text-body hover:bg-support-soft"
              : "bg-accent-soft text-accent-text hover:bg-blush-200"
          }`}
        >
          {fullySelected ? (
            <CheckIcon className="h-3.5 w-3.5" />
          ) : (
            <PlusIcon className="h-3.5 w-3.5" />
          )}
          {fullySelected ? t("deselectMonth") : t("selectMonth")}
        </button>
      </div>

      <table className="border-collapse">
        <thead>
          <tr>
            <td aria-hidden="true" />
            {weekdays.map((weekday, index) => (
              <th
                // Narrow names repeat ("T", "S"), so the column is the key.
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed 7 columns
                key={index}
                scope="col"
                className="pb-1 text-xs font-bold text-muted"
              >
                {weekday}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.weekNumber}>
              <td
                className="px-1.5 text-center text-xs font-bold text-muted"
                aria-hidden="true"
              >
                {week.weekNumber}
              </td>
              {week.days.map((day, index) => (
                <td
                  // Padding slots never move within a week.
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed 7-slot row
                  key={index}
                  className="p-0"
                >
                  {day && (
                    <DayCell
                      dateKey={day.dateKey}
                      day={day.day}
                      label={day.label}
                      selected={selectedSet.has(day.dateKey)}
                      past={day.dateKey < today}
                      isToday={day.dateKey === today}
                      tabbable={day.dateKey === tabStop}
                      onToggle={onToggleDay}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DayCell = memo(function DayCell({
  dateKey,
  day,
  label,
  selected,
  past,
  isToday,
  tabbable,
  onToggle,
}: {
  dateKey: string;
  day: number;
  label: string;
  selected: boolean;
  past: boolean;
  isToday: boolean;
  tabbable: boolean;
  onToggle: (dateKey: string) => void;
}) {
  const state = selected
    ? "bg-accent text-on-accent hover:bg-accent-hover"
    : isToday
      ? "text-strong ring-1 ring-inset ring-accent hover:bg-surface-sunken"
      : "text-strong hover:bg-surface-sunken";

  return (
    <button
      type="button"
      data-date-key={dateKey}
      onClick={() => onToggle(dateKey)}
      onKeyDown={handleArrowKeys}
      disabled={past}
      aria-pressed={selected}
      aria-label={label}
      tabIndex={tabbable ? 0 : -1}
      className={`h-9 w-9 rounded-md text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-transparent disabled:text-ink-200 ${state}`}
    >
      {day}
    </button>
  );
});

/**
 * Moves focus between day buttons straight through the DOM — no React state,
 * so arrowing around never re-renders the grid. Past days are skipped by
 * walking on until an enabled button turns up (or the strip runs out).
 */
function handleArrowKeys(event: KeyboardEvent<HTMLButtonElement>) {
  const step = KEY_STEPS[event.key];
  const from = event.currentTarget.dataset.dateKey;
  const strip = event.currentTarget.closest("[data-date-strip]");
  if (!step || !from || !strip) return;
  event.preventDefault();

  const date = fromDateKey(from);
  for (let i = 0; i < 400; i++) {
    date.setDate(date.getDate() + step);
    const next = strip.querySelector<HTMLButtonElement>(
      `button[data-date-key="${toDateKey(date)}"]`,
    );
    if (!next) return;
    if (!next.disabled) {
      next.focus();
      return;
    }
  }
}

/** Monday-first weeks with ISO week numbers, formatted in the page locale. */
function buildMonth(month: Date, locale: string) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const caption = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(month);

  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  // 2 Sep 2024 was a Monday; any Monday would do.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    weekdayFormat.format(new Date(2024, 8, 2 + i)),
  );

  const labelFormat = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  // getDay() counts from Sunday; shift so the week starts on Monday.
  const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  // Day 0 of the next month is the last day of this one.
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();

  const slots: (DayCellData | null)[] = Array(leading).fill(null);
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, monthIndex, day);
    slots.push({
      dateKey: toDateKey(date),
      day,
      label: labelFormat.format(date),
    });
  }
  while (slots.length % 7 !== 0) slots.push(null);

  const weeks: WeekData[] = [];
  for (let i = 0; i < slots.length; i += 7) {
    const days = slots.slice(i, i + 7);
    const firstDay = days.find((day) => day !== null) as DayCellData;
    weeks.push({ weekNumber: isoWeek(fromDateKey(firstDay.dateKey)), days });
  }

  return { caption, weekdays, weeks };
}

function isoWeek(date: Date): number {
  // The ISO week belongs to the year its Thursday falls in.
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((thursday.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    )
  );
}
