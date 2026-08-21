/**
 * Turns raw availability rows into the per-date rollup that both the grid and
 * the results panel render. Pure and dependency-free so it can be unit-tested
 * and reused on either side of the server boundary.
 */

export type SummaryParticipant = {
  id: number;
  name: string;
};

/** Date keys each participant said yes to, keyed by participant id. */
export type AvailabilityByParticipant = Record<number, string[]>;

export type DateSummary = {
  date: string;
  /** Participants who said yes. */
  available: SummaryParticipant[];
  /** Participants who answered, but not for this date. */
  unavailable: SummaryParticipant[];
  /** Participants who haven't answered the poll at all yet. */
  pending: SummaryParticipant[];
  yesCount: number;
  /** Everyone invited, answered or not. */
  totalCount: number;
  /** Nobody is missing — including the people who haven't replied. */
  worksForEveryone: boolean;
  /** Ties the current highest yes-count (and that count is above zero). */
  isTop: boolean;
};

export type PollSummary = {
  byDate: DateSummary[];
  /** Highest yes-count across all dates; 0 when nobody has answered. */
  topCount: number;
  /** Dates tied at `topCount`, in calendar order. Empty until someone answers. */
  topDates: DateSummary[];
  respondedCount: number;
  totalCount: number;
};

export function summarizePoll({
  dates,
  participants,
  availability,
  respondedIds,
}: {
  dates: string[];
  participants: SummaryParticipant[];
  availability: AvailabilityByParticipant;
  /** Participants with a saved answer — distinct from "said yes to nothing". */
  respondedIds: Iterable<number>;
}): PollSummary {
  const responded = new Set(respondedIds);
  const totalCount = participants.length;

  const byDate: DateSummary[] = dates.map((date) => {
    const available: SummaryParticipant[] = [];
    const unavailable: SummaryParticipant[] = [];
    const pending: SummaryParticipant[] = [];

    for (const participant of participants) {
      if (!responded.has(participant.id)) {
        pending.push(participant);
      } else if ((availability[participant.id] ?? []).includes(date)) {
        available.push(participant);
      } else {
        unavailable.push(participant);
      }
    }

    return {
      date,
      available,
      unavailable,
      pending,
      yesCount: available.length,
      totalCount,
      worksForEveryone: totalCount > 0 && available.length === totalCount,
      // Filled in below, once every date's count is known.
      isTop: false,
    };
  });

  const topCount = byDate.reduce((max, day) => Math.max(max, day.yesCount), 0);
  for (const day of byDate) {
    day.isTop = topCount > 0 && day.yesCount === topCount;
  }

  return {
    byDate,
    topCount,
    topDates: topCount > 0 ? byDate.filter((day) => day.isTop) : [],
    respondedCount: participants.filter((p) => responded.has(p.id)).length,
    totalCount,
  };
}
