/**
 * mysteryStore — lightweight state for the "مَن الفاعل؟" mystery mode.
 * Entirely parallel to gameStore; mystery games never touch gameStore.
 */
import { create } from 'zustand';
import type { Scenario, DrawnSolution, MysteryTileClue } from '@/lib/mysteries';
import type { Question } from '@/lib/types';

export type MysteryPhase = 'briefing' | 'board' | 'question' | 'accuse' | 'verdict';
export type MysteryTeam = 'alpha' | 'beta';

export interface TileState {
  clue: MysteryTileClue;
  question: Question;
  revealedByTeam: MysteryTeam | null; // null = not yet correctly answered
}

export interface Accusation {
  suspectId: string;
  locationId: string;
  methodId: string;
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
  // Accusation — one attempt per team; null = not yet accused
  accusations: Record<MysteryTeam, Accusation | null>;
  solvedByTeam: MysteryTeam | null;

  // actions
  initMystery: (scenario: Scenario, solution: DrawnSolution, tiles: TileState[], names: Record<MysteryTeam, string>) => void;
  pickTile: (tileId: string) => void;
  answerTile: (correct: boolean) => void;
  submitAccusation: (accusation: Accusation) => void;
  setPhase: (phase: MysteryPhase) => void;
  reset: () => void;
}

const INITIAL: Omit<MysteryState, keyof { initMystery: unknown; pickTile: unknown; answerTile: unknown; submitAccusation: unknown; setPhase: unknown; reset: unknown }> = {
  phase: 'briefing',
  scenario: null,
  solution: null,
  tiles: [],
  activeTileId: null,
  activeTeam: 'alpha',
  scores: { alpha: 0, beta: 0 },
  teamNames: { alpha: 'البحر', beta: 'البر' },
  accusations: { alpha: null, beta: null },
  solvedByTeam: null,
};

export const useMysteryStore = create<MysteryState>((set, get) => ({
  ...INITIAL,

  initMystery: (scenario, solution, tiles, names) =>
    set({
      ...INITIAL,
      scenario,
      solution,
      tiles,
      teamNames: names,
      phase: 'briefing',
    }),

  pickTile: (tileId) => {
    const tile = get().tiles.find((t) => t.clue.tileId === tileId);
    if (!tile || tile.revealedByTeam !== null) return;
    set({ activeTileId: tileId, phase: 'question' });
  },

  answerTile: (correct) => {
    const { activeTileId, activeTeam, tiles, scores } = get();
    if (!activeTileId) return;

    if (correct) {
      const pts = tiles.find((t) => t.clue.tileId === activeTileId)!.clue.points;
      set({
        tiles: tiles.map((t) =>
          t.clue.tileId === activeTileId ? { ...t, revealedByTeam: activeTeam } : t
        ),
        scores: { ...scores, [activeTeam]: scores[activeTeam] + pts },
        activeTileId: null,
        activeTeam: activeTeam === 'alpha' ? 'beta' : 'alpha',
        phase: 'board',
      });
    } else {
      // Wrong answer — pass turn, tile stays locked
      set({
        activeTileId: null,
        activeTeam: activeTeam === 'alpha' ? 'beta' : 'alpha',
        phase: 'board',
      });
    }
  },

  submitAccusation: (accusation) => {
    const { activeTeam, solution, accusations, scores } = get();
    // One attempt per team — silently ignore if already used
    if (accusations[activeTeam] !== null) return;

    const correct =
      solution !== null &&
      accusation.suspectId  === solution.suspect.id &&
      accusation.locationId === solution.location.id &&
      accusation.methodId   === solution.method.id;

    const newAccusations = { ...accusations, [activeTeam]: accusation };

    if (correct) {
      set({
        accusations: newAccusations,
        scores: { ...scores, [activeTeam]: scores[activeTeam] + 1000 },
        solvedByTeam: activeTeam,
        phase: 'verdict',
      });
    } else {
      // Wrong — eliminate from accusing, hand turn to opponent
      const opponent: MysteryTeam = activeTeam === 'alpha' ? 'beta' : 'alpha';
      const bothWrong = newAccusations[opponent] !== null;
      set({
        accusations: newAccusations,
        activeTeam: opponent,
        // If both teams guessed wrong, reveal verdict anyway
        phase: bothWrong ? 'verdict' : 'board',
      });
    }
  },

  setPhase: (phase) => set({ phase }),

  reset: () => set({ ...INITIAL }),
}));

// ── Selectors ─────────────────────────────────────────────────────────────────

export function revealedCount(tiles: TileState[]): number {
  return tiles.filter((t) => t.revealedByTeam !== null).length;
}

/** Can the given team press "اتّهم"? */
export function canAccuse(
  tiles: TileState[],
  team: MysteryTeam,
  accusations: Record<MysteryTeam, Accusation | null>,
): boolean {
  return revealedCount(tiles) >= 6 && accusations[team] === null;
}
