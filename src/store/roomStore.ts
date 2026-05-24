import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  TeamId,
  Team,
  GameMode,
  StatePatch,
  RoomSnapshot,
  ReconnectSession,
} from '@/lib/types';
import {
  createTeams,
  autoAssignTeam,
  applyTeamAssignment,
  removeFromTeams,
  addTeamScore,
  getPlayerTeam,
} from '@/lib/teams';
import { saveSession, clearSession, loadSession } from '@/multiplayer/reconnect';
import { useGameStore } from './gameStore';

export type AnswerPhase = 'idle' | 'submitting' | 'confirmed' | 'rejected' | 'timed_out';

export interface RoomStoreState {
  mode: GameMode;
  teams: Record<TeamId, Team>;
  syncVersion: number;
  timerRemaining: number;
  timerServerTs: number;
  pendingAnswer: { questionId: string; answerIndex: number; ts: number } | null;
  answerPhase: AnswerPhase;
  reconnectSession: ReconnectSession | null;
  isReconnecting: boolean;
  connectionRtt: number;

  // Actions ─────────────────────────────────────────────────────────────────
  setMode: (mode: GameMode) => void;
  initTeams: () => void;
  assignTeam: (playerId: string, teamId: TeamId) => void;
  autoAssign: (playerId: string) => TeamId;
  removePlayer: (playerId: string) => void;
  addTeamScore: (teamId: TeamId, points: number) => void;
  setTimer: (remaining: number, serverTs: number) => void;
  stopTimer: () => void;
  setSyncVersion: (v: number) => void;
  applyPatch: (patch: StatePatch) => void;
  applySnapshot: (snapshot: RoomSnapshot) => void;
  submitAnswer: (questionId: string, answerIndex: number) => void;
  resolveAnswer: (phase: 'confirmed' | 'rejected') => void;
  resetAnswer: () => void;
  persistSession: (session: Omit<ReconnectSession, 'savedAt'>) => void;
  loadPersistedSession: () => void;
  clearPersistedSession: () => void;
  setReconnecting: (v: boolean) => void;
  setRtt: (ms: number) => void;
  resetRoom: () => void;
}

const INITIAL_TEAMS = createTeams();

export const useRoomStore = create<RoomStoreState>()(
  subscribeWithSelector((set, get) => ({
    mode: 'ffa',
    teams: INITIAL_TEAMS,
    syncVersion: 0,
    timerRemaining: 0,
    timerServerTs: 0,
    pendingAnswer: null,
    answerPhase: 'idle',
    reconnectSession: null,
    isReconnecting: false,
    connectionRtt: 0,

    setMode: (mode) => set({ mode }),

    initTeams: () => set({ teams: createTeams() }),

    assignTeam: (playerId, teamId) =>
      set((s) => ({ teams: applyTeamAssignment(s.teams, playerId, teamId) })),

    autoAssign: (playerId) => {
      const teamId = autoAssignTeam(get().teams);
      set((s) => ({ teams: applyTeamAssignment(s.teams, playerId, teamId) }));
      return teamId;
    },

    removePlayer: (playerId) =>
      set((s) => ({ teams: removeFromTeams(s.teams, playerId) })),

    addTeamScore: (teamId, points) =>
      set((s) => ({ teams: addTeamScore(s.teams, teamId, points) })),

    setTimer: (remaining, serverTs) => set({ timerRemaining: remaining, timerServerTs: serverTs }),

    stopTimer: () => set({ timerRemaining: 0 }),

    setSyncVersion: (v) => set({ syncVersion: v }),

    applyPatch: (patch) => {
      const s = get();
      if (patch.version <= s.syncVersion) return;
      set({ syncVersion: patch.version });

      switch (patch.op) {
        case 'TEAM_ASSIGNED':
          set((cur) => ({ teams: applyTeamAssignment(cur.teams, patch.payload.playerId, patch.payload.teamId) }));
          break;
        case 'PLAYER_LEFT':
          set((cur) => ({ teams: removeFromTeams(cur.teams, patch.payload.playerId) }));
          break;
        case 'ANSWER_RESULT': {
          const { playerId, points, updatedTeams } = patch.payload;
          // Sync teams from authoritative server data
          if (updatedTeams) set({ teams: updatedTeams });
          // If using FFA mode, find team from current assignments and award
          if (points > 0 && !updatedTeams) {
            const teamId = getPlayerTeam(s.teams, playerId);
            if (teamId) set((cur) => ({ teams: addTeamScore(cur.teams, teamId, points) }));
          }
          break;
        }
        case 'GAME_OVER':
          if (patch.payload.teams) set({ teams: patch.payload.teams });
          break;
        default:
          break;
      }
    },

    applySnapshot: (snapshot) => {
      set({
        syncVersion: snapshot.version,
        mode: snapshot.mode,
        teams: snapshot.teams,
        timerRemaining: snapshot.timerRemaining,
        timerServerTs: snapshot.timerServerTs,
      });
      // Also hydrate gameStore if we have the snapshot
      const { game } = useGameStore.getState();
      if (!game) {
        // Snapshot-driven hydration for reconnect scenario
        useGameStore.setState({
          game: {
            room: snapshot.room,
            board: snapshot.board,
            currentQuestion: snapshot.currentQuestion,
            activePlayer: snapshot.activePlayer,
            timer: snapshot.timerRemaining,
            phase: snapshot.phase,
            hostMessage: snapshot.hostMessage,
            sabotages: snapshot.sabotages,
            selectedSabotage: null,
            sabotageTarget: null,
            lastAnswer: snapshot.lastAnswer,
          },
        });
      }
    },

    submitAnswer: (questionId, answerIndex) =>
      set({ pendingAnswer: { questionId, answerIndex, ts: Date.now() }, answerPhase: 'submitting' }),

    resolveAnswer: (phase) => set({ answerPhase: phase }),

    resetAnswer: () => set({ pendingAnswer: null, answerPhase: 'idle' }),

    persistSession: (session) => {
      saveSession(session);
      set({ reconnectSession: { ...session, savedAt: Date.now() } });
    },

    loadPersistedSession: () => {
      const session = loadSession();
      set({ reconnectSession: session });
    },

    clearPersistedSession: () => {
      clearSession();
      set({ reconnectSession: null });
    },

    setReconnecting: (v) => set({ isReconnecting: v }),

    setRtt: (ms) => set({ connectionRtt: ms }),

    resetRoom: () =>
      set({
        mode: 'ffa',
        teams: createTeams(),
        syncVersion: 0,
        timerRemaining: 0,
        timerServerTs: 0,
        pendingAnswer: null,
        answerPhase: 'idle',
        isReconnecting: false,
        connectionRtt: 0,
      }),
  }))
);
