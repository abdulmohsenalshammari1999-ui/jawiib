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
  teams?: { alpha: TeamResult; beta: TeamResult } | null;
  mode?: 'ffa' | 'teams';
}

export function GameOverScreen({
  players,
  hostMessage,
  onPlayAgain,
  onNewGame,
  teams,
  mode = 'ffa',
}: GameOverScreenProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  const winnerTeam =
    mode === 'teams' && teams
      ? teams.alpha.score >= teams.beta.score
        ? teams.alpha
        : teams.beta
      : null;

  return (
    <div className="animate-fade-in min-h-screen flex items-center justify-center p-4">
      {/* Neon glow burst */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            winnerTeam?.color
              ? `radial-gradient(ellipse at center, ${winnerTeam.color}15 0%, transparent 70%)`
              : 'radial-gradient(ellipse at center, #D4A01720 0%, transparent 70%)',
        }}
      />

      <div className="max-w-lg w-full text-center relative z-10">
        <div className="text-7xl mb-3 animate-bounce-in">🏆</div>
        <h1 className="text-3xl font-black text-gold-gradient mb-6">انتهت اللعبة!</h1>

        {/* Team winner */}
        {winnerTeam && (
          <div
            className="game-card p-6 mb-5 animate-pulse-gold"
            style={{ borderColor: `${winnerTeam.color}60` }}
          >
            <p className="text-jawwib-text-dim text-sm mb-2">الفريق الفائز</p>
            <div className="text-5xl mb-2">{winnerTeam.emoji}</div>
            <h2 className="text-2xl font-black mb-1" style={{ color: winnerTeam.color }}>
              {winnerTeam.name}
            </h2>
            <p className="text-3xl font-black text-jawwib-gold-light">{winnerTeam.score} نقطة</p>
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
        )}

        {/* FFA winner */}
        {!winnerTeam && winner && (
          <div className="game-card p-6 mb-5 animate-pulse-gold">
            <p className="text-jawwib-text-dim text-sm mb-2">الفائز</p>
            <div className="text-4xl mb-2">{winner.avatar}</div>
            <h2 className="text-2xl font-black text-jawwib-gold mb-1">{winner.name}</h2>
            <p className="text-3xl font-black text-jawwib-gold-light">{winner.score} نقطة</p>
          </div>
        )}

        {/* Host roast */}
        <div className="flex items-start gap-3 bg-jawwib-surface rounded-xl p-4 mb-5 text-right">
          <span className="text-xl shrink-0">🎙️</span>
          <p className="text-sm leading-relaxed">{hostMessage}</p>
        </div>

        {/* Full leaderboard */}
        <div className="game-card p-4 mb-5">
          <h3 className="text-jawwib-gold font-bold text-sm mb-3 text-right">الترتيب النهائي</h3>
          <div className="space-y-2">
            {sorted.map((player, idx) => {
              const teamColor =
                mode === 'teams' && teams
                  ? teams.alpha.playerIds.includes(player.id)
                    ? '#3B82F6'
                    : '#EF4444'
                  : null;
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-jawwib-surface"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm w-6 text-jawwib-text-dim">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </span>
                    <span className="text-lg">{player.avatar}</span>
                    <span className="font-bold text-sm" style={teamColor ? { color: teamColor } : undefined}>
                      {player.name}
                    </span>
                  </div>
                  <span className="text-jawwib-gold font-bold">{player.score}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={onPlayAgain} className="btn-gold w-full text-lg py-4">
            العب مرة ثانية 🎮
          </button>
          {onNewGame && (
            <button
              onClick={onNewGame}
              className="w-full text-sm py-3 rounded-xl border border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
            >
              لعبة جديدة 🏠
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
