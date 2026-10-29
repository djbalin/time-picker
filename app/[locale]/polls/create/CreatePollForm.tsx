"use client";

import Form from "next/form";
import { useTranslations } from "next-intl";
import {
  type KeyboardEvent,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPoll } from "@/app/actions/polls";
import { EmojiInputButton } from "@/components/EmojiInputButton";
import { PencilIcon, SpinnerIcon, TrashIcon } from "@/components/icons";
import { useRouter } from "@/i18n/navigation";
import { setAdminToken } from "@/lib/local-store";
import { participantColor } from "@/lib/participant-colors";
import { buttonClass, fieldClass, labelClass } from "@/lib/ui";
import {
  type CreatePollFieldErrors,
  createPollSchema,
  firstFieldErrors,
  nameIsTaken,
} from "@/lib/validation";
import { DatePicker, type DatesUpdate } from "./DatePicker";

/** Fields in on-screen order, so the summary under the button reads top down. */
const FIELD_ORDER: (keyof CreatePollFieldErrors)[] = [
  "title",
  "description",
  "creatorEmail",
  "participants",
  "dates",
];

/** Right padding that keeps typed text clear of the emoji button. */
const EMOJI_PAD = "pr-12!";

export function CreatePollForm() {
  const t = useTranslations("CreatePollForm");
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createPoll, null);
  const [dateKeys, setDateKeys] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [errors, setErrors] = useState<CreatePollFieldErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  // The poll's admin token comes back exactly once, so it has to be stored
  // before navigating — it is the only proof this device created the poll.
  useEffect(() => {
    if (!state?.ok) return;
    setAdminToken(state.slug, state.adminToken);
    router.push(`/polls/${state.slug}`);
  }, [state, router]);

  // Server-side validation wins over whatever the client last complained about.
  useEffect(() => {
    if (state && !state.ok && state.fieldErrors) {
      setErrors(state.fieldErrors);
    }
  }, [state]);

  /** Drops a field's message as soon as the user acts on it. */
  const clearError = useCallback((field: keyof CreatePollFieldErrors) => {
    setErrors((previous) =>
      previous[field] === undefined
        ? previous
        : { ...previous, [field]: undefined },
    );
  }, []);

  const handleDatesChange = useCallback(
    (update: DatesUpdate) => {
      setDateKeys(update);
      clearError("dates");
    },
    [clearError],
  );

  /**
   * Validates before letting the action run. Note that `preventDefault` is
   * only called on failure: React skips a form's action entirely once the
   * submit event is cancelled, so cancelling unconditionally would mean the
   * form never submits at all.
   */
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const result = createPollSchema.safeParse({
      title: formData.get("title") ?? "",
      description: formData.get("description") ?? "",
      creatorEmail: formData.get("creatorEmail") ?? "",
      dates: dateKeys,
      participants,
    });

    if (result.success) {
      setErrors({});
      return;
    }

    event.preventDefault();
    setErrors(firstFieldErrors(result.error));
  }

  const formError = state && !state.ok ? state.message : null;
  // After a failed attempt the button stays disabled until every flagged
  // field has been touched; each field clears its own message on change.
  const invalidFields = FIELD_ORDER.filter((field) => errors[field]);
  const blocked = invalidFields.length > 0;
  const showSummary = blocked || Boolean(formError);

  return (
    <Form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6"
    >
      <div>
        <label className={labelClass} htmlFor="title">
          {t("titleLabel")}
        </label>
        <div className="relative">
          <input
            ref={titleRef}
            id="title"
            name="title"
            placeholder={t("titlePlaceholder")}
            onChange={() => clearError("title")}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            className={`${fieldClass(Boolean(errors.title))} ${EMOJI_PAD}`}
          />
          <EmojiInputButton inputRef={titleRef} />
        </div>
        <FieldError id="title-error" message={errors.title} />
      </div>

      <div>
        <label className={labelClass} htmlFor="description">
          {t("descriptionLabel")}{" "}
          <span className="font-normal text-ink-400">
            {t("descriptionOptional")}
          </span>
        </label>
        <div className="relative">
          <input
            ref={descriptionRef}
            id="description"
            name="description"
            placeholder={t("descriptionPlaceholder")}
            onChange={() => clearError("description")}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
            className={`${fieldClass(Boolean(errors.description))} ${EMOJI_PAD}`}
          />
          <EmojiInputButton inputRef={descriptionRef} />
        </div>
        <FieldError id="description-error" message={errors.description} />
      </div>

      <div>
        <label className={labelClass} htmlFor="creatorEmail">
          {t("emailLabel")}
        </label>
        <input
          id="creatorEmail"
          name="creatorEmail"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          onChange={() => clearError("creatorEmail")}
          aria-invalid={Boolean(errors.creatorEmail)}
          aria-describedby={
            errors.creatorEmail ? "creatorEmail-error" : undefined
          }
          className={fieldClass(Boolean(errors.creatorEmail))}
        />
        <FieldError id="creatorEmail-error" message={errors.creatorEmail} />
        <p className="mt-1.5 text-sm text-ink-400">{t("emailHint")}</p>
      </div>

      <div>
        <span className={labelClass}>{t("participantsLabel")}</span>
        <ParticipantsInput
          participants={participants}
          onChange={(next) => {
            setParticipants(next);
            clearError("participants");
          }}
          error={errors.participants}
        />
      </div>
      <input
        type="hidden"
        name="participants"
        value={JSON.stringify(participants)}
      />

      <div>
        <span className={labelClass}>
          {t("datesLabel")}{" "}
          {dateKeys.length > 0 && (
            <span className="font-semibold text-plum-600">
              · {t("datesSelectedCount", { count: dateKeys.length })}
            </span>
          )}
        </span>
        <DatePicker selected={dateKeys} onChange={handleDatesChange} />
        <FieldError id="dates-error" message={errors.dates} />
      </div>
      <input type="hidden" name="dates" value={JSON.stringify(dateKeys)} />

      <div className="border-t border-apricot-200 pt-6">
        <button
          type="submit"
          disabled={pending || blocked}
          aria-describedby={showSummary ? "submit-errors" : undefined}
          className={buttonClass({ size: "lg" })}
        >
          {pending && <SpinnerIcon className="h-4 w-4" />}
          {pending ? t("submitting") : t("submit")}
        </button>
        {showSummary && (
          <ul
            id="submit-errors"
            role="alert"
            className="mt-3 flex flex-col gap-1 text-sm font-semibold text-coral-600"
          >
            {invalidFields.map((field) => (
              <li key={field}>{errors[field]}</li>
            ))}
            {formError && <li>{formError}</li>}
          </ul>
        )}
      </div>
    </Form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-semibold text-coral-600">
      {message}
    </p>
  );
}

function ParticipantsInput({
  participants,
  onChange,
  error,
}: {
  participants: string[];
  onChange: (next: string[]) => void;
  error: string | undefined;
}) {
  const t = useTranslations("CreatePollForm");
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = draft.trim();
  const message = duplicate ? t("duplicateName") : error;

  function commit() {
    if (!trimmed) return;

    const others = participants.filter((_, index) => index !== editingIndex);
    if (nameIsTaken(trimmed, others)) {
      setDuplicate(true);
      return;
    }

    if (editingIndex !== null) {
      const next = [...participants];
      next[editingIndex] = trimmed;
      onChange(next);
      setEditingIndex(null);
    } else {
      onChange([...participants, trimmed]);
    }
    setDraft("");
    setDuplicate(false);
    inputRef.current?.focus();
  }

  function startEdit(index: number) {
    setDraft(participants[index]);
    setEditingIndex(index);
    setDuplicate(false);
    inputRef.current?.focus();
  }

  function cancelEdit() {
    setDraft("");
    setEditingIndex(null);
    setDuplicate(false);
  }

  function remove(index: number) {
    if (editingIndex === index) cancelEdit();
    onChange(participants.filter((_, i) => i !== index));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
    if (event.key === "Escape" && editingIndex !== null) {
      event.preventDefault();
      cancelEdit();
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative w-full min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setDuplicate(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t("participantsPlaceholder")}
            aria-label={t("participantsAriaLabel")}
            aria-invalid={Boolean(message)}
            aria-describedby={message ? "participants-error" : undefined}
            className={`${fieldClass(Boolean(message))} ${EMOJI_PAD}`}
          />
          <EmojiInputButton inputRef={inputRef} />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={commit}
            disabled={!trimmed}
            className={buttonClass({
              variant: "secondary",
              className: "flex-1 sm:flex-none",
            })}
          >
            {editingIndex !== null ? t("save") : t("add")}
          </button>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className={buttonClass({ variant: "quiet" })}
            >
              {t("cancel")}
            </button>
          )}
        </div>
      </div>

      <FieldError id="participants-error" message={message} />

      {participants.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {participants.map((name, index) => (
            <ParticipantBadge
              key={name}
              name={name}
              index={index}
              onEdit={() => startEdit(index)}
              onDelete={() => remove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipantBadge({
  name,
  index,
  onEdit,
  onDelete,
}: {
  name: string;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("CreatePollForm");
  const { bg, text } = participantColor(index);
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-[6px] py-1 pr-1 pl-2.5 text-sm font-semibold ${bg} ${text}`}
    >
      {name}
      <button
        type="button"
        onClick={onEdit}
        aria-label={t("editParticipant", { name })}
        title={t("editNameTitle")}
        className="inline-flex size-6 items-center justify-center rounded-[4px] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500"
      >
        <PencilIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={t("removeParticipant", { name })}
        title={t("removeParticipantTitle")}
        className="inline-flex size-6 items-center justify-center rounded-[4px] transition hover:bg-white/70 hover:text-coral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-500"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
