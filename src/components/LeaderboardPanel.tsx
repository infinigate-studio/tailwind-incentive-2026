import type { LeaderboardEntry } from '../lib/types';
import PodiumEntry from './PodiumEntry';
import LeaderboardEntryRow from './LeaderboardEntry';

export interface IconMap {
  1?: string;
  2?: string;
  3?: string;
  default: string;
}

interface Props {
  title: string;
  entries: LeaderboardEntry[];
  changedIds: Set<string>;
  icons: IconMap;
  iconType: 'spaceman' | 'spaceship';
}

export default function LeaderboardPanel({ title, entries, changedIds, icons, iconType }: Props) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);
  const maxScore = entries.length > 0 ? entries[0].score : 1;

  function getIcon(rank: number) {
    return (icons as unknown as Record<number, string>)[rank] ?? icons.default;
  }

  return (
    <div className="panel">
      <h2 className="panel__title">{title}</h2>
      <ol className="panel__list" aria-label={`${title} leaderboard`}>
        {top3.map((entry, i) => (
          <PodiumEntry
            key={entry.id}
            entry={entry}
            rank={i + 1}
            highlighted={changedIds.has(entry.id)}
            maxScore={maxScore}
            icon={getIcon(i + 1)}
            iconType={iconType}
          />
        ))}
        {rest.map((entry, i) => (
          <LeaderboardEntryRow
            key={entry.id}
            entry={entry}
            rank={i + 4}
            highlighted={changedIds.has(entry.id)}
            maxScore={maxScore}
            icon={icons.default}
            iconType={iconType}
          />
        ))}
      </ol>
    </div>
  );
}
