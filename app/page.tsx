import Link from "next/link";

const features = [
  {
    icon: "📅",
    tint: "bg-sky-tint",
    title: "Propose dates",
    body: "Pick every date that could work on a friendly, multi-month calendar.",
  },
  {
    icon: "🔗",
    tint: "bg-green-tint",
    title: "Share the poll",
    body: "Send a link to everyone you're trying to schedule with. No sign-up needed.",
  },
  {
    icon: "✓",
    tint: "bg-orange-tint",
    title: "See what works",
    body: "Watch responses roll in and spot the date that works for the whole group.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-5xl px-6 pt-10 pb-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sky-tint px-3.5 py-1.5 text-xs font-extrabold text-sky-deep">
              <span className="h-2 w-2 rounded-full bg-sky" />
              Scheduling made simple
            </div>
            <h1 className="mb-4 font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
              Find a time everyone loves.
            </h1>
            <p className="mb-8 max-w-md text-lg leading-relaxed text-slate">
              Propose a handful of dates, share the poll, and let your group
              pick the one that works. No more endless back-and-forth.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/polls/create"
                className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3.5 text-base font-extrabold text-paper shadow-raised transition hover:bg-graphite"
              >
                Create a poll
              </Link>
              <Link
                href="/polls"
                className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3.5 text-base font-extrabold text-ink transition hover:border-silver"
              >
                View polls
              </Link>
            </div>
          </div>

          <div className="grid place-items-center">
            <div className="relative flex h-52 w-52 items-center justify-center rounded-lg bg-gradient-to-br from-sky-light to-sky text-7xl shadow-float">
              🗓️
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-line bg-white p-6 shadow-soft"
            >
              <div
                className={`mb-4 grid h-11 w-11 place-items-center rounded-md text-xl ${feature.tint}`}
              >
                {feature.icon}
              </div>
              <div className="mb-1.5 font-display text-lg font-semibold text-ink">
                {feature.title}
              </div>
              <p className="text-sm leading-relaxed text-slate">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="flex flex-col items-center justify-between gap-6 rounded-lg bg-ink px-8 py-10 text-center sm:flex-row sm:text-left">
          <div>
            <div className="font-display text-2xl font-semibold text-paper">
              Ready to lock in a date?
            </div>
            <p className="mt-1 text-sm font-semibold text-silver">
              Create a poll in under a minute.
            </p>
          </div>
          <Link
            href="/polls/create"
            className="inline-flex items-center justify-center rounded-full bg-sky px-6 py-3.5 text-base font-extrabold text-white shadow-raised transition hover:bg-sky-light"
          >
            Get started
          </Link>
        </div>
      </section>
    </main>
  );
}
