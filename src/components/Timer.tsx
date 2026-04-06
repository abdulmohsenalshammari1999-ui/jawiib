interface TimerProps {
  time: number;
  maxTime: number;
}

export function Timer({ time, maxTime }: TimerProps) {
  const percentage = (time / maxTime) * 100;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const isLow = time <= 5;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="88" height="88" className="transform -rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="#2A2A3E"
          strokeWidth="4"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={isLow ? '#EF4444' : '#D4A017'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className={`absolute text-2xl font-bold ${isLow ? 'text-jawwib-red animate-shake' : 'text-jawwib-gold'}`}>
        {time}
      </div>
    </div>
  );
}
