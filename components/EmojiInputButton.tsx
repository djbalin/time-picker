"use client";

import {
  EmojiPicker,
  type EmojiPickerListCategoryHeaderProps,
  type EmojiPickerListEmojiProps,
  type EmojiPickerListRowProps,
} from "frimousse";
import { useLocale, useTranslations } from "next-intl";
import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui";

const PANEL_WIDTH = 304;
const PANEL_HEIGHT = 360;
/** Space between the trigger and the panel, and kept from the screen edge. */
const GAP = 8;

/**
 * A smiley button that sits inside the right end of a text input and opens
 * an emoji picker; the chosen emoji is typed in at the input's cursor.
 *
 * Place it in a `relative` wrapper next to the input, and give the input
 * enough right padding to clear it.
 *
 * The panel is portalled to `<body>`: rendered inside a `<form>`, pressing
 * Enter in its search box would submit the form.
 */
export function EmojiInputButton({
  inputRef,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const t = useTranslations("EmojiPicker");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Anchor the panel under the button's right edge, flipping above it when
  // there isn't room below, and re-anchor as the page scrolls or resizes.
  useLayoutEffect(() => {
    if (!open) return;

    function place() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const fitsBelow =
        rect.bottom + GAP + PANEL_HEIGHT <= window.innerHeight - GAP;
      const top = fitsBelow
        ? rect.bottom + GAP
        : Math.max(GAP, rect.top - GAP - PANEL_HEIGHT);
      const left = Math.min(
        Math.max(GAP, rect.right - PANEL_WIDTH),
        window.innerWidth - PANEL_WIDTH - GAP,
      );
      setPosition({ top, left: Math.max(GAP, left) });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      close();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      close();
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  function handleSelect(emoji: string) {
    const input = inputRef.current;
    if (input) insertAtCursor(input, emoji);
    close();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={t("open")}
        title={t("open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[6px] transition-colors hover:bg-plum-50 hover:text-plum-700 ${
          open ? "bg-plum-50 text-plum-700" : "text-ink-400"
        }`}
      >
        <Icon name="add_reaction" size={20} />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t("open")}
            className="fixed z-50 rounded-[12px] border border-apricot-300 bg-paper p-2 shadow-warm"
            style={{
              top: position.top,
              left: position.left,
              width: PANEL_WIDTH,
              height: PANEL_HEIGHT,
            }}
          >
            <EmojiPickerPanel onSelect={handleSelect} />
          </div>,
          document.body,
        )}
    </>
  );
}

function EmojiPickerPanel({ onSelect }: { onSelect: (emoji: string) => void }) {
  const t = useTranslations("EmojiPicker");
  const locale = useLocale();
  const searchRef = useRef<HTMLInputElement>(null);

  // Only jump into the search box with a real pointer — on touch screens it
  // would pop the keyboard up over the picker.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) {
      searchRef.current?.focus();
    }
  }, []);

  return (
    <EmojiPicker.Root
      locale={locale}
      columns={8}
      onEmojiSelect={({ emoji }) => onSelect(emoji)}
      className="isolate flex h-full w-full flex-col"
    >
      <EmojiPicker.Search
        ref={searchRef}
        placeholder={t("search")}
        className="mb-2 w-full rounded-[8px] border border-apricot-300 bg-paper px-3 py-2 text-sm text-strong outline-none placeholder:text-ink-400 focus:border-plum-500"
      />
      <EmojiPicker.Viewport className="relative flex-1 outline-none">
        <EmojiPicker.Loading className="absolute inset-0 grid place-items-center text-sm text-ink-400">
          {t("loading")}
        </EmojiPicker.Loading>
        <EmojiPicker.Empty className="absolute inset-0 grid place-items-center text-sm text-ink-400">
          {t("empty")}
        </EmojiPicker.Empty>
        <EmojiPicker.List
          className="select-none pb-1"
          components={LIST_COMPONENTS}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}

// Module-level so their identity is stable — new component types on each
// render would remount every row of the virtualised list.
const LIST_COMPONENTS = {
  CategoryHeader: ({
    category,
    ...props
  }: EmojiPickerListCategoryHeaderProps) => (
    <div
      className="bg-paper px-1.5 pt-2 pb-1 text-2xs font-semibold uppercase tracking-label text-ink-400"
      {...props}
    >
      {category.label}
    </div>
  ),
  Row: ({ children, ...props }: EmojiPickerListRowProps) => (
    <div className="scroll-my-1 px-0.5" {...props}>
      {children}
    </div>
  ),
  Emoji: ({ emoji, ...props }: EmojiPickerListEmojiProps) => (
    <button
      className="flex h-8 w-8 items-center justify-center rounded-[6px] text-xl data-[active]:bg-apricot-100"
      {...props}
    >
      {emoji.emoji}
    </button>
  ),
};

/**
 * Types `text` over the input's current selection, as if from the keyboard.
 * The synthetic `input` event is what makes React's `onChange` fire, so this
 * works for controlled and uncontrolled inputs alike.
 */
function insertAtCursor(input: HTMLInputElement, text: string) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  input.focus();
  input.setRangeText(text, start, end, "end");
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
