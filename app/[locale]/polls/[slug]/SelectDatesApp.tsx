"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { finalizePoll } from "@/app/actions/polls";
import {
  Avatar,
  AvatarStack,
  Button,
  Chip,
  IconButton,
  SegmentedControl,
} from "@/components/ui";
import { formatDateKey, fromDateKey } from "@/lib/date-keys";
import type { PollDetail, PollParticipant } from "@/lib/db/queries";
import { getAdminToken, getIdentity, setIdentity } from "@/lib/local-store";
import { participantColor } from "@/lib/participant-colors";
import { type DateSummary, summarizePoll } from "@/lib/poll-summary";
import { BestDates } from "./BestDates";
import { IdentityPicker } from "./IdentityPicker";
import { InviteLink } from "./InviteLink";
import { MonthCalendar, monthLabel } from "./MonthCalendar";
import { NightsList } from "./NightsList";
import { OwnerTools } from "./OwnerTools";
import { SaveIndicator } from "./SaveIndicator";
import { type SaveState, useDebouncedSave } from "./useDebouncedSave";

type View = "month" | "nights";

/**
 * The Select Dates screen: the invite link up top, then the month (2a) or
 * the ranked nights (2b), with the best dates in a rail beside them.
 */
export function SelectDatesApp({ poll }: { poll: PollDetail }) {
  const t = useTranslations("SelectDates");
  const locale = useLocale();
  const router = useRouter();

  const [view, setView] = useState<View>("month");
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [identityChecked, setIdentityChecked] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [localAnswer, setLocalAnswer] = useState<string[] | null>(null);
  const [addedParticipants, setAddedParticipants] = useState<PollParticipant[]>(
    [],
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showGroup, setShowGroup] = useState(false);
  const [monthDate, setMonthDate] = useState<Date>(() =>
    startMonth(poll.dates),
  );
  const [finalizing, startFinalize] = useTransition();

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
    setAdminToken(getAdminToken(poll.slug));
  }, [poll.slug]);

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

  function settle(date: string | null) {
    if (!adminToken) return;
    startFinalize(async () => {
      const result = await finalizePoll(poll.slug, adminToken, date);
      if (result.ok) router.refresh();
    });
  }

  const nav = [
    { value: "month" as const, label: t("viewMonth"), icon: "calendar_month" },
    { value: "nights" as const, label: t("viewNights"), icon: "list" },
  ];

  const topDate = summary.topDates[0]?.date ?? null;
  const answered = summary.respondedCount;

  return (
    <div className="flex  w-full flex-col py-4 px-4 sm:py-8 lg:py-10 gap-4 h-screen  rounded-sheet[background:var(--grad-page)] sm:gap-[18px] ">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="font-display text-4xl leading-tight tracking-display text-strong sm:text-5xl">
            {poll.title}
          </h1>
          {current !== null ? (
            <p className="mt-2 font-display text-xl leading-snug tracking-display text-body sm:text-2xl">
              {t.rich("greeting", {
                name: current.name,
                pill: (chunks) => (
                  <NamePill
                    colorIndex={participants.indexOf(current)}
                    label={t("switchPerson")}
                    onClick={() => {
                      flush();
                      setCurrentId(null);
                    }}
                  >
                    {chunks}
                  </NamePill>
                ),
              })}
            </p>
          ) : null}
        </div>
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
          <InviteLink slug={poll.slug} />
          {current !== null ? (
            <button
              type="button"
              onClick={() => setShowGroup(true)}
              aria-label={t("groupHeading", { count: participants.length })}
              className="flex shrink-0 items-center gap-3 rounded-pill border border-white bg-surface-glass py-1.5 pl-2 pr-4 shadow-rest backdrop-blur-lg transition-colors hover:bg-paper"
            >
              <AvatarStack names={participants.map((p) => p.name)} size="md" />
              <span className="whitespace-nowrap text-xs font-semibold text-body">
                {t("answeredCount", {
                  answered,
                  total: participants.length,
                })}
              </span>
            </button>
          ) : null}
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
            <div className="min-w-0 rounded-sheet bg-surface-card p-3 shadow-sheet sm:p-[18px]">
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
                className="max-h-96 lg:absolute lg:inset-0 lg:max-h-none"
              />
            </div>

            <div className="min-w-0 lg:col-start-1">
              <div className="flex justify-end px-1">
                <SaveIndicator state={saveState} error={saveError} />
              </div>

              {adminToken ? (
                <SettleBar
                  finalizedDate={poll.finalizedDate}
                  topDate={topDate}
                  locale={locale}
                  busy={finalizing}
                  onSettle={() => settle(topDate)}
                  onReopen={() => settle(null)}
                />
              ) : null}
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
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-0.5 align-baseline font-display transition-[filter] hover:brightness-95 ${bg} ${text}`}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function GroupStats({
  participants,
  respondedIds,
  availability,
  dates,
  locale,
  onClose,
}: {
  participants: PollParticipant[];
  respondedIds: Set<number>;
  availability: Record<number, string[]>;
  dates: string[];
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations("SelectDates");
  const proposed = new Set(dates);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-sheet bg-surface-card p-6 shadow-pop"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-display text-strong">
            {t("groupHeading", { count: participants.length })}
          </h2>
          <IconButton
            icon="close"
            label={t("close")}
            size="sm"
            onClick={onClose}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {participants.map((p) => {
            const answered = respondedIds.has(p.id);
            const yesDates = (availability[p.id] ?? [])
              .filter((d) => proposed.has(d))
              .sort();
            return (
              <div key={p.id} className="rounded-md bg-paper-2 p-4 shadow-rest">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} size="md" />
                  <span className="flex-1 font-sans text-md font-bold text-strong">
                    {p.name}
                  </span>
                  <Chip tone={answered ? "yes" : "accent"}>
                    {answered ? t("statAnswered") : t("statNotAnswered")}
                  </Chip>
                </div>
                {answered ? (
                  <p className="mt-2 text-xs text-body">
                    {yesDates.length > 0
                      ? t("statYesDates", {
                          count: yesDates.length,
                          dates: yesDates
                            .map((d) => formatDateKey(d, locale))
                            .join(", "),
                        })
                      : t("statNoDates")}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
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

function SettleBar({
  finalizedDate,
  topDate,
  locale,
  busy,
  onSettle,
  onReopen,
}: {
  finalizedDate: string | null;
  topDate: string | null;
  locale: string;
  busy: boolean;
  onSettle: () => void;
  onReopen: () => void;
}) {
  const t = useTranslations("SelectDates");

  if (finalizedDate) {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-sheet p-[18px_22px] shadow-pop [background:var(--grad-sunset)]">
        <span className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/75">
            <span className="ms text-[22px] text-accent-text" aria-hidden>
              celebration
            </span>
          </span>
          <span>
            <span className="block text-2xs font-semibold uppercase tracking-caps text-ink-800/70">
              {t("itsHappening")}
            </span>
            <span className="block font-display text-xl text-ink-900">
              {longDate(finalizedDate, locale)}
            </span>
          </span>
        </span>
        <Button variant="glass" onClick={onReopen} disabled={busy}>
          {t("reopen")}
        </Button>
      </div>
    );
  }

  if (!topDate) return null;

  return (
    <div className="mt-4 flex justify-end">
      <Button
        variant="primary"
        size="lg"
        icon="celebration"
        onClick={onSettle}
        disabled={busy}
      >
        {t("settleOn", { date: shortDate(topDate, locale) })}
      </Button>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-sheet bg-surface-card p-10 text-center shadow-sheet">
      <p className="font-display text-xl text-strong">{title}</p>
      {body ? <p className="mt-2 text-sm text-body">{body}</p> : null}
    </div>
  );
}

function longDate(dateKey: string, locale: string): string {
  return fromDateKey(dateKey).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function shortDate(dateKey: string, locale: string): string {
  return fromDateKey(dateKey).toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function shiftMonth(date: Date, by: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + by, 1);
}

function startMonth(dates: string[]): Date {
  const first = [...dates].sort()[0];
  const d = first ? fromDateKey(first) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
