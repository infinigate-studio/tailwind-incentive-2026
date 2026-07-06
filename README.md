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
two apps' data never mix. Row-level security restricts writes to admins enrolled
for the `tailwind` app, so a Spark admin cannot edit Tailwind data (and, once
Section 4 is applied, vice versa). To stand it up:

1. In the Spark project's SQL editor, run Sections 1–3 of [`supabase-schema.sql`](./supabase-schema.sql). These only add objects and are safe for the live Spark app.
2. Create each Tailwind admin under **Authentication → Users** (email + password), then enroll them with the `admin_roles` insert shown in the script.
3. (Optional) To also block Tailwind admins from writing Spark's tables, follow the ordered warning in **Section 4** — enroll all current Spark admins first, then tighten the Spark policies.

The app reuses the Spark project's `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
(the anon key is a public client key). These are set both in `.env` locally and as
GitHub Actions secrets for deploys.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and publishes it to GitHub Pages. The Vite `base` is set to `/tailwind-incentive-2026/` in `vite.config.ts`.
