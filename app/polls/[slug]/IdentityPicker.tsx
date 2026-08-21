"use client";

import { type KeyboardEvent, useState, useTransition } from "react";
import { joinPoll } from "@/app/actions/polls";
import { PlusIcon, SpinnerIcon } from "@/components/icons";
import type { PollParticipant } from "@/lib/db/queries";
import { participantColor } from "@/lib/participant-colors";
import { buttonClass, fieldClass } from "@/lib/ui";

/**
 * First screen a responder sees. Picking a name is remembered per device, so
 * this only appears once per browser unless they switch person.
 */
export function IdentityPicker({
  slug,
  participants,
  onSelect,
  onJoined,
}: {
  slug: string;
  participants: PollParticipant[];
  onSelect: (participantId: number) => void;
  onJoined: (participant: PollParticipant) => void;
}) {
  const [adding, setAdding] = useState(participants.length === 0);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const trimmed = draft.trim();

  function commit() {
    if (!trimmed || pending) return;
    startTransition(async () => {
      const result = await joinPoll(slug, trimmed);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setDraft("");
      setError(null);
      setAdding(false);
      onJoined({
        id: result.participantId,
        name: trimmed,
        hasResponded: false,
      });
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
    if (event.key === "Escape" && participants.length > 0) {
      event.preventDefault();
      setDraft("");
      setError(null);
      setAdding(false);
    }
  }

  return (
    <section className="rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
      <h2 className="font-display text-lg font-semibold text-ink">
        Which one are you?
      </h2>
      <p className="mt-1 text-sm font-semibold text-slate">
        {participants.length > 0
          ? "Pick your name to fill in your availability."
          : "Add your name to get started."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {participants.map((participant, index) => {
          const { bg, text } = participantColor(index);
          return (
            <button
              key={participant.id}
              type="button"
              onClick={() => onSelect(participant.id)}
              className="flex flex-col items-center gap-3 rounded-md border border-line bg-white p-5 shadow-soft transition hover:border-sky hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
            >
              <span
                aria-hidden="true"
                className={`grid h-12 w-12 place-items-center rounded-full text-lg font-extrabold ${bg} ${text}`}
              >
                {participant.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-center text-sm font-extrabold text-ink">
                {participant.name}
              </span>
              <span className="text-[11px] font-bold text-mist">
                {participant.hasResponded ? "Answered" : "Not answered yet"}
              </span>
            </button>
          );
        })}

        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line bg-paper p-5 transition hover:border-sky hover:bg-sky-tint/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-cloud text-slate">
              <PlusIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-extrabold text-slate">
              I'm not listed
            </span>
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-4 rounded-md border border-sky bg-sky-tint/40 p-4">
          <label
            className="mb-1.5 block text-xs font-extrabold text-slate"
            htmlFor="new-participant-name"
          >
            Your name
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              // biome-ignore lint/a11y/noAutofocus: the field appears in response to the user's own click
              autoFocus
              id="new-participant-name"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Freja"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "new-participant-error" : undefined}
              className={fieldClass(Boolean(error))}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={commit}
                disabled={!trimmed || pending}
                className={buttonClass({ className: "flex-1 sm:flex-none" })}
              >
                {pending && <SpinnerIcon className="h-4 w-4" />}
                {pending ? "Adding…" : "That's me"}
              </button>
              {participants.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setDraft("");
                    setError(null);
                  }}
                  className={buttonClass({ variant: "secondary" })}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          {error && (
            <p
              id="new-participant-error"
              className="mt-2 text-xs font-bold text-red-deep"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
