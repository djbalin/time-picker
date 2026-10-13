---
name: ui-review
description: Review and fix the time-picker UI on phone, tablet and desktop. Takes Playwright screenshots of every screen state, grades them against the project's design rubric (including "cramped"/density checks), fixes the top issues, then re-shoots to prove the fix and catch regressions at other widths. Use when the user runs /ui-review or asks to review, polish or fix layout, responsive or visual-design problems.
argument-hint: "[screen/area] [viewport] [focus], e.g. 'poll mobile' or 'create page, spacing only'"
---

# UI review

You're the design reviewer and the fixer. Your eyes are the screenshots;
your ruler is `layout.json`; your taste is [rubric.md](rubric.md). Read the
rubric before looking at any image.

Scope from the user: `$ARGUMENTS` (empty means a full review).

## 0. Preconditions

- The app must already be running. Check with
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`.
  If that doesn't return 200, **stop and ask the user to run `pnpm dev`.
  Never start a server yourself** (AGENTS.md).
- If Playwright says the browser is missing, ask the user to run
  `pnpm exec playwright install chromium`.

## 1. Pick the scope

Screens are listed in `e2e/screens.ts`; viewports in `playwright.config.ts`
are `mobile-sm` (360), `mobile` (393), `tablet` (820) and `desktop` (1440).
Each image costs context, so budget about **40 tiles per round**.

- Full review default: English on `mobile-sm`, `tablet` and `desktop`, plus
  Danish on `mobile-sm` only. Danish is where text-fitting breaks first.
- If the user named a screen or area, shoot that on all four viewports in
  both locales.

Filters for `pnpm ui:shots`: `--screen <regex>`, `--locale en|da`,
`--project=<viewport>` (repeatable).

## 2. Shoot the "before"

```bash
pnpm ui:shots [filters]
rm -rf ui-review/before && cp -r ui-review/shots ui-review/before
```

Output per screen: `ui-review/shots/<viewport>/<screen>.<locale>/`, holding
the tiles `01.png`, `02.png`, … (one viewport-height each — **read these, not
`full.png`**, which gets downscaled) plus `layout.json`.

## 3. Read the measurements first

Open `ui-review/shots/SUMMARY.md`. **Bold** entries are objective P1 bugs.
For anything flagged, `layout.json` gives the element, its box and the
detail. Use it to confirm what you see and to find the element in code.

## 4. Look

For each screen in scope, Read its tiles in order. For every screen:

1. **Describe before judging.** In a sentence or two, say what's on screen
   and how it's arranged. This stops you from critiquing things that aren't
   there.
2. Walk rubric sections A→E and note every violation, with its rubric ID.
3. Compare the same screen across viewports (D4) and locales (A5).

Then **verify each finding**: point at the tile it's visible in and, where
it's measurable, the number from `layout.json`. Drop anything you can't
point at. If you're unsure whether something is intended, mark it `?` and
ask rather than change it.

## 5. Report

Give the user a table, worst first:

| # | Sev | Rubric | Screen @ viewport | What's wrong (concrete) | Where in code | Proposed fix |
|---|---|---|---|---|---|---|

"Concrete" means something like: *"answered-count pill wraps below the
heading at 360px with 4px between them (B5, D1)"*. "Header feels cramped"
alone is not concrete enough.

## 6. Fix — a few at a time

Fix the top **1–3** findings (P1 before P2; P3 only if asked).

- Mobile-first Tailwind: base classes for phones, then `sm:`/`md:`/`lg:`.
- Use design tokens from `app/[locale]/globals.css`, not magic numbers or
  raw palette colours (rubric E1).
- Follow AGENTS.md: check `node_modules/next/dist/docs/` before touching
  Next APIs, and keep in-file sub-components after the main component.
- Don't change copy in `messages/*.json` unless the fix is wording. If you
  do, change both locales.

## 7. Prove it

```bash
pnpm ui:shots --screen <changed screens>   # all viewports, both locales
pnpm test:layout --grep "<screen>"
```

Read the new tiles next to the same ones in `ui-review/before/`. Check that
the fix landed **and** that nothing regressed at the other widths. Fixing
phones often breaks tablet. If it regressed, fix it or revert.

## 8. Stop and hand back

Report what you changed (with file:line refs), the before/after tile paths,
and the findings still open. Then stop. The user looks at the app and
decides whether to do another round.

Don't run `pnpm test:visual:update` (it accepts the new look as the
baseline) unless the user asks.

## Optional: live poking with Playwright MCP

The `playwright` MCP server (in `.mcp.json`) drives a real browser for things
static shots can't show: hover and focus states, dialogs mid-flow, typing
into the create form. Use `browser_resize` to switch widths. Treat what you
find the same way: verify, report, fix a few, re-shoot.
