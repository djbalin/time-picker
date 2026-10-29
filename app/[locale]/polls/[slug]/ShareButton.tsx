"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";

const COPIED_RESET_MS = 2000;

/**
 * "Share poll": copies the poll's link and confirms with "Link copied". The
 * URL is read from `window` (the server can't know the host the visitor
 * typed).
 */
export function ShareButton({ slug }: { slug: string }) {
  const t = useTranslations("ShareCard");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    const url = `${window.location.origin}/polls/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      /* clipboard blocked (insecure origin / permissions) — nothing to do */
    }
  }

  return (
    <>
      <Button
        onClick={copy}
        size="sm"
        variant={copied ? "soft" : "support"}
        icon={copied ? "check" : undefined}
        className={copied ? "bg-mint-100! text-mint-600!" : ""}
      >
        {copied ? t("copied") : t("button")}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? t("copiedAnnounce") : ""}
      </span>
    </>
  );
}
