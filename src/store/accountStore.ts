import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

export type Gender = 'male' | 'female' | 'neutral';

export interface PlayerAccount {
  id: string;
  name: string;
  avatar: string;
  gender: Gender;
  joinedAt: number;
  lastPlayed: number | null;
  stats: {
    gamesPlayed: number;
    wins: number;
    totalPoints: number;
    bestScore: number;
  };
}

interface AccountStoreState {
  account: PlayerAccount | null;
  createAccount: (name: string, avatar: string, gender: Gender) => void;
  editProfile: (name: string, avatar: string, gender: Gender) => void;
  recordGame: (won: boolean, points: number) => void;
  clearAccount: () => void;
}

export const useAccountStore = create<AccountStoreState>()(
  persist(
    (set, get) => ({
      account: null,

      createAccount: (name, avatar, gender) => {
        set({
          account: {
            id: uuid(),
            name: name.trim(),
            avatar,
            gender,
            joinedAt: Date.now(),
            lastPlayed: null,
            stats: { gamesPlayed: 0, wins: 0, totalPoints: 0, bestScore: 0 },
          },
        });
      },

      editProfile: (name, avatar, gender) => {
        const { account } = get();
        if (!account) return;
        set({ account: { ...account, name: name.trim(), avatar, gender } });
      },

      recordGame: (won, points) => {
        const { account } = get();
        if (!account) return;
        const s = account.stats;
        set({
          account: {
            ...account,
            lastPlayed: Date.now(),
            stats: {
              gamesPlayed: s.gamesPlayed + 1,
              wins: s.wins + (won ? 1 : 0),
              totalPoints: s.totalPoints + points,
              bestScore: Math.max(s.bestScore, points),
            },
          },
        });
      },

      clearAccount: () => set({ account: null }),
    }),
    { name: 'jawib-account-v1' },
  ),
);
