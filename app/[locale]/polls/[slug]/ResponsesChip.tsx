"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { formatDateKey } from "@/lib/date-keys";
import type { DateSummary } from "@/lib/poll-summary";

/**
 * The 👥 x/y chip for a date. Hover it with a mouse to see how each person
 * answered; tap it on touch (or press it from the keyboard) to pin that open.
 *
 * Renders the chip and its popover as siblings, so the popover is positioned
 * against the nearest positioned ancestor — pass its placement in
 * `popoverClassName`.
 */
export function ResponsesChip({
  day,
  total,
  countClass,
  className,
  popoverClassName,
  hideIconOnMobile = false,
  onMouseClick,
}: {
  day: DateSummary;
  total: number;
  /** Text colour for the count, usually the date's heat colour. */
  countClass: string;
  /** Position + size of the chip. */
  className: string;
  popoverClassName: string;
  hideIconOnMobile?: boolean;
  /** What a mouse click does instead of pinning (it already sees on hover). */
  onMouseClick?: () => void;
}) {
  const t = useTranslations("SelectDates");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const pointerType = useRef("");
  const chip = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!chip.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={chip}
        type="button"
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
        }}
        onClick={() => {
          if (pointerType.current === "mouse" && onMouseClick) onMouseClick();
          else setOpen((prev) => !prev);
          pointerType.current = "";
        }}
        aria-expanded={open}
        aria-describedby={popoverId}
        aria-label={t("responsesFor", {
          date: formatDateKey(day.date, locale),
        })}
        className={`peer/count inline-flex cursor-help items-center gap-0.5 whitespace-nowrap rounded-pill font-bold leading-none shadow-rest transition-colors hover:bg-white ${countClass} ${
          open ? "bg-white" : "bg-white/55"
        } ${className}`}
      >
        <span
          className={hideIconOnMobile ? "hidden sm:inline-flex" : "inline-flex"}
        >
          <Icon name="group" size={13} color="currentColor" />
        </span>
        {day.yesCount}/{total}
      </button>
      <DayResponses
        id={popoverId}
        day={day}
        className={`${open ? "block" : "hidden peer-hover/count:block"} ${popoverClassName}`}
      />
    </>
  );
}

function DayResponses({
  id,
  day,
  className,
}: {
  id: string;
  day: DateSummary;
  className: string;
}) {
  const t = useTranslations("SelectDates");
  const people = [
    ...day.available.map((p) => ({ ...p, mark: "yes" as const })),
    ...day.unavailable.map((p) => ({ ...p, mark: "no" as const })),
    ...day.pending.map((p) => ({ ...p, mark: "pending" as const })),
  ];
  const MARK = {
    yes: { icon: "check", color: "var(--color-yes)", label: t("responseYes") },
    no: { icon: "close", color: "var(--color-no)", label: t("responseNo") },
    pending: {
      icon: "schedule",
      color: "var(--color-ink-200)",
      label: t("responsePending"),
    },
  };

  return (
    <span
      id={id}
      role="tooltip"
      className={`pointer-events-none absolute z-30 w-max min-w-[140px] max-w-[220px] rounded-md bg-surface-card p-2.5 shadow-pop ${className}`}
    >
      {people.map((person) => {
        const mark = MARK[person.mark];
        return (
          <span key={person.id} className="flex items-center gap-2 py-0.5">
            <span
              className={`min-w-0 flex-1 truncate text-xs font-semibold ${
                person.mark === "pending" ? "text-muted" : "text-strong"
              }`}
            >
              {person.name}
            </span>
            <Icon name={mark.icon} size={16} color={mark.color} />
            <span className="sr-only">{mark.label}</span>
          </span>
        );
      })}
    </span>
  );
}
