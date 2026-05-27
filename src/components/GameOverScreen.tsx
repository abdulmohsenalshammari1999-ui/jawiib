import { useEffect, useState } from 'react';
import type { Player } from '@/lib/types';

interface TeamResult {
  name: string;
  score: number;
  color: string;
  emoji: string;
  playerIds: string[];
}

interface GameOverScreenProps {
  players: Player[];
  hostMessage: string;
  onPlayAgain: () => void;
  onNewGame?: () => void;
  onRateMatch?: () => void;
  teams?: { alpha: TeamResult; beta: TeamResult } | null;
  mode?: 'ffa' | 'teams';
}

interface Confetto {
  id: number;
  left: number;
  color: string;
  duration: number;
  delay: number;
  size: number;
}

// Kuwait cultural palette: dark gold, light gold, pearl white, sea blue, palm green, sadu red, oud purple
const CONFETTI_COLORS = ['#B07D1A', '#D4A94A', '#F5F0E8', '#1A5FA8', '#1A7A42', '#B82118', '#C9A87A'];

function useConfetti(count = 28) {
  const [pieces] = useState<Confetto[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      duration: 2.5 + Math.random() * 2,
      delay: Math.random() * 1.5,
      size: 6 + Math.random() * 6,
    }))
  );
  return pieces;
}

export function GameOverScreen({
  players,
  hostMessage,
  onPlayAgain,
  onNewGame,
  onRateMatch,
  teams,
  mode = 'ffa',
}: GameOverScreenProps) {
  const confetti = useConfetti();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 200);
    return () => clearTimeout(t);
  }, []);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  const winnerTeam =
    mode === 'teams' && teams
      ? teams.alpha.score >= teams.beta.score
        ? teams.alpha
        : teams.beta
      : null;

  const loserTeam =
    mode === 'teams' && teams
      ? teams.alpha.score >= teams.beta.score
        ? teams.beta
        : teams.alpha
      : null;

  const gapScore =
    mode === 'teams' && teams
      ? Math.abs(teams.alpha.score - teams.beta.score)
      : 0;

  return (
    <div className="animate-fade-in min-h-screen flex items-center justify-center p-4">
      {/* Confetti */}
      {showConfetti &&
        confetti.map((c) => (
          <div
            key={c.id}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              width: `${c.size}px`,
              height: `${c.size * 0.6}px`,
              background: c.color,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}

      {/* Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: winnerTeam?.color
            ? `radial-gradient(ellipse at center, ${winnerTeam.color}18 0%, transparent 65%)`
            : 'radial-gradient(ellipse at center, #C8880A18 0%, transparent 65%)',
        }}
      />

      <div className="max-w-lg w-full text-center relative z-10">
        <div className="text-6xl mb-2 animate-bounce-in">🏆</div>
        <h1 className="text-3xl font-black text-gold-gradient mb-1">انتهت اللعبة!</h1>
        <div className="sea-wave-accent mx-auto mb-5" style={{ width: 120 }} />

        {/* Team winner */}
        {winnerTeam && loserTeam && (
          <>
            <div
              className="game-card p-6 mb-3 animate-score-reveal"
              style={{ borderColor: `${winnerTeam.color}50`, borderWidth: '2px' }}
            >
              <p className="text-jawwib-text-dim text-xs mb-2">الفريق الفائز 🎉</p>
              <div className="text-5xl mb-2">{winnerTeam.emoji}</div>
              <h2 className="text-2xl font-black mb-1" style={{ color: winnerTeam.color }}>
                {winnerTeam.name}
              </h2>
              <p className="text-3xl font-black text-jawwib-gold tabular-nums">{winnerTeam.score}</p>
              <p className="text-jawwib-text-dim text-xs mt-1">نقطة</p>
              {gapScore > 0 && (
                <p className="text-xs text-jawwib-text-dim mt-2">
                  تقدّم بـ {gapScore} نقطة على {loserTeam.name}
                </p>
              )}
              {/* MVP */}
              {(() => {
                const mvp = players
                  .filter((p) => winnerTeam.playerIds.includes(p.id))
                  .sort((a, b) => b.score - a.score)[0];
                return mvp ? (
                  <div className="mt-3 inline-flex items-center gap-2 bg-jawwib-gold/10 px-4 py-1.5 rounded-full">
                    <span>{mvp.avatar}</span>
                    <span className="text-sm font-bold text-jawwib-gold">{mvp.name}</span>
                    <span className="text-xs text-jawwib-text-dim">MVP ⭐</span>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Loser team quick result */}
            <div className="flex items-center gap-3 bg-jawwib-surface rounded-xl px-4 py-2.5 mb-4 border border-jawwib-border">
              <span className="text-base" style={{ color: loserTeam.color }}>{loserTeam.emoji}</span>
              <span className="font-bold text-sm" style={{ color: loserTeam.color }}>{loserTeam.name}</span>
              <span className="font-black tabular-nums mr-auto" style={{ color: loserTeam.color }}>
                {loserTeam.score}
              </span>
            </div>
          </>
        )}

        {/* FFA winner */}
        {!winnerTeam && winner && (
          <div className="game-card p-6 mb-5 animate-score-reveal border-2 border-jawwib-gold/40">
            <p className="text-jawwib-text-dim text-sm mb-2">الفائز 🥇</p>
            <div className="text-4xl mb-2">{winner.avatar}</div>
            <h2 className="text-2xl font-black text-jawwib-gold mb-1">{winner.name}</h2>
            <p className="text-3xl font-black text-jawwib-gold tabular-nums">{winner.score} نقطة</p>
          </div>
        )}

        {/* Host message */}
        <div className="flex items-start gap-3 bg-jawwib-surface rounded-xl p-4 mb-4 text-right border border-jawwib-border">
          <span className="text-xl shrink-0">🎙️</span>
          <p className="text-sm leading-relaxed">{hostMessage}</p>
        </div>

        {/* Full leaderboard */}
        <div className="game-card p-4 mb-5">
          <h3 className="text-jawwib-gold font-bold text-sm mb-3 text-right">الترتيب النهائي</h3>
          <div className="space-y-1.5">
            {sorted.map((player, idx) => {
              const tColor =
                mode === 'teams' && teams
                  ? teams.alpha.playerIds.includes(player.id)
                    ? '#1D4ED8'
                    : '#B91C1C'
                  : null;
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-jawwib-surface"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm w-6 text-jawwib-text-dim">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </span>
                    <span className="text-lg">{player.avatar}</span>
                    <span className="font-bold text-sm" style={tColor ? { color: tColor } : undefined}>
                      {player.name}
                    </span>
                  </div>
                  <span className="text-jawwib-gold font-black tabular-nums">{player.score}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cultural footer motif */}
        <div className="cultural-strip mb-3">
          🌴 🐪 ☕ 🌊 🌴
        </div>

        <div className="flex flex-col gap-2.5">
          <button onClick={onPlayAgain} className="btn-gold w-full text-lg py-4">
            🔄 العب مرة ثانية
          </button>
          {onRateMatch && (
            <button
              onClick={onRateMatch}
              className="w-full text-sm py-3 rounded-xl border-2 border-jawwib-gold/40 text-jawwib-gold hover:bg-jawwib-gold/10 transition-all"
            >
              ⭐ قيّم المباراة
            </button>
          )}
          {onNewGame && (
            <button
              onClick={onNewGame}
              className="w-full text-sm py-3 rounded-xl border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
            >
              🏠 لعبة جديدة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
