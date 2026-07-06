import Link from "next/link";
import { notFound } from "next/navigation";

import { getPollById, getPollBySlug } from "@/app/actions/polls";
import { formatTimestamp } from "@/lib/format";
import { ResponseFlow } from "./ResponseFlow";

export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);
  console.log(id);
  // if (Number.isNaN(numericId)) {
  //   notFound();
  // }

  const poll = await getPollBySlug(id);

  if (!poll) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          className="text-sm font-extrabold text-slate underline-offset-2 hover:text-ink hover:underline"
          href="/polls"
        >
          ← All polls
        </Link>
        <span className="rounded-full bg-cloud px-3 py-1 text-xs font-extrabold text-slate">
          Poll #{poll.id}
        </span>
      </div>

      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          {poll.title}
        </h1>
        {poll.description && (
          <p className="mt-0.5 text-sm font-semibold text-slate">
            {poll.description}
          </p>
        )}
        <p className="mt-1 text-xs font-bold text-mist">
          Created {formatTimestamp(poll.createdAt)} · Updated{" "}
          {formatTimestamp(poll.updatedAt)}
        </p>
      </header>

      <section className="rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
        <ResponseFlow pollId={poll.id} dates={poll.dates} />
      </section>
    </main>
  );
}
