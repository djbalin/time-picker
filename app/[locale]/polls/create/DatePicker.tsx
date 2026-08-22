import {
  DayPicker,
  MonthCaption,
  type MonthCaptionProps,
} from "@daypicker/react";
import { da, enUS } from "@daypicker/react/locale";
import { useLocale, useTranslations } from "next-intl";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { startOfToday, toDateKey } from "@/lib/date-keys";
import "@daypicker/react/style.css";

const CALENDAR_LOCALES = { en: enUS, da };

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
  const t = useTranslations("DatePicker");
  const locale = useLocale();

  const selectEntireMonth = (month: Date) => {
    const today = startOfToday();
    const daysToAdd = datesInMonth(month).filter((date) => date >= today);
    onSelect([...withoutMonth(selected, month), ...daysToAdd]);
  };

  const deselectEntireMonth = (month: Date) => {
    onSelect(withoutMonth(selected, month));
  };

  /**
   * True once every selectable (not-yet-past) day in the month is checked —
   * the point at which clicking the toggle should remove them instead of
   * adding the rest.
   */
  const isMonthFullySelected = (month: Date) => {
    const today = startOfToday();
    const remaining = datesInMonth(month).filter((date) => date >= today);
    if (remaining.length === 0) return false;
    const selectedKeys = new Set(selected.map(toDateKey));
    return remaining.every((date) => selectedKeys.has(toDateKey(date)));
  };

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden py-1">
      <DayPicker
        animate
        mode="multiple"
        locale={CALENDAR_LOCALES[locale as keyof typeof CALENDAR_LOCALES]}
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
          }: MonthCaptionProps) => {
            const fullySelected = isMonthFullySelected(calendarMonth.date);
            return (
              <MonthCaption {...props} calendarMonth={calendarMonth}>
                <div className="flex flex-col gap-2">
                  <div className="text-center font-display text-sm font-semibold text-ink">
                    {children}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      fullySelected
                        ? deselectEntireMonth(calendarMonth.date)
                        : selectEntireMonth(calendarMonth.date)
                    }
                    // Labelled by what the click is about to do, not the
                    // current state, so there's no ambiguity about which
                    // way the toggle is about to go.
                    className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-1 text-xs font-extrabold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky ${
                      fullySelected
                        ? "border-line bg-cloud text-slate hover:bg-silver/30"
                        : "border-sky/30 bg-sky-tint text-sky-deep hover:bg-sky-tint/70"
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
              </MonthCaption>
            );
          },
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
