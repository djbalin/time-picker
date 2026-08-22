"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { deletePoll } from "@/app/actions/polls";
import { SpinnerIcon, TrashIcon } from "@/components/icons";
import { useRouter } from "@/i18n/navigation";
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
}: {
  slug: string;
  adminToken: string;
  title: string;
}) {
  const t = useTranslations("OwnerTools");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
        {t("heading")}
      </h2>
      <p className="mt-1 text-sm font-semibold text-mist">{t("subtitle")}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {confirming ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-ink">
              {t("deleteConfirm", { title })}
            </span>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className={buttonClass({ variant: "danger", size: "sm" })}
            >
              {pending && <SpinnerIcon className="h-4 w-4" />}
              {t("yesDelete")}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className={buttonClass({ variant: "quiet", size: "sm" })}
            >
              {t("keepIt")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={buttonClass({ variant: "danger", size: "sm" })}
          >
            <TrashIcon className="h-4 w-4" />
            {t("deletePoll")}
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
