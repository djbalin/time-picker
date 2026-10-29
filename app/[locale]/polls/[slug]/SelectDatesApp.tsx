"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { IconButton, SegmentedControl } from "@/components/ui";
import { fromDateKey } from "@/lib/date-keys";
import type { PollDetail, PollParticipant } from "@/lib/db/queries";
import { getIdentity, setIdentity } from "@/lib/local-store";
import { participantColor } from "@/lib/participant-colors";
import { type DateSummary, summarizePoll } from "@/lib/poll-summary";
import { BestDates } from "./BestDates";
import { IdentityPicker } from "./IdentityPicker";
import { MonthCalendar, monthLabel } from "./MonthCalendar";
import { NightsList } from "./NightsList";
import { SaveIndicator } from "./SaveIndicator";
import { ShareButton } from "./ShareButton";
import { type SaveState, useDebouncedSave } from "./useDebouncedSave";

type View = "month" | "nights";

/**
 * The Select Dates screen: the invite link up top, then the month (2a) or
 * the ranked nights (2b), with the best dates in a rail beside them.
 */
export function SelectDatesApp({ poll }: { poll: PollDetail }) {
  const t = useTranslations("SelectDates");
  const locale = useLocale();

  const [view, setView] = useState<View>("month");
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [identityChecked, setIdentityChecked] = useState(false);
  const [localAnswer, setLocalAnswer] = useState<string[] | null>(null);
  const [addedParticipants, setAddedParticipants] = useState<PollParticipant[]>(
    [],
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  // const [showGroup, setShowGroup] = useState(false);
  const [monthDate, setMonthDate] = useState<Date>(() =>
    startMonth(poll.dates),
  );
  // const [finalizing, startFinalize] = useTransition();

  const participants = useMemo(() => {
    const known = new Set(poll.participants.map((p) => p.id));
    return [
      ...poll.participants,
      ...addedParticipants.filter((p) => !known.has(p.id)),
    ];
  }, [poll.participants, addedParticipants]);

  const availability = useMemo(() => {
    if (currentId === null || localAnswer === null) return poll.availability;
    return { ...poll.availability, [currentId]: localAnswer };
  }, [poll.availability, currentId, localAnswer]);

  const respondedIds = useMemo(() => {
    const ids = new Set(
      participants.filter((p) => p.hasResponded).map((p) => p.id),
    );
    if (currentId !== null && localAnswer !== null) ids.add(currentId);
    return ids;
  }, [participants, currentId, localAnswer]);

  const summary = useMemo(
    () =>
      summarizePoll({
        dates: poll.dates,
        participants,
        availability,
        respondedIds,
      }),
    [poll.dates, participants, availability, respondedIds],
  );

  const proposed = useMemo(() => new Set(poll.dates), [poll.dates]);
  const dayByDate = useMemo(() => {
    const out: Record<string, DateSummary> = {};
    for (const day of summary.byDate) out[day.date] = day;
    return out;
  }, [summary]);

  const current = participants.find((p) => p.id === currentId) ?? null;
  const myAnswer = currentId === null ? [] : (availability[currentId] ?? []);
  const mineDates = useMemo(() => new Set(myAnswer), [myAnswer]);

  const { save, flush } = useDebouncedSave({
    slug: poll.slug,
    onStateChange: setSaveState,
    onError: setSaveError,
  });

  useEffect(() => {
    const remembered = getIdentity(poll.slug);
    const stillExists =
      remembered !== null && poll.participants.some((p) => p.id === remembered);
    if (stillExists) setCurrentId(remembered);
    setIdentityChecked(true);
  }, [poll.slug, poll.participants]);

  const chooseIdentity = useCallback(
    (participantId: number) => {
      flush();
      setIdentity(poll.slug, participantId);
      setLocalAnswer(null);
      setSaveState("idle");
      setSaveError(null);
      setCurrentId(participantId);
    },
    [poll.slug, flush],
  );

  const handleJoined = useCallback(
    (participant: PollParticipant) => {
      setAddedParticipants((prev) => [...prev, participant]);
      chooseIdentity(participant.id);
    },
    [chooseIdentity],
  );

  const toggleMine = useCallback(
    (dateKey: string) => {
      if (currentId === null) return;
      const next = myAnswer.includes(dateKey)
        ? myAnswer.filter((d) => d !== dateKey)
        : [...myAnswer, dateKey].sort();
      setLocalAnswer(next);
      save(currentId, next);
    },
    [currentId, myAnswer, save],
  );

  const nav = [
    { value: "month" as const, label: t("viewMonth"), icon: "calendar_month" },
    { value: "nights" as const, label: t("viewNights"), icon: "list" },
  ];

  const answered = summary.respondedCount;

  const switchPerson = () => {
    flush();
    setCurrentId(null);
  };

  return (
    <div className="flex max-w-[1300px]   w-full flex-col py-4 px-4 sm:py-8 lg:py-10 gap-4 h-screen  rounded-sheet[background:var(--grad-page)] sm:gap-[18px] ">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl leading-tight tracking-display text-strong sm:text-5xl">
            {poll.title}
          </h1>
          {poll.description ? (
            <p className="mt-1.5 max-w-[60ch] text-sm text-body sm:text-md">
              {poll.description}
            </p>
          ) : null}
          {current !== null ? (
            <p className="mt-2 font-display text-xl leading-snug tracking-display text-body sm:text-2xl">
              {t.rich("greeting", {
                name: current.name,
                pill: (chunks) => (
                  <NamePill
                    colorIndex={participants.indexOf(current)}
                    label={t("switchPerson")}
                    onClick={switchPerson}
                  >
                    {chunks}
                  </NamePill>
                ),
              })}
            </p>
          ) : null}
        </div>
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
          <ShareButton slug={poll.slug} />
        </div>
      </header>

      {poll.dates.length === 0 ? (
        <Empty title={t("emptyTitle")} body={t("emptyBody")} />
      ) : !identityChecked ? (
        <Empty title={t("loading")} body="" />
      ) : current === null ? (
        <IdentityPicker
          slug={poll.slug}
          participants={participants}
          onSelect={chooseIdentity}
          onJoined={handleJoined}
        />
      ) : (
        <>
          {/* The rail shares the calendar's row, so it stretches to the
                calendar's height and scrolls past it instead of growing. */}
          <div className="grid gap-x-5 gap-y-4 lg:grid-cols-[minmax(0,1fr)_322px]">
            <div className="min-w-0 rounded-[14px] border border-apricot-300 bg-paper p-3 sm:p-[18px]">
              <p className="flex flex-wrap items-center gap-x-1 px-1 text-xs text-ink-400">
                <span>
                  {t.rich("answeringAs", {
                    name: current.name,
                    b: (chunks) => (
                      <span className="font-bold text-body">{chunks}</span>
                    ),
                  })}
                </span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={switchPerson}
                  className="font-semibold text-plum-600 underline decoration-plum-300 underline-offset-2 hover:decoration-plum-600"
                >
                  {t("switchPerson")}
                </button>
              </p>
              <div className="mb-3 flex items-center justify-between gap-2">
                {view === "month" ? (
                  <div className="flex min-w-0 items-center gap-1">
                    <IconButton
                      icon="arrow_back"
                      label={t("prevMonth")}
                      size="sm"
                      onClick={() => setMonthDate(shiftMonth(monthDate, -1))}
                    />
                    <span className="truncate text-center font-display text-lg tracking-display text-strong first-letter:uppercase sm:min-w-[170px] sm:text-xl">
                      {monthLabel(monthDate, locale)}
                    </span>
                    <IconButton
                      icon="arrow_forward"
                      label={t("nextMonth")}
                      size="sm"
                      onClick={() => setMonthDate(shiftMonth(monthDate, 1))}
                    />
                  </div>
                ) : (
                  <span className="px-1 font-display text-lg tracking-display text-strong sm:text-xl">
                    {t("allNights", { count: poll.dates.length })}
                  </span>
                )}
                <SegmentedControl
                  options={nav}
                  value={view}
                  onChange={setView}
                  iconOnly
                  aria-label={t("viewLabel")}
                />
              </div>

              {view === "month" ? (
                <MonthCalendar
                  monthDate={monthDate}
                  locale={locale}
                  proposed={proposed}
                  days={dayByDate}
                  totalParticipants={participants.length}
                  mineDates={mineDates}
                  canAnswer
                  onToggleMine={toggleMine}
                />
              ) : (
                <NightsList
                  days={summary.byDate}
                  locale={locale}
                  totalParticipants={participants.length}
                  mineDates={mineDates}
                  canAnswer
                  onToggleMine={toggleMine}
                />
              )}

              <Legend />
            </div>

            <div className="min-w-0 lg:relative">
              <BestDates
                days={summary.byDate}
                locale={locale}
                participantNames={participants.map((p) => p.name)}
                answered={answered}
                className="max-h-96 lg:absolute lg:inset-0 lg:max-h-none"
              />
            </div>

            <div className="min-w-0 lg:col-start-1">
              <div className="flex justify-end px-1">
                <SaveIndicator state={saveState} error={saveError} />
              </div>

              {/* {adminToken ? (
                <SettleBar
                  finalizedDate={poll.finalizedDate}
                  topDate={topDate}
                  locale={locale}
                  busy={finalizing}
                  onSettle={() => settle(topDate)}
                  onReopen={() => settle(null)}
                />
              ) : null} */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** You, in your participant colour. Tapping it lets you switch person. */
function NamePill({
  colorIndex,
  label,
  onClick,
  children,
}: {
  colorIndex: number;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const { bg, text } = participantColor(colorIndex);
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-0.5 align-baseline font-display transition-[filter] hover:brightness-95 ${bg} ${text}`}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function Legend() {
  const t = useTranslations("SelectDates");
  const items: [string, string][] = [
    ["bg-mint-300", t("legendEveryone")],
    ["bg-butter-300", t("legendMost")],
    ["bg-coral-300", t("legendFew")],
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1">
      {items.map(([dot, label]) => (
        <span
          key={label}
          className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-body"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[14px] border border-apricot-300 bg-paper p-10 text-center">
      <p className="font-display text-xl text-strong">{title}</p>
      {body ? <p className="mt-2 text-sm text-body">{body}</p> : null}
    </div>
  );
}

function shiftMonth(date: Date, by: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + by, 1);
}

function startMonth(dates: string[]): Date {
  const first = [...dates].sort()[0];
  const d = first ? fromDateKey(first) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
