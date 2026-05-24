import { v4 as uuid } from 'uuid';
import type { GameRoom, CategoryId } from '@/lib/types';
import { mockPlayers } from './players';

function roomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const DEFAULT_CATS: CategoryId[] = ['culture', 'sport', 'history', 'science'];

export const mockRooms = {
  empty: (categories: CategoryId[] = DEFAULT_CATS): GameRoom => {
    const hostId = uuid();
    return {
      id: uuid(),
      code: roomCode(),
      hostId,
      players: [],
      status: 'waiting',
      categories,
      currentQuestion: 0,
      answeredQuestions: [],
      isTrial: false,
      createdAt: Date.now(),
    };
  },

  waiting: (categories: CategoryId[] = DEFAULT_CATS): GameRoom => {
    const players = mockPlayers.lobby();
    return {
      id: uuid(),
      code: roomCode(),
      hostId: players[0].id,
      players,
      status: 'waiting',
      categories,
      currentQuestion: 0,
      answeredQuestions: [],
      isTrial: false,
      createdAt: Date.now(),
    };
  },

  trial: (): GameRoom => {
    const players = mockPlayers.lobby().slice(0, 2);
    return {
      id: uuid(),
      code: roomCode(),
      hostId: players[0].id,
      players,
      status: 'waiting',
      categories: ['culture', 'sport'],
      currentQuestion: 0,
      answeredQuestions: [],
      isTrial: true,
      createdAt: Date.now(),
    };
  },

  playing: (categories: CategoryId[] = DEFAULT_CATS): GameRoom => {
    const players = mockPlayers.midGame();
    return {
      id: uuid(),
      code: roomCode(),
      hostId: players[0].id,
      players,
      status: 'playing',
      categories,
      currentQuestion: 3,
      answeredQuestions: [],
      isTrial: false,
      createdAt: Date.now() - 5 * 60_000,
    };
  },

  finished: (): GameRoom => {
    const players = mockPlayers.endGame();
    return {
      id: uuid(),
      code: roomCode(),
      hostId: players[0].id,
      players,
      status: 'finished',
      categories: DEFAULT_CATS,
      currentQuestion: 12,
      answeredQuestions: [],
      isTrial: false,
      createdAt: Date.now() - 20 * 60_000,
    };
  },
};
