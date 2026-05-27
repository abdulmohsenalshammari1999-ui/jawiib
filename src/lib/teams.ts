import type { Team, TeamId } from './types';

export const TEAM_DEFS: Record<TeamId, Omit<Team, 'playerIds' | 'score'>> = {
  alpha: { id: 'alpha', name: 'فريق البحر', color: '#1A5FA8', accent: 'blue', emoji: '🌊' },
  beta:  { id: 'beta',  name: 'فريق البر',  color: '#B82118', accent: 'red',  emoji: '🐪' },
};

export function createTeams(): Record<TeamId, Team> {
  return {
    alpha: { ...TEAM_DEFS.alpha, playerIds: [], score: 0 },
    beta:  { ...TEAM_DEFS.beta,  playerIds: [], score: 0 },
  };
}

export function autoAssignTeam(teams: Record<TeamId, Team>): TeamId {
  return teams.alpha.playerIds.length <= teams.beta.playerIds.length ? 'alpha' : 'beta';
}

export function applyTeamAssignment(
  teams: Record<TeamId, Team>,
  playerId: string,
  teamId: TeamId,
): Record<TeamId, Team> {
  const stripped = {
    alpha: { ...teams.alpha, playerIds: teams.alpha.playerIds.filter((id) => id !== playerId) },
    beta:  { ...teams.beta,  playerIds: teams.beta.playerIds.filter((id)  => id !== playerId) },
  };
  return {
    ...stripped,
    [teamId]: { ...stripped[teamId], playerIds: [...stripped[teamId].playerIds, playerId] },
  };
}

export function removeFromTeams(
  teams: Record<TeamId, Team>,
  playerId: string,
): Record<TeamId, Team> {
  return {
    alpha: { ...teams.alpha, playerIds: teams.alpha.playerIds.filter((id) => id !== playerId) },
    beta:  { ...teams.beta,  playerIds: teams.beta.playerIds.filter((id)  => id !== playerId) },
  };
}

export function getPlayerTeam(teams: Record<TeamId, Team>, playerId: string): TeamId | null {
  if (teams.alpha.playerIds.includes(playerId)) return 'alpha';
  if (teams.beta.playerIds.includes(playerId))  return 'beta';
  return null;
}

export function addTeamScore(
  teams: Record<TeamId, Team>,
  teamId: TeamId,
  points: number,
): Record<TeamId, Team> {
  return { ...teams, [teamId]: { ...teams[teamId], score: teams[teamId].score + points } };
}

export function getWinningTeam(teams: Record<TeamId, Team>): TeamId | 'tie' {
  if (teams.alpha.score > teams.beta.score) return 'alpha';
  if (teams.beta.score > teams.alpha.score)  return 'beta';
  return 'tie';
}

export function getTeamPlayers<P extends { id: string }>(
  teams: Record<TeamId, Team>,
  players: P[],
  teamId: TeamId,
): P[] {
  const ids = new Set(teams[teamId].playerIds);
  return players.filter((p) => ids.has(p.id));
}
