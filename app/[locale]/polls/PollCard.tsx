"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarIcon, CheckIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { formatDateKeyLong } from "@/lib/date-keys";
import type { PollSummaryRow } from "@/lib/db/queries";
import { formatRelative } from "@/lib/format";

export function PollCard({ poll }: { poll: PollSummaryRow }) {
  const t = useTranslations("PollCard");
  const locale = useLocale();
  const everyoneAnswered =
    poll.participantCount > 0 && poll.respondedCount === poll.participantCount;

  return (
    <li>
      <Link
        href={`/polls/${poll.slug}`}
        className="block rounded-[14px] border border-apricot-300 bg-paper p-5 transition-colors hover:border-plum-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-xl text-strong">{poll.title}</h2>
            {poll.description && (
              <p className="mt-1 text-body">{poll.description}</p>
            )}
          </div>
          {poll.finalizedDate && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[6px] bg-mint-100 px-2.5 py-1 text-xs font-semibold text-mint-600">
              <CheckIcon className="h-3.5 w-3.5" />
              {t("decided")}
            </span>
          )}
        </div>

        {poll.finalizedDate ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-[6px] bg-mint-100 px-2.5 py-1 text-xs font-semibold text-mint-600">
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatDateKeyLong(poll.finalizedDate, locale)}
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-plum-50 px-2.5 py-1 text-xs font-semibold text-plum-700">
              {t("dateCount", { count: poll.dates.length })}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-xs font-semibold ${
                everyoneAnswered
                  ? "bg-mint-100 text-mint-600"
                  : "bg-apricot-100 text-body"
              }`}
            >
              {t("answeredCount", {
                answered: poll.respondedCount,
                total: poll.participantCount,
              })}
            </span>
          </div>
        )}

        <p className="mt-4 border-t border-apricot-200 pt-3 text-xs font-semibold text-ink-400">
          {t("updated", { relative: formatRelative(poll.updatedAt, locale) })}
        </p>
      </Link>
    </li>
  );
}
