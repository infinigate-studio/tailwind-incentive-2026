import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SETTINGS_TABLE } from '../lib/tables';

export interface SiteSettings {
  page_title: string;
  panel_left_title: string;
  panel_right_title: string;
}

const defaults: SiteSettings = {
  page_title: 'Tailwind Incentive 2026 on Spanish Island',
  panel_left_title: 'Account Managers',
  panel_right_title: 'Sales Teams',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase
      .from(SETTINGS_TABLE)
      .select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const map: Record<string, string> = {};
          data.forEach((row: { key: string; value: string }) => {
            map[row.key] = row.value;
          });
          setSettings({
            page_title: map.page_title ?? defaults.page_title,
            panel_left_title: map.panel_left_title ?? defaults.panel_left_title,
            panel_right_title: map.panel_right_title ?? defaults.panel_right_title,
          });
        }
        setLoading(false);
      });

    // Real-time updates
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: SETTINGS_TABLE },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const row = payload.new as { key: string; value: string };
            setSettings(prev => ({ ...prev, [row.key]: row.value }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateSetting(key: keyof SiteSettings, value: string) {
    if (!isSupabaseConfigured) return;
    await supabase
      .from(SETTINGS_TABLE)
      .upsert({ key, value }, { onConflict: 'key' });
  }

  return { settings, loading, updateSetting };
}
