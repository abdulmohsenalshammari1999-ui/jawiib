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
  activeTeamId?: TeamId | null;
  teamScores?: Partial<Record<TeamId, number>>;
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
  activeTeamId,
  teamScores,
  mode,
  lastStandUsed = {},
  onActivateLastStand,
}: TeamScoreboardProps) {
  if (mode === 'teams' && teams) {
    const alphaPlayers = players.filter((p) => teams.alpha.playerIds.includes(p.id));
    const betaPlayers  = players.filter((p) => teams.beta.playerIds.includes(p.id));
    const alphaScore   = teamScores?.alpha ?? alphaPlayers.reduce((s, p) => s + p.score, 0);
    const betaScore    = teamScores?.beta  ?? betaPlayers.reduce((s, p) => s + p.score, 0);
    const alphaLeads   = alphaScore >= betaScore;
    const gap          = Math.abs(alphaScore - betaScore);
    const isCloseGame  = gap <= 200 && (alphaScore > 0 || betaScore > 0);

    const alphaCanLastStand = !alphaLeads && gap >= 400 && !lastStandUsed['alpha'] && !!onActivateLastStand;
    const betaCanLastStand  =  alphaLeads && gap >= 400 && !lastStandUsed['beta']  && !!onActivateLastStand;

    const activeTeam: TeamId | null = activeTeamId !== undefined
      ? activeTeamId
      : (() => {
          if (!activePlayerId) return null;
          if (teams.alpha.playerIds.includes(activePlayerId)) return 'alpha';
          if (teams.beta.playerIds.includes(activePlayerId)) return 'beta';
          return null;
        })();

    return (
      <div className="game-card p-4">
        {/* Gap / rivalry indicator */}
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
              alphaLeads ? 'text-jawwib-red bg-jawwib-red/10' : 'text-jawwib-oasis bg-jawwib-oasis/10'
            }`}>
              💪 {alphaLeads ? teams.beta.name : teams.alpha.name} يحارب للعودة!
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {/* Alpha team */}
          <div
            className={`rounded-xl p-3 border-2 transition-all duration-500 ${
              activeTeam === 'alpha'
                ? 'team-panel-active-alpha animate-team-pulse-blue'
                : alphaLeads
                ? 'border-jawwib-oasis/45 bg-jawwib-oasis/10'
                : 'border-jawwib-border bg-jawwib-surface'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">🌊</span>
              <span className="font-bold text-xs truncate text-jawwib-oasis">{teams.alpha.name}</span>
              {alphaLeads && gap > 0 && <span className="text-jawwib-gold text-xs mr-auto">👑</span>}
              {activeTeam === 'alpha' && (
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full mr-auto"
                  style={{ background: 'rgba(95,169,140,0.15)', color: '#5FA98C' }}
                >
                  دورهم
                </span>
              )}
            </div>
            <p className="score-display text-2xl font-black text-jawwib-oasis tabular-nums">{alphaScore}</p>
            <div className="flex flex-wrap gap-0.5 mt-1">
              {alphaPlayers.map((p) => (
                <span
                  key={p.id}
                  className={`text-[10px] px-1 py-0.5 rounded ${
                    p.id === activePlayerId
                      ? 'bg-jawwib-oasis/20 text-jawwib-oasis font-bold'
                      : 'bg-jawwib-surface text-jawwib-text-dim'
                  }`}
                >
                  {p.avatar}
                </span>
              ))}
            </div>
          </div>

          {/* Beta team */}
          <div
            className={`rounded-xl p-3 border-2 transition-all duration-500 ${
              activeTeam === 'beta'
                ? 'team-panel-active-beta animate-team-pulse-red'
                : !alphaLeads
                ? 'border-jawwib-red/45 bg-jawwib-red/10'
                : 'border-jawwib-border bg-jawwib-surface'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">🐪</span>
              <span className="font-bold text-xs truncate text-jawwib-red">{teams.beta.name}</span>
              {!alphaLeads && gap > 0 && <span className="text-jawwib-gold text-xs mr-auto">👑</span>}
              {activeTeam === 'beta' && (
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full mr-auto"
                  style={{ background: 'rgba(200,90,52,0.15)', color: '#C85A34' }}
                >
                  دورهم
                </span>
              )}
            </div>
            <p className="score-display text-2xl font-black text-jawwib-red tabular-nums">{betaScore}</p>
            <div className="flex flex-wrap gap-0.5 mt-1">
              {betaPlayers.map((p) => (
                <span
                  key={p.id}
                  className={`text-[10px] px-1 py-0.5 rounded ${
                    p.id === activePlayerId
                      ? 'bg-jawwib-red/20 text-jawwib-red font-bold'
                      : 'bg-jawwib-surface text-jawwib-text-dim'
                  }`}
                >
                  {p.avatar}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Momentum bar */}
        {(alphaScore > 0 || betaScore > 0) && (
          <div className="mb-3">
            <div className="h-2 rounded-full bg-jawwib-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(alphaScore / Math.max(alphaScore + betaScore, 1)) * 100}%`,
                  background: 'linear-gradient(to left, #5FA98C, #7EC4A9)',
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-jawwib-text-dim mt-0.5">
              <span className="text-jawwib-oasis font-bold">{teams.alpha.name}</span>
              {gap > 0 && <span className="font-bold">فارق {gap}</span>}
              <span className="text-jawwib-red font-bold">{teams.beta.name}</span>
            </div>
          </div>
        )}

        {/* Last Stand buttons */}
        {alphaCanLastStand && (
          <button
            onClick={() => onActivateLastStand?.('alpha')}
            className="w-full mb-2 py-2.5 rounded-xl border-2 border-jawwib-oasis/40 bg-jawwib-oasis/8 text-jawwib-oasis text-xs font-black last-stand-btn tap-target"
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

        {/* Individual player list */}
        <div className="space-y-1">
          {[
            ...alphaPlayers.map((p) => ({ ...p, teamColor: '#5B9BE0', teamBg: 'bg-jawwib-oasis/12' })),
            ...betaPlayers.map((p)  => ({ ...p, teamColor: '#E08884', teamBg: 'bg-jawwib-red/12' })),
          ]
            .sort((a, b) => b.score - a.score)
            .map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                  player.id === activePlayerId
                    ? 'bg-jawwib-gold/12 border border-jawwib-gold/30'
                    : player.teamBg
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{player.avatar}</span>
                  <span className="font-bold text-xs">{player.name}</span>
                  {player.streak > 0 && streakIndicator(player.streak)}
                </div>
                <span className="score-display font-black text-sm tabular-nums" style={{ color: player.teamColor }}>
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
                <span className="score-display text-jawwib-gold font-black tabular-nums">{player.score}</span>
                {isLeading && <span className="text-xs">👑</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
