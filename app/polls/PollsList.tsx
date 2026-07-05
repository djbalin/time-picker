import { getPolls } from "../actions/polls";
import { PollItem } from "./PollItem";

export async function PollList() {
  const polls = await getPolls();

  if (polls.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">No polls yet</p>
        <p className="mt-2 text-sm text-slate-600">
          Your poll list will render here once your server logic is wired up.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {polls.map((poll) => (
        <PollItem poll={poll} />
      ))}
    </ul>
  );
}
