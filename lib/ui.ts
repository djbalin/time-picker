/**
 * Button styling in one place. The pill button shows up on nearly every screen
 * and had drifted into a dozen near-identical class strings.
 */

type Variant = "primary" | "secondary" | "accent" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-paper shadow-raised hover:bg-graphite",
  secondary:
    "border border-line bg-white text-ink shadow-soft hover:border-silver",
  accent: "bg-sky text-white shadow-raised hover:bg-sky-light",
  quiet: "text-slate hover:bg-cloud hover:text-ink",
  danger: "border border-red/40 bg-white text-red-deep hover:bg-red-tint",
};

const SIZES: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
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

export const inputClass =
  "w-full rounded-md border bg-paper px-4 py-3 text-sm font-semibold text-ink placeholder:font-semibold placeholder:text-mist focus:bg-white focus:outline-none focus:ring-4";

export function fieldClass(hasError: boolean): string {
  return `${inputClass} ${
    hasError
      ? "border-red focus:border-red focus:ring-red-tint"
      : "border-line focus:border-sky focus:ring-sky-tint"
  }`;
}
