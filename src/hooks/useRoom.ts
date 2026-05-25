import { useGameStore } from '@/store/gameStore';
import { useRoomStore } from '@/store/roomStore';
import { getPlayerTeam, getTeamPlayers, getWinningTeam } from '@/lib/teams';
import type { Player } from '@/lib/types';

export function useRoom() {
  const game          = useGameStore((s) => s.game);
  const localPlayerId = useGameStore((s) => s.localPlayerId);
  const mode          = useRoomStore((s) => s.mode);
  const teams         = useRoomStore((s) => s.teams);
  const answerPhase   = useRoomStore((s) => s.answerPhase);
  const pendingAnswer = useRoomStore((s) => s.pendingAnswer);
  const timerRemaining = useRoomStore((s) => s.timerRemaining);
  const timerServerTs  = useRoomStore((s) => s.timerServerTs);
  const isReconnecting = useRoomStore((s) => s.isReconnecting);
  const connectionRtt  = useRoomStore((s) => s.connectionRtt);

  const localTeamId = localPlayerId ? getPlayerTeam(teams, localPlayerId) : null;
  const localTeam   = localTeamId ? teams[localTeamId] : null;

  const isTeamMode  = mode === 'teams';
  const isLocalHost = game ? game.room.hostId === localPlayerId : false;

  const alphaPlayers: Player[] = game ? getTeamPlayers(teams, game.room.players, 'alpha') : [];
  const betaPlayers:  Player[] = game ? getTeamPlayers(teams, game.room.players, 'beta')  : [];

  const winningTeam = isTeamMode ? getWinningTeam(teams) : null;

  return {
    game,
    localPlayerId,
    localTeamId,
    localTeam,
    mode,
    teams,
    isTeamMode,
    isLocalHost,
    alphaPlayers,
    betaPlayers,
    winningTeam,
    answerPhase,
    pendingAnswer,
    timerRemaining,
    timerServerTs,
    isReconnecting,
    connectionRtt,
  };
}
