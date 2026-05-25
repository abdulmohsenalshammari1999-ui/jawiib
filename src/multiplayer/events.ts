import type {
  CategoryId,
  Player,
  SabotageType,
  GameBoardCell,
  Question,
  TeamId,
  Team,
  RoomSnapshot,
  StatePatch,
} from '@/lib/types';

// ─── Outbound (client → server) ──────────────────────────────────────────────

export type ClientEvent =
  | { type: 'CREATE_ROOM';     payload: { hostName: string; isTrial: boolean; categories: CategoryId[]; mode: 'ffa' | 'teams' } }
  | { type: 'JOIN_ROOM';       payload: { code: string; playerName: string } }
  | { type: 'REJOIN_ROOM';     payload: { roomId: string; playerId: string; sessionToken: string } }
  | { type: 'LEAVE_ROOM';      payload: { roomId: string; playerId: string } }
  | { type: 'ASSIGN_TEAM';     payload: { roomId: string; playerId: string; teamId: TeamId } }
  | { type: 'START_GAME';      payload: { roomId: string } }
  | { type: 'SELECT_QUESTION'; payload: { roomId: string; questionId: string; playerId: string } }
  | { type: 'SUBMIT_ANSWER';   payload: { roomId: string; playerId: string; answerIndex: number; timeRemaining: number } }
  | { type: 'USE_SABOTAGE';    payload: { roomId: string; playerId: string; type: SabotageType; targetId: string } }
  | { type: 'REQUEST_SYNC';    payload: { roomId: string; lastVersion: number } }
  | { type: 'PING';            payload: { ts: number } };

// ─── Inbound (server → client) ───────────────────────────────────────────────

export type ServerEvent =
  | { type: 'ROOM_CREATED';       payload: { roomId: string; code: string; player: Player; teams: Record<TeamId, Team> } }
  | { type: 'PLAYER_JOINED';      payload: { player: Player; teamId: TeamId; teams: Record<TeamId, Team> } }
  | { type: 'PLAYER_LEFT';        payload: { playerId: string; teams: Record<TeamId, Team> } }
  | { type: 'TEAM_ASSIGNED';      payload: { playerId: string; teamId: TeamId; teams: Record<TeamId, Team> } }
  | { type: 'GAME_STARTED';       payload: { board: GameBoardCell[][]; activePlayerId: string } }
  | { type: 'QUESTION_SELECTED';  payload: { question: Question; activePlayerId: string; timerRemaining: number; timerServerTs: number } }
  | { type: 'TIMER_SYNC';         payload: { remaining: number; serverTs: number } }
  | { type: 'TIMER_EXPIRED';      payload: { questionId: string } }
  | {
      type: 'ANSWER_RESULT';
      payload: {
        playerId: string;
        teamId: TeamId | null;
        correct: boolean;
        points: number;
        timeBonus: number;
        streakMultiplier: number;
        updatedPlayers: Player[];
        updatedTeams: Record<TeamId, Team>;
        boardCell: { questionId: string; answered: true; answeredBy: string };
      };
    }
  | { type: 'SABOTAGE_APPLIED';   payload: { type: SabotageType; fromId: string; targetId: string; updatedPlayers: Player[]; updatedTeams: Record<TeamId, Team> } }
  | { type: 'SCORE_UPDATE';       payload: { players: Player[]; teams: Record<TeamId, Team> } }
  | { type: 'GAME_OVER';          payload: { players: Player[]; teams: Record<TeamId, Team>; hostMessage: string } }
  | { type: 'HOST_MESSAGE';       payload: { message: string } }
  | { type: 'ROOM_SNAPSHOT';      payload: { snapshot: RoomSnapshot } }
  | { type: 'STATE_PATCH';        payload: { patch: StatePatch } }
  | { type: 'PLAYER_RECONNECTED'; payload: { playerId: string; snapshot: RoomSnapshot } }
  | { type: 'PONG';               payload: { ts: number; serverTs: number } }
  | { type: 'ERROR';              payload: { code: string; message: string } };

// ─── Internal event bus ───────────────────────────────────────────────────────

export type InternalEvent =
  | { type: 'CONNECTION_OPEN';  payload: { roomId: string } }
  | { type: 'CONNECTION_CLOSE'; payload: { code: number; reason: string } }
  | { type: 'CONNECTION_ERROR'; payload: { error: string } };

export type AnyEvent = ClientEvent | ServerEvent | InternalEvent;
