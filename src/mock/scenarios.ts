import type { GameState, CategoryId } from '@/lib/types';
import { mockRooms } from './rooms';
import { questions } from '@/lib/questions';
import { getWelcomeMessage } from '@/lib/host';

function buildMockBoard(categories: CategoryId[]) {
  const catQuestions = questions.reduce(
    (acc, q) => {
      if (!acc[q.category]) acc[q.category] = { 1: [], 2: [], 3: [] };
      acc[q.category][q.tier].push(q.id);
      return acc;
    },
    {} as Record<string, Record<number, string[]>>
  );

  return categories.map((cat) => {
    const row = [];
    for (const tier of [1, 2, 3] as const) {
      const ids = catQuestions[cat]?.[tier] ?? [];
      for (let i = 0; i < Math.min(2, ids.length); i++) {
        row.push({
          questionId: ids[i],
          category: cat,
          tier,
          points: (tier * 100) as 100 | 200 | 300,
          answered: false,
        });
      }
    }
    return row;
  });
}

export const scenarios = {
  freshLobby: (): GameState => {
    const room = mockRooms.waiting();
    const cats = room.categories as CategoryId[];
    return {
      room,
      board: buildMockBoard(cats),
      currentQuestion: null,
      activePlayer: room.players[0].id,
      timer: 15,
      phase: 'lobby',
      hostMessage: getWelcomeMessage(),
      sabotages: Object.fromEntries(room.players.map((p) => [p.id, ['steal', 'block', 'halve']])),
      selectedSabotage: null,
      sabotageTarget: null,
      lastAnswer: null,
    };
  },

  boardPhase: (): GameState => {
    const room = mockRooms.playing();
    const cats = room.categories as CategoryId[];
    return {
      room,
      board: buildMockBoard(cats),
      currentQuestion: null,
      activePlayer: room.players[0].id,
      timer: 15,
      phase: 'board',
      hostMessage: 'يلا اختاروا سؤال! 🎯',
      sabotages: Object.fromEntries(room.players.map((p) => [p.id, ['steal', 'block', 'halve']])),
      selectedSabotage: null,
      sabotageTarget: null,
      lastAnswer: null,
    };
  },

  questionPhase: (): GameState => {
    const room = mockRooms.playing();
    const q = questions.find((q) => q.tier === 1)!;
    const cats = room.categories as CategoryId[];
    return {
      room,
      board: buildMockBoard(cats),
      currentQuestion: q,
      activePlayer: room.players[1].id,
      timer: 10,
      phase: 'question',
      hostMessage: 'يلا جاوب! ⏰',
      sabotages: Object.fromEntries(room.players.map((p) => [p.id, ['steal', 'block', 'halve']])),
      selectedSabotage: null,
      sabotageTarget: null,
      lastAnswer: null,
    };
  },

  resultCorrect: (): GameState => {
    const room = mockRooms.playing();
    const q = questions.find((q) => q.tier === 2)!;
    const cats = room.categories as CategoryId[];
    const player = room.players[0];
    return {
      room,
      board: buildMockBoard(cats),
      currentQuestion: q,
      activePlayer: room.players[1].id,
      timer: 0,
      phase: 'result',
      hostMessage: 'ماشاء الله عليك يا بطل! 🏆',
      sabotages: Object.fromEntries(room.players.map((p) => [p.id, ['steal', 'block', 'halve']])),
      selectedSabotage: null,
      sabotageTarget: null,
      lastAnswer: { playerId: player.id, correct: true, points: 225, timeBonus: 25, streakMultiplier: 1 },
    };
  },

  gameOver: (): GameState => {
    const room = mockRooms.finished();
    const cats = room.categories as CategoryId[];
    return {
      room,
      board: buildMockBoard(cats),
      currentQuestion: null,
      activePlayer: null,
      timer: 0,
      phase: 'finished',
      hostMessage: 'مبروووك يا بطل! فزت! 🏆',
      sabotages: {},
      selectedSabotage: null,
      sabotageTarget: null,
      lastAnswer: null,
    };
  },

  trialLobby: (): GameState => {
    const room = mockRooms.trial();
    const cats = room.categories as CategoryId[];
    return {
      room,
      board: buildMockBoard(cats),
      currentQuestion: null,
      activePlayer: room.players[0].id,
      timer: 15,
      phase: 'lobby',
      hostMessage: getWelcomeMessage(),
      sabotages: Object.fromEntries(room.players.map((p) => [p.id, []])),
      selectedSabotage: null,
      sabotageTarget: null,
      lastAnswer: null,
    };
  },
};
