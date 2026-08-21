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

There are no user accounts. Two things live in the browser's `localStorage`:

- **Your identity for a poll** — so you don't have to re-pick your name on every
  visit.
- **An admin token** — minted when you create a poll and stored only on that
  device. Finalizing and deleting a poll require it, and it is never included in
  a poll read, so people you share the link with can't delete your poll.

The list at `/polls` is likewise device-local: it shows the polls this browser
has created or opened, not every poll in the database.

> **Note on the trust model:** anyone holding a poll's link can answer as any
> name on it. That's the intended trade-off for a zero-signup tool — the link is
> the shared secret. Don't use it for anything you'd need real auth for.

## Getting started

```bash
pnpm install
pnpm db:seed     # create the SQLite file, apply the schema, add sample polls
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). `pnpm db:seed` prints the
URLs of the polls it created, so you can jump straight into one.

## Configuration

Copy `.env.example` to `.env` if you want to point at something other than the
default local SQLite file:

| Variable              | Default          | Purpose                                        |
| --------------------- | ---------------- | ---------------------------------------------- |
| `DATABASE_URL`        | `file:./db.sqlite` | libsql connection string (local file or Turso) |
| `DATABASE_AUTH_TOKEN` | *(unset)*        | Auth token, required for hosted Turso          |

## Scripts

| Script             | What it does                                              |
| ------------------ | --------------------------------------------------------- |
| `pnpm dev`         | Start the dev server                                       |
| `pnpm build`       | Production build (does not need a reachable database)      |
| `pnpm start`       | Serve the production build                                 |
| `pnpm test`        | Run the logic checks in `scripts/checks.ts`                |
| `pnpm lint`        | Biome lint + format check                                  |
| `pnpm format`      | Apply Biome formatting                                     |
| `pnpm db:generate` | Generate a migration from `lib/db/schema.ts`               |
| `pnpm db:migrate`  | Apply pending migrations                                   |
| `pnpm db:push`     | Push the schema straight to the database (dev shortcut)    |
| `pnpm db:seed`     | Reset and repopulate the database with sample polls        |
| `pnpm db:studio`   | Open Drizzle Studio                                        |

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
  local-store.ts       localStorage: identity, known polls, admin tokens
drizzle/               Generated migrations
scripts/checks.ts      Logic checks (`pnpm test`)
```

### Why reads and writes live apart

Every export of a `"use server"` module is a callable POST endpoint. Keeping
reads in `lib/db/queries.ts` means adding a query can't accidentally publish the
whole database; only the handful of functions in `app/actions/polls.ts` are
reachable from the network, and each one validates its own input.

## Stack

Next.js 16 (App Router) · React 19 · Drizzle ORM on libsql/SQLite ·
Tailwind CSS v4 · Zod · Biome
