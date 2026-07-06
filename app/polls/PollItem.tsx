"use client";
import Link from "next/link";
import type { Poll } from "@/lib/db/schema";
import { deletePoll } from "../actions/polls";

function formatTimestamp(value: Poll["updatedAt"]) {
  return new Date(value * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const PollItem = ({ poll }: { poll: Poll }) => {
  return (
    <li className="rounded-lg border border-line bg-white p-6 shadow-soft transition hover:shadow-raised">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            {poll.title}
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate">
            {poll.description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-cloud px-3 py-1 text-xs font-extrabold text-slate">
          Poll #{poll.id}
        </span>
      </div>

      {poll.dates.length > 0 && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-tint px-3 py-1 text-xs font-extrabold text-sky-deep">
          {poll.dates.length} proposed{" "}
          {poll.dates.length === 1 ? "date" : "dates"}
        </span>
      )}

      {poll.participants.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate">
            Participants
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {poll.participants.map((participant) => (
              <span
                key={participant}
                className="rounded-full bg-cloud px-3.5 py-1.5 text-xs font-extrabold text-slate"
              >
                {participant}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs font-bold text-mist">
          Updated {formatTimestamp(poll.updatedAt)}
        </span>
        <div className="flex items-center gap-4">
          <Link
            className="text-sm font-extrabold text-ink underline-offset-2 hover:underline"
            href={`/poll/${poll.id}`}
          >
            Open poll
          </Link>
          <button
            type="button"
            className="text-sm font-extrabold text-mist transition hover:text-[#ff3b30]"
            onClick={() => deletePoll(poll.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
};
