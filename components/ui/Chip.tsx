import type { ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * A small status pill. Answer tones (`yes` / `maybe` / `no`) are semantic:
 * mint means "can", butter "maybe", coral "can't" — never decorative.
 */
export type ChipTone =
  | "neutral"
  | "accent"
  | "support"
  | "yes"
  | "maybe"
  | "no"
  | "glass";

const TONES: Record<ChipTone, string> = {
  neutral: "bg-surface-sunken text-body",
  accent: "bg-accent-soft text-accent-text",
  support: "bg-support-soft text-support-text",
  yes: "bg-yes text-yes-text",
  maybe: "bg-maybe text-maybe-text",
  no: "bg-no text-no-text",
  glass: "bg-surface-glass text-support-text border border-white",
};

export function Chip({
  children,
  tone = "neutral",
  icon,
  caps = true,
  size = "md",
  className = "",
}: {
  children: ReactNode;
  tone?: ChipTone;
  icon?: string;
  /** Uppercase + tracked. On by default; turn off for sentence-case chips. */
  caps?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill font-sans font-semibold whitespace-nowrap ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-[11px] py-1 text-2xs"
      } ${caps ? "uppercase tracking-label" : ""} ${TONES[tone]} ${className}`}
    >
      {icon ? <Icon name={icon} size={13} /> : null}
      {children}
    </span>
  );
}
