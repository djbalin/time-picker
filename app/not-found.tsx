import Link from "next/link";
import { buttonClass } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-lg bg-sky-tint text-3xl">
        🗓️
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        We couldn't find that
      </h1>
      <p className="text-sm font-semibold text-slate">
        The poll may have been deleted, or the link might have a typo in it.
        Double-check the link with whoever shared it.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/polls" className={buttonClass()}>
          Your polls
        </Link>
        <Link
          href="/polls/create"
          className={buttonClass({ variant: "secondary" })}
        >
          Create a poll
        </Link>
      </div>
    </main>
  );
}
