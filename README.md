# Tailwind Incentive 2026 on Spanish Island

Real-time incentive leaderboard, built with React + TypeScript + Vite and backed by Supabase. Forked from the Spark Leaderboard app.

Live site: https://infinigate-studio.github.io/tailwind-incentive-2026/

## Local development

```bash
npm install
npm run dev
```

Without Supabase credentials the app runs on mock data. The live backend is the
**shared Spark Leaderboard Supabase project** — the same URL and anon key, already
set in `.env`.

## Backend setup

This app shares the Spark Leaderboard Supabase **project** but uses its own
prefixed tables (`tailwind_leaderboard_entries`, `tailwind_site_settings`) so the
two apps' data never mix. Access matches Spark: any signed-in user can administer
the board, so every existing Spark admin can also log into the Tailwind `/admin`,
and any user added later automatically gets access to both. To stand it up:

1. In the Spark project's SQL editor, run [`supabase-schema.sql`](./supabase-schema.sql) once. It only adds objects and is safe for the live Spark app.
2. Make sure email sign-ups are **disabled** (Authentication → Providers → Email) so only dashboard-created accounts can log in.

Admins are the same accounts already in the project — no per-user setup needed.

The app reuses the Spark project's `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
(the anon key is a public client key). These are set both in `.env` locally and as
GitHub Actions secrets for deploys.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and publishes it to GitHub Pages. The Vite `base` is set to `/tailwind-incentive-2026/` in `vite.config.ts`.
