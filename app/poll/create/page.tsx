import Link from "next/link";
import { PollList } from "@/app/polls/PollsList";
import { CreatePollForm } from "./CreatePollForm";

export default function CreatePollPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Time Picker
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Create Poll
        </h1>
        <p className="text-sm text-slate-600">
          Add your poll details below to set up a new scheduling poll.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Poll Details</h2>
        <p className="mt-1 text-sm text-slate-600">
          Form fields and submit behavior will go here.
        </p>
        <CreatePollForm />
      </section>

      <Link
        href="/polls"
        className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
      >
        Back to all polls
      </Link>
      <PollList />
    </main>
  );
}
