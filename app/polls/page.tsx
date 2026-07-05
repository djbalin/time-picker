import type { InferSelectModel } from "drizzle-orm";

import type { pollsTable } from "@/lib/db/schema";
import { getPolls } from "../actions/polls";
import { Suspense } from "react";
import { AddPollButton } from "./AddPollButton";
import { PollItem } from "./PollItem";

export default function PollsPage() {
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
      <AddPollButton />
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
        <PollItem poll={poll} />
      ))}
    </ul>
  );
}
