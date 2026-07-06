import Link from "next/link";
import { Suspense } from "react";
import { PollList } from "./PollsList";

export default function PollsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-mist">
            Time Picker
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Polls
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate">
            All the scheduling polls you've created.
          </p>
        </div>
        <Link
          href="/polls/create"
          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-extrabold text-paper shadow-raised transition hover:bg-graphite"
        >
          Create poll
        </Link>
      </header>

      <Suspense fallback={<Fallback />}>
        <PollList />
      </Suspense>
    </main>
  );
}

function Fallback() {
  return (
    <div className="rounded-lg border border-line bg-white p-8 text-center text-sm font-bold text-mist shadow-soft">
      Loading polls...
    </div>
  );
}
