import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto w-full max-w-5xl px-6 py-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-sky shadow-raised">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="4" />
              <path d="M3 9h18M8 2v4M16 2v4" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Time Picker
            </span>
            <span className="mt-0.5 text-xs font-bold text-mist">
              Find a time together
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/polls"
            className="text-sm font-extrabold text-slate transition hover:text-ink"
          >
            Polls
          </Link>
          <Link
            href="/polls/create"
            className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-extrabold text-paper shadow-raised transition hover:bg-graphite"
          >
            New poll
          </Link>
        </nav>
      </div>
    </header>
  );
}
