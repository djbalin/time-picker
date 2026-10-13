# Time Picker

A small scheduling poll app: propose a set of dates, share one link, and let
everyone tick the days they can make. No accounts, no sign-up — the link *is*
the invitation.

## How it works

1. **Create a poll.** Give it a title, list who you're trying to schedule with,
   and pick every date that could work on a multi-month calendar.
2. **Share the link.** Anyone with the URL can open the poll, pick their name,
   and tick their dates. Answers save as you go.
3. **Lock in a date.** The results panel ranks the dates by how many people can
   make them and flags any that work for everyone. The organizer can then
   finalize one.

### Who can do what

There are no user accounts yet. Two things live in the browser's `localStorage`:

- **Your identity for a poll** — so you don't have to re-pick your name on every
  visit.
- **An admin token** — minted when you create a poll and stored only on that
  device. Finalizing and deleting a poll require it, and it is never included in
  a poll read, so people you share the link with can't delete your poll.

To create a poll you give an **email**. The "My polls" screen (`/polls`) lists
every poll created under an email you type in. This is deliberately unguarded —
there's no verification yet — and will be gated behind real sign-in later. In
development there's also an **ALL POLLS** button that dumps the whole table.

> **Note on the trust model:** anyone holding a poll's link can answer as any
> name on it, and anyone who types a creator's email sees their polls. That's the
> intended trade-off for the current zero-signup stage — don't use it for
> anything you'd need real auth for.

## Getting started

You need [Docker](https://docs.docker.com/get-docker/) running — the local
database is a Supabase stack in containers.

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs `scripts/dev.sh`, which starts local Supabase, writes
`.env.development.local` pointing the app at it, syncs the schema
(`drizzle-kit push`), then starts Next. The first run pulls Docker images
(~1–2 min); later runs just reconnect.

Then, in another terminal:

```bash
pnpm db:seed   # populate sample polls — prints their URLs and the "My polls" email
```

Open [http://localhost:3000](http://localhost:3000).

To run against the remote database instead, use `pnpm dev:next` directly and
delete `.env.development.local`.

## Configuration

Env files (all gitignored except `.env.example`), in Next.js precedence order —
later overrides earlier, and `lib/db/load-env.ts` teaches `pnpm db:*` the same
order:

| File                    | Used for                                       |
| ----------------------- | ---------------------------------------------- |
| `.env.development`       | `pnpm dev:next` fallback (e.g. a remote dev DB) |
| `.env.production`        | `pnpm build` / `pnpm start`                    |
| `.env.development.local` | Written by `pnpm dev` — the local Supabase DB  |

`DATABASE_URL` is the only variable — a Postgres connection string. On Vercel
it's a Project env var instead of a file.

## Deploying

The app is on Vercel (`time-picker`, linked to this repo — pushes to `main`
deploy). To stand up a fresh environment:

1. Set `DATABASE_URL` in the Vercel project (Settings → Environment Variables) to
   the target Postgres — the Supabase **transaction pooler** string, port 6543.
2. Apply the schema once: `DATABASE_URL="<that url>" pnpm db:push`.
3. Redeploy.

There are no migration files — `db:push` diffs `lib/db/schema.ts` against
whatever `DATABASE_URL` points at. Fine while there's no data to lose; switch to
`db:generate` + committed migrations before real users arrive.

## Scripts

| Script                | What it does                                              |
| --------------------- | -------------------------------------------------------- |
| `pnpm dev`            | Local Supabase + schema push + Next (`scripts/dev.sh`)    |
| `pnpm dev:next`       | Just `next dev`, against whatever `DATABASE_URL` resolves |
| `pnpm supabase:start` | Start the local Supabase stack                            |
| `pnpm supabase:stop`  | Stop it                                                   |
| `pnpm build`          | Production build (does not need a reachable database)     |
| `pnpm start`          | Serve the production build                                |
| `pnpm test`           | Run the logic checks in `scripts/checks.ts`               |
| `pnpm lint`           | Biome lint + format check                                 |
| `pnpm format`         | Apply Biome formatting                                    |
| `pnpm db:push`        | Diff `lib/db/schema.ts` against the database and apply it |
| `pnpm db:seed`        | Push the schema, then reset + repopulate with sample polls |
| `pnpm db:studio`      | Open Drizzle Studio                                       |
| `pnpm db:generate`    | (dormant) Generate a migration — for once there's real data |
| `pnpm test:e2e`       | All UI checks: layout, accessibility, visual baselines    |
| `pnpm test:layout`    | Just the layout checks (also `test:a11y`, `test:visual`)  |
| `pnpm test:visual:update` | Accept the current look as the new visual baseline    |
| `pnpm test:report`    | Open the HTML report of the last UI test run              |
| `pnpm test:audit`     | Self-test of the layout-measuring code (no server needed) |
| `pnpm ui:shots`       | Screenshot every screen for AI review (`ui-review/shots/`) |

## UI testing

Playwright renders every screen state in `e2e/screens.ts` at four widths —
360 and 393 (phones), 820 (tablet), 1440 (desktop) — in English and Danish,
against fixture polls (`e2e/fixtures/polls.ts`) that global setup recreates
in your dev database. Only rows with a `ui-` slug are touched.

The tests need the app running and never start it themselves:

```bash
pnpm dev                                   # terminal 1
pnpm exec playwright install chromium      # once
pnpm test:e2e                              # terminal 2
```

Three layers, from strict to subjective:

1. **Layout checks** (`e2e/layout.spec.ts` + `e2e/audit.ts`) measure the
   page and fail on objective breakage: sideways scroll, off-screen or
   clipped content, overlapping controls, tap targets under 24px, console or
   hydration errors.
2. **Accessibility and visual baselines** — axe-core (serious/critical
   violations fail), and pixel diffs against `e2e/__screenshots__/`. The
   first run writes the baselines; commit them.
3. **AI design review** — in Claude Code, run `/ui-review` (optionally with a
   scope, e.g. `/ui-review poll page on mobile`). It shoots the screens,
   grades them against `.claude/skills/ui-review/rubric.md` (what "cramped"
   means here, concretely), fixes the worst one to three issues, re-shoots
   to prove the fix, and stops for you to check. Edit the rubric to teach
   it your taste.

## Layout

```
app/
  actions/polls.ts     Server Actions — mutations only (each export is a public endpoint)
  polls/               List, create, and the poll page
  polls/[slug]/        The answering + results surface
components/            Shared header and icon set
lib/
  db/schema.ts         Drizzle schema
  db/queries.ts        Reads, imported directly by Server Components
  poll-summary.ts      Availability rollup — pure, unit-tested
  validation.ts        Zod schemas shared by client and server
  local-store.ts       localStorage: per-poll identity and admin token
  db/load-env.ts       Loads .env.* for scripts that run outside Next
supabase/              Local Supabase stack config (`config.toml`)
scripts/dev.sh         `pnpm dev` — local Supabase + schema push + Next
scripts/checks.ts      Logic checks (`pnpm test`)
```

### Why reads and writes live apart

Every export of a `"use server"` module is a callable POST endpoint. Keeping
reads in `lib/db/queries.ts` means adding a query can't accidentally publish the
whole database; only the handful of functions in `app/actions/polls.ts` are
reachable from the network, and each one validates its own input.

## Stack

Next.js 16 (App Router) · React 19 · Drizzle ORM on Postgres (Supabase) ·
Tailwind CSS v4 · Zod · Biome
