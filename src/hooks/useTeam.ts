import { useGameStore } from '@/store/gameStore';
import { useRoomStore } from '@/store/roomStore';
import { getPlayerTeam, getTeamPlayers, getWinningTeam, TEAM_DEFS } from '@/lib/teams';
import type { Player, TeamId } from '@/lib/types';

/** Returns team context for a given player (defaults to local player) */
export function usePlayerTeam(playerId?: string) {
  const localPlayerId = useGameStore((s) => s.localPlayerId);
  const teams         = useRoomStore((s) => s.teams);
  const id            = playerId ?? localPlayerId;

  const teamId = id ? getPlayerTeam(teams, id) : null;
  const team   = teamId ? teams[teamId] : null;

  return {
    teamId,
    team,
    isAlpha:   teamId === 'alpha',
    isBeta:    teamId === 'beta',
    unassigned: teamId === null,
    def: teamId ? TEAM_DEFS[teamId] : null,
  };
}

/** Full team roster for a specific team */
export function useTeamRoster(teamId: TeamId): Player[] {
  const game  = useGameStore((s) => s.game);
  const teams = useRoomStore((s) => s.teams);
  if (!game) return [];
  return getTeamPlayers(teams, game.room.players, teamId);
}

/** Team vs team scoring summary */
export function useTeamScores() {
  const teams  = useRoomStore((s) => s.teams);
  const winner = getWinningTeam(teams);
  return {
    alpha: teams.alpha.score,
    beta:  teams.beta.score,
    winner,
    isTied: winner === 'tie',
    leading: winner !== 'tie' ? winner : null,
    delta: Math.abs(teams.alpha.score - teams.beta.score),
  };
}

/** All players grouped by team */
export function useTeamRosters(): { alpha: Player[]; beta: Player[]; unassigned: Player[] } {
  const game  = useGameStore((s) => s.game);
  const teams = useRoomStore((s) => s.teams);

  if (!game) return { alpha: [], beta: [], unassigned: [] };

  const alphaIds = new Set(teams.alpha.playerIds);
  const betaIds  = new Set(teams.beta.playerIds);

  return {
    alpha:      game.room.players.filter((p) => alphaIds.has(p.id)),
    beta:       game.room.players.filter((p) => betaIds.has(p.id)),
    unassigned: game.room.players.filter((p) => !alphaIds.has(p.id) && !betaIds.has(p.id)),
  };
}
