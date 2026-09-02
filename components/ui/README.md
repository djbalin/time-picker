# Meety design system — code

The design team's token package (`meety-design-system-dbcc063d`) ported into
this codebase.

## Where things live

| Layer | File |
| --- | --- |
| Tokens (palette, type, shape, shadow, motion) | `app/[locale]/globals.css` — `@theme` + `:root` |
| Primitive components | `components/ui/*` (this folder) |
| Availability heat (green / orange / red) | `lib/availability-heat.ts` |
| Older button/field class strings | `lib/ui.ts` |

## Tokens

`@theme` entries become both a CSS variable and a Tailwind utility, so
`--color-accent` gives you `bg-accent` / `text-accent` and `--radius-sheet`
gives `rounded-sheet`. Composite values that aren't utilities (page
gradients, the `--type-*` `font` shorthands, motion recipes) are plain
custom properties in `:root`.

Prefer the **semantic** names (`text-strong`, `bg-surface-card`,
`text-accent-text`, `bg-yes` / `bg-maybe` / `bg-no`) over the raw palette
(`bg-blush-300`). The `--color-sky` / `--color-ink` / … aliases exist only to
keep the pre-Meety screens rendering during migration — don't reach for them
in new code.

Answer colours are semantic and never decorative: **mint = can**, **butter =
maybe**, **coral = can't**.

## Components

`Button` · `IconButton` · `Icon` · `Chip` · `Card` · `Avatar` /
`AvatarStack` · `SegmentedControl` · `SlotToggle` · `AvailabilityBar` ·
`Wordmark`

```tsx
import { Button, Chip, SlotToggle } from "@/components/ui";
```

`Button`, `IconButton`, `Card`, `Chip`, `Avatar` and `AvailabilityBar` are
server components (hover/press is CSS-only). `SegmentedControl`,
`SlotToggle` and anything with an `onChange` are client components.

`SlotToggle` is the signature control — the round tick. Unanswered sits
small and grey; answering pops it to full colour in one bounce.

## Fonts

Righteous (display, one weight) and Gabarito (everything else) load via
`next/font/google` in the root layout. Material Symbols Rounded loads from
the Google Fonts CDN in `globals.css`; the `.ms` class carries the
variation settings and `Icon` wraps it.
