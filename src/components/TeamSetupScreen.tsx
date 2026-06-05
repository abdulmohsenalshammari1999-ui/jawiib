import { useState } from 'react';

interface TeamSetupScreenProps {
  alphaName: string;
  betaName: string;
  onConfirm: (alphaName: string, betaName: string, picksPerTeam: number) => void;
}

type GameLength = 3 | 4;

const LENGTH_OPTIONS: { value: GameLength; label: string; sub: string; emoji: string }[] = [
  { value: 3, label: 'سريع', sub: '3 فئات / فريق (~15 دقيقة)', emoji: '⚡' },
  { value: 4, label: 'عادي', sub: '4 فئات / فريق (~20 دقيقة)', emoji: '🎯' },
];

/* Simple sadu-pattern SVG badge for each team */
function TeamBadge({ color, side }: { color: 'blue' | 'red'; side: 'right' | 'left' }) {
  const c = color === 'blue' ? '#1A5FA8' : '#B82118';
  const stripes = color === 'blue'
    ? ['#1A5FA8', '#C9A87A', '#1A5FA8', '#B07D1A', '#1A5FA8']
    : ['#B82118', '#C9A87A', '#B82118', '#B07D1A', '#B82118'];
  void side;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill={`${c}15`} stroke={c} strokeWidth="2"/>
      {/* Sadu stripes */}
      {stripes.map((s, i) => (
        <rect key={i} x={8 + i * 6.5} y="14" width="5" height="20" rx="1" fill={s} opacity="0.85"/>
      ))}
      <circle cx="24" cy="24" r="7" fill="white" opacity="0.9"/>
      <circle cx="24" cy="24" r="4" fill={c}/>
    </svg>
  );
}

export function TeamSetupScreen({ alphaName, betaName, onConfirm }: TeamSetupScreenProps) {
  const [alpha,      setAlpha]      = useState(alphaName);
  const [beta,       setBeta]       = useState(betaName);
  const [gameLength, setGameLength] = useState<GameLength>(3);

  return (
    <div className="min-h-screen bg-diwaniya flex flex-col items-center justify-center p-5 gap-5 animate-fade-in">
      {/* Sadu accent stripe */}
      <div className="sadu-accent w-full max-w-sm" />

      <div className="text-center">
        <h1 className="text-3xl font-black text-gold-gradient mb-0.5">حدّد الفرق</h1>
        <p className="text-jawwib-text-dim text-sm">سمّ كل فريق واختر وقت اللعب</p>
      </div>

      <div className="w-full max-w-sm space-y-5">
        {/* Team naming — VS layout */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          {/* Alpha */}
          <div className="flex flex-col items-center gap-2">
            <TeamBadge color="blue" side="right" />
            <input
              type="text"
              value={alpha}
              onChange={(e) => setAlpha(e.target.value)}
              placeholder="الفريق الأزرق"
              maxLength={16}
              className="w-full text-center font-bold text-sm border-2 !border-jawwib-blue/50 !bg-blue-50/60 text-jawwib-blue focus:!border-jawwib-blue"
              dir="rtl"
            />
          </div>

          <div className="flex flex-col items-center gap-1 pt-8">
            <span className="text-xl font-black text-jawwib-gold">VS</span>
          </div>

          {/* Beta */}
          <div className="flex flex-col items-center gap-2">
            <TeamBadge color="red" side="left" />
            <input
              type="text"
              value={beta}
              onChange={(e) => setBeta(e.target.value)}
              placeholder="الفريق الأحمر"
              maxLength={16}
              className="w-full text-center font-bold text-sm border-2 !border-jawwib-red/50 !bg-red-50/60 text-jawwib-red focus:!border-jawwib-red"
              dir="rtl"
            />
          </div>
        </div>

        {/* Game length */}
        <div>
          <p className="text-xs text-jawwib-text-dim mb-2 text-center">مدة اللعبة</p>
          <div className="grid grid-cols-2 gap-2">
            {LENGTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGameLength(opt.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  gameLength === opt.value
                    ? 'border-jawwib-gold bg-jawwib-gold/10 shadow-sm'
                    : 'border-jawwib-border bg-jawwib-surface opacity-70'
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className={`font-black text-base ${gameLength === opt.value ? 'text-jawwib-gold' : 'text-jawwib-text'}`}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-jawwib-text-dim text-center leading-tight">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onConfirm(alpha || 'الفريق الأزرق', beta || 'الفريق الأحمر', gameLength)}
          className="btn-gold w-full text-lg py-4"
        >
          اختر الفئات ←
        </button>
      </div>

      <div className="sadu-accent w-full max-w-sm" />
    </div>
  );
}
