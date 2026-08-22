"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckIcon, LockIcon } from "@/components/icons";
import {
  formatDateKey,
  formatDateShort,
  formatWeekdayLong,
} from "@/lib/date-keys";
import type { PollParticipant } from "@/lib/db/queries";
import { participantColor } from "@/lib/participant-colors";
import type { AvailabilityByParticipant } from "@/lib/poll-summary";
import { SaveIndicator, type SaveState } from "./PollWorkspace";

/**
 * The answering surface: one row per proposed date, one column per
 * participant. Only the current participant's column is editable — everyone
 * else's is a read-only, locked preview of their answer.
 */
export function AvailabilityGrid({
  dates,
  participants,
  currentParticipant,
  availabilityByParticipant,
  onToggleDate,
  onChangeIdentity,
  saveState,
  saveError,
}: {
  dates: string[];
  participants: PollParticipant[];
  currentParticipant: PollParticipant;
  availabilityByParticipant: AvailabilityByParticipant;
  onToggleDate: (dateKey: string) => void;
  onChangeIdentity: () => void;
  saveState: SaveState;
  saveError: string | null;
}) {
  const t = useTranslations("AvailabilityGrid");
  const locale = useLocale();
  const currentColor = participantColor(
    participants.findIndex((p) => p.id === currentParticipant.id),
  );

  function toggleDate(dateKey: string) {
    onToggleDate(dateKey);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-baseline gap-2 text-base font-bold text-slate">
            {t("answeringAs")}
            <span
              className={`rounded-full px-3.5 py-1.5 text-base font-extrabold ${currentColor.bg} ${currentColor.text}`}
            >
              {currentParticipant.name}
            </span>
          </p>
          <button
            type="button"
            onClick={onChangeIdentity}
            className="mt-1 text-xs font-bold text-mist underline-offset-2 transition hover:text-slate hover:underline"
          >
            {t("switchPerson")}
          </button>
        </div>
        <SaveIndicator state={saveState} error={saveError} />
      </div>

      <div className="mt-4 w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <caption className="sr-only">{t("caption")}</caption>
          <thead>
            <tr className="border-b border-line">
              <th
                scope="col"
                className="py-3 pr-4 text-left text-xs font-extrabold uppercase tracking-wide text-mist"
              >
                {t("dateColumn")}
              </th>
              {participants.map((participant, i) => {
                const isCurrent = participant.id === currentParticipant.id;
                const { bg, text } = participantColor(i);
                return (
                  <th
                    key={participant.id}
                    scope="col"
                    aria-disabled={!isCurrent}
                    className={`px-2 py-3 text-center text-xs font-extrabold ${
                      isCurrent
                        ? "border-x-2 border-t-2 border-sky/50 bg-sky-tint/50"
                        : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {!isCurrent && (
                        <LockIcon
                          className="h-3.5 w-3.5 text-mist"
                          aria-label={t("locked")}
                        />
                      )}
                      <span
                        className={`rounded-full px-2.5 py-1 ${bg} ${text} ${isCurrent ? "" : "opacity-70"}`}
                      >
                        {participant.name}
                        {isCurrent && ` ${t("you")}`}
                      </span>
                    </span>
                  </th>
                );
              })}
              <th scope="col" className="sr-only">
                {t("countColumn")}
              </th>
            </tr>
          </thead>
          <tbody>
            {dates.map((dateKey, index) => {
              const availableCount = participants.filter((p) =>
                (availabilityByParticipant[p.id] ?? []).includes(dateKey),
              ).length;
              const worksForEveryone =
                participants.length > 0 &&
                availableCount === participants.length;
              const state = availabilityState(
                availableCount,
                participants.length,
              );
              // A thicker top border marks the first row of a new month, so
              // a long list of dates doesn't read as one undifferentiated
              // block.
              const isNewMonth =
                index > 0 && monthOf(dateKey) !== monthOf(dates[index - 1]);
              return (
                <tr
                  key={dateKey}
                  className={`border-b border-line ${state.row} ${
                    isNewMonth ? "border-t-2 border-t-ink/20" : ""
                  }`}
                >
                  <th
                    scope="row"
                    className="py-2.5 pr-4 pl-2 text-left text-sm font-semibold text-ink"
                  >
                    {/* Fixed-height row so the "Everyone" pill doesn't change
                        this row's height relative to the ones without it.
                        Weekday and date each get their own fixed-width
                        column, spreadsheet-style, so they line up down the
                        whole list instead of ragging with name length. */}
                    <span className="flex h-6 items-center gap-2 whitespace-nowrap">
                      <span className="inline-block w-24 shrink-0 text-left">
                        {formatWeekdayLong(dateKey, locale)}
                      </span>
                      <span className="inline-block w-10 text-left   text-slate">
                        {formatDateShort(dateKey)}
                      </span>
                      {worksForEveryone && (
                        <span className="shrink-0 rounded-full bg-green-deep px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                          {t("everyone")}
                        </span>
                      )}
                    </span>
                  </th>
                  {participants.map((participant) => {
                    const isCurrent = participant.id === currentParticipant.id;
                    const checked = (
                      availabilityByParticipant[participant.id] ?? []
                    ).includes(dateKey);
                    return (
                      <td
                        key={participant.id}
                        className={`px-2 py-2.5 text-center ${
                          isCurrent
                            ? "border-x-2 border-sky/30 bg-sky-tint/30"
                            : ""
                        }`}
                      >
                        <AvailabilityCell
                          checked={checked}
                          locked={!isCurrent}
                          label={
                            isCurrent
                              ? t("yourAvailabilityAria", {
                                  date: formatDateKey(dateKey, locale),
                                })
                              : t("readonlyAvailabilityAria", {
                                  name: participant.name,
                                  date: formatDateKey(dateKey, locale),
                                })
                          }
                          onToggle={() => toggleDate(dateKey)}
                        />
                      </td>
                    );
                  })}
                  <td
                    className={`px-3 py-2.5 text-center text-base font-black tabular-nums ${state.countCell}`}
                  >
                    {availableCount}/{participants.length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export function AvailabilityCell({
  checked,
  locked,
  label,
  onToggle,
}: {
  checked: boolean;
  locked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <label
      className={`inline-flex p-1 ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        aria-label={label}
        aria-disabled={locked}
        tabIndex={locked ? -1 : 0}
        onChange={() => {
          if (!locked) onToggle();
        }}
      />
      <span
        className={`grid h-7 w-7 place-items-center rounded-md border-2 transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-sky peer-focus-visible:ring-offset-1 ${
          locked
            ? checked
              ? "border-silver bg-silver"
              : "border-line bg-cloud"
            : checked
              ? "border-sky bg-sky hover:scale-110 hover:bg-sky-light"
              : "border-line bg-white hover:scale-110 hover:border-sky"
        }`}
      >
        <CheckIcon
          className={`h-4 w-4 text-white transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
        />
      </span>
    </label>
  );
} /**
 * Row color by how close the date is to working for everyone:
 * all available = green, one short = orange, two or more short = red.
 * Saturated enough to read at a glance, not just a faint tint.
 */

export function availabilityState(count: number, total: number) {
  if (total > 0 && count === total) {
    return {
      row: "bg-green/15",
      countCell: "bg-green-600 text-white",
    };
  }
  if (count === total - 1) {
    return {
      row: "bg-orange/15",
      countCell: "bg-orange-200 text-slate-700",
    };
  }
  return {
    row: "bg-red/12",
    countCell: "bg-red-400 text-slate-700",
  };
}

/** The "YYYY-MM" prefix of a "YYYY-MM-DD" date key. */
function monthOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}
