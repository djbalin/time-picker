"use client";

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
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}/polls/${slug}`);
  }, [slug]);

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
    <section className="rounded-lg border border-line bg-sky-tint/40 p-4 sm:px-5">
      <label
        className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-sky-deep"
        htmlFor="share-url"
      >
        Share this link with your group
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="share-url"
          type="text"
          readOnly
          value={url}
          onFocus={selectInput}
          className="w-full truncate rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-slate focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky-tint"
        />
        <button
          type="button"
          onClick={copy}
          disabled={!url}
          className={buttonClass({ variant: "primary", size: "md" })}
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </p>
    </section>
  );
}
