-- Tailwind Incentive 2026 on Spanish Island — database schema
-- Run this in the Supabase SQL editor of a fresh project.

-- ============================================================
-- leaderboard_entries
-- ============================================================
create table if not exists public.leaderboard_entries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  score      integer not null default 0,
  team       text not null check (team in ('account_managers', 'sales_teams')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on every update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leaderboard_updated_at on public.leaderboard_entries;
create trigger trg_leaderboard_updated_at
  before update on public.leaderboard_entries
  for each row execute function public.set_updated_at();

-- ============================================================
-- site_settings (key/value store for page + panel titles)
-- ============================================================
create table if not exists public.site_settings (
  key   text primary key,
  value text not null
);

insert into public.site_settings (key, value) values
  ('page_title',        'Tailwind Incentive 2026 on Spanish Island'),
  ('panel_left_title',  'Account Managers'),
  ('panel_right_title', 'Sales Teams')
on conflict (key) do nothing;

-- ============================================================
-- Row Level Security
--   public (anon) can read; only authenticated users can write
-- ============================================================
alter table public.leaderboard_entries enable row level security;
alter table public.site_settings       enable row level security;

-- leaderboard_entries policies
drop policy if exists "leaderboard read" on public.leaderboard_entries;
create policy "leaderboard read"
  on public.leaderboard_entries for select
  using (true);

drop policy if exists "leaderboard write" on public.leaderboard_entries;
create policy "leaderboard write"
  on public.leaderboard_entries for all
  to authenticated
  using (true) with check (true);

-- site_settings policies
drop policy if exists "settings read" on public.site_settings;
create policy "settings read"
  on public.site_settings for select
  using (true);

drop policy if exists "settings write" on public.site_settings;
create policy "settings write"
  on public.site_settings for all
  to authenticated
  using (true) with check (true);

-- ============================================================
-- Realtime — the app subscribes to postgres_changes on both tables
-- ============================================================
alter publication supabase_realtime add table public.leaderboard_entries;
alter publication supabase_realtime add table public.site_settings;
