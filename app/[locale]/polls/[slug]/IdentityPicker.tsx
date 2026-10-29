"use client";

import { useTranslations } from "next-intl";
import { type KeyboardEvent, useState, useTransition } from "react";
import { joinPoll } from "@/app/actions/polls";
import { PlusIcon, SpinnerIcon } from "@/components/icons";
import type { PollParticipant } from "@/lib/db/queries";
import { participantColor } from "@/lib/participant-colors";
import { buttonClass, fieldClass, labelClass } from "@/lib/ui";

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
  const t = useTranslations("IdentityPicker");
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
    <section className="rounded-[14px] border border-apricot-300 bg-paper p-6 sm:p-8">
      <h2 className="font-display text-xl text-strong">{t("heading")}</h2>
      <p className="mt-1 text-body">
        {participants.length > 0 ? t("subtitlePick") : t("subtitleAdd")}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {participants.map((participant, index) => {
          const { bg, text } = participantColor(index);
          return (
            <button
              key={participant.id}
              type="button"
              onClick={() => onSelect(participant.id)}
              className="flex flex-col items-center gap-3 rounded-[12px] border border-apricot-300 bg-paper p-5 transition-colors hover:border-plum-300 hover:bg-apricot-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500"
            >
              <span
                aria-hidden="true"
                className={`grid h-auto w-auto place-items-center rounded-[8px] px-3.5 py-1.5 text-lg font-bold ${bg} ${text}`}
              >
                {participant.name}
              </span>
              {/* <span className="text-center text-sm font-extrabold text-ink">
                {participant.name}
              </span> */}
              <span className="text-xs font-semibold text-ink-400">
                {participant.hasResponded ? t("answered") : t("notAnsweredYet")}
              </span>
            </button>
          );
        })}

        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-apricot-300 bg-paper p-5 transition-colors hover:border-plum-300 hover:bg-plum-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500"
          >
            <span className="grid size-11 place-items-center rounded-[10px] bg-plum-50 text-plum-600">
              <PlusIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-body">
              {t("notListed")}
            </span>
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-4 rounded-[12px] border border-apricot-300 bg-apricot-50 p-4">
          <label className={labelClass} htmlFor="new-participant-name">
            {t("yourNameLabel")}
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
              placeholder={t("namePlaceholder")}
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
                {pending ? t("adding") : t("thatsMe")}
              </button>
              {participants.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setDraft("");
                    setError(null);
                  }}
                  className={buttonClass({ variant: "quiet" })}
                >
                  {t("cancel")}
                </button>
              )}
            </div>
          </div>
          {error && (
            <p
              id="new-participant-error"
              className="mt-2 text-sm font-semibold text-coral-600"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
