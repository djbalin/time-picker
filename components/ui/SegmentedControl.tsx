"use client";

import { Icon } from "./Icon";

export type Segment<T extends string> = {
  value: T;
  label: string;
  icon?: string;
};

/** A pill-shaped tab strip. The selected segment lifts onto a white chip. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  options: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label"?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex gap-1 rounded-pill bg-surface-sunken p-1"
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
            className={`inline-flex items-center gap-1.5 rounded-pill px-4 py-2 font-sans text-sm font-bold tracking-tight transition-[background-color,color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              on
                ? "bg-paper text-strong shadow-rest"
                : "bg-transparent text-muted hover:text-body"
            }`}
          >
            {option.icon ? <Icon name={option.icon} size={16} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
