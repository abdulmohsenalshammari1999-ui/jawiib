interface TimerBarProps {
  time: number;
  maxTime: number;
  compact?: boolean;
}

export function TimerBar({ time, maxTime, compact = false }: TimerBarProps) {
  const pct    = Math.max(0, (time / maxTime) * 100);
  const isLow  = time <= 5;
  const isMed  = time <= 9 && time > 5;

  const barColor = isLow
    ? 'from-jawwib-red to-red-400'
    : isMed
    ? 'from-yellow-500 to-yellow-400'
    : 'from-jawwib-gold to-jawwib-gold-light';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-jawwib-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-l ${barColor} transition-all duration-1000 ease-linear`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`text-sm font-bold tabular-nums w-5 text-left ${
            isLow
              ? 'text-jawwib-red animate-tick-pulse'
              : isMed
              ? 'text-yellow-600'
              : 'text-jawwib-gold'
          }`}
        >
          {time}
        </span>
      </div>
    );
  }

  const strokeColor = isLow ? '#B91C1C' : isMed ? '#CA8A04' : '#C8880A';
  const circumference = 2 * Math.PI * 34;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" className="-rotate-90">
          {/* Track */}
          <circle cx="40" cy="40" r="34" fill="none" stroke="#E5CFA0" strokeWidth="5" />
          {/* Progress */}
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-2xl font-black ${
            isLow
              ? 'text-jawwib-red animate-tick-pulse'
              : isMed
              ? 'text-yellow-600 animate-shake'
              : 'text-jawwib-gold'
          }`}
        >
          {time}
        </span>
      </div>
    </div>
  );
}
