import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./icon-names";

/**
 * The button: a slim pill. Hover darkens it one step; press shrinks it a
 * touch. One primary (plum) action per view. `glass` is kept as an alias of
 * `secondary` for older call sites.
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "support"
  | "soft"
  | "ghost"
  | "danger"
  | "glass";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-pill font-sans font-semibold tracking-tight cursor-pointer select-none transition-[background-color,border-color,color,scale] duration-150 ease-out active:scale-[0.98] focus-visible:outline-plum-500 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100";

const SECONDARY =
  "bg-paper text-strong ring-1 ring-inset ring-apricot-300 hover:not-disabled:ring-plum-300 hover:not-disabled:text-plum-700";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-plum-600 text-apricot-50 hover:not-disabled:bg-plum-700",
  secondary: SECONDARY,
  glass: SECONDARY,
  support: "bg-butter-300 text-apricot-800 hover:not-disabled:bg-butter-200",
  soft: "bg-plum-50 text-plum-700 hover:not-disabled:bg-plum-100",
  ghost: "bg-transparent text-plum-600 hover:not-disabled:bg-plum-50",
  danger: "bg-coral-100 text-coral-600 hover:not-disabled:bg-coral-300/50",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-8 px-3.5 py-1 text-sm",
  md: "min-h-11 px-5 py-2 text-md",
  lg: "min-h-12 px-6 py-2.5 text-md",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  full = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
} = {}): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${full ? "w-full" : ""} ${className}`
    .replace(/\s+/g, " ")
    .trim();
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  full = false,
  icon,
  iconEnd,
  className = "",
  type = "button",
  ...rest
}: {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  /** Leading Material Symbols glyph name. */
  icon?: IconName;
  /** Trailing Material Symbols glyph name. */
  iconEnd?: IconName;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, full, className })}
      {...rest}
    >
      {icon ? <Icon name={icon} size="sm" /> : null}
      {children}
      {iconEnd ? <Icon name={iconEnd} size="sm" /> : null}
    </button>
  );
}
