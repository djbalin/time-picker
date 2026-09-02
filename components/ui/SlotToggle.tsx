"use client";

import { Icon } from "./Icon";

/**
 * The round tick — the single most important control in the product.
 *
 * Unanswered sits at `scale(.94)` in sunken lilac with a transparent glyph;
 * answering pops it to `scale(1)` and full colour in one bounce. Clicking
 * cycles through the mode's states and then back to unanswered.
 */
export type SlotValue = "yes" | "maybe" | "no" | null;
export type SlotMode = "binary" | "tri";

const CYCLE: Record<SlotMode, SlotValue[]> = {
  binary: ["yes", null],
  tri: ["yes", "maybe", "no", null],
};

const STATES: Record<
  "yes" | "maybe" | "no",
  { className: string; icon: string }
> = {
  yes: { className: "bg-yes text-yes-text", icon: "check" },
  maybe: { className: "bg-maybe text-maybe-text", icon: "question_mark" },
  no: { className: "bg-no text-no-text", icon: "close" },
};

export function SlotToggle({
  value = null,
  onChange,
  mode = "binary",
  size = 32,
  label,
}: {
  value?: SlotValue;
  onChange: (value: SlotValue) => void;
  mode?: SlotMode;
  size?: number;
  /** Accessible name — e.g. "Your answer for Saturday 12". */
  label?: string;
}) {
  const state = value ? STATES[value] : null;

  function next(event: React.MouseEvent) {
    // The toggle often lives inside a clickable row; its own click shouldn't
    // also select the row.
    event.stopPropagation();
    const cycle = CYCLE[mode];
    const i = cycle.indexOf(value);
    onChange(cycle[(i + 1) % cycle.length]);
  }

  return (
    <button
      type="button"
      onClick={next}
      aria-pressed={value === "yes"}
      aria-label={label ?? value ?? "not answered"}
      className={`grid shrink-0 place-items-center rounded-full border-none cursor-pointer transition-[background-color,color,transform] duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        state
          ? `${state.className} scale-100`
          : "bg-surface-sunken text-transparent scale-[0.94]"
      }`}
      style={{ width: size, height: size }}
    >
      <Icon
        name={state ? state.icon : "check"}
        size={Math.round(size * 0.55)}
        color="currentColor"
      />
    </button>
  );
}
