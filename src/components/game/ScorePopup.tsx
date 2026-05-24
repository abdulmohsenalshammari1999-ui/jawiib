interface ScorePopupProps {
  points: number;
  color?: string;
}

export function ScorePopup({ points, color }: ScorePopupProps) {
  const positive = points > 0;
  const c = color ?? (positive ? '#22C55E' : '#EF4444');
  const label = `${positive ? '+' : ''}${points}`;

  return (
    <div className="fixed inset-0 pointer-events-none z-[70] flex items-center justify-center">
      <div
        className="score-popup text-5xl font-black tabular-nums"
        style={{ color: c, textShadow: `0 0 30px ${c}80` }}
      >
        {label}
      </div>
    </div>
  );
}
