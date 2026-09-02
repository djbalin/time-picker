"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui";
import type { SaveState } from "./useDebouncedSave";

/** The small "Saving… / Saved" status that sits next to the answering header. */
export function SaveIndicator({
  state,
  error,
}: {
  state: SaveState;
  error: string | null;
}) {
  const t = useTranslations("PollWorkspace");
  if (state === "idle") return null;

  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-no-text">
        {error ?? t("saveError")}
      </span>
    );
  }

  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted">
        <Icon name="progress_activity" size={14} className="animate-spin" />
        {t("saving")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yes-text">
      <Icon name="check" size={14} />
      {t("saved")}
    </span>
  );
}
