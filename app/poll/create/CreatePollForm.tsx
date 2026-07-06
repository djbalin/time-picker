"use client";
import Form from "next/form";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  type SVGProps,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { z } from "zod";
import { addPoll } from "../../actions/polls";
import { DatePicker } from "./DatePicker";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const createPollSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  dates: z.array(z.string()).min(1, "Pick at least one date."),
  participants: z.array(z.string()).min(1, "Add at least one participant."),
});

type FormErrors = Partial<
  Record<keyof z.infer<typeof createPollSchema>, string>
>;

export function CreatePollForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addPoll, null);
  const [dates, setDates] = useState<Date[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (state?.id) {
      router.push(`/poll/${state.id}`);
    }
  }, [state, router]);

  const handleDatesChange = useCallback((next: Date[]) => {
    setDates(next);
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const result = createPollSchema.safeParse({
      title: formData.get("title"),
      dates: dates.map(toDateKey),
      participants: participants,
      description: formData.get("description"),
    });

    if (!result.success) {
      const fieldErrors = z.flattenError(result.error).fieldErrors;
      console.log("FIELD ERRORS:");

      console.log(fieldErrors);
      setErrors({
        title: fieldErrors.title?.[0],
        dates: fieldErrors.dates?.[0],
        participants: fieldErrors.participants?.[0],
      });
      e.preventDefault();
    } else {
      setErrors({});
    }
  }

  console.log(errors);

  return (
    <Form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <div>
        <label
          className="mb-1.5 block text-xs font-extrabold text-slate"
          htmlFor="title"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          placeholder="e.g. Team offsite"
          aria-invalid={Boolean(errors.title)}
          className={`w-full rounded-md border bg-paper px-4 py-3 text-sm font-semibold text-ink placeholder:text-mist placeholder:font-semibold  focus:border-sky focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-tint  ${
            errors.title
              ? "border-red-500"
              : "border-line focus:border-sky focus:ring-sky-tint"
          }`}
        />
        {errors.title && (
          <p className="mt-1.5 text-xs font-bold text-[#ff3b30]">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label
          className="mb-1.5 block text-xs font-extrabold text-slate"
          htmlFor="description"
        >
          Description
        </label>
        <input
          id="description"
          name="description"
          placeholder="What's this poll for?"
          className="w-full rounded-md border border-line bg-paper px-4 py-3 text-sm font-semibold text-ink placeholder:text-mist placeholder:font-semibold focus:border-sky focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-tint"
        />
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-extrabold text-slate">
          Participants
        </span>
        <ParticipantsInput
          participants={participants}
          onChange={setParticipants}
          error={errors.participants}
        />
      </div>
      <input
        type="hidden"
        name="participants"
        id="participants"
        value={JSON.stringify(participants)}
      />

      <div>
        <span className="mb-1.5 block text-xs font-extrabold text-slate">
          Proposed dates
        </span>
        <DatePicker selected={dates} onSelect={handleDatesChange} />
        {errors.dates && (
          <p className="mt-1.5 text-xs font-bold text-[#ff3b30]">
            {errors.dates}
          </p>
        )}
      </div>
      <input
        type="hidden"
        name="dates"
        value={JSON.stringify(dates.map(toDateKey))}
      />

      <div className="flex items-center gap-4 border-t border-line pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-extrabold text-paper shadow-raised transition hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create poll"}
        </button>
        {pending && (
          <span className="text-sm font-semibold text-mist">
            Saving your poll...
          </span>
        )}
      </div>
    </Form>
  );
}

function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414A2 2 0 019 13z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BADGE_COLORS = [
  { bg: "bg-sky-tint", text: "text-sky-deep" },
  { bg: "bg-green-tint", text: "text-green-deep" },
  { bg: "bg-orange-tint", text: "text-orange-deep" },
  { bg: "bg-yellow", text: "text-ink" },
];

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
  const { bg, text } = BADGE_COLORS[index % BADGE_COLORS.length];
  return (
    <span
      className={`group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-extrabold ${bg} ${text}`}
    >
      {name}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 rounded-full bg-ink/75 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${name}`}
          title="Edit name"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-paper transition hover:text-sky-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Remove ${name}`}
          title="Remove participant"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-paper transition hover:text-[#ff3b30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </span>
    </span>
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
  const [draft, setDraft] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = draft.trim();

  function commit() {
    if (!trimmed) return;
    if (editingIndex !== null) {
      const next = [...participants];
      next[editingIndex] = trimmed;
      onChange(next);
      setEditingIndex(null);
    } else {
      onChange([...participants, trimmed]);
    }
    setDraft("");
  }

  function startEdit(index: number) {
    setDraft(participants[index]);
    setEditingIndex(index);
    inputRef.current?.focus();
  }

  function cancelEdit() {
    setDraft("");
    setEditingIndex(null);
  }

  function remove(index: number) {
    if (editingIndex === index) cancelEdit();
    onChange(participants.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape" && editingIndex !== null) {
      e.preventDefault();
      cancelEdit();
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Freja"
          className={`w-full rounded-md border border-line bg-paper px-4 py-3 text-sm font-semibold text-ink placeholder:font-semibold placeholder:text-mist focus:border-sky focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-tint ${
            error
              ? "border-red-500"
              : "border-line focus:border-sky focus:ring-sky-tint"
          }`}
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          onClick={commit}
          disabled={!trimmed}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-extrabold text-paper shadow-raised transition hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-40"
        >
          {editingIndex !== null ? "Save" : "Add"}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={cancelEdit}
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-paper px-5 py-3 text-sm font-extrabold text-slate shadow-soft transition hover:bg-cloud"
          >
            Cancel
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-bold text-[#ff3b30]">{error}</p>
      )}

      {participants.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {participants.map((name, i) => (
            <ParticipantBadge
              key={`${name}-${i}`}
              name={name}
              index={i}
              onEdit={() => startEdit(i)}
              onDelete={() => remove(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
