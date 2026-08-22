import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/lib/ui";
import { MyPolls } from "./MyPolls";

export const metadata: Metadata = {
  title: "Your polls · Time Picker",
  description: "Every scheduling poll you've created or opened on this device.",
};

export default function PollsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-mist">
            Time Picker
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Your polls
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate">
            Polls you've created or opened on this device.
          </p>
        </div>
        <Link href="/polls/create" className={buttonClass({ size: "md" })}>
          Create poll
        </Link>
      </header>

      <MyPolls />
    </main>
  );
}
