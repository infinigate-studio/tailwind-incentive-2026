-- Tailwind Incentive 2026 on Spanish Island — database schema
-- ============================================================
-- This app SHARES the Spark Leaderboard Supabase project but uses its own
-- prefixed tables (tailwind_*) so the two apps' data never mix. Writes are
-- restricted by row-level security to admins enrolled for the 'tailwind' app.
--
-- Run SECTIONS 1–3 in the Spark project's SQL editor. They only ADD objects
-- and are safe for the live Spark app. SECTION 4 (optional) tightens the
-- EXISTING Spark tables and MUST be run carefully — read its warning first.
-- ============================================================


-- ============================================================
-- SECTION 1 — Admin role registry (shared by both apps)
--   Maps a Supabase Auth user to the app(s) they may administer.
--   Manage membership from the dashboard SQL editor or Table editor.
-- ============================================================
create table if not exists public.admin_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  app     text not null check (app in ('spark', 'tailwind')),
  primary key (user_id, app)
);

alter table public.admin_roles enable row level security;

-- Users may read their own role rows; membership is managed out-of-band
-- (dashboard / service role), so no insert/update/delete policy is granted.
drop policy if exists "admin_roles self read" on public.admin_roles;
create policy "admin_roles self read"
  on public.admin_roles for select
  to authenticated
  using (user_id = auth.uid());

-- Helper: is the current user an admin for the given app?
-- SECURITY DEFINER so it can read admin_roles regardless of the caller's RLS.
create or replace function public.is_admin(app_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_roles r
    where r.user_id = auth.uid() and r.app = app_name
  );
$$;

-- Shared trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================================
-- SECTION 2 — Tailwind tables
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
-- SECTION 3 — RLS for the Tailwind tables
--   public (anon) can read; only 'tailwind' admins can write.
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
  using (public.is_admin('tailwind'))
  with check (public.is_admin('tailwind'));

drop policy if exists "tw settings read" on public.tailwind_site_settings;
create policy "tw settings read"
  on public.tailwind_site_settings for select
  using (true);

drop policy if exists "tw settings write" on public.tailwind_site_settings;
create policy "tw settings write"
  on public.tailwind_site_settings for all
  to authenticated
  using (public.is_admin('tailwind'))
  with check (public.is_admin('tailwind'));

-- Realtime — the app subscribes to postgres_changes on both tables
alter publication supabase_realtime add table public.tailwind_leaderboard_entries;
alter publication supabase_realtime add table public.tailwind_site_settings;


-- ============================================================
-- Enroll your Tailwind admins (repeat per admin)
--   Create the account first under Authentication → Users, then:
-- ============================================================
-- insert into public.admin_roles (user_id, app)
-- select id, 'tailwind' from auth.users where email = 'tailwind-admin@example.com'
-- on conflict do nothing;


-- ============================================================
-- SECTION 4 (OPTIONAL) — Lock the EXISTING Spark tables to 'spark' admins
--
--   ⚠️  DANGER: run this ONLY after enrolling every current Spark admin,
--   or they will be locked out of the live Spark app. Order matters:
--
--   1) Enroll all Spark admins:
--        insert into public.admin_roles (user_id, app)
--        select id, 'spark' from auth.users
--        where email in ('spark-admin-1@example.com', 'spark-admin-2@example.com')
--        on conflict do nothing;
--
--   2) Verify they are present:
--        select u.email from public.admin_roles r
--        join auth.users u on u.id = r.user_id where r.app = 'spark';
--
--   3) THEN replace the permissive Spark write policies below.
--      (Adjust the policy names if your Spark project used different ones.)
-- ============================================================
-- drop policy if exists "leaderboard write" on public.leaderboard_entries;
-- create policy "leaderboard write"
--   on public.leaderboard_entries for all
--   to authenticated
--   using (public.is_admin('spark'))
--   with check (public.is_admin('spark'));
--
-- drop policy if exists "settings write" on public.site_settings;
-- create policy "settings write"
--   on public.site_settings for all
--   to authenticated
--   using (public.is_admin('spark'))
--   with check (public.is_admin('spark'));
