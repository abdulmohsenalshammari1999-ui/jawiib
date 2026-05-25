export type AnswerPhase = 'idle' | 'submitting' | 'confirmed' | 'rejected' | 'timed_out';

export interface PendingAnswer {
  questionId: string;
  answerIndex: number;
  ts: number;
}

type PhaseListener = (phase: AnswerPhase) => void;

const SERVER_TIMEOUT_MS = 5_000;
const RESET_DELAY_MS    = 1_500;

export class AnswerSyncManager {
  private _phase: AnswerPhase = 'idle';
  private _pending: PendingAnswer | null = null;
  private _serverTimeout: ReturnType<typeof setTimeout> | null = null;
  private _resetTimeout:  ReturnType<typeof setTimeout> | null = null;
  private _listeners = new Set<PhaseListener>();

  get phase(): AnswerPhase { return this._phase; }
  get pending(): PendingAnswer | null { return this._pending; }
  get isIdle(): boolean { return this._phase === 'idle'; }

  onPhaseChange(listener: PhaseListener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /** Optimistically mark an answer as submitted; returns the pending record */
  submit(questionId: string, answerIndex: number): PendingAnswer | null {
    if (this._phase !== 'idle') return null;
    this._pending = { questionId, answerIndex, ts: Date.now() };
    this._setPhase('submitting');
    this._serverTimeout = setTimeout(() => {
      if (this._phase === 'submitting') {
        this._setPhase('timed_out');
        this._scheduleReset();
      }
    }, SERVER_TIMEOUT_MS);
    return this._pending;
  }

  /** Called when server confirms the answer was accepted */
  confirm(): void {
    this._clearServerTimeout();
    this._setPhase('confirmed');
    this._scheduleReset();
  }

  /** Called when server rejects (e.g. too late, already answered) */
  reject(): void {
    this._clearServerTimeout();
    this._setPhase('rejected');
    this._scheduleReset();
  }

  forceReset(): void {
    this._clearAll();
    this._pending = null;
    this._setPhase('idle');
  }

  private _setPhase(phase: AnswerPhase): void {
    this._phase = phase;
    this._listeners.forEach((l) => l(phase));
  }

  private _scheduleReset(): void {
    this._resetTimeout = setTimeout(() => this.forceReset(), RESET_DELAY_MS);
  }

  private _clearServerTimeout(): void {
    if (this._serverTimeout) { clearTimeout(this._serverTimeout); this._serverTimeout = null; }
  }

  private _clearAll(): void {
    this._clearServerTimeout();
    if (this._resetTimeout) { clearTimeout(this._resetTimeout); this._resetTimeout = null; }
  }
}

export const answerSync = new AnswerSyncManager();
