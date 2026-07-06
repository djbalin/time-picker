import Link from "next/link";
import { notFound } from "next/navigation";

import { getPollById } from "@/app/actions/polls";
import { ResponseFlow } from "./ResponseFlow";

function formatTimestamp(value: number) {
  return new Date(value * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);

  if (Number.isNaN(numericId)) {
    notFound();
  }

  const poll = await getPollById(numericId);

  if (!poll) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <Link
        className="text-sm font-extrabold text-slate underline-offset-2 hover:text-ink hover:underline"
        href="/polls"
      >
        ← Back to all polls
      </Link>

      <header className="rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {poll.title}
          </h1>
          <span className="shrink-0 rounded-full bg-cloud px-3 py-1 text-xs font-extrabold text-slate">
            Poll #{poll.id}
          </span>
        </div>
        <p className="mt-3 text-base font-semibold text-slate">
          {poll.description}
        </p>
        <div className="mt-6 grid gap-3 border-t border-line pt-4 text-sm font-semibold text-slate sm:grid-cols-2">
          <p>
            <span className="font-extrabold text-ink">Created:</span>{" "}
            {formatTimestamp(poll.createdAt)}
          </p>
          <p>
            <span className="font-extrabold text-ink">Updated:</span>{" "}
            {formatTimestamp(poll.updatedAt)}
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-lg font-semibold text-ink">
          Availability
        </h2>
        <div className="mt-4">
          <ResponseFlow pollId={poll.id} dates={poll.dates} />
        </div>
      </section>
    </main>
  );
}
