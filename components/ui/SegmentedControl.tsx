"use client";

import { Icon } from "./Icon";
import type { IconName } from "./icon-names";

export type Segment<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

/**
 * A pill-shaped tab strip. The selected segment lifts onto a white chip.
 * `iconOnly` drops the visible labels (they stay as tooltip + accessible name).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  iconOnly = false,
  "aria-label": ariaLabel,
}: {
  options: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  iconOnly?: boolean;
  "aria-label"?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex gap-0.5 rounded-[10px] bg-apricot-100 p-0.5"
    >
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(option.value)}
            title={iconOnly ? option.label : undefined}
            aria-label={iconOnly ? option.label : undefined}
            className={`inline-flex items-center gap-1.5 rounded-[8px] ${iconOnly ? "px-2.5 py-1.5" : "px-4 py-2"} font-sans text-sm font-bold tracking-tight transition-[background-color,color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              on
                ? "bg-paper text-plum-700 shadow-[0_1px_2px_rgba(74,46,27,0.12)]"
                : "bg-transparent text-ink-400 hover:text-body"
            }`}
          >
            {option.icon ? (
              <Icon name={option.icon} size={iconOnly ? 18 : 16} />
            ) : null}
            {iconOnly ? null : option.label}
          </button>
        );
      })}
    </div>
  );
}
