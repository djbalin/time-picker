import { useState, type SVGProps } from "react";

import { DayPicker, MonthCaption, MonthCaptionProps } from "@daypicker/react";
import "@daypicker/react/style.css";

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 5v14M5 12h14"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M5 12h14"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function removeDatesOfMonthFromDatesArray({
  dates,
  month,
}: {
  dates: Date[];
  month: number;
}) {
  const selectedFiltered = dates.filter((el) => el.getMonth() !== month);
  return selectedFiltered;
}

function getLastDateOfMonth({ month, year }: { month: number; year: number }) {
  return new Date(year, month + 1, 0);
}

function getDatesOfMonth({ month, year }: { month: number; year: number }) {
  const dates: Date[] = [];
  const lastDate = getLastDateOfMonth({ month, year });

  // i = 1 because that is the first day of the month
  for (let i = 1; i <= lastDate.getDate(); i++) {
    dates.push(new Date(year, month, i));
  }

  return dates;
}

export function DatePicker() {
  const [selected, setSelected] = useState<Date[]>([]);

  const selectEntireMonth = (date: Date) => {
    const month = date.getMonth();
    const filtered = removeDatesOfMonthFromDatesArray({
      dates: selected,
      month,
    });
    const datesOfMonth = getDatesOfMonth({
      month: month,
      year: date.getFullYear(),
    });
    setSelected(filtered.concat(datesOfMonth));
  };

  const deselectEntireMonth = (date: Date) => {
    const monthNum = date.getMonth();
    const filtered = removeDatesOfMonthFromDatesArray({
      dates: selected,
      month: monthNum,
    });

    setSelected(filtered);
  };

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden py-1">
      <DayPicker
        animate
        mode="multiple"
        selected={selected}
        onSelect={setSelected}
        required
        hideNavigation
        // captionLayout="dropdown"
        showWeekNumber
        numberOfMonths={6}
        classNames={{
          months: "flex w-max flex-row gap-4",
          month:
            "rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
          month_caption: "mb-3",
          weekdays: "text-zinc-500 dark:text-zinc-400",
          weekday: "text-xs font-medium",
          day_button:
            "h-9 w-9 rounded-md text-sm hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600",
          selected:
            "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
          today: "border border-zinc-300 dark:border-zinc-700",
          week_number:
            "px-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400",
        }}
        components={{
          MonthCaption: ({
            calendarMonth,
            children,
            ...props
          }: MonthCaptionProps) => (
            <MonthCaption {...props} calendarMonth={calendarMonth}>
              <div className="flex flex-col gap-2">
                <div className="text-center text-sm font-semibold">
                  {children}
                </div>
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                  <button
                    type="button"
                    onClick={() => selectEntireMonth(calendarMonth.date)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-700 transition hover:bg-zinc-200 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white dark:focus-visible:ring-zinc-600"
                    aria-label="Select entire month"
                    title="Select entire month"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <div className="text-center text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                    Entire month
                  </div>
                  <button
                    type="button"
                    onClick={() => deselectEntireMonth(calendarMonth.date)}
                    className="inline-flex h-7 w-7 items-center justify-center justify-self-end rounded-md text-zinc-700 transition hover:bg-zinc-200 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white dark:focus-visible:ring-zinc-600"
                    aria-label="Deselect entire month"
                    title="Deselect entire month"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </MonthCaption>
          ),
        }}
      />
      {/* <DayPicker
      animate
      mode="multiple"
      selected={selected}
      onSelect={setSelected}
      required
      /> */}
    </div>
  );
}
