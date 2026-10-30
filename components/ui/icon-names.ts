/**
 * Every Material Symbols glyph the app draws. The icon font is self-hosted
 * as a subset holding only these, so it stays a few KB instead of several
 * MB. Adding a name here means regenerating the font:
 *
 *   pnpm icons:font
 *
 * Keep the list alphabetical; Google Fonts requires it for `icon_names`.
 */
export const ICON_NAMES = [
  "add_reaction",
  "arrow_back",
  "arrow_forward",
  "calendar_month",
  "check",
  "close",
  "event",
  "expand_more",
  "group",
  "list",
  "progress_activity",
  "question_mark",
  "schedule",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
