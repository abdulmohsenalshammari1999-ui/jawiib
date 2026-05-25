import { v4 as uuid } from 'uuid';
import type { Player } from '@/lib/types';

const AVATARS = ['🦁', '🦊', '🐺', '🦅', '🐉', '🦈', '🐅', '🦂'];

function avatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

export const mockPlayers = {
  host: (name = 'أحمد'): Player => ({
    id: uuid(),
    name,
    avatar: avatar(),
    score: 0,
    streak: 0,
    isHost: true,
  }),

  guest: (name = 'لاعب'): Player => ({
    id: uuid(),
    name,
    avatar: avatar(),
    score: 0,
    streak: 0,
    isHost: false,
  }),

  withScore: (name: string, score: number): Player => ({
    id: uuid(),
    name,
    avatar: avatar(),
    score,
    streak: 0,
    isHost: false,
  }),

  lobby: (): Player[] => [
    { id: uuid(), name: 'عبدالله', avatar: '🦁', score: 0, streak: 0, isHost: true },
    { id: uuid(), name: 'فهد', avatar: '🦊', score: 0, streak: 0, isHost: false },
    { id: uuid(), name: 'نورة', avatar: '🦅', score: 0, streak: 0, isHost: false },
  ],

  midGame: (): Player[] => [
    { id: uuid(), name: 'عبدالله', avatar: '🦁', score: 650, streak: 2, isHost: true },
    { id: uuid(), name: 'فهد', avatar: '🦊', score: 300, streak: 0, isHost: false },
    { id: uuid(), name: 'نورة', avatar: '🦅', score: 500, streak: 1, isHost: false },
  ],

  endGame: (): Player[] => [
    { id: uuid(), name: 'عبدالله', avatar: '🦁', score: 1450, streak: 4, isHost: true },
    { id: uuid(), name: 'فهد', avatar: '🦊', score: 900, streak: 0, isHost: false },
    { id: uuid(), name: 'نورة', avatar: '🦅', score: 1200, streak: 2, isHost: false },
  ],
};
