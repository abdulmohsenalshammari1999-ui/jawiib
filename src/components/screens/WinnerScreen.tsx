import { useEffect, useRef, useState } from 'react';

interface WinnerPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

interface WinnerScreenProps {
  players: Array<WinnerPlayer>;
  teams?: {
    alpha: { name: string; score: number; playerIds: string[] };
    beta: { name: string; score: number; playerIds: string[] };
  } | null;
  hostMessage: string;
  localPlayerId: string;
  isHost?: boolean;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

// ─── CSS-only confetti particles ─────────────────────────────────────────────
// Each particle is a tiny div with random hue-rotated neon color, positioned
// absolutely and animated with a pure CSS keyframe drop + fade.

function ConfettiParticles() {
  const particles = Array.from({ length: 40 }, (_, i) => i);
  const colors = [
    '#D4A017', '#F5D060', '#3B82F6', '#EF4444',
    '#8B5CF6', '#22C55E', '#EC4899', '#06B6D4',
  ];

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
        @keyframes neon-drift {
          0%   { transform: translateY(-10px) translateX(0px) scale(1); opacity: 0.9; }
          50%  { transform: translateY(50vh) translateX(20px) scale(1.2); opacity: 0.7; }
          100% { transform: translateY(110vh) translateX(-10px) scale(0.6); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          top: 0;
          border-radius: 2px;
          animation: confetti-fall linear infinite;
        }
        .neon-orb {
          position: absolute;
          top: 0;
          border-radius: 50%;
          filter: blur(2px);
          animation: neon-drift ease-in infinite;
        }
      `}</style>

      {particles.map((i) => {
        const color = colors[i % colors.length];
        const left = `${(i * 2.5 + Math.sin(i) * 5 + 50) % 100}%`;
        const delay = `${(i * 0.3) % 5}s`;
        const duration = `${3 + (i % 4)}s`;
        const size = i % 3 === 0 ? 8 : 5;
        const isOrb = i % 5 === 0;

        return isOrb ? (
          <div
            key={i}
            className="neon-orb"
            style={{
              left,
              width: `${size + 4}px`,
              height: `${size + 4}px`,
              background: color,
              animationDelay: delay,
              animationDuration: duration,
              opacity: 0.7,
            }}
          />
        ) : (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left,
              width: `${size}px`,
              height: `${size * 2}px`,
              background: color,
              animationDelay: delay,
              animationDuration: duration,
              transform: `rotate(${i * 17}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Animated score counter ───────────────────────────────────────────────────

function AnimatedScore({
  target,
  duration = 1200,
  delay = 0,
}: {
  target: number;
  duration?: number;
  delay?: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (now: number) => {
        if (!startRef.current) startRef.current = now;
        const elapsed = now - startRef.current;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(Math.round(eased * target));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return <span>{displayed}</span>;
}

// ─── Rematch countdown ────────────────────────────────────────────────────────

function RematchCountdown({
  isHost,
  onAutoAccept,
}: {
  isHost: boolean;
  onAutoAccept: () => void;
}) {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (!isHost) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          onAutoAccept();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isHost, onAutoAccept]);

  if (!isHost) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-jawwib-text-dim text-sm">
      <span>هل تريد إعادة؟</span>
      <span className="w-7 h-7 rounded-full bg-jawwib-gold/20 border border-jawwib-gold/40 text-jawwib-gold font-black text-sm flex items-center justify-center animate-pulse">
        {seconds}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WinnerScreen({
  players,
  teams,
  hostMessage,
  localPlayerId,
  isHost = false,
  onPlayAgain,
  onNewGame,
}: WinnerScreenProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isTeamsMode = teams != null;

  // ── Teams mode ──────────────────────────────────────────────────────────────
  if (isTeamsMode && teams) {
    const winnerTeamId =
      teams.alpha.score >= teams.beta.score ? 'alpha' : 'beta';
    const winnerTeam = teams[winnerTeamId];
    const loserTeam = teams[winnerTeamId === 'alpha' ? 'beta' : 'alpha'];
    const isWinnerAlpha = winnerTeamId === 'alpha';

    // MVP = highest individual score on winning team
    const winnerPlayers = players.filter((p) =>
      winnerTeam.playerIds.includes(p.id)
    );
    const mvp = winnerPlayers.sort((a, b) => b.score - a.score)[0] ?? null;
    const isLocal = mvp?.id === localPlayerId;

    const teamGlow = isWinnerAlpha
      ? 'shadow-[0_0_60px_rgba(59,130,246,0.35)]'
      : 'shadow-[0_0_60px_rgba(239,68,68,0.35)]';
    const teamBorder = isWinnerAlpha
      ? 'border-blue-500/60'
      : 'border-red-500/60';
    const teamBg = isWinnerAlpha ? 'bg-blue-500/8' : 'bg-red-500/8';
    const teamText = isWinnerAlpha ? 'text-blue-400' : 'text-red-400';
    const loserText = isWinnerAlpha ? 'text-red-400' : 'text-blue-400';

    return (
      <div
        className="animate-fade-in relative min-h-screen flex flex-col items-center justify-start p-4 pt-8 gap-5 overflow-hidden"
        dir="rtl"
      >
        <ConfettiParticles />

        <div className="relative z-10 w-full max-w-lg flex flex-col gap-5">

          {/* Winning team banner */}
          <div
            className={`animate-bounce-in game-card ${teamBorder} ${teamBg} ${teamGlow} p-6 text-center border-2`}
          >
            <p className="text-jawwib-text-dim text-xs mb-1 font-bold tracking-wider uppercase">
              الفريق الفائز
            </p>
            <div className="text-5xl mb-2">{isWinnerAlpha ? '🛡️' : '⚔️'}</div>
            <h2 className={`text-3xl font-black mb-3 ${teamText}`}>
              {isWinnerAlpha ? 'الفريق الأزرق' : 'الفريق الأحمر'}
            </h2>

            {/* Score vs score */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <p className={`text-4xl font-black ${teamText}`}>
                  <AnimatedScore target={winnerTeam.score} delay={300} />
                </p>
                <p className="text-[10px] text-jawwib-text-dim">الفائز</p>
              </div>
              <span className="text-jawwib-text-dim text-2xl font-black">vs</span>
              <div className="text-center opacity-60">
                <p className={`text-4xl font-black ${loserText}`}>
                  <AnimatedScore target={loserTeam.score} delay={500} />
                </p>
                <p className="text-[10px] text-jawwib-text-dim">الخاسر</p>
              </div>
            </div>

            {/* MVP */}
            {mvp && (
              <div className="mt-3 pt-3 border-t border-jawwib-border/40">
                <p className="text-[10px] text-jawwib-gold font-bold mb-2 tracking-wider">
                  ⭐ أفضل لاعب
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{mvp.avatar}</span>
                  <div className="text-right">
                    <p className="font-black text-jawwib-text">
                      {mvp.name}
                      {isLocal && (
                        <span className="mr-1 text-[10px] bg-jawwib-gold/20 text-jawwib-gold px-1.5 py-0.5 rounded-full font-bold">
                          أنت!
                        </span>
                      )}
                    </p>
                    <p className="text-jawwib-gold text-sm font-bold">
                      <AnimatedScore target={mvp.score} delay={700} /> نقطة
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Host message */}
          <div className="animate-slide-up game-card p-4 flex items-start gap-3" style={{ animationDelay: '200ms' }}>
            <span className="text-2xl shrink-0">🎙️</span>
            <p className="text-sm leading-relaxed text-jawwib-text">{hostMessage}</p>
          </div>

          {/* All players */}
          <div className="animate-slide-up game-card p-4" style={{ animationDelay: '300ms' }}>
            <h3 className="text-jawwib-gold font-bold mb-3 text-sm">ترتيب اللاعبين</h3>
            <div className="space-y-2">
              {[...players].sort((a, b) => b.score - a.score).map((player, idx) => {
                const onWinnerTeam = winnerTeam.playerIds.includes(player.id);
                return (
                  <div
                    key={player.id}
                    className="animate-slide-up flex items-center justify-between p-2.5 rounded-xl bg-jawwib-surface"
                    style={{ animationDelay: `${300 + idx * 60}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-jawwib-text-dim w-6 text-center">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                      </span>
                      <span className="text-xl">{player.avatar}</span>
                      <div>
                        <p className="text-xs font-bold text-jawwib-text">
                          {player.name}
                          {player.id === localPlayerId && (
                            <span className="mr-1 text-[9px] bg-jawwib-gold/20 text-jawwib-gold px-1 py-0.5 rounded-full">
                              أنت
                            </span>
                          )}
                        </p>
                        <p
                          className={`text-[10px] font-bold ${onWinnerTeam ? teamText : loserText}`}
                        >
                          {onWinnerTeam
                            ? isWinnerAlpha ? '🛡️ الأزرق' : '⚔️ الأحمر'
                            : isWinnerAlpha ? '⚔️ الأحمر' : '🛡️ الأزرق'}
                        </p>
                      </div>
                    </div>
                    <span className="text-jawwib-gold font-black text-sm">
                      <AnimatedScore target={player.score} delay={400 + idx * 80} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rematch / New game buttons */}
          <div className="animate-slide-up flex flex-col gap-3 pb-6" style={{ animationDelay: '400ms' }}>
            <RematchCountdown isHost={isHost} onAutoAccept={onPlayAgain} />
            <button onClick={onPlayAgain} className="btn-gold w-full text-base py-3.5">
              إعادة مع نفس اللاعبين 🔄
            </button>
            <button
              onClick={onNewGame}
              className="w-full py-3 rounded-xl font-bold text-sm border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
            >
              لعبة جديدة 🏠
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FFA mode ─────────────────────────────────────────────────────────────────
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isLocalWinner = winner?.id === localPlayerId;

  return (
    <div
      className="animate-fade-in relative min-h-screen flex flex-col items-center justify-start p-4 pt-8 gap-5 overflow-hidden"
      dir="rtl"
    >
      <ConfettiParticles />

      <div className="relative z-10 w-full max-w-lg flex flex-col gap-5">

        {/* Trophy + winner */}
        <div className="text-center animate-bounce-in">
          <div className="text-7xl mb-3">🏆</div>
          <h1 className="text-3xl font-black text-gold-gradient mb-1">
            {isLocalWinner ? 'فزت! 🎉' : 'انتهت اللعبة!'}
          </h1>
        </div>

        {winner && (
          <div
            className="animate-bounce-in game-card p-6 text-center border-jawwib-gold/50 animate-pulse-gold"
            style={{ animationDelay: '100ms' }}
          >
            <p className="text-jawwib-text-dim text-xs mb-2 font-bold tracking-wider">الفائز</p>
            <div className="text-5xl mb-3">{winner.avatar}</div>
            <h2 className="text-2xl font-black text-jawwib-gold mb-1">
              {winner.name}
              {isLocalWinner && (
                <span className="mr-2 text-sm bg-jawwib-gold/20 px-2 py-1 rounded-full font-bold">
                  أنت!
                </span>
              )}
            </h2>
            <p className="text-4xl font-black text-jawwib-gold-light">
              <AnimatedScore target={winner.score} delay={200} />
              <span className="text-base font-bold text-jawwib-text-dim mr-2">نقطة</span>
            </p>
          </div>
        )}

        {/* Host message */}
        <div
          className="animate-slide-up game-card p-4 flex items-start gap-3"
          style={{ animationDelay: '200ms' }}
        >
          <span className="text-2xl shrink-0">🎙️</span>
          <p className="text-sm leading-relaxed text-jawwib-text">{hostMessage}</p>
        </div>

        {/* Full leaderboard */}
        <div
          className="animate-slide-up game-card p-4"
          style={{ animationDelay: '300ms' }}
        >
          <h3 className="text-jawwib-gold font-bold mb-3 text-sm">الترتيب النهائي</h3>
          <div className="space-y-2">
            {sorted.map((player, idx) => {
              const medal =
                idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
              const isLocal = player.id === localPlayerId;

              return (
                <div
                  key={player.id}
                  className={`animate-slide-up flex items-center justify-between p-3 rounded-xl transition-all ${
                    isLocal
                      ? 'bg-jawwib-gold/8 border border-jawwib-gold/25'
                      : 'bg-jawwib-surface'
                  }`}
                  style={{ animationDelay: `${300 + idx * 70}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-jawwib-text-dim w-6 text-center">
                      {medal}
                    </span>
                    <span className="text-xl">{player.avatar}</span>
                    <div>
                      <p className="font-bold text-sm text-jawwib-text">
                        {player.name}
                        {isLocal && (
                          <span className="mr-1 text-[9px] bg-jawwib-gold/20 text-jawwib-gold px-1 py-0.5 rounded-full">
                            أنت
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-jawwib-gold font-black text-lg">
                    <AnimatedScore target={player.score} delay={400 + idx * 80} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rematch prompt + buttons */}
        <div
          className="animate-slide-up flex flex-col gap-3 pb-6"
          style={{ animationDelay: '500ms' }}
        >
          <RematchCountdown isHost={isHost} onAutoAccept={onPlayAgain} />
          <button onClick={onPlayAgain} className="btn-gold w-full text-base py-3.5">
            إعادة مع نفس اللاعبين 🔄
          </button>
          <button
            onClick={onNewGame}
            className="w-full py-3 rounded-xl font-bold text-sm border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
          >
            لعبة جديدة 🏠
          </button>
        </div>
      </div>
    </div>
  );
}
