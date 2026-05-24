export type CategoryId =
  | 'culture'
  | 'sport'
  | 'history'
  | 'quran'
  | 'gulf'
  | 'science'
  | 'geo'
  | 'food'
  | 'drama'
  | 'music'
  | 'jokes'
  | 'business'
  | 'social'
  | 'ramadan'
  | 'travel'
  | 'family';

export interface Question {
  id: string;
  category: CategoryId;
  tier: 1 | 2 | 3;
  points: 100 | 200 | 300;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  isHost: boolean;
}

export interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  categories: CategoryId[];
  currentQuestion: number;
  answeredQuestions: string[];
  isTrial: boolean;
  createdAt: number;
}

export interface GameBoardCell {
  questionId: string;
  category: CategoryId;
  tier: 1 | 2 | 3;
  points: 100 | 200 | 300;
  answered: boolean;
  answeredBy?: string;
}

export type SabotageType = 'steal' | 'block' | 'halve';

export interface Sabotage {
  type: SabotageType;
  name: string;
  description: string;
  icon: string;
}

export interface GameState {
  room: GameRoom;
  board: GameBoardCell[][];
  currentQuestion: Question | null;
  activePlayer: string | null;
  timer: number;
  phase: 'lobby' | 'board' | 'question' | 'result' | 'sabotage' | 'finished';
  hostMessage: string;
  sabotages: Record<string, SabotageType[]>;
  selectedSabotage: SabotageType | null;
  sabotageTarget: string | null;
  lastAnswer: {
    playerId: string;
    correct: boolean;
    points: number;
    timeBonus: number;
    streakMultiplier: number;
  } | null;
}

// ─── Multiplayer / Team types ─────────────────────────────────────────────────

export type TeamId = 'alpha' | 'beta';
export type GameMode = 'ffa' | 'teams';

export interface Team {
  id: TeamId;
  name: string;
  color: string;
  accent: string;
  emoji: string;
  playerIds: string[];
  score: number;
}

export interface RoomSnapshot {
  version: number;
  ts: number;
  room: GameRoom;
  board: GameBoardCell[][];
  teams: Record<TeamId, Team>;
  mode: GameMode;
  phase: GameState['phase'];
  activePlayer: string | null;
  currentQuestion: Question | null;
  timerRemaining: number;
  timerServerTs: number;
  sabotages: Record<string, SabotageType[]>;
  lastAnswer: GameState['lastAnswer'];
  hostMessage: string;
}

export type StatePatch =
  | { version: number; ts: number; op: 'PLAYER_JOINED';      payload: { player: Player } }
  | { version: number; ts: number; op: 'PLAYER_LEFT';        payload: { playerId: string } }
  | { version: number; ts: number; op: 'TEAM_ASSIGNED';      payload: { playerId: string; teamId: TeamId } }
  | { version: number; ts: number; op: 'GAME_STARTED';       payload: { board: GameBoardCell[][]; activePlayerId: string } }
  | { version: number; ts: number; op: 'QUESTION_SELECTED';  payload: { question: Question; activePlayerId: string; timerServerTs: number } }
  | { version: number; ts: number; op: 'ANSWER_RESULT';      payload: { playerId: string; correct: boolean; points: number; updatedPlayers: Player[]; updatedTeams: Record<TeamId, Team> } }
  | { version: number; ts: number; op: 'SABOTAGE_APPLIED';   payload: { type: SabotageType; fromId: string; targetId: string; updatedPlayers: Player[]; updatedTeams: Record<TeamId, Team> } }
  | { version: number; ts: number; op: 'GAME_OVER';          payload: { players: Player[]; teams: Record<TeamId, Team> } };

export interface ReconnectSession {
  roomId: string;
  roomCode: string;
  playerId: string;
  teamId: TeamId | null;
  savedAt: number;
}
