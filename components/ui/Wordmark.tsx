/**
 * The brand mark: three overlapping pastel dots (lilac / mint / blush) built
 * in CSS `box-shadow`, beside the wordmark in Righteous. No logo file was
 * supplied — this is the treatment until one is.
 */
export function Wordmark({
  label = "meety",
  size = "md",
  className = "",
}: {
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const text = size === "sm" ? "text-lg" : "text-xl";
  return (
    <span className={`inline-flex items-center gap-[30px] ${className}`}>
      <span
        aria-hidden="true"
        className="h-[11px] w-[11px] shrink-0 rounded-full bg-lilac-300"
        style={{
          boxShadow:
            "8px 0 0 var(--color-mint-300), 16px 0 0 var(--color-blush-300)",
        }}
      />
      <span className={`font-display ${text} text-strong`}>{label}</span>
    </span>
  );
}
