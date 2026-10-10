# Reel Tool

A hosted tool for production companies and reps. It holds every director's spots in
one library, analyzes each spot with an AI model, proposes a reel for a brief with a
reason for every pick, and learns from what happens after the reel is sent.

Status: project skeleton. No features are built yet. See `docs/PLAN.md` for the
product brief and build order, and `db/schema.sql` for the planned data model.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Layout

- `src/app/` the web app (Next.js, TypeScript, Tailwind)
- `docs/PLAN.md` what is being built, in what order, and why
- `db/schema.sql` the planned database tables (not yet applied anywhere)
- `AGENTS.md`, `CLAUDE.md` instructions for AI coding sessions working in this repo
