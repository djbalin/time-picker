"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";

const COPIED_RESET_MS = 2000;

/**
 * The share link in the sidebar — the only way anyone else reaches this
 * poll. The URL is read from `window` (the server can't know the host the
 * visitor typed); the whole card copies it.
 */
export function InviteLink({ slug, label }: { slug: string; label: string }) {
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
      className="rounded-md bg-paper p-4 text-left shadow-rest transition-colors hover:bg-paper-2"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-2xs font-semibold uppercase tracking-label text-muted">
          {label}
        </span>
        <Icon
          name={copied ? "check" : "content_copy"}
          size={14}
          color="var(--color-support-text)"
        />
      </span>
      <span className="mt-1.5 block truncate text-xs font-bold text-support-text">
        {copied ? t("copied") : url.replace(/^https?:\/\//, "") || "…"}
      </span>
    </button>
  );
}
