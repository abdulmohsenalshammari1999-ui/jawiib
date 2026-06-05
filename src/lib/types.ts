export type CategoryId =
  // ── Original 22 ──────────────────────────────────────────────────────────
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
  | 'family'
  | 'kuwait_history'
  | 'kuwait_dialect'
  | 'gcc_football'
  | 'diwaniya'
  | 'kuwait_food'
  | 'kuwait_celebs'
  // ── Islamic ──────────────────────────────────────────────────────────────
  | 'quran_tafsir'
  | 'hadith'
  | 'islamic_history'
  | 'prophets'
  // ── Arab & World ─────────────────────────────────────────────────────────
  | 'arab_world'
  | 'world_history'
  | 'politics'
  // ── Economy & Business ───────────────────────────────────────────────────
  | 'economics'
  | 'finance'
  | 'entrepreneurship'
  // ── Technology ───────────────────────────────────────────────────────────
  | 'technology'
  | 'ai_tech'
  | 'cybersecurity'
  | 'programming'
  // ── Health & Mind ────────────────────────────────────────────────────────
  | 'medicine'
  | 'human_body'
  | 'psychology'
  // ── Nature & Universe ────────────────────────────────────────────────────
  | 'space'
  | 'environment'
  | 'animals'
  // ── Arts & Culture ───────────────────────────────────────────────────────
  | 'architecture'
  | 'literature'
  | 'art_visual'
  | 'arabic_language'
  // ── Entertainment ────────────────────────────────────────────────────────
  | 'movies_intl'
  | 'tv_shows_intl'
  | 'video_games'
  | 'celebrities_intl'
  | 'flags_maps'
  // ── Challenge Modes ──────────────────────────────────────────────────────
  | 'math_logic'
  | 'riddles_ar';

// ── Question media type ───────────────────────────────────────────────────────
export type QuestionType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'math'
  | 'riddle'
  | 'guess'      // "خمّن من/ماذا/أين" — identify a person / place / object
  | 'scene'      // "ماذا حدث في هذا المشهد؟" — video/image scene question
  | 'identify'   // "عرّف هذا الصوت/الأغنية/الصوت" — sound/voice identification
  | 'ordering';  // "رتّب" — drag/tap items into the correct order

export interface Question {
  id: string;
  category: CategoryId;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  points: 100 | 200 | 300 | 400 | 500 | 600;
  text: string;
  options: string[];
  correctIndex: number;
  /** Ordering questions only: correct sequence as option indices e.g. [2,0,3,1] */
  correctOrder?: number[];
  // Multimedia
  type?: QuestionType;        // defaults to 'text'
  mediaUrl?: string;          // image / audio / video URL
  mediaAlt?: string;          // accessible description of the media
  mediaDuration?: number;     // seconds — relevant for audio/video clips
  // Display helpers
  teaser?: string;            // shown before question is answered (e.g. "هل تعرف هذا الوجه؟")
  tags?: string[];            // optional taxonomy tags for filtering
  // Educational reveal content
  explanation?: string;       // why this answer is correct
  funFact?: string;           // interesting related fact
  didYouKnow?: string;        // extra knowledge nugget
  source?: string;            // reference / attribution
  evidence?: Evidence;
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
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  points: 100 | 200 | 300 | 400 | 500 | 600;
  answered: boolean;
  answeredBy?: string;
}

export type SabotageType =
  | 'steal'
  | 'block'
  | 'halve'
  | 'bomb'
  | 'freeze'
  | 'scramble'
  | 'double'
  | 'mystery';

// ─── Weapon / Mystery-Box system ─────────────────────────────────────────────

export type WeaponType = 'timer_bomb' | 'immunity' | 'forced_category' | 'ask_friend' | 'extra_time';

export interface Evidence {
  title: string;
  description: string;
  visualIcon?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  sourceLink?: string;
}

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
  phase: 'lobby' | 'board' | 'question' | 'steal' | 'result' | 'sabotage' | 'finished';
  stealOpponentTeamId: TeamId | null;
  hostMessage: string;
  sabotages: Record<string, SabotageType[]>;
  selectedSabotage: SabotageType | null;
  sabotageTarget: string | null;
  lastAnswer: {
    playerId: string;
    teamId?: TeamId | null;
    correct: boolean;
    points: number;
    timeBonus: number;
    streakMultiplier: number;
    /** True when the opposing team still has a steal attempt pending — hide reveal until steal resolves */
    pendingSteal?: boolean;
  } | null;
  // ── Teams weapon system ──
  teamMembership: { alpha: string[]; beta: string[] } | null;
  activeTeamId: TeamId | null;
  teamStreaks: Partial<Record<TeamId, number>>;
  teamWeapons: Partial<Record<TeamId, WeaponType[]>>;
  pendingWeapon: { teamId: TeamId; weapon: WeaponType } | null;
  activeBomb: TeamId | null;
  activeImmunity: Partial<Record<TeamId, boolean>>;
  forcedCategory: { targetTeamId: TeamId; categoryId: CategoryId } | null;
  // ── Last Stand comeback mechanic ──
  lastStandActive: TeamId | null;
  lastStandUsed: Partial<Record<TeamId, boolean>>;
  // ── Per-team score totals (single-device safe) ──
  teamScores: Partial<Record<TeamId, number>>;
  // ── Display info (persisted so names survive refresh) ──
  teamDisplay: { alpha: { name: string; emoji: string }; beta: { name: string; emoji: string } } | null;
}

// ─── Sabotage system ──────────────────────────────────────────────────────────

export interface ActiveSabotageEffect {
  id: string;
  type: SabotageType;
  fromPlayerId: string;
  fromTeamId: TeamId | null;
  targetPlayerId: string;
  plantedTurn: number;
  expiresAfterTurns: number;
  resolved: boolean;
  data: {
    bombDamage: number;
    frozenDuration: number;
    doublePenalty: number;
    doubleMultiplier: number;
  };
}

export interface ScrambleMap {
  targetPlayerId: string;
  questionId: string;
  scrambledOptions: string[];
  indexMap: number[];
}

export type MysteryOutcomeEffect =
  | 'bonus_points'
  | 'steal_random'
  | 'easy_next'
  | 'immunity'
  | 'lose_points'
  | 'random_bomb'
  | 'double_next';

export interface MysteryOutcome {
  effect: MysteryOutcomeEffect;
  value: number;
  message: string;
  emoji: string;
  targetPlayerId?: string;
}

export interface SabotageInventory {
  ownerId: string;
  available: Partial<Record<SabotageType, number>>;
  usedThisGame: SabotageType[];
  consecutiveHitsReceived: number;
  immunityExpiresTurn: number;
  lastUsedAgainstId: string | null;
  lastUsedAgainstTurn: number;
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
