/**
 * QuestionEngine — orchestrates pool, difficulty, round progression, and validation.
 * Pure logic class; no React / Zustand imports. Stores call its methods.
 */
import type { Question, CategoryId, GameBoardCell, GameMode, TeamId } from '@/lib/types';
import { QuestionPool }                   from './questionPool';
import { computeDifficulty, recommendedTier } from './difficultyAdapter';
import type { DifficultyProfile, DifficultyContext } from './difficultyAdapter';
import { validateAnswer }                 from './answerValidator';
import type { ValidationInput, ValidationResult } from './answerValidator';
import { RoundManager }                   from './roundManager';
import type { TurnInfo, RoundInfo }       from './roundManager';
import { CategoryDraftManager }           from './categoryDraft';
import type { DraftState }               from './categoryDraft';
import { GameStateMachine }              from './stateMachine';
import type { EnginePhase }             from './stateMachine';
import { questions as ALL_QUESTIONS }    from '@/lib/questions';

const CELLS_PER_TIER = 2;

export interface BoardBuilderOptions {
  categories: CategoryId[];
  /** Override cells per tier (default: 2) */
  cellsPerTier?: number;
}

export interface EngineSnapshot {
  phase: EnginePhase;
  roundInfo: RoundInfo;
  turnInfo: TurnInfo;
  difficulty: DifficultyProfile | null;
  currentQuestion: Question | null;
  boardProgress: number;
}

interface PlayerRef {
  id: string;
  teamId: TeamId | null;
  streak: number;
  coldStreak: number;
  score: number;
}

export class QuestionEngine {
  private _pool:        QuestionPool;
  private _round:       RoundManager | null = null;
  private _fsm:         GameStateMachine;
  private _draft:       CategoryDraftManager | null = null;
  private _question:    Question | null = null;
  private _players:     PlayerRef[] = [];
  private _mode:        GameMode = 'ffa';
  private _totalCells   = 0;
  private _cellsAnswered = 0;

  constructor() {
    this._pool = new QuestionPool(ALL_QUESTIONS);
    this._fsm  = new GameStateMachine();
  }

  // ─── Setup ────────────────────────────────────────────────────────────────

  newGame(
    players: PlayerRef[],
    mode: GameMode,
    categories: CategoryId[],
  ): GameBoardCell[][] {
    this._pool.reset();
    this._fsm.reset();
    this._players     = players;
    this._mode        = mode;
    this._question    = null;
    this._cellsAnswered = 0;

    const board = this._buildBoard({ categories });
    this._totalCells = board.reduce((s, r) => s + r.length, 0);

    this._round = new RoundManager(
      players.map((p) => ({ id: p.id, teamId: p.teamId })),
      mode,
      this._totalCells,
    );

    this._fsm.dispatch('GAME_CREATED');
    return board;
  }

  startDraft(categories: CategoryId[], picksPerTeam = 3): DraftState {
    this._draft = new CategoryDraftManager(categories, picksPerTeam, 'snake');
    this._fsm.dispatch('DRAFT_STARTED');
    return this._draft.state;
  }

  draftPick(teamId: TeamId, categoryId: CategoryId): DraftState {
    if (!this._draft) throw new Error('No draft in progress');
    const state = this._draft.pick(teamId, categoryId);
    if (state.isComplete) this._fsm.dispatch('DRAFT_COMPLETE');
    return state;
  }

  startBoard(): void {
    if (this._fsm.phase === 'lobby') this._fsm.dispatch('DRAFT_COMPLETE');
  }

  // ─── Question flow ────────────────────────────────────────────────────────

  selectCell(questionId: string): Question | null {
    if (!this._round) return null;
    this._fsm.dispatch('CELL_SELECTED');

    const q = ALL_QUESTIONS.find((x) => x.id === questionId) ?? null;
    if (!q) return null;

    this._question = q;
    this._fsm.dispatch('QUESTION_READY');
    this._fsm.dispatch('TIMER_STARTED');
    return q;
  }

  submitAnswer(
    playerId: string,
    input: Omit<ValidationInput, 'question'>,
  ): ValidationResult | null {
    if (!this._question || !this._round) return null;
    if (!this._fsm.is('answering')) return null;

    this._fsm.dispatch('ANSWER_SUBMITTED');
    const result = validateAnswer({ ...input, question: this._question });

    // Update player tracking
    const player = this._players.find((p) => p.id === playerId);
    if (player) {
      player.streak     = result.newStreak;
      player.coldStreak = result.correct ? 0 : player.coldStreak + 1;
      player.score      += result.totalPoints;
    }

    const { roundAdvanced } = this._round.recordAnswer();
    this._cellsAnswered++;
    this._fsm.dispatch('VALIDATION_DONE');

    const allDone = this._cellsAnswered >= this._totalCells;

    // Transition result → turn_end
    this._fsm.dispatch('RESULT_ACKED');
    if (allDone) {
      this._fsm.dispatch('ALL_DONE');
    } else if (roundAdvanced) {
      this._fsm.dispatch('ROUND_COMPLETE');
      this._fsm.dispatch('TURN_ADVANCED');
    } else {
      this._round.advanceTurn();
      this._fsm.dispatch('TURN_ADVANCED');
    }

    this._question = null;
    return result;
  }

  timerExpired(): ValidationResult | null {
    if (!this._question || !this._round) return null;
    if (!this._fsm.is('answering')) return null;

    this._fsm.dispatch('TIMER_EXPIRED');
    const result = validateAnswer({
      question:        this._question,
      answerIndex:     null,
      timeRemaining:   0,
      timerDuration:   15,
      playerStreak:    0,
      pointMultiplier: 1,
    });

    const player = this._players.find((p) => p.id === this.turnInfo?.playerId);
    if (player) {
      player.streak     = 0;
      player.coldStreak = player.coldStreak + 1;
    }

    const { roundAdvanced } = this._round.recordAnswer();
    this._cellsAnswered++;
    this._fsm.dispatch('VALIDATION_DONE');

    const allDone = this._cellsAnswered >= this._totalCells;
    this._fsm.dispatch('RESULT_ACKED');
    if (allDone) {
      this._fsm.dispatch('ALL_DONE');
    } else if (roundAdvanced) {
      this._fsm.dispatch('ROUND_COMPLETE');
      this._fsm.dispatch('TURN_ADVANCED');
    } else {
      this._round.advanceTurn();
      this._fsm.dispatch('TURN_ADVANCED');
    }

    this._question = null;
    return result;
  }

  // ─── Adaptive difficulty ──────────────────────────────────────────────────

  difficulty(playerId: string, teams?: Record<TeamId, { score: number }>): DifficultyProfile {
    const player   = this._players.find((p) => p.id === playerId);
    const progress = this._totalCells > 0 ? this._cellsAnswered / this._totalCells : 0;

    let teamScoreDelta = 0;
    if (this._mode === 'teams' && player?.teamId && teams) {
      const myScore  = teams[player.teamId]?.score ?? 0;
      const oppId    = player.teamId === 'alpha' ? 'beta' : 'alpha';
      const oppScore = teams[oppId]?.score ?? 0;
      teamScoreDelta = myScore - oppScore;
    }

    const ctx: DifficultyContext = {
      boardProgress:    progress,
      playerStreak:     player?.streak ?? 0,
      teamScoreDelta,
      playerColdStreak: player?.coldStreak ?? 0,
      isOpening:        this._cellsAnswered === 0,
    };

    return computeDifficulty(ctx);
  }

  /** Best-fit unused question for a category given current difficulty */
  suggestQuestion(
    category: CategoryId,
    playerId: string,
    teams?: Record<TeamId, { score: number }>,
  ): Question | null {
    const diff = this.difficulty(playerId, teams);
    return this._pool.drawFallback(category, diff.tier);
  }

  // ─── Reads ────────────────────────────────────────────────────────────────

  get phase(): EnginePhase { return this._fsm.phase; }
  get fsm(): GameStateMachine { return this._fsm; }
  get currentQuestion(): Question | null { return this._question; }
  get roundInfo(): RoundInfo | null { return this._round?.roundInfo ?? null; }
  get turnInfo(): TurnInfo | null { return this._round?.turnInfo ?? null; }
  get boardProgress(): number {
    return this._totalCells > 0 ? this._cellsAnswered / this._totalCells : 0;
  }
  get recommendedTier(): 1 | 2 | 3 { return recommendedTier(this.boardProgress); }

  snapshot(playerId: string, teams?: Record<TeamId, { score: number }>): EngineSnapshot {
    return {
      phase:           this._fsm.phase,
      roundInfo:       this._round?.roundInfo ?? { round: 1, totalRounds: 3, tier: 1, boardProgress: 0, cellsAnswered: 0, totalCells: 0, isLateGame: false, isLastRound: false },
      turnInfo:        this._round?.turnInfo ?? { turnNumber: 0, playerId: '', teamId: null, round: 1, recommendedTier: 1, isTeamMode: false },
      difficulty:      this._players.length > 0 ? this.difficulty(playerId, teams) : null,
      currentQuestion: this._question,
      boardProgress:   this.boardProgress,
    };
  }

  // ─── Board builder ────────────────────────────────────────────────────────

  private _buildBoard(opts: BoardBuilderOptions): GameBoardCell[][] {
    const cells = opts.cellsPerTier ?? CELLS_PER_TIER;
    return opts.categories.map((cat) => {
      const row: GameBoardCell[] = [];
      for (const tier of [1, 2, 3] as const) {
        const questions = this._pool.drawN(cat, tier, cells);
        for (const q of questions) {
          row.push({ questionId: q.id, category: cat, tier, points: q.points, answered: false });
        }
      }
      return row;
    });
  }
}

/** Singleton engine instance — shared across stores */
export const engine = new QuestionEngine();
