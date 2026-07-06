import { useAnimatedScore } from '../hooks/useAnimatedScore';

interface ScoreCounterProps {
  value: number;
  className?: string;
}

export default function ScoreCounter({ value, className = '' }: ScoreCounterProps) {
  const display = useAnimatedScore(value);

  return (
    <span className={className} aria-live="polite">
      {display.toLocaleString()}
    </span>
  );
}
