const POLL_HZ = 4; // UI refresh rate for the timer

export class TimerSyncManager {
  private _serverTs = 0;
  private _remaining = 0;
  private _active = false;

  /** Called when server sends TIMER_SYNC or QUESTION_SELECTED */
  sync(remaining: number, serverTs: number): void {
    this._remaining = remaining;
    this._serverTs = serverTs;
    this._active = remaining > 0;
  }

  /** Current display value, accounting for network delta */
  get current(): number {
    if (!this._active || this._remaining <= 0) return 0;
    const elapsed = (Date.now() - this._serverTs) / 1000;
    return Math.max(0, this._remaining - elapsed);
  }

  get isActive(): boolean {
    return this._active && this.current > 0;
  }

  stop(): void {
    this._active = false;
  }

  reset(): void {
    this._serverTs = 0;
    this._remaining = 0;
    this._active = false;
  }
}

export const timerSync = new TimerSyncManager();

// ─── React hook ──────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';

/**
 * Drives a smooth countdown from a server-synced anchor.
 * Returns display-ready integer (0–N).
 */
export function useSyncedTimer(remaining: number, serverTs: number): number {
  const [display, setDisplay] = useState(remaining);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (remaining <= 0) {
      setDisplay(0);
      return;
    }

    const interval = Math.floor(1000 / POLL_HZ);
    const id = setInterval(() => {
      const elapsed = (Date.now() - serverTs) / 1000;
      const next = Math.max(0, remaining - elapsed);
      setDisplay(Math.ceil(next));
      if (next <= 0) clearInterval(id);
    }, interval);

    setDisplay(Math.ceil(Math.max(0, remaining - (Date.now() - serverTs) / 1000)));
    return () => {
      clearInterval(id);
      cancelAnimationFrame(rafRef.current);
    };
  }, [remaining, serverTs]);

  return display;
}

/** Simpler hook for local-only countdown (no server sync) */
export function useLocalTimer(initial: number, active: boolean): number {
  const [val, setVal] = useState(initial);

  useEffect(() => {
    setVal(initial);
  }, [initial]);

  useEffect(() => {
    if (!active || val <= 0) return;
    const id = setInterval(() => setVal((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [active, val]);

  return val;
}
