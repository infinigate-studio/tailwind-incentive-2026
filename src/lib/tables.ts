// This app shares the Spark Leaderboard Supabase project but keeps its own
// prefixed tables so the two apps' data never mix. Row-level security
// (see supabase-schema.sql) restricts writes to enrolled Tailwind admins.
export const LEADERBOARD_TABLE = 'tailwind_leaderboard_entries';
export const SETTINGS_TABLE = 'tailwind_site_settings';
