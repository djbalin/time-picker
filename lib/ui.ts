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
 * A white panel on the warm ground: a fine apricot border and a small radius,
 * no shadow. Separation comes from the border, not from depth.
 */
export const sheetClass = "rounded-[14px] border border-apricot-300 bg-paper";

/**
 * Inputs are crisp white fields with a fine warm border and a small radius.
 * Focus turns the border plum and adds a soft plum halo.
 */
export const inputClass =
  "w-full rounded-[8px] border bg-paper px-3.5 py-2.5 text-md text-strong outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-ink-400 focus:ring-3";

export function fieldClass(hasError: boolean): string {
  return `${inputClass} ${
    hasError
      ? "border-coral-400 focus:border-coral-600 focus:ring-coral-100"
      : "border-apricot-300 hover:border-apricot-600 focus:border-plum-500 focus:ring-plum-100"
  }`;
}

/** A form label: small, semibold, in the strong ink. */
export const labelClass = "mb-1.5 block text-sm font-semibold text-strong";
