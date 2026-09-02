import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * The Meety button. One primary action per view.
 *
 * Buttons do **not** move on hover — they darken one step. Press is a
 * `scale(.98)`. The coloured glow under a filled CTA (`shadow-accent` /
 * `shadow-support`) is what makes it read as an object rather than a
 * rectangle.
 */
export type ButtonVariant = "primary" | "support" | "soft" | "glass" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 min-h-[--tap-min] rounded-pill font-sans font-bold tracking-tight cursor-pointer select-none transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-on-accent shadow-accent hover:enabled:bg-accent-hover",
  support:
    "bg-support text-on-accent shadow-support hover:enabled:bg-support-hover",
  soft: "bg-accent-soft text-accent-text hover:enabled:bg-blush-200",
  glass:
    "bg-surface-glass text-strong border border-white backdrop-blur-lg hover:enabled:bg-paper",
  ghost: "bg-transparent text-support-text hover:enabled:bg-support-soft",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-[22px] py-[13px] text-md",
  lg: "px-[26px] py-[17px] text-lg",
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
  icon?: string;
  /** Trailing Material Symbols glyph name. */
  iconEnd?: string;
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
