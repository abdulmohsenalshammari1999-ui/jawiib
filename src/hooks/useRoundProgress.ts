import { useMemo } from 'react';
import { useGameStore }          from '@/store/gameStore';
import { useAdaptiveDifficulty } from './useAdaptiveDifficulty';

export interface RoundProgressState {
  /** 1-based round (1 = early / easy, 2 = mid, 3 = late / hard) */
  round:            number;
  totalRounds:      number;
  /** Fraction 0–1 */
  roundProgress:    number;
  boardProgress:    number;
  cellsAnswered:    number;
  totalCells:       number;
  /** Remaining unanswered cells */
  cellsRemaining:   number;
  currentTier:      1 | 2 | 3;
  isOpening:        boolean;
  isMidGame:        boolean;
  isLateGame:       boolean;
  isFinished:       boolean;
  /** Points available in the current round (approximate) */
  pointsAtStake:    number;
}

const TOTAL_ROUNDS = 3;

export function useRoundProgress(): RoundProgressState {
  const game          = useGameStore((s) => s.game);
  const answeredCount = useGameStore((s) => s.answeredCount);
  const { boardProgress, recommendedTier: currentTier } = useAdaptiveDifficulty();

  return useMemo(() => {
    const totalCells    = game?.board.reduce((a, r) => a + r.length, 0) ?? 0;
    const cellsAnswered = answeredCount;
    const cellsRemaining = Math.max(0, totalCells - cellsAnswered);

    // Map board progress to round (1–3)
    const round = boardProgress < 0.30 ? 1 : boardProgress < 0.65 ? 2 : 3;
    // Progress within the current round (0–1)
    const roundStart = round === 1 ? 0 : round === 2 ? 0.30 : 0.65;
    const roundEnd   = round === 1 ? 0.30 : round === 2 ? 0.65 : 1.0;
    const roundProgress =
      roundEnd > roundStart
        ? Math.min(1, (boardProgress - roundStart) / (roundEnd - roundStart))
        : 1;

    const pointsAtStake = currentTier * 100;

    return {
      round,
      totalRounds:   TOTAL_ROUNDS,
      roundProgress,
      boardProgress,
      cellsAnswered,
      totalCells,
      cellsRemaining,
      currentTier,
      isOpening:  boardProgress < 0.15,
      isMidGame:  boardProgress >= 0.30 && boardProgress < 0.65,
      isLateGame: boardProgress >= 0.65,
      isFinished: game?.phase === 'finished',
      pointsAtStake,
    };
  }, [game, answeredCount, boardProgress, currentTier]);
}
