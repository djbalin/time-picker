"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";

const COPIED_RESET_MS = 2000;

/**
 * The share link as one button: shows the URL, copies it on click. The URL
 * is read from `window` (the server can't know the host the visitor typed).
 */
export function InviteLink({ slug }: { slug: string }) {
  const t = useTranslations("ShareCard");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}/polls/${slug}`);
  }, [slug]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    if (!url) return;
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
    <button
      type="button"
      onClick={copy}
      disabled={!url}
      aria-label={`${t("copy")} ${url}`}
      className={`inline-flex min-w-0  h-6 md:h-8 max-w-full items-center gap-2 rounded-pill border border-white py-1.5 pl-3.5 pr-1.5 shadow-rest backdrop-blur-lg transition-colors ${
        copied ? "bg-yes-soft" : "bg-surface-glass hover:bg-paper"
      }`}
    >
      <Icon name="link" size={18} color="var(--color-support-text)" />
      <span className="min-w-0 truncate text-xs md:text-sm font-bold text-support-text">
        {url.replace(/^https?:\/\//, "") || "…"}
      </span>
      <span
        className={`grid h-5 w-5 md:h-6 md:w-6 shrink-0 place-items-center rounded-full text-on-accent transition-colors ${
          copied ? "bg-yes-text" : "bg-support"
        }`}
      >
        <Icon name={copied ? "check" : "content_copy"} size={12} />
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? t("copiedAnnounce") : ""}
      </span>
    </button>
  );
}
