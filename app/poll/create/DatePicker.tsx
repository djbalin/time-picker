import {
  DayPicker,
  MonthCaption,
  type MonthCaptionProps,
} from "@daypicker/react";
import type { SVGProps } from "react";
import "@daypicker/react/style.css";

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
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

export function DatePicker({
  selected,
  onSelect,
}: {
  selected: Date[];
  onSelect: (dates: Date[]) => void;
}) {
  const selectEntireMonth = (date: Date) => {
    const month = date.getMonth();
    const filtered = removeDatesOfMonthFromDatesArray({
      dates: selected,
      month,
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const datesOfMonth = getDatesOfMonth({
      month: month,
      year: date.getFullYear(),
    }).filter((d) => d >= today);
    onSelect(filtered.concat(datesOfMonth));
  };

  const deselectEntireMonth = (date: Date) => {
    const monthNum = date.getMonth();
    const filtered = removeDatesOfMonthFromDatesArray({
      dates: selected,
      month: monthNum,
    });

    onSelect(filtered);
  };

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden py-1">
      <DayPicker
        animate
        mode="multiple"
        selected={selected}
        onSelect={onSelect}
        required
        disabled={{ before: new Date() }}
        hideNavigation
        showWeekNumber
        numberOfMonths={6}
        classNames={{
          months: "flex w-max flex-row gap-4",
          month: "rounded-md border border-line bg-white p-3 shadow-soft",
          month_caption: "mb-3",
          weekdays: "text-mist",
          weekday: "text-xs font-bold",
          day_button:
            "h-9 w-9 rounded-md text-sm font-semibold text-ink hover:bg-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky",
          selected: "bg-sky text-white hover:bg-sky-light",
          today: "border border-sky",
          week_number: "px-1.5 text-xs font-bold text-mist",
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
