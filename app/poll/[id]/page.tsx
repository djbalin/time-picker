import Link from "next/link";
import { notFound } from "next/navigation";

import { getPollById } from "@/app/actions/polls";

function formatTimestamp(value: number) {
  console.log(value);
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
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {poll.title}
        </h1>{" "}
        <p className="mt-3 text-base text-slate-700">{poll.description}</p>
        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:grid-cols-2">
          <p>
            <span className="font-medium text-slate-800">Created:</span>{" "}
            {poll.createdAt}
          </p>
          <p>
            <span className="font-medium text-slate-800">Updated:</span>{" "}
            {poll.updatedAt}
          </p>
        </div>
      </header>

      <Link
        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        href="/polls"
      >
        Back to all polls
      </Link>
    </main>
  );
}
