import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  SabotageType,
  TeamId,
  ActiveSabotageEffect,
  ScrambleMap,
  MysteryOutcome,
  SabotageInventory,
  GameMode,
} from '@/lib/types';
import { sabotageEngine } from '@/engine/sabotageEngine';
import type { ActivationResult, EffectResolution } from '@/engine/sabotageEngine';

export interface SabotageStoreState {
  // Mirror of engine state for React reactivity
  inventories:    Record<string, SabotageInventory>;
  activeEffects:  ActiveSabotageEffect[];
  scrambles:      Record<string, ScrambleMap>;
  lastMystery:    MysteryOutcome | null;
  /** Last activation result — for toast/UI feedback */
  lastResult:     ActivationResult | null;
  /** Last resolution — for toast/UI feedback */
  lastResolution: EffectResolution | null;
  currentTurn:    number;

  // Actions ──────────────────────────────────────────────────────────────────
  initGame: (mode: GameMode, ownerIds: string[]) => void;
  activate: (params: {
    fromPlayerId: string;
    fromTeamId: TeamId | null;
    type: SabotageType;
    targetPlayerId: string;
    targetTeamId: TeamId | null;
    targetScore: number;
    questionOptions?: string[];
  }) => ActivationResult;
  resolveAnswer: (targetPlayerId: string, correct: boolean) => EffectResolution;
  getFreezeFor: (playerId: string) => number | null;
  getScrambleFor: (playerId: string) => ScrambleMap | null;
  clearScramble: (playerId: string) => void;
  hasDoubleActive: (playerId: string) => boolean;
  hasBombActive:   (playerId: string) => boolean;
  getDoubleMultiplierFor: (playerId: string) => number | null;
  earnSabotage: (ownerId: string, type: SabotageType) => void;
  advanceTurn: () => void;
  resetSabotagees: () => void;
}

export const useSabotageStore = create<SabotageStoreState>()(
  subscribeWithSelector((set, get) => ({
    inventories:    {},
    activeEffects:  [],
    scrambles:      {},
    lastMystery:    null,
    lastResult:     null,
    lastResolution: null,
    currentTurn:    0,

    initGame: (mode, ownerIds) => {
      sabotageEngine.reset();
      if (mode === 'teams') {
        sabotageEngine.initTeamInventories(ownerIds as TeamId[]);
      } else {
        sabotageEngine.initPlayerInventories(ownerIds);
      }
      set({
        inventories: Object.fromEntries(
          ownerIds.map((id) => [id, sabotageEngine.getInventory(id)!]),
        ),
        activeEffects: [],
        scrambles: {},
        lastMystery: null,
        lastResult: null,
        lastResolution: null,
        currentTurn: 0,
      });
    },

    activate: (params) => {
      const result = sabotageEngine.activate({ ...params, currentTurn: get().currentTurn });
      // Sync engine state back to store
      const ownerId     = params.fromTeamId ?? params.fromPlayerId;
      const targetOwner = params.targetTeamId ?? params.targetPlayerId;
      const invs = { ...get().inventories };
      const freshFrom   = sabotageEngine.getInventory(ownerId);
      const freshTarget = sabotageEngine.getInventory(targetOwner);
      if (freshFrom)   invs[ownerId]     = freshFrom;
      if (freshTarget) invs[targetOwner] = freshTarget;

      const newScrambles = { ...get().scrambles };
      if (result.scramble) newScrambles[params.targetPlayerId] = result.scramble;

      set({
        inventories:   invs,
        activeEffects: sabotageEngine.getAllActiveEffects(),
        scrambles:     newScrambles,
        lastMystery:   result.mystery,
        lastResult:    result,
      });
      return result;
    },

    resolveAnswer: (targetPlayerId, correct) => {
      const resolution = sabotageEngine.resolveAnswer(targetPlayerId, correct, get().currentTurn);
      set({
        activeEffects: sabotageEngine.getAllActiveEffects(),
        lastResolution: resolution,
      });
      return resolution;
    },

    getFreezeFor: (playerId) => sabotageEngine.getFreezeFor(playerId),

    getScrambleFor: (playerId) => get().scrambles[playerId] ?? null,

    clearScramble: (playerId) => {
      sabotageEngine.clearScramble(playerId);
      const s = { ...get().scrambles };
      delete s[playerId];
      set({ scrambles: s });
    },

    hasDoubleActive:         (id) => sabotageEngine.hasDoubleActive(id),
    hasBombActive:           (id) => sabotageEngine.hasBombActive(id),
    getDoubleMultiplierFor:  (id) => sabotageEngine.getDoubleMultiplierFor(id),

    earnSabotage: (ownerId, type) => {
      sabotageEngine.earnSabotage(ownerId, type);
      const inv = sabotageEngine.getInventory(ownerId);
      if (inv) set({ inventories: { ...get().inventories, [ownerId]: inv } });
    },

    advanceTurn: () => {
      sabotageEngine.advanceTurn();
      set((s) => ({
        currentTurn:  s.currentTurn + 1,
        activeEffects: sabotageEngine.getAllActiveEffects(),
      }));
    },

    resetSabotagees: () => {
      sabotageEngine.reset();
      set({
        inventories: {}, activeEffects: [], scrambles: {},
        lastMystery: null, lastResult: null, lastResolution: null, currentTurn: 0,
      });
    },
  }))
);
