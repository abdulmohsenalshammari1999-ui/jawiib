import type { Player, TeamId } from '@/lib/types';

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
  lastStandUsed?: Partial<Record<TeamId, boolean>>;
  onActivateLastStand?: (teamId: TeamId) => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

function streakIndicator(streak: number) {
  if (streak <= 0) return null;
  if (streak >= 5) return <span className="text-[11px] streak-fire">👑×{streak}</span>;
  if (streak >= 4) return <span className="text-[11px] streak-fire">🔥🔥🔥🔥</span>;
  if (streak >= 3) return <span className="text-[11px] text-jawwib-gold">🔥🔥🔥</span>;
  if (streak >= 2) return <span className="text-[11px] text-jawwib-gold/70">🔥🔥</span>;
  return <span className="text-[11px] opacity-60">🔥</span>;
}

export function TeamScoreboard({
  players,
  teams,
  activePlayerId,
  mode,
  lastStandUsed = {},
  onActivateLastStand,
}: TeamScoreboardProps) {
  if (mode === 'teams' && teams) {
    const alphaPlayers = players.filter((p) => teams.alpha.playerIds.includes(p.id));
    const betaPlayers  = players.filter((p) => teams.beta.playerIds.includes(p.id));
    const alphaScore   = alphaPlayers.reduce((s, p) => s + p.score, 0);
    const betaScore    = betaPlayers.reduce((s, p) => s + p.score, 0);
    const alphaLeads   = alphaScore >= betaScore;
    const gap          = Math.abs(alphaScore - betaScore);
    const isCloseGame  = gap <= 200 && (alphaScore > 0 || betaScore > 0);

    // Last Stand eligibility: losing team trailing by 400+, one-time only
    const alphaCanLastStand = !alphaLeads && gap >= 400 && !lastStandUsed['alpha'] && !!onActivateLastStand;
    const betaCanLastStand  =  alphaLeads && gap >= 400 && !lastStandUsed['beta']  && !!onActivateLastStand;

    const activeTeam = (() => {
      if (!activePlayerId) return null;
      if (teams.alpha.playerIds.includes(activePlayerId)) return 'alpha';
      if (teams.beta.playerIds.includes(activePlayerId)) return 'beta';
      return null;
    })();

    return (
      <div className="game-card p-4">
        {/* Gap indicator */}
        {isCloseGame && (
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold text-jawwib-gold bg-jawwib-gold/10 px-2 py-0.5 rounded-full animate-rivalry-flash">
              ⚡ تعادل قريب!
            </span>
          </div>
        )}
        {gap >= 400 && !isCloseGame && (
          <div className="text-center mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              alphaLeads
                ? 'text-jawwib-red bg-jawwib-red/10'
                : 'text-jawwib-blue bg-jawwib-blue/10'
            }`}>
              💪 {alphaLeads ? teams.beta.name : teams.alpha.name} يحارب للعودة!
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Alpha team */}
          <div
            className={`rounded-xl p-3 border-2 transition-all ${
              activeTeam === 'alpha'
                ? 'border-jawwib-blue animate-team-pulse-blue'
                : alphaLeads
                ? 'border-blue-300/60 bg-blue-50/60'
                : 'border-jawwib-border bg-jawwib-surface'
            }`}
          >
            <div className="flex items-center gap-1 mb-1">
              <span className="text-base">🌊</span>
              <span className="text-jawwib-blue font-bold text-xs truncate">{teams.alpha.name}</span>
              {alphaLeads && gap > 0 && <span className="text-jawwib-gold text-xs mr-auto">👑</span>}
            </div>
            <p className="text-2xl font-black text-jawwib-blue tabular-nums">{alphaScore}</p>
            {activeTeam === 'alpha' && (
              <p className="text-[10px] text-jawwib-blue mt-0.5 opacity-70">دورهم الآن</p>
            )}
          </div>

          {/* Beta team */}
          <div
            className={`rounded-xl p-3 border-2 transition-all ${
              activeTeam === 'beta'
                ? 'border-jawwib-red animate-team-pulse-red'
                : !alphaLeads
                ? 'border-red-300/60 bg-red-50/60'
                : 'border-jawwib-border bg-jawwib-surface'
            }`}
          >
            <div className="flex items-center gap-1 mb-1">
              <span className="text-base">🐪</span>
              <span className="text-jawwib-red font-bold text-xs truncate">{teams.beta.name}</span>
              {!alphaLeads && gap > 0 && <span className="text-jawwib-gold text-xs mr-auto">👑</span>}
            </div>
            <p className="text-2xl font-black text-jawwib-red tabular-nums">{betaScore}</p>
            {activeTeam === 'beta' && (
              <p className="text-[10px] text-jawwib-red mt-0.5 opacity-70">دورهم الآن</p>
            )}
          </div>
        </div>

        {/* Gap bar */}
        {(alphaScore > 0 || betaScore > 0) && (
          <div className="mb-3">
            <div className="h-1.5 rounded-full bg-jawwib-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(alphaScore / Math.max(alphaScore + betaScore, 1)) * 100}%`,
                  background: 'linear-gradient(to left, #1D4ED8, #3B82F6)',
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-jawwib-text-dim mt-0.5">
              <span>{teams.alpha.name}</span>
              {gap > 0 && <span>فارق {gap}</span>}
              <span>{teams.beta.name}</span>
            </div>
          </div>
        )}

        {/* Last Stand buttons */}
        {alphaCanLastStand && (
          <button
            onClick={() => onActivateLastStand?.('alpha')}
            className="w-full mb-2 py-2.5 rounded-xl border-2 border-jawwib-blue/40 bg-jawwib-blue/8 text-jawwib-blue text-xs font-black last-stand-btn tap-target"
          >
            🌊 صمود أخير — ضاعف نقاط السؤال ×3
          </button>
        )}
        {betaCanLastStand && (
          <button
            onClick={() => onActivateLastStand?.('beta')}
            className="w-full mb-2 py-2.5 rounded-xl border-2 border-jawwib-red/40 bg-jawwib-red/8 text-jawwib-red text-xs font-black last-stand-btn tap-target"
          >
            🐪 صمود أخير — ضاعف نقاط السؤال ×3
          </button>
        )}

        {/* Individual players */}
        <div className="space-y-1">
          {[
            ...alphaPlayers.map((p) => ({ ...p, teamColor: '#1D4ED8', teamBg: 'bg-blue-50' })),
            ...betaPlayers.map((p)  => ({ ...p, teamColor: '#B91C1C', teamBg: 'bg-red-50' })),
          ]
            .sort((a, b) => b.score - a.score)
            .map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-all ${
                  player.id === activePlayerId
                    ? 'bg-jawwib-gold/12 border border-jawwib-gold/30'
                    : player.teamBg
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{player.avatar}</span>
                  <span className="font-bold text-xs">{player.name}</span>
                  {player.streak > 0 && streakIndicator(player.streak)}
                </div>
                <span className="font-black text-sm tabular-nums" style={{ color: player.teamColor }}>
                  {player.score}
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // FFA scoreboard
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const topScore = sorted[0]?.score ?? 0;

  return (
    <div className="game-card p-4">
      <h3 className="text-jawwib-gold font-bold text-sm mb-3">🏆 الترتيب</h3>
      <div className="space-y-1.5">
        {sorted.map((player, idx) => {
          const gap = topScore - player.score;
          const isLeading = idx === 0 && topScore > 0;
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                player.id === activePlayerId
                  ? 'bg-jawwib-gold/10 border border-jawwib-gold/30'
                  : 'bg-jawwib-surface'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm w-5">{MEDALS[idx] ?? `${idx + 1}`}</span>
                <span className="text-base">{player.avatar}</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm">{player.name}</span>
                  {player.streak > 0 && streakIndicator(player.streak)}
                  {!isLeading && gap > 0 && gap <= 300 && (
                    <span className="text-[10px] text-jawwib-text-dim"> −{gap}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-jawwib-gold font-black tabular-nums">{player.score}</span>
                {isLeading && <span className="text-xs">👑</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
