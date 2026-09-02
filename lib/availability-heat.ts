/**
 * How a proposed date is coloured on the Select Dates screen, by how many of
 * the group can make it.
 *
 *   green (mint)   — everyone can play
 *   orange (butter) — most can (≥ 60%)
 *   red (coral)    — only a few
 *
 * Mirrors `heat()` in the design source. Kept pure and token-only so the
 * calendar, the night rows, and the selection rail all read the same.
 */
export type HeatLevel = "everyone" | "most" | "few";

export function heatLevel(yes: number, total: number): HeatLevel {
  if (total > 0 && yes >= total) return "everyone";
  if (yes >= Math.ceil(total * 0.6)) return "most";
  return "few";
}

export type HeatTokens = {
  /** Cell / row background. */
  bg: string;
  /** Foreground text on that background. */
  fg: string;
  /** The small day-number tile. */
  tileBg: string;
  tileFg: string;
  /** Legend / count text colour. */
  count: string;
};

const TOKENS: Record<HeatLevel, HeatTokens> = {
  everyone: {
    bg: "bg-mint-300",
    fg: "text-mint-600",
    tileBg: "bg-mint-300",
    tileFg: "text-mint-600",
    count: "text-mint-600",
  },
  most: {
    bg: "bg-butter-200",
    fg: "text-butter-600",
    tileBg: "bg-butter-300",
    tileFg: "text-butter-600",
    count: "text-butter-600",
  },
  few: {
    bg: "bg-coral-100",
    fg: "text-coral-600",
    tileBg: "bg-coral-300",
    tileFg: "text-coral-600",
    count: "text-coral-600",
  },
};

export function heatTokens(yes: number, total: number): HeatTokens {
  return TOKENS[heatLevel(yes, total)];
}
