import { useState, useEffect, useRef } from 'react';
import { useRoomStore } from '@/store/roomStore';

const TICK_MS = 250; // 4 Hz — smooth without hammering React

/** Timer driven by server-sync anchor from roomStore */
export function useServerTimer(): { display: number; isUrgent: boolean } {
  const timerRemaining = useRoomStore((s) => s.timerRemaining);
  const timerServerTs  = useRoomStore((s) => s.timerServerTs);
  const [display, setDisplay] = useState(timerRemaining);

  useEffect(() => {
    if (timerRemaining <= 0) { setDisplay(0); return; }

    const update = () => {
      const elapsed = (Date.now() - timerServerTs) / 1000;
      setDisplay(Math.ceil(Math.max(0, timerRemaining - elapsed)));
    };
    update();
    const id = setInterval(update, TICK_MS);
    return () => clearInterval(id);
  }, [timerRemaining, timerServerTs]);

  return { display, isUrgent: display <= 5 && display > 0 };
}

/** Standalone countdown — no server sync (local game / trial mode) */
export function useLocalCountdown(
  initial: number,
  running: boolean,
  onExpire?: () => void,
): number {
  const [val, setVal] = useState(initial);
  const expiredRef = useRef(false);

  useEffect(() => {
    setVal(initial);
    expiredRef.current = false;
  }, [initial]);

  useEffect(() => {
    if (!running || val <= 0) {
      if (val <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }
    const id = setInterval(() => setVal((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [running, val, onExpire]);

  return val;
}

/** Percentage 0–1 for progress bars */
export function useTimerProgress(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, current / total));
}
