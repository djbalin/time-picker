"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { buttonClass } from "@/lib/ui";

const COPIED_RESET_MS = 2000;

/**
 * The share link, which is the only way anyone else reaches this poll.
 *
 * The URL is read from `window` in an effect rather than rendered on the
 * server: the server has no reliable idea which host the visitor typed, and
 * guessing would put a wrong link on the clipboard.
 */
export function ShareCard({ slug }: { slug: string }) {
  const t = useTranslations("ShareCard");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}/polls/${slug}`);
  }, [slug]);

  // The host/path is plenty to recognize the link at a glance; the full
  // https:// origin just eats space on one line. The clipboard still gets
  // the complete, absolute URL.
  const displayUrl = url.replace(/^https?:\/\//, "");

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard access can be denied (insecure origin, permissions). The
      // input below is still selectable, so fall back to selecting the text.
      selectInput();
      return;
    }
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  }

  function selectInput() {
    const input = document.getElementById("share-url");
    if (input instanceof HTMLInputElement) input.select();
  }

  return (
    <section className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-sky-tint/40 p-3 sm:px-4">
      <label
        className="shrink-0 text-xs font-extrabold uppercase tracking-wide text-sky-deep"
        htmlFor="share-url"
      >
        {t("label")}
      </label>
      <input
        id="share-url"
        type="text"
        readOnly
        value={displayUrl}
        onFocus={selectInput}
        className="min-w-0 flex-1 truncate rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-slate focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky-tint"
      />
      <button
        type="button"
        onClick={copy}
        disabled={!url}
        className={buttonClass({ variant: "primary", size: "sm" })}
      >
        {copied ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
        {copied ? t("copied") : t("copy")}
      </button>
      <p aria-live="polite" className="sr-only">
        {copied ? t("copiedAnnounce") : ""}
      </p>
    </section>
  );
}
