import { getPolls } from "../actions/polls";
import { PollItem } from "./PollItem";

export async function PollList() {
  const polls = await getPolls();

  if (polls.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white p-10 text-center">
        <p className="font-display text-lg font-semibold text-ink">
          No polls yet
        </p>
        <p className="mt-2 text-sm font-semibold text-slate">
          Create your first poll to start finding a time that works.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {polls.map((poll) => (
        <PollItem key={poll.id} poll={poll} />
      ))}
    </ul>
  );
}
