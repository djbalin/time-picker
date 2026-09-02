"use client";

import { useCallback, useEffect, useRef } from "react";
import { saveAvailability } from "@/app/actions/polls";

/** How long to sit on a toggle before writing it, so a burst becomes one save. */
const SAVE_DEBOUNCE_MS = 600;

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Collapses a burst of toggles into one write. The pending payload lives in a
 * ref so that leaving the page mid-debounce still sends it rather than
 * silently dropping the answer.
 */
export function useDebouncedSave({
  slug,
  onStateChange,
  onError,
}: {
  slug: string;
  onStateChange: (state: SaveState) => void;
  onError: (message: string | null) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ participantId: number; dates: string[] } | null>(
    null,
  );

  const send = useCallback(async () => {
    const payload = pending.current;
    if (!payload) return;
    pending.current = null;

    const result = await saveAvailability(
      slug,
      payload.participantId,
      payload.dates,
    );

    if (result.ok) {
      onStateChange("saved");
      onError(null);
    } else {
      onStateChange("error");
      onError(result.message);
    }
  }, [slug, onStateChange, onError]);

  const save = useCallback(
    (participantId: number, dates: string[]) => {
      pending.current = { participantId, dates };
      onStateChange("saving");
      onError(null);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        void send();
      }, SAVE_DEBOUNCE_MS);
    },
    [send, onStateChange, onError],
  );

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    void send();
  }, [send]);

  useEffect(
    () => () => {
      // Unmounting: fire the outstanding write without awaiting it. The
      // request outlives this component, which is exactly what we want.
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
        void send();
      }
    },
    [send],
  );

  return { save, flush };
}
