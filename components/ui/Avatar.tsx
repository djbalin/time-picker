import type { CSSProperties } from "react";

/**
 * An initials avatar. The fill colour is picked deterministically from the
 * name, so the same person is the same colour on every screen.
 *
 * Warm accents (butter, coral) live here and in chips — never in body text
 * or on big surfaces.
 */
export type AvatarSize = "sm" | "md" | "lg" | "xl";

export const AVATAR_PX: Record<AvatarSize, number> = {
  sm: 22,
  md: 27,
  lg: 34,
  xl: 48,
};

const PALETTE = [
  "var(--color-butter-200)",
  "var(--color-blush-300)",
  "var(--color-mint-300)",
  "var(--color-lilac-200)",
  "var(--color-butter-400)",
  "var(--color-blush-200)",
];

export function avatarColor(name = ""): string {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return PALETTE[n % PALETTE.length];
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  name = "",
  size = "md",
  color,
  ring = true,
  style,
}: {
  name?: string;
  size?: AvatarSize | number;
  color?: string;
  ring?: boolean;
  style?: CSSProperties;
}) {
  const px = typeof size === "number" ? size : AVATAR_PX[size];
  return (
    <span
      title={name}
      className="grid shrink-0 place-items-center rounded-full font-sans font-bold text-ink-800"
      style={{
        width: px,
        height: px,
        fontSize: Math.round(px * 0.38),
        background: color ?? avatarColor(name),
        border: ring ? "var(--ring-avatar)" : "none",
        ...style,
      }}
    >
      {initials(name)}
    </span>
  );
}
