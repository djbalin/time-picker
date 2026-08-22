"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { buttonClass } from "@/lib/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-lg bg-orange-tint text-3xl">
        ⚠️
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        {t("title")}
      </h1>
      <p className="text-sm font-semibold text-slate">{t("body")}</p>
      <button type="button" onClick={reset} className={buttonClass()}>
        {t("retry")}
      </button>
    </main>
  );
}
