export type Team = 'account_managers' | 'sales_teams';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  team: Team;
  created_at: string;
  updated_at: string;
}
