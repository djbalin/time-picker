"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { loadAllPolls, loadPollsByEmail } from "@/app/actions/polls";
import { SpinnerIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import type { PollSummaryRow } from "@/lib/db/queries";
import { buttonClass, fieldClass } from "@/lib/ui";
import { PollCard } from "./PollCard";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * There are no accounts yet, so "my polls" means "polls created under an email
 * the visitor types in". This is deliberately unguarded — real auth will gate
 * it later. In dev there's also a button that dumps every poll in the database.
 */
export function MyPolls() {
  const t = useTranslations("MyPolls");
  const [email, setEmail] = useState("");
  const [polls, setPolls] = useState<PollSummaryRow[] | null>(null);
  const [heading, setHeading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function lookupByEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await loadPollsByEmail(email);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError(null);
      setHeading(t("resultsFor", { email: email.trim().toLowerCase() }));
      setPolls(result.polls);
    });
  }

  function showAllPolls() {
    startTransition(async () => {
      const result = await loadAllPolls();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError(null);
      setHeading(t("allPollsHeading"));
      setPolls(result.polls);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={lookupByEmail}
        noValidate
        className="rounded-lg border border-line bg-white p-6 shadow-soft"
      >
        <label
          className="mb-1.5 block text-xs font-extrabold text-slate"
          htmlFor="my-polls-email"
        >
          {t("emailLabel")}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="my-polls-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            placeholder={t("emailPlaceholder")}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
            aria-invalid={Boolean(error)}
            className={fieldClass(Boolean(error))}
          />
          <button
            type="submit"
            disabled={pending}
            className={buttonClass({ className: "sm:flex-none" })}
          >
            {pending && <SpinnerIcon className="h-4 w-4" />}
            {t("lookup")}
          </button>
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-bold text-red-deep" role="alert">
            {error}
          </p>
        )}
        <p className="mt-2 text-xs font-semibold text-mist">
          {t("disclaimer")}
        </p>

        {IS_DEV && (
          <button
            type="button"
            onClick={showAllPolls}
            disabled={pending}
            className={buttonClass({
              variant: "danger",
              size: "sm",
              className: "mt-4",
            })}
          >
            {t("allPolls")}
          </button>
        )}
      </form>

      {polls !== null &&
        (polls.length === 0 ? (
          <Notice title={t("emptyTitle")}>
            {t("emptyBody")}
            <Link
              href="/polls/create"
              className={buttonClass({ className: "mt-5" })}
            >
              {t("emptyCreatePoll")}
            </Link>
          </Notice>
        ) : (
          <div className="flex flex-col gap-3">
            {heading && (
              <p className="text-xs font-extrabold uppercase tracking-wide text-mist">
                {heading}
              </p>
            )}
            <ul className="grid gap-4">
              {polls.map((poll) => (
                <PollCard key={poll.slug} poll={poll} />
              ))}
            </ul>
          </div>
        ))}
    </div>
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
