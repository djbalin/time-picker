import { useState } from "react";

import {
  CalendarMonth,
  DateRange,
  DayPicker,
  MonthCaption,
  MonthCaptionProps,
} from "@daypicker/react";
import "@daypicker/react/style.css";

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
    const newDate = new Date(year, month, i);
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

  console.log(selected.length);

  return (
    <div className="flex flex-row gap-2">
      <div>
        <DayPicker
          animate
          mode="multiple"
          selected={selected}
          onSelect={setSelected}
          required
          captionLayout="dropdown"
          showWeekNumber
          numberOfMonths={3}
          components={{
            MonthCaption: ({
              calendarMonth,
              children,
              ...props
            }: MonthCaptionProps) => (
              <MonthCaption {...props} calendarMonth={calendarMonth}>
                <div className="flex items-center justify-between gap-2">
                  <div>{children}</div>
                  <button
                    type="button"
                    onClick={() => selectEntireMonth(calendarMonth.date)}
                    className="text-xs underline"
                  >
                    ++ entire month
                  </button>
                  <button
                    type="button"
                    onClick={() => deselectEntireMonth(calendarMonth.date)}
                    className="text-xs underline"
                  >
                    -- entire month
                  </button>
                </div>
              </MonthCaption>
            ),
          }}
        />
      </div>
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
