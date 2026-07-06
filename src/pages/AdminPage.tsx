import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLeaderboardData } from '../hooks/useLeaderboardData';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useAuth } from '../hooks/useAuth';
import type { Team, LeaderboardEntry } from '../lib/types';

export default function AdminPage() {
  const { accountManagers, salesTeams, loading } = useLeaderboardData();
  const { settings, loading: settingsLoading, updateSetting } = useSiteSettings();
  const { signOut } = useAuth();

  return (
    <div className="admin">
      <div className="admin__header">
        <h1 className="admin__title">
          Leaderboard Admin
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/" className="btn btn--secondary">View Leaderboard</Link>
          <button className="btn btn--logout" onClick={signOut}>Sign Out</button>
        </div>
      </div>

      {(loading || settingsLoading) ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      ) : (
        <>
          <SettingsSection settings={settings} updateSetting={updateSetting} />

          <div className="admin__teams">
            <TeamSection
              title={settings.panel_left_title}
              team="account_managers"
              entries={accountManagers}
            />
            <TeamSection
              title={settings.panel_right_title}
              team="sales_teams"
              entries={salesTeams}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================
   Settings Section
   ============================================ */

interface SettingsSectionProps {
  settings: { page_title: string; panel_left_title: string; panel_right_title: string };
  updateSetting: (key: 'page_title' | 'panel_left_title' | 'panel_right_title', value: string) => Promise<void>;
}

function SettingsSection({ settings, updateSetting }: SettingsSectionProps) {
  const [pageTitle, setPageTitle] = useState(settings.page_title);
  const [leftTitle, setLeftTitle] = useState(settings.panel_left_title);
  const [rightTitle, setRightTitle] = useState(settings.panel_right_title);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPageTitle(settings.page_title);
    setLeftTitle(settings.panel_left_title);
    setRightTitle(settings.panel_right_title);
  }, [settings]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    await Promise.all([
      updateSetting('page_title', pageTitle.trim()),
      updateSetting('panel_left_title', leftTitle.trim()),
      updateSetting('panel_right_title', rightTitle.trim()),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--bg-card)' }}>
      <h2 className="admin__section-title">Page settings</h2>
      <form className="admin-form" onSubmit={handleSave} style={{ flexWrap: 'wrap' }}>
        <div className="admin-form__field" style={{ flex: '1 1 200px' }}>
          <label htmlFor="setting-title">Page title</label>
          <input
            id="setting-title"
            type="text"
            value={pageTitle}
            onChange={e => setPageTitle(e.target.value)}
            required
          />
        </div>
        <div className="admin-form__field" style={{ flex: '1 1 150px' }}>
          <label htmlFor="setting-left">Left panel title</label>
          <input
            id="setting-left"
            type="text"
            value={leftTitle}
            onChange={e => setLeftTitle(e.target.value)}
            required
          />
        </div>
        <div className="admin-form__field" style={{ flex: '1 1 150px' }}>
          <label htmlFor="setting-right">Right panel title</label>
          <input
            id="setting-right"
            type="text"
            value={rightTitle}
            onChange={e => setRightTitle(e.target.value)}
            required
          />
        </div>
        <button className="btn btn--primary" type="submit">
          {saved ? 'Saved' : 'Save'}
        </button>
      </form>
    </div>
  );
}

/* ============================================
   Team Section
   ============================================ */

interface TeamSectionProps {
  title: string;
  team: Team;
  entries: LeaderboardEntry[];
}

function TeamSection({ title, team, entries }: TeamSectionProps) {
  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !score.trim()) return;

    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum)) {
      setError('Score must be a number');
      return;
    }

    if (editId) {
      const { error: err } = await supabase
        .from('leaderboard_entries')
        .update({ name: name.trim(), score: scoreNum })
        .eq('id', editId);
      if (err) { setError(err.message); return; }
    } else {
      const { error: err } = await supabase
        .from('leaderboard_entries')
        .insert({ name: name.trim(), score: scoreNum, team });
      if (err) { setError(err.message); return; }
    }

    setName('');
    setScore('');
    setEditId(null);
  }

  function startEdit(entry: LeaderboardEntry) {
    setEditId(entry.id);
    setName(entry.name);
    setScore(String(entry.score));
  }

  function cancelEdit() {
    setEditId(null);
    setName('');
    setScore('');
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this entry?')) return;
    await supabase.from('leaderboard_entries').delete().eq('id', id);
  }

  return (
    <div>
      <h2 className="admin__section-title">{title}</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form__field" style={{ flex: 1 }}>
          <label htmlFor={`name-${team}`}>Name</label>
          <input
            id={`name-${team}`}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter name"
            required
          />
        </div>
        <div className="admin-form__field" style={{ width: '100px' }}>
          <label htmlFor={`score-${team}`}>Score</label>
          <input
            id={`score-${team}`}
            type="number"
            value={score}
            onChange={e => setScore(e.target.value)}
            placeholder="0"
            required
          />
        </div>
        <button className="btn btn--primary" type="submit">
          {editId ? 'Update' : 'Add'}
        </button>
        {editId && (
          <button className="btn btn--secondary" type="button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>
      {error && <p style={{ color: 'var(--accent-coral)', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                No entries yet
              </td>
            </tr>
          ) : (
            entries.map((entry, i) => (
              <tr key={entry.id}>
                <td>{i + 1}</td>
                <td>{entry.name}</td>
                <td>{entry.score.toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn--secondary btn--small"
                    onClick={() => startEdit(entry)}
                    style={{ marginRight: '6px' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn--danger btn--small"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
