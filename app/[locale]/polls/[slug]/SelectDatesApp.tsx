"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
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
  buttonClass,
  Chip,
  IconButton,
  SegmentedControl,
  Wordmark,
} from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { formatDateKey, fromDateKey } from "@/lib/date-keys";
import type { PollDetail, PollParticipant } from "@/lib/db/queries";
import { getAdminToken, getIdentity, setIdentity } from "@/lib/local-store";
import { summarizePoll } from "@/lib/poll-summary";
import { IdentityPicker } from "./IdentityPicker";
import { InviteLink } from "./InviteLink";
import { MonthCalendar, monthLabel } from "./MonthCalendar";
import { NightsList } from "./NightsList";
import { OwnerTools } from "./OwnerTools";
import { SaveIndicator } from "./SaveIndicator";
import { SelectionRail } from "./SelectionRail";
import { type SaveState, useDebouncedSave } from "./useDebouncedSave";

type View = "month" | "nights";

/**
 * The Select Dates screen — the design team's app shell around the poll:
 * a sidebar, the month (2a) or the ranked nights (2b), and a rail that
 * says who's in for the night you've picked.
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
  const yesCountByDate = useMemo(() => {
    const out: Record<string, number> = {};
    for (const day of summary.byDate) out[day.date] = day.yesCount;
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

  // Land on the best date once answers are in; otherwise the first option.
  useEffect(() => {
    setSelectedDate((prev) => {
      if (prev && proposed.has(prev)) return prev;
      return summary.topDates[0]?.date ?? poll.dates[0] ?? null;
    });
  }, [summary.topDates, poll.dates, proposed]);

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

  const selectedDay =
    summary.byDate.find((d) => d.date === selectedDate) ?? null;
  const topDate = summary.topDates[0]?.date ?? null;
  const answered = summary.respondedCount;

  return (
    <div className="mx-auto w-full max-w-[--width-app]">
      <div
        className={`grid grid-cols-1 overflow-hidden rounded-sheet shadow-pop [background:var(--grad-page)] ${
          current === null ? "" : "md:grid-cols-[250px_1fr]"
        }`}
      >
        {/* ── Sidebar ─────────────────────────────────────────── */}
        {current !== null ? (
          <aside className="flex flex-col gap-6 border-b border-white/60 bg-surface-glass p-5 backdrop-blur-lg md:border-b-0">
            <Wordmark className="px-2 py-1" />

            <nav className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setShowGroup(true)}
                className="flex items-center gap-3 rounded-pill px-4 py-3 text-left font-sans text-md font-bold text-muted transition-colors hover:bg-paper hover:text-body hover:shadow-rest"
              >
                <span className="ms text-[22px]" aria-hidden="true">
                  group
                </span>
                {t("navGroup", { count: participants.length })}
              </button>
            </nav>

            <div className="flex-1" />

            <InviteLink slug={poll.slug} label={t("inviteLink")} />
            <Link
              href="/polls/create"
              className={buttonClass({ variant: "primary", full: true })}
            >
              <span className="ms text-[18px]" aria-hidden>
                add
              </span>
              {t("newProposal")}
            </Link>
          </aside>
        ) : null}

        {/* ── Main ────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-[18px] p-6 md:p-[28px_30px]">
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
              <header className="flex flex-wrap items-end justify-between gap-6">
                <div className="min-w-0">
                  <div className="text-2xs font-semibold uppercase tracking-label text-muted">
                    {poll.title}
                  </div>
                  <h1 className="mt-2 font-display text-3xl leading-tight tracking-display text-strong">
                    {t("question")}
                  </h1>
                </div>
                <div className="flex shrink-0 items-center gap-3 rounded-pill border border-white bg-surface-glass py-2.5 pl-3 pr-4 shadow-rest backdrop-blur-lg">
                  <AvatarStack
                    names={participants.map((p) => p.name)}
                    size="md"
                  />
                  <span className="whitespace-nowrap text-xs font-semibold text-body">
                    {t("answeredCount", {
                      answered,
                      total: participants.length,
                    })}
                  </span>
                </div>
              </header>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-pill border border-white bg-surface-glass p-[9px_12px] shadow-rest backdrop-blur-lg">
                <div className="flex items-center gap-1.5">
                  {view === "month" ? (
                    <>
                      <IconButton
                        icon="arrow_back"
                        label={t("prevMonth")}
                        size="sm"
                        onClick={() => setMonthDate(shiftMonth(monthDate, -1))}
                      />
                      <span className="min-w-[180px] text-center font-display text-xl tracking-display text-strong">
                        {monthLabel(monthDate, locale)}
                      </span>
                      <IconButton
                        icon="arrow_forward"
                        label={t("nextMonth")}
                        size="sm"
                        onClick={() => setMonthDate(shiftMonth(monthDate, 1))}
                      />
                    </>
                  ) : (
                    <span className="px-3 font-display text-xl tracking-display text-strong">
                      {t("allNights", { count: poll.dates.length })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Legend />
                  <SegmentedControl
                    options={nav}
                    value={view}
                    onChange={setView}
                    aria-label={t("viewLabel")}
                  />
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_322px] lg:items-start">
                <div className="min-w-0">
                  {view === "month" ? (
                    <MonthCalendar
                      monthDate={monthDate}
                      locale={locale}
                      proposed={proposed}
                      yesCountByDate={yesCountByDate}
                      totalParticipants={participants.length}
                      mineDates={mineDates}
                      selectedDate={selectedDate}
                      canAnswer
                      onSelect={setSelectedDate}
                      onToggleMine={toggleMine}
                    />
                  ) : (
                    <NightsList
                      nights={poll.dates.map((dateKey) => ({
                        dateKey,
                        yes: yesCountByDate[dateKey] ?? 0,
                      }))}
                      locale={locale}
                      totalParticipants={participants.length}
                      mineDates={mineDates}
                      selectedDate={selectedDate}
                      canAnswer
                      onSelect={setSelectedDate}
                      onToggleMine={toggleMine}
                    />
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        flush();
                        setCurrentId(null);
                      }}
                      className="text-xs font-bold text-muted underline-offset-2 transition-colors hover:text-body hover:underline"
                    >
                      {t("answeringAs", { name: current.name })} ·{" "}
                      {t("switchPerson")}
                    </button>
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

                <SelectionRail day={selectedDay} locale={locale} />
              </div>
            </>
          )}
        </div>
      </div>

      {adminToken ? (
        <div className="mt-4">
          <OwnerTools
            slug={poll.slug}
            adminToken={adminToken}
            title={poll.title}
          />
        </div>
      ) : null}

      {showGroup ? (
        <GroupStats
          participants={participants}
          respondedIds={respondedIds}
          availability={availability}
          dates={poll.dates}
          locale={locale}
          onClose={() => setShowGroup(false)}
        />
      ) : null}
    </div>
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
    <div className="hidden items-center gap-3.5 xl:flex">
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
