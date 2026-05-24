import type { CategoryId, Player, SabotageType, GameBoardCell, Question } from '@/lib/types';

// ─── Outbound (client → server) ──────────────────────────────────────────────

export type ClientEvent =
  | { type: 'CREATE_ROOM'; payload: { hostName: string; isTrial: boolean; categories: CategoryId[] } }
  | { type: 'JOIN_ROOM'; payload: { code: string; playerName: string } }
  | { type: 'LEAVE_ROOM'; payload: { roomId: string; playerId: string } }
  | { type: 'START_GAME'; payload: { roomId: string } }
  | { type: 'SELECT_QUESTION'; payload: { roomId: string; questionId: string; playerId: string } }
  | { type: 'SUBMIT_ANSWER'; payload: { roomId: string; playerId: string; answerIndex: number; timeRemaining: number } }
  | { type: 'USE_SABOTAGE'; payload: { roomId: string; playerId: string; type: SabotageType; targetId: string } }
  | { type: 'PING'; payload: { ts: number } };

// ─── Inbound (server → client) ───────────────────────────────────────────────

export type ServerEvent =
  | { type: 'ROOM_CREATED'; payload: { roomId: string; code: string; player: Player } }
  | { type: 'PLAYER_JOINED'; payload: { player: Player } }
  | { type: 'PLAYER_LEFT'; payload: { playerId: string } }
  | { type: 'GAME_STARTED'; payload: { board: GameBoardCell[][]; activePlayerId: string } }
  | { type: 'QUESTION_SELECTED'; payload: { question: Question; activePlayerId: string; timer: number } }
  | {
      type: 'ANSWER_RESULT';
      payload: {
        playerId: string;
        correct: boolean;
        points: number;
        timeBonus: number;
        streakMultiplier: number;
        updatedPlayers: Player[];
        boardCell: { questionId: string; answered: true; answeredBy: string };
      };
    }
  | { type: 'SABOTAGE_APPLIED'; payload: { type: SabotageType; fromId: string; targetId: string; updatedPlayers: Player[] } }
  | { type: 'GAME_OVER'; payload: { players: Player[]; hostMessage: string } }
  | { type: 'HOST_MESSAGE'; payload: { message: string } }
  | { type: 'TIMER_TICK'; payload: { remaining: number } }
  | { type: 'PONG'; payload: { ts: number; serverTs: number } }
  | { type: 'ERROR'; payload: { code: string; message: string } };

// ─── Internal event bus ───────────────────────────────────────────────────────

export type InternalEvent =
  | { type: 'CONNECTION_OPEN'; payload: { roomId: string } }
  | { type: 'CONNECTION_CLOSE'; payload: { code: number; reason: string } }
  | { type: 'CONNECTION_ERROR'; payload: { error: string } };

export type AnyEvent = ClientEvent | ServerEvent | InternalEvent;
