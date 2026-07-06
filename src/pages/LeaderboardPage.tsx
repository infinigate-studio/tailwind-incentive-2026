import Header from '../components/Header';
import LeaderboardPanel from '../components/LeaderboardPanel';
import { useLeaderboardData } from '../hooks/useLeaderboardData';
import { useSiteSettings } from '../hooks/useSiteSettings';
import spacemanBlue from '../img/spaceman_blue.svg';
import spacemanCoral from '../img/spaceman_coral.svg';
import spacemanTeal from '../img/spaceman_teal.svg';
import spacemanCyan from '../img/spaceman_cyan.svg';
import spaceshipBlue from '../img/spaceship_ blue.svg';
import spaceshipCoral from '../img/spaceship_coral.svg';
import spaceshipTeal from '../img/spaceship_teal.svg';
import spaceshipCyan from '../img/spaceship_cyan.svg';

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
            1: spacemanCoral,
            2: spacemanTeal,
            3: spacemanCyan,
            default: spacemanBlue,
          }}
          iconType="spaceman"
        />
        <LeaderboardPanel
          title={settings.panel_right_title}
          entries={salesTeams}
          changedIds={changedIds}
          icons={{
            1: spaceshipCoral,
            2: spaceshipTeal,
            3: spaceshipCyan,
            default: spaceshipBlue,
          }}
          iconType="spaceship"
        />
      </div>
    </div>
  );
}
