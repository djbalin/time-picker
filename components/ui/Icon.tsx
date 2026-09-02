import type { CSSProperties } from "react";

/**
 * A Material Symbols Rounded glyph. The font is loaded globally in
 * `globals.css`; the `.ms` class carries the variation settings.
 *
 * Icons are `currentColor` by default and inherit the surrounding ink.
 * Colour one only when it carries answer semantics (mint check, butter
 * question mark, coral cross).
 */
export type IconSize = "sm" | "md" | "lg" | "xl";

const PX: Record<IconSize, number> = { sm: 18, md: 22, lg: 26, xl: 34 };

export function Icon({
  name,
  size = "md",
  fill = false,
  color,
  className = "",
  style,
}: {
  name: string;
  /** A keyword (`sm`–`xl`) or an explicit pixel size. */
  size?: IconSize | number;
  /** Filled glyph — a *state* (selected nav, active toggle), not a style. */
  fill?: boolean;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const px = typeof size === "number" ? size : PX[size];
  return (
    <span
      className={`ms ${className}`}
      data-fill={fill ? "1" : "0"}
      aria-hidden="true"
      style={{ fontSize: px, width: px, height: px, color, ...style }}
    >
      {name}
    </span>
  );
}
