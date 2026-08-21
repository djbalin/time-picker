import {
  DayPicker,
  MonthCaption,
  type MonthCaptionProps,
} from "@daypicker/react";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { startOfToday } from "@/lib/date-keys";
import "@daypicker/react/style.css";

/** Months shown at once; the strip scrolls horizontally beyond the viewport. */
const MONTHS_SHOWN = 6;

const DAY_BUTTON = [
  "h-9 w-9 rounded-md text-sm font-semibold transition",
  "text-ink hover:bg-cloud",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky",
  "disabled:cursor-not-allowed disabled:text-silver disabled:hover:bg-transparent",
  "in-data-[today=true]:ring-1 in-data-[today=true]:ring-sky",
  "in-data-[selected=true]:bg-sky in-data-[selected=true]:text-white",
  "in-data-[selected=true]:hover:bg-sky-light",
].join(" ");

export function DatePicker({
  selected,
  onSelect,
}: {
  selected: Date[];
  onSelect: (dates: Date[]) => void;
}) {
  const selectEntireMonth = (month: Date) => {
    const today = startOfToday();
    const daysToAdd = datesInMonth(month).filter((date) => date >= today);
    onSelect([...withoutMonth(selected, month), ...daysToAdd]);
  };

  const deselectEntireMonth = (month: Date) => {
    onSelect(withoutMonth(selected, month));
  };

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden py-1">
      <DayPicker
        animate
        mode="multiple"
        selected={selected}
        onSelect={(next) => onSelect(next ?? [])}
        // Compared against local midnight, not "now" — otherwise today itself
        // becomes unpickable from midday onwards.
        disabled={{ before: startOfToday() }}
        hideNavigation
        showWeekNumber
        numberOfMonths={MONTHS_SHOWN}
        classNames={{
          months: "flex w-max flex-row gap-4",
          month: "rounded-md border border-line bg-white p-3 shadow-soft",
          month_caption: "mb-3",
          weekdays: "text-mist",
          weekday: "text-xs font-bold",
          week_number: "px-1.5 text-xs font-bold text-mist",
          // Day state lives on the button, driven by the cell's data
          // attributes. Putting it on the cell instead pits `text-white`
          // against the button's own `text-ink` at equal specificity, where
          // the winner comes down to stylesheet order rather than intent.
          // Overriding a key replaces its default `rdp-*` class outright, so
          // the semantic names are re-declared here for readable markup.
          day: "rdp-day p-0",
          day_button: DAY_BUTTON,
          selected: "rdp-selected",
          today: "rdp-today",
          disabled: "rdp-disabled",
        }}
        components={{
          MonthCaption: ({
            calendarMonth,
            children,
            ...props
          }: MonthCaptionProps) => (
            <MonthCaption {...props} calendarMonth={calendarMonth}>
              <div className="flex flex-col gap-2">
                <div className="text-center font-display text-sm font-semibold text-ink">
                  {children}
                </div>
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border border-line bg-cloud px-2 py-1">
                  <button
                    type="button"
                    onClick={() => deselectEntireMonth(calendarMonth.date)}
                    className="inline-flex h-7 w-7 items-center justify-center justify-self-end rounded-full text-slate transition hover:bg-sky-tint hover:text-sky-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                    aria-label="Deselect entire month"
                    title="Deselect entire month"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <div className="text-center text-xs font-extrabold uppercase tracking-wide text-slate">
                    Entire month
                  </div>
                  <button
                    type="button"
                    onClick={() => selectEntireMonth(calendarMonth.date)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate transition hover:bg-sky-tint hover:text-sky-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                    aria-label="Select entire month"
                    title="Select entire month"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </MonthCaption>
          ),
        }}
      />
    </div>
  );
}

/**
 * Year matters as well as month: the strip spans six months, so it regularly
 * shows the same month number in two different years.
 */
function withoutMonth(dates: Date[], month: Date): Date[] {
  return dates.filter(
    (date) =>
      date.getMonth() !== month.getMonth() ||
      date.getFullYear() !== month.getFullYear(),
  );
}

function datesInMonth(month: Date): Date[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  // Day 0 of the next month is the last day of this one.
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();

  const dates: Date[] = [];
  for (let day = 1; day <= lastDay; day++) {
    dates.push(new Date(year, monthIndex, day));
  }
  return dates;
}
