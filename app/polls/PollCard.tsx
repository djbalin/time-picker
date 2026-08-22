import Link from "next/link";
import { CalendarIcon, CheckIcon } from "@/components/icons";
import { formatDateKeyLong } from "@/lib/date-keys";
import type { PollSummaryRow } from "@/lib/db/queries";
import { formatRelative, pluralize } from "@/lib/format";

export function PollCard({ poll }: { poll: PollSummaryRow }) {
  const everyoneAnswered =
    poll.participantCount > 0 && poll.respondedCount === poll.participantCount;

  return (
    <li>
      <Link
        href={`/polls/${poll.slug}`}
        className="block rounded-lg border border-line bg-white p-6 shadow-soft transition hover:border-sky hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-ink">
              {poll.title}
            </h2>
            {poll.description && (
              <p className="mt-1 text-sm font-semibold text-slate">
                {poll.description}
              </p>
            )}
          </div>
          {poll.finalizedDate && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-tint px-3 py-1 text-xs font-extrabold text-green-deep">
              <CheckIcon className="h-3.5 w-3.5" />
              Decided
            </span>
          )}
        </div>

        {poll.finalizedDate ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-tint px-3 py-1 text-xs font-extrabold text-green-deep">
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatDateKeyLong(poll.finalizedDate)}
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-tint px-3 py-1 text-xs font-extrabold text-sky-deep">
              {poll.dates.length} {pluralize(poll.dates.length, "date")}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                everyoneAnswered
                  ? "bg-green-tint text-green-deep"
                  : "bg-cloud text-slate"
              }`}
            >
              {poll.respondedCount}/{poll.participantCount} answered
            </span>
          </div>
        )}

        <p className="mt-4 border-t border-line pt-3 text-xs font-bold text-mist">
          Updated {formatRelative(poll.updatedAt)}
        </p>
      </Link>
    </li>
  );
}
