"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { loadMyPolls } from "@/app/actions/polls";
import { SpinnerIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import type { PollSummaryRow } from "@/lib/db/queries";
import { getKnownPolls } from "@/lib/local-store";
import { buttonClass } from "@/lib/ui";
import { PollCard } from "./PollCard";

/**
 * There are no accounts, so "your polls" means the ones this browser knows
 * about. The list of slugs comes from localStorage and is exchanged for poll
 * details on the server — which is also why this can't be a Server Component.
 */
export function MyPolls() {
  const t = useTranslations("MyPolls");
  const [polls, setPolls] = useState<PollSummaryRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const known = getKnownPolls();

    if (known.length === 0) {
      setPolls([]);
      return;
    }

    loadMyPolls(known.map((poll) => poll.slug))
      .then((rows) => {
        if (!active) return;
        // Keep the browser's most-recently-seen ordering.
        const order = new Map(known.map((poll, index) => [poll.slug, index]));
        setPolls(
          [...rows].sort(
            (a, b) =>
              (order.get(a.slug) ?? Infinity) - (order.get(b.slug) ?? Infinity),
          ),
        );
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (failed) {
    return <Notice title={t("failedTitle")}>{t("failedBody")}</Notice>;
  }

  if (polls === null) {
    return (
      <div className="rounded-lg border border-line bg-white p-10 text-center text-sm font-bold text-mist shadow-soft">
        <SpinnerIcon className="mx-auto mb-2 h-5 w-5" />
        {t("loading")}
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <Notice title={t("emptyTitle")}>
        {t("emptyBody")}
        <Link
          href="/polls/create"
          className={buttonClass({ className: "mt-5" })}
        >
          {t("emptyCreatePoll")}
        </Link>
      </Notice>
    );
  }

  return (
    <ul className="grid gap-4">
      {polls.map((poll) => (
        <PollCard key={poll.slug} poll={poll} />
      ))}
    </ul>
  );
}

function Notice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-line bg-white p-10 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      <div className="mt-2 flex max-w-sm flex-col items-center text-sm font-semibold text-slate">
        {children}
      </div>
    </div>
  );
}
