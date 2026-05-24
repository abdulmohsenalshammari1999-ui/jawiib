import type { Player } from '@/lib/types';

interface TeamData {
  id: 'alpha' | 'beta';
  name: string;
  score: number;
  playerIds: string[];
}

interface TeamScoreboardProps {
  players: Player[];
  teams: { alpha: TeamData; beta: TeamData } | null;
  activePlayerId: string | null;
  mode: 'ffa' | 'teams';
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function TeamScoreboard({ players, teams, activePlayerId, mode }: TeamScoreboardProps) {
  if (mode === 'teams' && teams) {
    const alphaPlayers = players.filter((p) => teams.alpha.playerIds.includes(p.id));
    const betaPlayers = players.filter((p) => teams.beta.playerIds.includes(p.id));
    const alphaLeads = teams.alpha.score >= teams.beta.score;

    return (
      <div className="game-card p-4">
        <h3 className="text-jawwib-gold font-bold text-sm mb-3">🏆 النتائج</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Alpha team */}
          <div
            className={`rounded-xl p-3 border transition-all ${
              alphaLeads ? 'border-blue-500/50 bg-blue-500/10' : 'border-jawwib-border bg-jawwib-surface'
            }`}
          >
            <div className="flex items-center gap-1 mb-2">
              <span className="text-blue-400 text-lg">🛡️</span>
              <span className="text-blue-400 font-bold text-xs">{teams.alpha.name}</span>
              {alphaLeads && <span className="text-xs text-jawwib-gold">👑</span>}
            </div>
            <p className="text-2xl font-black text-blue-400">{teams.alpha.score}</p>
          </div>
          {/* Beta team */}
          <div
            className={`rounded-xl p-3 border transition-all ${
              !alphaLeads ? 'border-red-500/50 bg-red-500/10' : 'border-jawwib-border bg-jawwib-surface'
            }`}
          >
            <div className="flex items-center gap-1 mb-2">
              <span className="text-red-400 text-lg">⚔️</span>
              <span className="text-red-400 font-bold text-xs">{teams.beta.name}</span>
              {!alphaLeads && <span className="text-xs text-jawwib-gold">👑</span>}
            </div>
            <p className="text-2xl font-black text-red-400">{teams.beta.score}</p>
          </div>
        </div>

        {/* Individual players */}
        <div className="space-y-1">
          {[
            ...alphaPlayers.map((p) => ({ ...p, teamColor: 'text-blue-400', teamBg: 'bg-blue-500/10' })),
            ...betaPlayers.map((p) => ({ ...p, teamColor: 'text-red-400', teamBg: 'bg-red-500/10' })),
          ]
            .sort((a, b) => b.score - a.score)
            .map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                  player.id === activePlayerId
                    ? 'bg-jawwib-gold/10 border border-jawwib-gold/30'
                    : `${player.teamBg}`
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{player.avatar}</span>
                  <span className="font-bold text-xs">{player.name}</span>
                  {player.streak >= 3 && (
                    <span className="text-xs text-jawwib-gold">🔥{player.streak}</span>
                  )}
                </div>
                <span className={`font-bold text-sm ${player.teamColor}`}>{player.score}</span>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // FFA scoreboard
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <div className="game-card p-4">
      <h3 className="text-jawwib-gold font-bold text-sm mb-3">🏆 النتائج</h3>
      <div className="space-y-2">
        {sorted.map((player, idx) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              player.id === activePlayerId
                ? 'bg-jawwib-gold/10 border border-jawwib-gold/30'
                : 'bg-jawwib-surface'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm w-5">{MEDALS[idx] ?? `${idx + 1}`}</span>
              <span className="text-lg">{player.avatar}</span>
              <div>
                <span className="font-bold text-sm">{player.name}</span>
                {player.streak >= 3 && (
                  <span className="mr-1 text-xs text-jawwib-gold"> 🔥×{player.streak}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-jawwib-gold font-bold">{player.score}</span>
              <span className="text-jawwib-text-dim text-xs mr-1"> نقطة</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
