import { Suspense } from "react";
import { AddPollButton } from "./AddPollButton";
import { PollList } from "./PollsList";
import Link from "next/link";

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
      <Link
        href="/poll/create"
        className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Create poll
      </Link>
    </main>
  );
}

function Fallback() {
  return <div>LOADING POLLS...</div>;
}
