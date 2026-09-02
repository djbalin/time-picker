/**
 * A compact tally for slots where an avatar stack won't fit. It exists
 * because "visual over textual" is an explicit requirement and "4/5" alone
 * is textual.
 */
export function AvailabilityBar({
  yes = 0,
  maybe = 0,
  total = 0,
  showCount = true,
  className = "",
}: {
  yes?: number;
  maybe?: number;
  total?: number;
  showCount?: boolean;
  className?: string;
}) {
  const cells = Array.from({ length: total }, (_, i) =>
    i < yes ? "yes" : i < yes + maybe ? "maybe" : "none",
  );
  const fill: Record<string, string> = {
    yes: "bg-yes",
    maybe: "bg-maybe",
    none: "bg-ink-100",
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="inline-flex gap-[3px]">
        {cells.map((cell, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional segments
          <span key={i} className={`h-[18px] w-2 rounded-xs ${fill[cell]}`} />
        ))}
      </span>
      {showCount ? (
        <span className="text-xs font-semibold text-muted">
          {yes}/{total}
        </span>
      ) : null}
    </span>
  );
}
