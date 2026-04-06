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
