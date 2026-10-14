/**
 * Shared button / field class strings for the pre-Meety screens (create
 * form, identity picker, owner tools, …). New screens should import the
 * typed components from `@/components/ui` instead; this file keeps the older
 * call sites on-brand until they migrate.
 */

type Variant = "primary" | "secondary" | "accent" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-pill font-bold tracking-tight transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent shadow-accent hover:bg-accent-hover",
  secondary: "bg-surface-card text-strong shadow-rest hover:bg-surface-sunken",
  accent: "bg-support text-on-accent shadow-support hover:bg-support-hover",
  quiet: "text-support-text hover:bg-support-soft",
  danger: "bg-no-soft text-no-text hover:bg-no",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-[22px] py-3 text-md",
  lg: "px-[26px] py-3.5 text-lg",
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
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim();
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
