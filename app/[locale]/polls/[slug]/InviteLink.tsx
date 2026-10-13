"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button, Icon } from "@/components/ui";

const COPIED_RESET_MS = 2000;

/**
 * The share link, up top — the only way anyone else reaches this poll. The
 * URL is read from `window` (the server can't know the host the visitor
 * typed).
 */
export function InviteLink({
  slug,
  label,
  hint,
}: {
  slug: string;
  label: string;
  hint: string;
}) {
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
    <div className="flex flex-wrap items-center gap-3 rounded-sheet border border-white bg-surface-glass p-3 pl-4 shadow-rest backdrop-blur-lg">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-support-soft">
        <Icon name="link" size={20} color="var(--color-support-text)" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xs font-semibold uppercase tracking-label text-muted">
          {label} · {hint}
        </span>
        <span className="mt-0.5 block select-all truncate text-md font-bold text-support-text">
          {url.replace(/^https?:\/\//, "") || "…"}
        </span>
      </span>
      <Button
        variant="support"
        size="sm"
        icon={copied ? "check" : "content_copy"}
        onClick={copy}
        disabled={!url}
      >
        {copied ? t("copied") : t("copy")}
      </Button>
    </div>
  );
}
