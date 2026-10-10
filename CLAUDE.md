# Working in this repository

Read `AGENTS.md` first: this project uses a Next.js version with breaking changes,
and its rules say to check `node_modules/next/dist/docs/` before writing code.

## What this is

Reel Tool: a hosted product for production companies and reps that builds a reel for
a brief and learns from results. `docs/PLAN.md` is the source of truth for scope and
build order. Build stage 1 (Fox Den only) in the order listed there; do not start a
later step before the earlier one works end to end.

## Who you are working with

The owner, Rich, is a commercial director, not a programmer. He directs in plain
language and often by voice.

- Explain what you built and how to check it in plain words. No jargon without a
  one-line explanation.
- He opens every outside account and enters every password and card himself. Tell
  him exactly where to click; never ask him to paste a secret into chat.
- Secrets live in environment variables. Never commit a key. `.env*` is git-ignored.
- When you invent wording that users will see, say so, so he can veto it.

## Conventions

- TypeScript, Next.js app router, Tailwind. System fonts only (no `next/font/google`:
  build machines may not reach Google Fonts).
- Keep `npm run build` and `npm run lint` passing before every commit.
- Planned services (none is set up yet, and none is locked in): Supabase for the
  database, sign-in and files; Cloudflare Stream or Mux for video; the Claude API for
  analysis and matching; Vercel for hosting.
- Other companies' unreleased work will live here in stage 3. Every table that holds
  customer data carries `company_id`, and every query filters by it.

## Database

- Changes go in a new numbered file in `db/migrations/`. Never edit a migration that
  has already been run. Rich runs each one by pasting it into the Supabase SQL Editor.
- Every new table gets row level security and an "own company only" policy, as in
  `001_init.sql`. Test migrations locally (PGlite works) before asking Rich to run one.
