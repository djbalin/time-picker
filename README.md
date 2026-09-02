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
`.env.development.local` pointing the app at it, applies migrations, then starts
Next. The first run pulls Docker images (~1–2 min); later runs just reconnect.

Then, in another terminal:

```bash
pnpm db:seed   # populate sample polls — prints their URLs and the "My polls" email
```

Open [http://localhost:3000](http://localhost:3000).

To run against the remote database instead, use `pnpm dev:next` directly and
delete `.env.development.local`.

## Configuration

Env files, in Next.js precedence order (later overrides earlier):

| File                     | Committed | Used for                                        |
| ------------------------ | --------- | ----------------------------------------------- |
| `.env.development`        | yes       | Shared dev defaults (remote DB fallback)        |
| `.env.production`         | yes       | `pnpm build` / `pnpm start`                     |
| `.env.development.local`  | no        | Written by `pnpm dev` — the local Supabase DB   |

| Variable       | Purpose                                                            |
| -------------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | Postgres connection string. `pnpm db:*` read the same files.      |

## Scripts

| Script                | What it does                                              |
| --------------------- | -------------------------------------------------------- |
| `pnpm dev`            | Local Supabase + migrations + Next (`scripts/dev.sh`)     |
| `pnpm dev:next`       | Just `next dev`, against whatever `DATABASE_URL` resolves |
| `pnpm supabase:start` | Start the local Supabase stack                            |
| `pnpm supabase:stop`  | Stop it                                                   |
| `pnpm build`          | Production build (does not need a reachable database)     |
| `pnpm start`          | Serve the production build                                |
| `pnpm test`           | Run the logic checks in `scripts/checks.ts`               |
| `pnpm lint`           | Biome lint + format check                                 |
| `pnpm format`         | Apply Biome formatting                                    |
| `pnpm db:generate`    | Generate a migration from `lib/db/schema.ts`              |
| `pnpm db:migrate`     | Apply pending migrations                                  |
| `pnpm db:push`        | Push the schema straight to the database (dev shortcut)   |
| `pnpm db:seed`        | Reset and repopulate the database with sample polls       |
| `pnpm db:studio`      | Open Drizzle Studio                                       |

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
drizzle/               Generated migrations
supabase/              Local Supabase stack config (`config.toml`)
scripts/dev.sh         `pnpm dev` — local Supabase + migrations + Next
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
