import { TrophyIcon } from "@/components/icons";
import { formatDateKeyLong } from "@/lib/date-keys";

/** Shown once the organizer locks a date in, above everything else. */
export function FinalizedBanner({ date }: { date: string }) {
  return (
    <section className="flex items-center gap-3 rounded-lg bg-green-deep px-5 py-4 text-white shadow-raised">
      <TrophyIcon className="h-5 w-5 shrink-0" />
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-green-tint">
          It's decided
        </p>
        <p className="font-display text-lg font-semibold">
          {formatDateKeyLong(date)}
        </p>
      </div>
    </section>
  );
}
