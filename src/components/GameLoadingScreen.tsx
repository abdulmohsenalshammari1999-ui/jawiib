import { useState, useEffect } from 'react';
import { audio } from '@/lib/audio';
import { categories as ALL_CATS } from '@/lib/categories';
import type { CategoryId } from '@/lib/types';

interface TeamInfo {
  name: string;
  color: string;
  emoji: string;
}

interface GameLoadingScreenProps {
  onDone: () => void;
  alphaTeam?: TeamInfo | null;
  betaTeam?: TeamInfo | null;
  selectedCategories: CategoryId[];
  hostMessage: string;
  mode: 'ffa' | 'teams';
}

const STEPS = ['٣', '٢', '١', 'ابدأ! 🚀'] as const;
const STEP_COLORS = ['#1A5FA8', '#B07D1A', '#B82118', ''];

export function GameLoadingScreen({
  onDone,
  alphaTeam,
  betaTeam,
  selectedCategories,
  hostMessage,
  mode,
}: GameLoadingScreenProps) {
  const [step, setStep]     = useState(0);
  const [phase, setPhase]   = useState<'reveal' | 'countdown'>('reveal');

  useEffect(() => {
    audio.playCountdown();

    const reveal = setTimeout(() => {
      setPhase('countdown');
      const interval = setInterval(() => {
        setStep((s) => {
          const next = s + 1;
          if (next < STEPS.length - 1) audio.playCountdown();
          if (next === STEPS.length - 1) audio.playCountdownGo();
          if (next >= STEPS.length) {
            clearInterval(interval);
            onDone();
          }
          return next;
        });
      }, 900);
      return () => clearInterval(interval);
    }, 1800);

    return () => clearTimeout(reveal);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const catItems = selectedCategories
    .map((id) => ALL_CATS.find((c) => c.id === id))
    .filter(Boolean) as typeof ALL_CATS;

  const label     = STEPS[Math.min(step, STEPS.length - 1)];
  const isFinal   = step >= STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-diwaniya flex flex-col items-center justify-center z-50 p-4 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 sadu-accent" />
      <div className="dune-silhouette" />

      {/* Reveal phase: show match summary */}
      {phase === 'reveal' && (
        <div className="w-full max-w-sm animate-slide-up space-y-4">

          {mode === 'teams' && alphaTeam && betaTeam ? (
            <>
              <p className="text-center text-jawwib-text-dim text-xs font-bold tracking-widest uppercase">
                المباراة
              </p>

              {/* Teams matchup */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <div
                  className="game-card p-4 text-center border-2"
                  style={{ borderColor: `${alphaTeam.color}50` }}
                >
                  <p className="text-3xl mb-1">{alphaTeam.emoji}</p>
                  <p className="font-black text-sm" style={{ color: alphaTeam.color }}>
                    {alphaTeam.name}
                  </p>
                </div>
                <div className="font-black text-xl text-jawwib-gold text-center">VS</div>
                <div
                  className="game-card p-4 text-center border-2"
                  style={{ borderColor: `${betaTeam.color}50` }}
                >
                  <p className="text-3xl mb-1">{betaTeam.emoji}</p>
                  <p className="font-black text-sm" style={{ color: betaTeam.color }}>
                    {betaTeam.name}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center font-black text-2xl text-gold-gradient animate-bounce-in">
              🎮 جاهز للعب!
            </p>
          )}

          {/* Categories */}
          {catItems.length > 0 && (
            <div className="game-card p-3">
              <p className="text-jawwib-text-dim text-[10px] text-center mb-2 font-bold">
                الفئات — {catItems.length} فئة
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {catItems.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 bg-jawwib-surface rounded-lg px-2 py-1 border border-jawwib-border text-[11px] font-bold"
                  >
                    {cat.icon} {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Host message */}
          <div className="flex items-center gap-2 bg-jawwib-surface rounded-xl px-3 py-2.5 border border-jawwib-border">
            <span className="text-lg shrink-0">🎙️</span>
            <p className="text-xs text-jawwib-text leading-relaxed">{hostMessage}</p>
          </div>
        </div>
      )}

      {/* Countdown phase */}
      {phase === 'countdown' && (
        <div className="text-center">
          <p
            key={step}
            className={`font-black leading-none animate-countdown-pop ${
              isFinal ? 'text-7xl text-gold-gradient' : 'text-9xl'
            }`}
            style={!isFinal ? { color: STEP_COLORS[step] } : undefined}
          >
            {label}
          </p>

          {mode === 'teams' && alphaTeam && betaTeam && (
            <p className="text-jawwib-text-dim text-sm mt-5 animate-fade-in font-bold">
              <span style={{ color: alphaTeam.color }}>{alphaTeam.emoji} {alphaTeam.name}</span>
              <span className="text-jawwib-gold mx-2">VS</span>
              <span style={{ color: betaTeam.color }}>{betaTeam.name} {betaTeam.emoji}</span>
            </p>
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 sadu-accent" />
    </div>
  );
}
