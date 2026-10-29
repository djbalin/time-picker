/**
 * Shared button / field class strings for the pre-Meety screens (create
 * form, identity picker, owner tools, …). New screens should import the
 * typed components from `@/components/ui` instead; this file keeps the older
 * call sites on-brand until they migrate.
 */

import {
  type ButtonVariant,
  buttonClass as uiButtonClass,
} from "@/components/ui/Button";

type Variant = "primary" | "secondary" | "accent" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

// The older names, mapped onto the shared button so both paths look the same.
const VARIANT_MAP: Record<Variant, ButtonVariant> = {
  primary: "primary",
  secondary: "secondary",
  accent: "support",
  quiet: "ghost",
  danger: "danger",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}): string {
  return uiButtonClass({ variant: VARIANT_MAP[variant], size, className });
}

/**
 * Inputs sit one surface level below the card they live on (sunken lilac
 * fill + hairline), so they read as wells on a white sheet. Focus lifts the
 * field back to white with a lilac border and halo.
 */
export const inputClass =
  "w-full rounded-pill border bg-surface-sunken px-[18px] py-3 text-md font-medium text-strong outline-none transition-[background-color,border-color,box-shadow] duration-[180ms] placeholder:font-medium placeholder:text-muted focus:bg-surface-card focus:ring-4";

export function fieldClass(hasError: boolean): string {
  return `${inputClass} ${
    hasError
      ? "border-no bg-no-soft/40 focus:border-no-text focus:ring-no-soft"
      : "border-hairline hover:border-ink-200 focus:border-support focus:ring-support-soft"
  }`;
}
