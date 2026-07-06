import type { LeaderboardEntry as EntryType } from '../lib/types';
import ScoreCounter from './ScoreCounter';

interface Props {
  entry: EntryType;
  rank: number;
  highlighted: boolean;
  maxScore: number;
  icon: string;
  iconType: 'spaceman' | 'spaceship';
}

export default function LeaderboardEntryRow({ entry, rank, highlighted, maxScore, icon, iconType }: Props) {
  const percent = maxScore > 0 ? Math.max(4, Math.round((entry.score / maxScore) * 100)) : 4;

  return (
    <li
      className={`row ${highlighted ? 'row--highlighted' : ''}`}
      aria-label={`Rank ${rank}: ${entry.name}, ${entry.score} points`}
    >
      <span className="row__rank row__rank--default">{rank}</span>
      <span className="row__name">{entry.name}</span>
      <div className="row__bar-track">
        <div
          className="row__bar-fill row__bar-fill--default"
          style={{ width: `${percent}%` }}
        >
          <img
            src={icon}
            alt=""
            className={`row__icon row__icon--${iconType}`}
            aria-hidden="true"
          />
        </div>
      </div>
      <ScoreCounter value={entry.score} className="row__score" />
    </li>
  );
}
