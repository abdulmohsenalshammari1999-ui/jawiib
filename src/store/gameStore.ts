import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type {
  GameState,
  GameRoom,
  Player,
  CategoryId,
  GameBoardCell,
  SabotageType,
} from '@/lib/types';
import { getQuestionById } from '@/lib/questions';
import {
  getWelcomeMessage,
  getWinnerRoast,
  getLoserRoast,
  getStreakMessage,
  getSabotageMessage,
  getGameOverMessage,
} from '@/lib/host';
import { engine }           from '@/engine/questionEngine';
import { validateAnswer }   from '@/engine/answerValidator';
import { globalPool }       from '@/engine/questionPool';

const TRIAL_QUESTION_LIMIT  = 9;
const TRIAL_CATEGORY_COUNT  = 2;
const DEFAULT_TIMER         = 15;

const AVATARS = ['🦁', '🦊', '🐺', '🦅', '🐉', '🦈', '🐅', '🦂'];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function buildBoard(selectedCategories: CategoryId[]): GameBoardCell[][] {
  // Use pool-based builder to guarantee no duplicate questions across the board
  globalPool.reset();
  return selectedCategories.map((cat) => {
    const row: GameBoardCell[] = [];
    for (const tier of [1, 2, 3] as const) {
      const questions = globalPool.drawN(cat, tier, 2);
      for (const q of questions) {
        row.push({ questionId: q.id, category: cat, tier, points: q.points, answered: false });
      }
    }
    return row;
  });
}

function getTrialCategories(): CategoryId[] {
  const all: CategoryId[] = [
    'culture', 'sport', 'history', 'quran', 'gulf', 'science', 'geo', 'food',
    'drama', 'music', 'jokes', 'business', 'social', 'ramadan', 'travel', 'family',
  ];
  return [...all].sort(() => Math.random() - 0.5).slice(0, TRIAL_CATEGORY_COUNT);
}

function initSabotages(playerIds: string[]): Record<string, SabotageType[]> {
  return Object.fromEntries(
    playerIds.map((id) => [id, ['steal', 'block', 'halve'] as SabotageType[]])
  );
}

export interface GameSlice extends GameState {
  // Derived
  answeredCount: number;
  // Actions
  createRoom: (name: string, isTrial: boolean, cats?: CategoryId[]) => { roomId: string; playerId: string };
  addPlayer: (name: string) => string;
  startGame: () => void;
  selectQuestion: (questionId: string) => void;
  answerQuestion: (playerId: string, answerIndex: number) => void;
  useSabotage: (playerId: string, type: SabotageType, targetId: string) => void;
  returnToBoard: () => void;
  resetGame: () => void;
  setHostMessage: (msg: string) => void;
  tickTimer: () => void;
}

export interface GameStoreState {
  game: GameState | null;
  localPlayerId: string | null;
  answeredCount: number;
  // Actions
  createRoom: (name: string, isTrial: boolean, cats?: CategoryId[]) => { roomId: string; playerId: string };
  addPlayer: (name: string) => string;
  startGame: () => void;
  selectQuestion: (questionId: string) => void;
  answerQuestion: (playerId: string, answerIndex: number) => void;
  useSabotage: (playerId: string, type: SabotageType, targetId: string) => void;
  returnToBoard: () => void;
  resetGame: () => void;
  setHostMessage: (msg: string) => void;
}

export const useGameStore = create<GameStoreState>()(
  subscribeWithSelector((set, get) => ({
    game: null,
    localPlayerId: null,
    answeredCount: 0,

    createRoom: (name, isTrial, cats) => {
      const playerId = uuid();
      const roomId = uuid();
      const categories = isTrial ? getTrialCategories() : (cats ?? getTrialCategories());
      const player: Player = {
        id: playerId,
        name: name.trim() || 'لاعب',
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        score: 0,
        streak: 0,
        isHost: true,
      };
      const room: GameRoom = {
        id: roomId,
        code: generateRoomCode(),
        hostId: playerId,
        players: [player],
        status: 'waiting',
        categories,
        currentQuestion: 0,
        answeredQuestions: [],
        isTrial,
        createdAt: Date.now(),
      };
      const board = buildBoard(categories);

      // Bootstrap the engine for adaptive difficulty + round management
      engine.newGame(
        [{ id: playerId, teamId: null, streak: 0, coldStreak: 0, score: 0 }],
        'ffa',
        categories,
      );

      const game: GameState = {
        room,
        board,
        currentQuestion: null,
        activePlayer: playerId,
        timer: DEFAULT_TIMER,
        phase: 'lobby',
        hostMessage: getWelcomeMessage(),
        sabotages: initSabotages([playerId]),
        selectedSabotage: null,
        sabotageTarget: null,
        lastAnswer: null,
      };
      set({ game, localPlayerId: playerId, answeredCount: 0 });
      return { roomId, playerId };
    },

    addPlayer: (name) => {
      const playerId = uuid();
      const { game } = get();
      if (!game) return playerId;
      const player: Player = {
        id: playerId,
        name: name.trim() || 'لاعب',
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        score: 0,
        streak: 0,
        isHost: false,
      };
      const updatedSabotages = { ...game.sabotages, [playerId]: ['steal', 'block', 'halve'] as SabotageType[] };
      set({
        game: {
          ...game,
          room: { ...game.room, players: [...game.room.players, player] },
          sabotages: updatedSabotages,
        },
        localPlayerId: playerId,
      });
      return playerId;
    },

    startGame: () => {
      const { game } = get();
      if (!game) return;
      set({
        game: { ...game, phase: 'board', room: { ...game.room, status: 'playing' } },
      });
    },

    selectQuestion: (questionId) => {
      const { game } = get();
      if (!game || game.phase !== 'board') return;
      const question = getQuestionById(questionId);
      if (!question) return;

      // Derive time limit from difficulty adapter (falls back to default)
      const localPlayerId = get().localPlayerId;
      const diff = localPlayerId ? engine.difficulty(localPlayerId) : null;
      const timeLimit = diff?.timeLimit ?? DEFAULT_TIMER;

      set({
        game: {
          ...game,
          phase: 'question',
          currentQuestion: question,
          timer: timeLimit,
        },
      });

      // Tick timer — stop if phase changes
      const tick = () => {
        const current = get().game;
        if (!current || current.phase !== 'question') return;
        if (current.timer <= 0) {
          set({
            game: {
              ...current,
              phase: 'result',
              timer: 0,
              hostMessage: getLoserRoast(),
              lastAnswer: {
                playerId: current.activePlayer ?? '',
                correct: false,
                points: 0,
                timeBonus: 0,
                streakMultiplier: 1,
              },
            },
          });
          return;
        }
        set({ game: { ...current, timer: current.timer - 1 } });
        setTimeout(tick, 1000);
      };
      setTimeout(tick, 1000);
    },

    answerQuestion: (playerId, answerIndex) => {
      const { game } = get();
      if (!game || game.phase !== 'question' || !game.currentQuestion) return;

      const question = game.currentQuestion;
      const player   = game.room.players.find((p) => p.id === playerId);
      if (!player) return;

      // Delegate scoring to answerValidator (single source of truth)
      const result = validateAnswer({
        question,
        answerIndex,
        timeRemaining:   game.timer,
        timerDuration:   DEFAULT_TIMER,
        playerStreak:    player.streak,
        pointMultiplier: 1,
      });

      const updatedPlayers = game.room.players.map((p) =>
        p.id === playerId
          ? { ...p, score: p.score + result.totalPoints, streak: result.newStreak }
          : p
      );

      const updatedBoard = game.board.map((row) =>
        row.map((cell) =>
          cell.questionId === question.id
            ? { ...cell, answered: true, answeredBy: playerId }
            : cell
        )
      );

      const answeredQuestions = [...game.room.answeredQuestions, question.id];
      const answeredCount     = updatedBoard.reduce((a, r) => a + r.filter((c) => c.answered).length, 0);
      const allAnswered       = game.room.isTrial
        ? answeredQuestions.length >= TRIAL_QUESTION_LIMIT
        : answeredCount >= game.board.reduce((a, r) => a + r.length, 0);

      const nextIdx         = (game.room.players.findIndex((p) => p.id === playerId) + 1) % game.room.players.length;
      const nextActivePlayer = game.room.players[nextIdx].id;

      const hostMessage = result.correct
        ? result.newStreak >= 3 ? getStreakMessage() : getWinnerRoast()
        : getLoserRoast();

      set({
        game: {
          ...game,
          board: updatedBoard,
          phase: allAnswered ? 'finished' : 'result',
          room: {
            ...game.room,
            players: updatedPlayers,
            answeredQuestions,
            status: allAnswered ? 'finished' : 'playing',
          },
          activePlayer: nextActivePlayer,
          hostMessage: allAnswered
            ? getGameOverMessage(
                [...updatedPlayers].sort((a, b) => b.score - a.score)[0].id === playerId
              )
            : hostMessage,
          lastAnswer: {
            playerId,
            correct:          result.correct,
            points:           result.totalPoints,
            timeBonus:        result.timeBonus,
            streakMultiplier: result.streakMultiplier,
          },
        },
        answeredCount,
      });
    },

    useSabotage: (playerId, type, targetId) => {
      const { game } = get();
      if (!game) return;

      const available = game.sabotages[playerId] ?? [];
      if (!available.includes(type)) return;

      const updatedSabotages = {
        ...game.sabotages,
        [playerId]: available.filter((s) => s !== type),
      };

      let updatedPlayers = game.room.players;
      if (type === 'halve') {
        updatedPlayers = game.room.players.map((p) =>
          p.id === targetId ? { ...p, score: Math.floor(p.score / 2) } : p
        );
      }
      if (type === 'steal') {
        const target = game.room.players.find((p) => p.id === targetId);
        const thief = game.room.players.find((p) => p.id === playerId);
        if (target && thief) {
          const stolen = Math.floor(target.score * 0.2);
          updatedPlayers = game.room.players.map((p) => {
            if (p.id === targetId) return { ...p, score: p.score - stolen };
            if (p.id === playerId) return { ...p, score: p.score + stolen };
            return p;
          });
        }
      }

      set({
        game: {
          ...game,
          room: { ...game.room, players: updatedPlayers },
          sabotages: updatedSabotages,
          hostMessage: getSabotageMessage(type),
          selectedSabotage: null,
          sabotageTarget: null,
        },
      });
    },

    returnToBoard: () => {
      const { game } = get();
      if (!game) return;
      set({ game: { ...game, phase: 'board', currentQuestion: null, lastAnswer: null } });
    },

    resetGame: () => {
      set({ game: null, localPlayerId: null, answeredCount: 0 });
    },

    setHostMessage: (msg) => {
      const { game } = get();
      if (!game) return;
      set({ game: { ...game, hostMessage: msg } });
    },
  }))
);
