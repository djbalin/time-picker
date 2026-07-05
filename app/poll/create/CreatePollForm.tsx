"use client";
import { useActionState } from "react";
import { addPoll } from "../../actions/polls";
import Form from "next/form";
import { DatePicker } from "./DatePicker";

export function CreatePollForm() {
  const [state, formAction, pending] = useActionState(addPoll, null);

  console.log(state);
  return (
    <Form
      action={formAction}
      className="mt-6 min-h-48 flex flex-col rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"
    >
      {pending && <div className="text-sm text-slate-500">Loading...</div>}
      <input placeholder="Title" name="title" />
      <input placeholder="Description" name="description" />
      <DatePicker />

      <button type="submit" disabled={pending}>
        Create form
      </button>
    </Form>
  );
}
