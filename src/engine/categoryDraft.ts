import type { CategoryId, TeamId } from '@/lib/types';
import { categories as ALL_CATS } from '@/lib/categories';

export type DraftMode = 'snake' | 'alternate' | 'host_picks';

export interface DraftPick {
  teamId: TeamId;
  categoryId: CategoryId;
  pickNumber: number;
}

export interface DraftState {
  mode: DraftMode;
  currentTeam: TeamId;
  picks: DraftPick[];
  remainingCategories: CategoryId[];
  teamAllotments: Record<TeamId, CategoryId[]>;
  totalPicks: number;
  isComplete: boolean;
  round: number; // 1-based draft round
}

export class CategoryDraftManager {
  private _state: DraftState;
  constructor(
    availableCategories: CategoryId[] = ALL_CATS.map((c) => c.id),
    picksPerTeam = 3,
    mode: DraftMode = 'snake',
    firstTeam: TeamId = 'alpha',
  ) {
    this._state = {
      mode,
      currentTeam: firstTeam,
      picks: [],
      remainingCategories: [...availableCategories].sort(() => Math.random() - 0.5),
      teamAllotments: { alpha: [], beta: [] },
      totalPicks: picksPerTeam * 2,
      isComplete: false,
      round: 1,
    };
  }

  get state(): Readonly<DraftState> {
    return this._state;
  }

  get isComplete(): boolean {
    return this._state.isComplete;
  }

  pick(teamId: TeamId, categoryId: CategoryId): DraftState {
    if (this._state.isComplete)
      throw new Error('Draft already complete');
    if (teamId !== this._state.currentTeam)
      throw new Error(`Not ${teamId}'s turn — it's ${this._state.currentTeam}'s turn`);
    if (!this._state.remainingCategories.includes(categoryId))
      throw new Error(`Category ${categoryId} is not available`);

    const pickNumber = this._state.picks.length;
    const newPicks: DraftPick[] = [...this._state.picks, { teamId, categoryId, pickNumber }];
    const remaining = this._state.remainingCategories.filter((c) => c !== categoryId);
    const allotments: Record<TeamId, CategoryId[]> = {
      alpha: [...this._state.teamAllotments.alpha, ...(teamId === 'alpha' ? [categoryId] : [])],
      beta:  [...this._state.teamAllotments.beta,  ...(teamId === 'beta'  ? [categoryId] : [])],
    };

    const isComplete =
      newPicks.length >= this._state.totalPicks || remaining.length === 0;

    const nextPickNumber = newPicks.length;
    const nextTeam: TeamId = isComplete
      ? teamId
      : this._nextTeam(nextPickNumber, this._state.mode, this._state.currentTeam);

    this._state = {
      ...this._state,
      picks: newPicks,
      remainingCategories: remaining,
      teamAllotments: allotments,
      currentTeam: nextTeam,
      isComplete,
      round: Math.floor(nextPickNumber / 2) + 1,
    };

    return this._state;
  }

  /** Automatically complete the remaining picks (for FFA / trial / host_picks) */
  autoComplete(preferTeam?: TeamId): DraftState {
    while (!this._state.isComplete && this._state.remainingCategories.length > 0) {
      const cat = this._state.remainingCategories[0];
      // In host_picks mode, preferTeam gets the first pick in each pair
      const team = this._state.mode === 'host_picks'
        ? (this._state.picks.length % 2 === 0 ? (preferTeam ?? 'alpha') : (preferTeam === 'alpha' ? 'beta' : 'alpha'))
        : this._state.currentTeam;
      this.pick(team, cat);
    }
    return this._state;
  }

  /** All selected categories in draft order */
  get selectedCategories(): CategoryId[] {
    return this._state.picks.map((p) => p.categoryId);
  }

  reset(firstTeam: TeamId = 'alpha'): void {
    this._state = {
      ...this._state,
      currentTeam: firstTeam,
      picks: [],
      remainingCategories: [...ALL_CATS.map((c) => c.id)].sort(() => Math.random() - 0.5),
      teamAllotments: { alpha: [], beta: [] },
      isComplete: false,
      round: 1,
    };
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  /**
   * Snake draft for 2 teams: A, B, B, A, A, B …
   * pick index 0→A, 1→B, 2→B, 3→A, 4→A, 5→B …
   */
  private _nextTeam(pickIndex: number, mode: DraftMode, _current: TeamId): TeamId {
    if (mode === 'alternate') {
      return pickIndex % 2 === 0 ? 'alpha' : 'beta';
    }
    // snake: pair = floor(i/2), direction alternates per pair
    const pair = Math.floor(pickIndex / 2);
    const order: [TeamId, TeamId] = pair % 2 === 0 ? ['alpha', 'beta'] : ['beta', 'alpha'];
    return order[pickIndex % 2];
  }
}

/** Convenience: build a randomised category set for FFA / trial */
export function randomCategories(n: number, exclude: CategoryId[] = []): CategoryId[] {
  const pool = ALL_CATS.map((c) => c.id).filter((id) => !exclude.includes(id));
  return [...pool].sort(() => Math.random() - 0.5).slice(0, n);
}
