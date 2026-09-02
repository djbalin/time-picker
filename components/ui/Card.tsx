import type { CSSProperties, ReactNode } from "react";

/**
 * A surface. Cards have **no borders** — separation comes from shadow and
 * radius. The `glass` variant is the only one with a stroke (a white 1px
 * rim), and transparency is reserved for it alone.
 *
 * Three surface levels, no more: `solid`/`flat` white → `sunken` lilac →
 * `glass` frosted sheet.
 */
export type CardVariant = "solid" | "glass" | "flat" | "sunken";

const VARIANTS: Record<CardVariant, string> = {
  solid: "bg-surface-card shadow-sheet",
  glass: "bg-surface-glass border border-white backdrop-blur-lg shadow-sheet",
  flat: "bg-surface-card shadow-rest",
  sunken: "bg-surface-sunken",
};

const PADS = {
  none: "p-0",
  sm: "p-4",
  md: "p-[--pad-card]",
  lg: "px-[30px] py-8",
} as const;

export function Card({
  children,
  variant = "solid",
  pad = "md",
  className = "",
  style,
}: {
  children: ReactNode;
  variant?: CardVariant;
  pad?: keyof typeof PADS;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-sheet ${VARIANTS[variant]} ${PADS[pad]} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
