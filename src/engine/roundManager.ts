import type { TeamId, GameMode } from '@/lib/types';
import { recommendedTier } from './difficultyAdapter';

type Tier = 1 | 2 | 3;

export interface TurnInfo {
  turnNumber: number;
  playerId: string;
  teamId: TeamId | null;
  round: number;
  /** Suggested tier for cell selection this turn */
  recommendedTier: Tier;
  isTeamMode: boolean;
}

export interface RoundInfo {
  round: number;
  totalRounds: number;
  tier: Tier;
  boardProgress: number;
  cellsAnswered: number;
  totalCells: number;
  isLateGame: boolean;
  isLastRound: boolean;
}

interface PlayerEntry {
  id: string;
  teamId: TeamId | null;
}

export class RoundManager {
  private _turnNumber   = 0;
  private _round        = 1;
  private _cellsAnswered = 0;
  private _currentTeam: TeamId = 'alpha';
  private _teamCursor: Record<TeamId, number> = { alpha: 0, beta: 0 };
  private _roundThresholds: number[];

  constructor(
    private readonly _players: PlayerEntry[],
    private readonly _mode: GameMode,
    private readonly _totalCells: number,
    totalRounds = 3,
  ) {
    // Thresholds: round advances when this many cells answered
    const third = Math.ceil(_totalCells / totalRounds);
    this._roundThresholds = Array.from({ length: totalRounds }, (_, i) => third * (i + 1));
  }

  // ─── Reads ────────────────────────────────────────────────────────────────

  get turnInfo(): TurnInfo {
    const player = this._activePlayer();
    const progress = this._totalCells > 0 ? this._cellsAnswered / this._totalCells : 0;
    return {
      turnNumber: this._turnNumber,
      playerId:   player.id,
      teamId:     player.teamId,
      round:      this._round,
      recommendedTier: recommendedTier(progress),
      isTeamMode: this._mode === 'teams',
    };
  }

  get roundInfo(): RoundInfo {
    const progress = this._totalCells > 0 ? this._cellsAnswered / this._totalCells : 0;
    const tier = recommendedTier(progress);
    return {
      round:         this._round,
      totalRounds:   this._roundThresholds.length,
      tier,
      boardProgress: progress,
      cellsAnswered: this._cellsAnswered,
      totalCells:    this._totalCells,
      isLateGame:    progress >= 0.70,
      isLastRound:   this._round >= this._roundThresholds.length,
    };
  }

  get currentTeam(): TeamId {
    return this._currentTeam;
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  /** Call after each answered question (correct or wrong) */
  recordAnswer(): { roundAdvanced: boolean; newRound: number } {
    this._cellsAnswered++;
    const prevRound = this._round;
    // Check if we crossed a threshold
    for (let i = this._round - 1; i < this._roundThresholds.length; i++) {
      if (this._cellsAnswered >= this._roundThresholds[i]) {
        this._round = Math.min(i + 2, this._roundThresholds.length);
      }
    }
    return { roundAdvanced: this._round > prevRound, newRound: this._round };
  }

  /** Advance to the next player/team turn */
  advanceTurn(): void {
    if (this._mode === 'teams') {
      // Increment cursor for the team that just played
      this._teamCursor[this._currentTeam]++;
      // Switch teams
      this._currentTeam = this._currentTeam === 'alpha' ? 'beta' : 'alpha';
    }
    this._turnNumber++;
  }

  reset(): void {
    this._turnNumber    = 0;
    this._round         = 1;
    this._cellsAnswered = 0;
    this._currentTeam   = 'alpha';
    this._teamCursor    = { alpha: 0, beta: 0 };
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private _activePlayer(): PlayerEntry {
    if (this._mode === 'teams') {
      const teamPlayers = this._players.filter((p) => p.teamId === this._currentTeam);
      if (teamPlayers.length > 0) {
        return teamPlayers[this._teamCursor[this._currentTeam] % teamPlayers.length];
      }
    }
    // FFA or fallback
    if (this._players.length === 0) return { id: '', teamId: null };
    return this._players[this._turnNumber % this._players.length];
  }
}
