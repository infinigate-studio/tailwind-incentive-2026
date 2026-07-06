import Header from '../components/Header';
import LeaderboardPanel from '../components/LeaderboardPanel';
import { useLeaderboardData } from '../hooks/useLeaderboardData';
import { useSiteSettings } from '../hooks/useSiteSettings';
import sailboat from '../img/sailboat.svg';
import seahorse from '../img/seahorse.svg';
import seahorseCoral from '../img/seahorse-coral.svg';
import seahorseTeal from '../img/seahorse-teal.svg';
import octopus from '../img/octopus.svg';
import turtle from '../img/turtle.svg';

export default function LeaderboardPage() {
  const { accountManagers, salesTeams, loading, changedIds } = useLeaderboardData();
  const { settings, loading: settingsLoading } = useSiteSettings();

  if (loading || settingsLoading) {
    return (
      <div className="tv-view" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-secondary)' }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="tv-view">
      <Header title={settings.page_title} />
      <div className="leaderboards">
        <LeaderboardPanel
          title={settings.panel_left_title}
          entries={accountManagers}
          changedIds={changedIds}
          icons={{
            1: sailboat,
            2: sailboat,
            3: sailboat,
            default: sailboat,
          }}
          iconType="spaceman"
        />
        <LeaderboardPanel
          title={settings.panel_right_title}
          entries={salesTeams}
          changedIds={changedIds}
          icons={{
            1: seahorse,
            2: seahorseCoral,
            3: seahorseTeal,
            4: octopus,
            default: turtle,
          }}
          iconType="spaceship"
        />
      </div>
    </div>
  );
}
