"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePoll, finalizePoll } from "@/app/actions/polls";
import { SpinnerIcon, TrashIcon } from "@/components/icons";
import { forgetPoll } from "@/lib/local-store";
import { buttonClass } from "@/lib/ui";

/**
 * Only rendered when this browser holds the poll's admin token, i.e. it is the
 * device that created the poll. The token is checked again on the server, so
 * hiding the panel is a convenience, not the control.
 */
export function OwnerTools({
  slug,
  adminToken,
  title,
  finalizedDate,
}: {
  slug: string;
  adminToken: string;
  title: string;
  finalizedDate: string | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reopen() {
    startTransition(async () => {
      const result = await finalizePoll(slug, adminToken, null);
      setError(result.ok ? null : result.message);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deletePoll(slug, adminToken);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      forgetPoll(slug);
      router.push("/polls");
    });
  }

  return (
    <section className="rounded-lg border border-line bg-paper p-5">
      <h2 className="text-xs font-extrabold uppercase tracking-wide text-slate">
        You created this poll
      </h2>
      <p className="mt-1 text-sm font-semibold text-mist">
        These controls only appear on this device.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {finalizedDate && (
          <button
            type="button"
            onClick={reopen}
            disabled={pending}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            Reopen poll
          </button>
        )}

        {confirming ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-ink">
              Delete “{title}” for everyone?
            </span>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className={buttonClass({ variant: "danger", size: "sm" })}
            >
              {pending && <SpinnerIcon className="h-4 w-4" />}
              Yes, delete it
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className={buttonClass({ variant: "quiet", size: "sm" })}
            >
              Keep it
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={buttonClass({ variant: "danger", size: "sm" })}
          >
            <TrashIcon className="h-4 w-4" />
            Delete poll
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-xs font-bold text-red-deep" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
