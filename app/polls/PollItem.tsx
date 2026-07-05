"use client";
import { Poll } from "@/lib/db/schema";
import Link from "next/link";
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
    <li
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      key={poll.id}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{poll.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{poll.description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          Poll #{poll.id}
        </span>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        Updated {poll.updatedAt}
      </div>
      <Link
        className="text-sm text-slate-700 underline"
        href={`/poll/${poll.id}`}
      >
        Open poll
      </Link>
      <button onClick={() => deletePoll(poll.id)}>Delete poll</button>
    </li>
  );
};
