"use client";

import { useEffect } from "react";

/**
 * Catches errors thrown by the root layout itself (`app/[locale]/layout.tsx`)
 * — a per-locale `error.tsx` can't catch those, only errors from its own
 * children. This can't use next-intl: if the layout blew up, the locale
 * context that provider needs may be exactly what's missing.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif" }}>
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1>Something went wrong</h1>
          <p>That's on us. Try again in a moment.</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
