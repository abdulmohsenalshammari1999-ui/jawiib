export type EnginePhase =
  | 'idle'
  | 'lobby'
  | 'draft'
  | 'board'
  | 'selecting'
  | 'question'
  | 'answering'
  | 'validating'
  | 'result'
  | 'turn_end'
  | 'round_end'
  | 'finished';

export type PhaseEvent =
  | 'GAME_CREATED'
  | 'DRAFT_STARTED'
  | 'DRAFT_COMPLETE'
  | 'CELL_SELECTED'
  | 'QUESTION_READY'
  | 'TIMER_STARTED'
  | 'ANSWER_SUBMITTED'
  | 'TIMER_EXPIRED'
  | 'VALIDATION_DONE'
  | 'RESULT_ACKED'
  | 'TURN_ADVANCED'
  | 'ROUND_COMPLETE'
  | 'ALL_DONE';

type Transitions = Partial<Record<PhaseEvent, EnginePhase>>;

const GRAPH: Record<EnginePhase, Transitions> = {
  idle:       { GAME_CREATED:    'lobby' },
  lobby:      { DRAFT_STARTED:   'draft',     DRAFT_COMPLETE: 'board' },
  draft:      { DRAFT_COMPLETE:  'board' },
  board:      { CELL_SELECTED:   'selecting', ALL_DONE:       'finished' },
  selecting:  { QUESTION_READY:  'question' },
  question:   { TIMER_STARTED:   'answering' },
  answering:  { ANSWER_SUBMITTED:'validating', TIMER_EXPIRED: 'validating' },
  validating: { VALIDATION_DONE: 'result' },
  result:     { RESULT_ACKED:    'turn_end' },
  turn_end:   { TURN_ADVANCED:   'board',     ROUND_COMPLETE: 'round_end', ALL_DONE: 'finished' },
  round_end:  { TURN_ADVANCED:   'board',     ALL_DONE:       'finished' },
  finished:   {},
};

/** Map engine phase → GameState.phase for store/UI compatibility */
export const ENGINE_TO_STORE_PHASE: Record<EnginePhase, string> = {
  idle:       'lobby',
  lobby:      'lobby',
  draft:      'lobby',
  board:      'board',
  selecting:  'board',
  question:   'question',
  answering:  'question',
  validating: 'question',
  result:     'result',
  turn_end:   'result',
  round_end:  'result',
  finished:   'finished',
};

type PhaseListener = (next: EnginePhase, prev: EnginePhase) => void;

export class GameStateMachine {
  private _phase: EnginePhase = 'idle';
  private _listeners = new Set<PhaseListener>();
  private _history: EnginePhase[] = ['idle'];

  get phase(): EnginePhase { return this._phase; }
  get history(): readonly EnginePhase[] { return this._history; }

  /** Returns the new phase if transition was valid, or null if invalid */
  dispatch(event: PhaseEvent): EnginePhase | null {
    const next = GRAPH[this._phase][event];
    if (!next) return null;
    const prev = this._phase;
    this._phase = next;
    this._history.push(next);
    this._listeners.forEach((l) => l(next, prev));
    return next;
  }

  /** Unconditional override (use sparingly, e.g. reconnect) */
  force(phase: EnginePhase): void {
    const prev = this._phase;
    this._phase = phase;
    this._history.push(phase);
    this._listeners.forEach((l) => l(phase, prev));
  }

  canDispatch(event: PhaseEvent): boolean {
    return event in GRAPH[this._phase];
  }

  is(...phases: EnginePhase[]): boolean {
    return phases.includes(this._phase);
  }

  onTransition(listener: PhaseListener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  reset(): void {
    this._phase = 'idle';
    this._history = ['idle'];
  }
}

export const gameFSM = new GameStateMachine();
