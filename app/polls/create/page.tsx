import Link from "next/link";
import { CreatePollForm } from "./CreatePollForm";

export default function CreatePollPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 pb-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Create poll
        </h1>
        {/* <p className="mt-1 text-sm font-semibold text-slate">
          Add your poll details and pick the dates you'd like to propose.
        </p> */}
      </header>

      <section className="rounded-lg border border-line bg-white px-6 shadow-soft sm:py-6 sm:px-8">
        <CreatePollForm />
      </section>

      <Link
        href="/polls"
        className="text-sm font-extrabold text-slate underline-offset-2 hover:text-ink hover:underline"
      >
        ← Back to all polls
      </Link>
    </main>
  );
}
