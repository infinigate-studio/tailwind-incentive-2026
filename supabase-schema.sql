-- Tailwind Incentive 2026 on Spanish Island — database schema
-- ============================================================
-- This app SHARES the Spark Leaderboard Supabase project but uses its own
-- prefixed tables (tailwind_*) so the two apps' data never mix.
--
-- Access model: same as Spark — any signed-in user can administer the board,
-- so all existing Spark admins can log into the Tailwind /admin too, and any
-- user you add later automatically gets access to both. (This relies on email
-- sign-ups being DISABLED in the project so only dashboard-created accounts
-- exist: Authentication → Providers → Email → "Allow new users to sign up" off.)
--
-- Run the whole file once in the Spark project's SQL editor. It only ADDS
-- objects and is safe for the live Spark app.
-- ============================================================


-- ============================================================
-- Shared trigger to keep updated_at fresh
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================================
-- Tailwind tables
-- ============================================================
create table if not exists public.tailwind_leaderboard_entries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  score      integer not null default 0,
  team       text not null check (team in ('account_managers', 'sales_teams')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_tailwind_leaderboard_updated_at on public.tailwind_leaderboard_entries;
create trigger trg_tailwind_leaderboard_updated_at
  before update on public.tailwind_leaderboard_entries
  for each row execute function public.set_updated_at();

create table if not exists public.tailwind_site_settings (
  key   text primary key,
  value text not null
);

insert into public.tailwind_site_settings (key, value) values
  ('page_title',        'Tailwind Incentive 2026 on Spanish Island'),
  ('panel_left_title',  'Account Managers'),
  ('panel_right_title', 'Sales Teams')
on conflict (key) do nothing;


-- ============================================================
-- Row Level Security
--   public (anon) can read; any signed-in user can write.
-- ============================================================
alter table public.tailwind_leaderboard_entries enable row level security;
alter table public.tailwind_site_settings       enable row level security;

drop policy if exists "tw leaderboard read" on public.tailwind_leaderboard_entries;
create policy "tw leaderboard read"
  on public.tailwind_leaderboard_entries for select
  using (true);

drop policy if exists "tw leaderboard write" on public.tailwind_leaderboard_entries;
create policy "tw leaderboard write"
  on public.tailwind_leaderboard_entries for all
  to authenticated
  using (true) with check (true);

drop policy if exists "tw settings read" on public.tailwind_site_settings;
create policy "tw settings read"
  on public.tailwind_site_settings for select
  using (true);

drop policy if exists "tw settings write" on public.tailwind_site_settings;
create policy "tw settings write"
  on public.tailwind_site_settings for all
  to authenticated
  using (true) with check (true);


-- ============================================================
-- Realtime — the app subscribes to postgres_changes on both tables
-- ============================================================
alter publication supabase_realtime add table public.tailwind_leaderboard_entries;
alter publication supabase_realtime add table public.tailwind_site_settings;
