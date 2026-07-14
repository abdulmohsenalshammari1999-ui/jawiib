/**
 * mysteryStore — state for the "مَن الفاعل؟" mystery mode.
 * Parallel to gameStore; mystery games never touch gameStore.
 */
import { create } from 'zustand';
import type { Scenario, DrawnSolution, MysteryTileClue } from '@/lib/mysteries';
import type { Question } from '@/lib/types';

export type MysteryPhase = 'briefing' | 'board' | 'question' | 'verdict';
export type MysteryTeam = 'alpha' | 'beta';
export type DeductionMark = 'suspected' | 'cleared' | null;

export interface TileState {
  clue: MysteryTileClue;
  question: Question;
  revealedByTeam: MysteryTeam | null;
}

export interface Accusation {
  suspectId: string;
  locationId: string;
  methodId: string;
}

// Shared deduction notebook — both teams mark together (builds collaboration)
export interface Deductions {
  suspects:  Record<string, DeductionMark>;
  locations: Record<string, DeductionMark>;
  methods:   Record<string, DeductionMark>;
}

interface MysteryState {
  phase: MysteryPhase;
  scenario: Scenario | null;
  solution: DrawnSolution | null;
  tiles: TileState[];
  activeTileId: string | null;
  activeTeam: MysteryTeam;
  scores: Record<MysteryTeam, number>;
  teamNames: Record<MysteryTeam, string>;
  accusations: Record<MysteryTeam, Accusation | null>;
  solvedByTeam: MysteryTeam | null;
  deductions: Deductions;
  showEvidenceBoard: boolean;
  lastRevealedClue: MysteryTileClue | null; // drives post-answer clue flash

  initMystery: (scenario: Scenario, solution: DrawnSolution, tiles: TileState[], names: Record<MysteryTeam, string>) => void;
  pickTile: (tileId: string) => void;
  answerTile: (correct: boolean) => void;
  submitAccusation: (accusation: Accusation) => boolean; // returns true if correct
  setPhase: (phase: MysteryPhase) => void;
  markDeduction: (type: keyof Deductions, id: string, mark: DeductionMark) => void;
  toggleEvidenceBoard: () => void;
  dismissClueFlash: () => void;
  reset: () => void;
}

const BLANK_DEDUCTIONS = (): Deductions => ({
  suspects: {}, locations: {}, methods: {},
});

const INITIAL_STATE = {
  phase: 'briefing' as MysteryPhase,
  scenario: null,
  solution: null,
  tiles: [],
  activeTileId: null,
  activeTeam: 'alpha' as MysteryTeam,
  scores: { alpha: 0, beta: 0 },
  teamNames: { alpha: 'البحر', beta: 'البر' },
  accusations: { alpha: null, beta: null },
  solvedByTeam: null,
  deductions: BLANK_DEDUCTIONS(),
  showEvidenceBoard: false,
  lastRevealedClue: null,
};

export const useMysteryStore = create<MysteryState>((set, get) => ({
  ...INITIAL_STATE,

  initMystery: (scenario, solution, tiles, names) =>
    set({ ...INITIAL_STATE, scenario, solution, tiles, teamNames: names }),

  pickTile: (tileId) => {
    const tile = get().tiles.find((t) => t.clue.tileId === tileId);
    if (!tile || tile.revealedByTeam !== null) return;
    set({ activeTileId: tileId, phase: 'question' });
  },

  answerTile: (correct) => {
    const { activeTileId, activeTeam, tiles, scores } = get();
    if (!activeTileId) return;
    const tile = tiles.find((t) => t.clue.tileId === activeTileId)!;

    if (correct) {
      set({
        tiles: tiles.map((t) =>
          t.clue.tileId === activeTileId ? { ...t, revealedByTeam: activeTeam } : t
        ),
        scores: { ...scores, [activeTeam]: scores[activeTeam] + tile.clue.points },
        activeTileId: null,
        activeTeam: activeTeam === 'alpha' ? 'beta' : 'alpha',
        phase: 'board',
        lastRevealedClue: tile.clue,
      });
    } else {
      set({
        activeTileId: null,
        activeTeam: activeTeam === 'alpha' ? 'beta' : 'alpha',
        phase: 'board',
        lastRevealedClue: null,
      });
    }
  },

  submitAccusation: (accusation) => {
    const { activeTeam, solution, accusations, scores } = get();
    if (accusations[activeTeam] !== null) return false;

    const correct =
      solution !== null &&
      accusation.suspectId  === solution.suspect.id &&
      accusation.locationId === solution.location.id &&
      accusation.methodId   === solution.method.id;

    const newAccusations = { ...accusations, [activeTeam]: accusation };
    const opponent: MysteryTeam = activeTeam === 'alpha' ? 'beta' : 'alpha';
    const bothUsed = newAccusations[opponent] !== null;

    if (correct) {
      set({
        accusations: newAccusations,
        scores: { ...scores, [activeTeam]: scores[activeTeam] + 1000 },
        solvedByTeam: activeTeam,
        phase: 'verdict',
      });
    } else {
      set({
        accusations: newAccusations,
        activeTeam: opponent,
        phase: bothUsed ? 'verdict' : 'board',
      });
    }
    return correct;
  },

  setPhase: (phase) => set({ phase }),

  markDeduction: (type, id, mark) =>
    set((s) => ({
      deductions: {
        ...s.deductions,
        [type]: { ...s.deductions[type], [id]: mark },
      },
    })),

  toggleEvidenceBoard: () => set((s) => ({ showEvidenceBoard: !s.showEvidenceBoard })),

  dismissClueFlash: () => set({ lastRevealedClue: null }),

  reset: () => set({ ...INITIAL_STATE, deductions: BLANK_DEDUCTIONS() }),
}));

// ── Selectors ─────────────────────────────────────────────────────────────────

export function revealedCount(tiles: TileState[]): number {
  return tiles.filter((t) => t.revealedByTeam !== null).length;
}

export function canAccuse(
  tiles: TileState[],
  team: MysteryTeam,
  accusations: Record<MysteryTeam, Accusation | null>,
): boolean {
  return revealedCount(tiles) >= 6 && accusations[team] === null;
}
