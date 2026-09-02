import type { ButtonHTMLAttributes } from "react";
import { Icon } from "./Icon";

/**
 * A round, icon-only button. `label` is required — it is the accessible
 * name and the tooltip.
 */
export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonVariant = "quiet" | "solid" | "glass";

const PX: Record<IconButtonSize, string> = {
  sm: "h-[34px] w-[34px]",
  md: "h-[44px] w-[44px]",
  lg: "h-[52px] w-[52px]",
};

const VARIANTS: Record<IconButtonVariant, string> = {
  quiet: "bg-transparent text-body hover:enabled:bg-surface-sunken",
  solid: "bg-support text-on-accent hover:enabled:bg-support-hover",
  glass:
    "bg-surface-glass text-strong border border-white backdrop-blur-lg hover:enabled:bg-paper",
};

export function IconButton({
  icon,
  label,
  size = "md",
  variant = "quiet",
  active = false,
  className = "",
  type = "button",
  ...rest
}: {
  icon: string;
  label: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  active?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`grid place-items-center rounded-full cursor-pointer transition-[background-color,color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed disabled:opacity-40 ${PX[size]} ${
        active ? "bg-accent-soft text-accent-text" : VARIANTS[variant]
      } ${className}`}
      {...rest}
    >
      <Icon name={icon} size={size === "sm" ? "sm" : "md"} fill={active} />
    </button>
  );
}
