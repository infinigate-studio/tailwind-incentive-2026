# Tailwind Incentive 2026 on Spanish Island

Real-time incentive leaderboard, built with React + TypeScript + Vite and backed by Supabase. Forked from the Spark Leaderboard app.

Live site: https://infinigate-studio.github.io/tailwind-incentive-2026/

## Local development

```bash
npm install
npm run dev
```

Without Supabase credentials the app runs on mock data. To use a live backend, copy your project credentials into `.env`:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Backend setup

This project uses its own Supabase database (separate from Spark Leaderboard). To stand it up:

1. Create a new project in the Supabase dashboard.
2. Open the SQL editor and run [`supabase-schema.sql`](./supabase-schema.sql) to create the tables, policies, and realtime config.
3. Create an admin user under **Authentication → Users** (email + password) for the `/admin` login.
4. Put the project URL and anon key in `.env` locally, and add them as the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` GitHub Actions secrets for deploys.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and publishes it to GitHub Pages. The Vite `base` is set to `/tailwind-incentive-2026/` in `vite.config.ts`.
