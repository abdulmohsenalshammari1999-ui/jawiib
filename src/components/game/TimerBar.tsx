interface TimerBarProps {
  time: number;
  maxTime: number;
  compact?: boolean;
  teamColor?: string;
}

export function TimerBar({ time, maxTime, compact = false, teamColor }: TimerBarProps) {
  const pct   = Math.max(0, (time / maxTime) * 100);
  const isLow = time <= 5;
  const isMed = time <= 9 && time > 5;

  // Team color overrides the default gold when a team is active
  const activeColor = isLow
    ? '#C85A34'
    : isMed
    ? '#D0A24A'
    : (teamColor ?? '#E9A23C');

  const barClass = isLow
    ? 'from-jawwib-red to-red-400'
    : isMed
    ? 'from-yellow-500 to-yellow-400'
    : '';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-jawwib-border rounded-full overflow-hidden min-w-[60px]">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${barClass}`}
            style={{
              width: `${pct}%`,
              background: barClass ? undefined : `linear-gradient(to left, ${activeColor}, ${activeColor}99)`,
            }}
          />
        </div>
        <span
          className={`timer-display text-sm font-black tabular-nums w-5 text-left ${
            isLow ? 'text-jawwib-red animate-tick-pulse' : isMed ? 'text-yellow-600' : ''
          }`}
          style={!isLow && !isMed && teamColor ? { color: teamColor } : undefined}
        >
          {time}
        </span>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 34;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" className="-rotate-90">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#E5CFA0" strokeWidth="5" />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke={activeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
          />
        </svg>
        <span
          className={`timer-display absolute inset-0 flex items-center justify-center font-black ${
            isLow ? 'text-jawwib-red animate-tick-pulse' : isMed ? 'text-yellow-600 animate-shake' : ''
          }`}
          style={!isLow && !isMed ? { color: activeColor } : undefined}
        >
          {time}
        </span>
      </div>
    </div>
  );
}
