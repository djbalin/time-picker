import type { Metadata } from "next";
import Link from "next/link";
import { CreatePollForm } from "./CreatePollForm";

export const metadata: Metadata = {
  title: "Create a poll · Time Picker",
  description: "Propose dates and invite your group to pick what works.",
};

export default function CreatePollPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Create poll
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate">
          Add who's coming and every date that could work. You'll get a link to
          share once it's created.
        </p>
      </header>

      <section className="rounded-lg border border-line bg-white px-6 py-6 shadow-soft sm:px-8">
        <CreatePollForm />
      </section>

      <Link
        href="/polls"
        className="text-sm font-extrabold text-slate underline-offset-2 transition hover:text-ink hover:underline"
      >
        ← Back to all polls
      </Link>
    </main>
  );
}
