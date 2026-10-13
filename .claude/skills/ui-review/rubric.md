# UI rubric — time-picker

Grade every screenshot against this list. It exists to turn "looks cramped"
or "feels off" into checks two reviewers would answer the same way. Cite the
ID (e.g. `B3`) in every finding.

Severity:

- **P1 — broken.** Content lost, unreadable, overlapping or unreachable.
  Always fix.
- **P2 — cramped or unclear.** Works, but a normal person would hesitate,
  squint or mis-tap. Fix when it's cheap and clearly better.
- **P3 — polish.** Taste-level. Report it, but don't change it unless asked.

## A. Broken (P1)

- **A1** The page scrolls sideways, or anything sticks out past the screen
  edge. (`layout.json` → `horizontalOverflow`, `offscreen`)
- **A2** Text or a control is cut off by its container (`clipped`), or
  truncated with "…" where the full text isn't shown anywhere else.
- **A3** Two elements overlap (`overlaps`), or content hides behind a sticky
  or fixed element.
- **A4** Text is hard to read against its background (axe `color-contrast`;
  also check text on the glass and gradient surfaces by eye).
- **A5** The Danish version breaks where the English one doesn't. Danish
  strings run about 20–30% longer — look for wraps, clipping and pushed-out
  buttons in `*.da` shots.
- **A6** A primary action is invisible or unreachable on a phone (off-screen,
  below an endless list with no other way to reach it, or covered).

## B. Spacing and density — what "cramped" means here (P2)

- **B1** Phones: at least 16px between the screen edge and any text or
  control. The app's page gutter is `px-4`, so anything closer has escaped
  it. (`edgeHugging`)
- **B2** Tap targets are at least 44×44px, or 24px with a clear gap around
  them. Calendar day cells and icon buttons are the usual suspects.
  (`smallTargets`)
- **B3** Neighbouring tap targets have at least 8px between them, so a thumb
  can't hit two at once.
- **B4** Text never touches the inside edge of its own pill, chip, card or
  button. Pills need 8px or more of horizontal padding; cards need 16px or
  more on phones.
- **B5** Proximity tells the story: related things sit closer together than
  unrelated things. Equal gaps everywhere, or a label nearer the wrong
  control, is a finding.
- **B6** At 360px, a single row holds at most about 3 competing items. A row
  that wraps into a ragged second line, like a toolbar with a title, arrows,
  a legend and a segmented control all fighting for one line, should
  restack deliberately instead.
- **B7** Spacing follows the 4px grid and repeats. Two similar cards with
  different padding, or gaps of 13px and 17px side by side, are a finding.
- **B8** No dead space either. On desktop, content shouldn't float in a sea
  of empty space or stretch across 1440px; it stays within `--width-app`
  (1240px) with a sensible column layout.

## C. Hierarchy and readability (P2)

- **C1** Within about 2 seconds it's clear what the screen is for and what to
  do first. One primary action per view (the `primary` button variant), and
  it is the most prominent control.
- **C2** The main heading is the most prominent text. On the poll screen
  that's the question, not the poll title eyebrow.
- **C3** Body text on phones is `text-md` (15.5px) or larger. `text-2xs`
  (11px) is only for uppercase eyebrow labels. Nothing goes under 11px.
  (`tinyText`)
- **C4** Headings don't leave a single word alone on their last line, and
  buttons never wrap mid-label.
- **C5** Paragraphs stay under about 75 characters per line on desktop.
- **C6** States are distinguishable without colour alone: mine vs. others',
  selected vs. not, finalized vs. open.

## D. Responsive behaviour (P1 or P2)

- **D1** A phone layout is a layout, not a shrunken desktop: sidebars stack
  or collapse, multi-column grids become one column below `md`/`lg`, and
  side rails move below the main content.
- **D2** Tablet (820px) gets its own look. In-between widths are where most
  bugs live: a two-column layout squeezed too narrow, or a phone layout
  stretched too wide.
- **D3** Fixed widths survive 360px. Watch hard-coded sizes like
  `min-w-[180px]`, `lg:grid-cols-[…_322px]` and `md:grid-cols-[250px_1fr]`.
- **D4** The same component looks related at every width: it may restack,
  but it shouldn't change personality.
- **D5** Long content degrades gracefully. The crowded fixture (16 people,
  long names, 40 dates, long title) should look busy, not broken.

## E. House style — Meety design system (P3 unless it breaks C or D)

- **E1** Uses tokens, not raw values: semantic colours (`text-strong`,
  `bg-surface-card`), the radius family (`rounded-pill`, `rounded-sheet`,
  `rounded-row`) and type tokens. Raw hex, `bg-blush-300`, or the legacy
  `sky`/`ink` aliases in new code are findings.
- **E2** Answer colours are semantic, never decorative: mint = can, butter =
  maybe, coral = can't.
- **E3** Righteous (`font-display`) is for display text only; everything else
  is Gabarito.
- **E4** Icons come from Material Symbols (`Icon`/`.ms`) at sizes consistent
  with their neighbours.
- **E5** Similar surfaces (glass pills, cards, sheets) share shadow, border
  and radius across screens.

## Not findings

- Anything consistent with sections A–E that you'd simply have designed
  differently.
- The test data itself (2030 dates, fixture names).
- Things only visible in `full.png` that the tiles show correctly. Tiles are
  the ground truth for detail; the full image is downscaled.
