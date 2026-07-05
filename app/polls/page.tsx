import type { InferSelectModel } from "drizzle-orm";

import type { pollsTable } from "@/lib/db/schema";
import { addPoll, getPolls } from "../actions/polls";
import { Suspense } from "react";

type Poll = InferSelectModel<typeof pollsTable>;

const mockPolls: Poll[] = [
  {
    id: 1,
    title: "Team Offsite Date",
    description: "Pick the best date for our quarterly offsite.",
    createdAt: 1720170000,
    updatedAt: 1720170000,
  },
  {
    id: 2,
    title: "Lunch Option",
    description: "Vote for what we should order for Friday lunch.",
    createdAt: 1720256400,
    updatedAt: 1720342800,
  },
];

function formatTimestamp(value: Poll["updatedAt"]) {
  return new Date(value * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PollsPage() {
  const handleClickAddPoll = async () => {
    await addPoll();
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Time Picker
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Polls
        </h1>
        <p className="text-sm text-slate-600">
          Frontend scaffold for rendering polls from your Drizzle schema.
        </p>
      </header>

      <Suspense fallback={<Fallback />}>
        <PollList />
      </Suspense>
      {/* <button onClick={handleClickAddPoll}>Add poll</button> */}
    </main>
  );
}

function Fallback() {
  return <div>LOADING POLLS...</div>;
}

async function PollList() {
  const polls = await getPolls();
  if (polls.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">No polls yet</p>
        <p className="mt-2 text-sm text-slate-600">
          Your poll list will render here once your server logic is wired up.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {polls.map((poll) => (
        <li
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          key={poll.id}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {poll.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{poll.description}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Poll #{poll.id}
            </span>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
            Updated {formatTimestamp(poll.updatedAt)}
          </div>
        </li>
      ))}
    </ul>
  );
}
