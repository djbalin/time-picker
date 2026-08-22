"use client";

import { useEffect } from "react";
import { buttonClass } from "@/lib/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-lg bg-orange-tint text-3xl">
        ⚠️
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        Something went wrong
      </h1>
      <p className="text-sm font-semibold text-slate">
        That's on us. Try again — if it keeps happening, the database may be
        unreachable.
      </p>
      <button type="button" onClick={reset} className={buttonClass()}>
        Try again
      </button>
    </main>
  );
}
