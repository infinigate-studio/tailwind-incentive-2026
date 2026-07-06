import { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockEntries } from '../lib/mockData';
import type { LeaderboardEntry, Team } from '../lib/types';

function sortByScore(entries: LeaderboardEntry[]) {
  return [...entries].sort((a, b) => b.score - a.score);
}

function filterByTeam(entries: LeaderboardEntry[], team: Team) {
  return sortByScore(entries.filter(e => e.team === team));
}

export function useLeaderboardData() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Use mock data when Supabase is not configured
      setEntries(mockEntries);
      setLoading(false);
      return;
    }

    // Initial fetch
    supabase
      .from('leaderboard_entries')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) {
          setEntries(data as LeaderboardEntry[]);
        } else {
          // Fallback to mock data on error
          setEntries(mockEntries);
        }
        setLoading(false);
      });

    // Real-time subscription
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEntry = payload.new as LeaderboardEntry;
            setEntries(prev => [...prev, newEntry]);
            markChanged(newEntry.id);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as LeaderboardEntry;
            setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
            markChanged(updated.id);
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as { id: string };
            setEntries(prev => prev.filter(e => e.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  function markChanged(id: string) {
    setChangedIds(prev => new Set(prev).add(id));
    // Clear existing timeout for this id
    const existing = timeoutsRef.current.get(id);
    if (existing) clearTimeout(existing);
    // Remove highlight after 2s
    const timeout = window.setTimeout(() => {
      setChangedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timeoutsRef.current.delete(id);
    }, 2000);
    timeoutsRef.current.set(id, timeout);
  }

  return {
    accountManagers: filterByTeam(entries, 'account_managers'),
    salesTeams: filterByTeam(entries, 'sales_teams'),
    loading,
    changedIds,
  };
}
