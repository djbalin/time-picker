"use client";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { addPoll } from "../../actions/polls";
import { DatePicker } from "./DatePicker";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CreatePollForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(addPoll, null);
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    if (state?.id) {
      router.push(`/poll/${state.id}`);
    }
  }, [state, router]);

  return (
    <Form action={formAction} className="flex flex-col gap-5">
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
          className="w-full rounded-md border border-line bg-paper px-4 py-3 text-sm font-semibold text-ink placeholder:text-mist placeholder:font-semibold focus:border-sky focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-tint"
        />
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
          Proposed dates
        </span>
        <DatePicker selected={dates} onSelect={setDates} />
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
