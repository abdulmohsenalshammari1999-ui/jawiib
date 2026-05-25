import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRoomStore }  from '@/store/roomStore';
import { getPlayerTeam } from '@/lib/teams';
import { computeDifficulty, recommendedTier } from '@/engine/difficultyAdapter';
import type { DifficultyProfile } from '@/engine/difficultyAdapter';
import type { CategoryId } from '@/lib/types';

export interface AdaptiveDifficultyState {
  profile:         DifficultyProfile;
  /** Cells highlighted as "recommended" based on current tier */
  recommendedTier: 1 | 2 | 3;
  /** 0–1 */
  boardProgress:   number;
  /** Is the game in the final stretch? */
  isLateGame:      boolean;
  /** Is there a hot streak active? */
  isHotStreak:     boolean;
  /** Is the local team staging a comeback? */
  isComeback:      boolean;
}

export function useAdaptiveDifficulty(): AdaptiveDifficultyState {
  const game          = useGameStore((s) => s.game);
  const localPlayerId = useGameStore((s) => s.localPlayerId);
  const answeredCount = useGameStore((s) => s.answeredCount);
  const mode   = useRoomStore((s) => s.mode);
  const teams  = useRoomStore((s) => s.teams);

  return useMemo(() => {
    const totalCells = game?.board.reduce((a, r) => a + r.length, 0) ?? 1;
    const boardProgress = totalCells > 0 ? answeredCount / totalCells : 0;

    const player = game?.room.players.find((p) => p.id === localPlayerId);
    const streak  = player?.streak ?? 0;

    // Cold streak: derived from board history (wrong answers since last correct)
    // We approximate by: if streak === 0 and last answer was wrong
    const lastWrong = game?.lastAnswer?.correct === false;
    const coldStreak = streak === 0 && lastWrong ? 1 : 0;

    let teamScoreDelta = 0;
    if (mode === 'teams' && localPlayerId) {
      const teamId = getPlayerTeam(teams, localPlayerId);
      if (teamId) {
        const myScore  = teams[teamId].score;
        const oppId    = teamId === 'alpha' ? 'beta' : 'alpha';
        const oppScore = teams[oppId].score;
        teamScoreDelta = myScore - oppScore;
      }
    }

    const profile = computeDifficulty({
      boardProgress,
      playerStreak:     streak,
      teamScoreDelta,
      playerColdStreak: coldStreak,
      isOpening:        answeredCount === 0,
    });

    return {
      profile,
      recommendedTier: recommendedTier(boardProgress),
      boardProgress,
      isLateGame:  boardProgress >= 0.70,
      isHotStreak: streak >= 3,
      isComeback:  teamScoreDelta <= -300,
    };
  }, [game, localPlayerId, answeredCount, mode, teams]);
}

/** Returns which board cells are "recommended" (matching current difficulty tier) */
export function useRecommendedCells(categoryId: CategoryId): boolean[] {
  const { recommendedTier: tier } = useAdaptiveDifficulty();
  const game = useGameStore((s) => s.game);
  const row = game?.board.find((r) => r[0]?.category === categoryId) ?? [];
  return row.map((cell) => !cell.answered && cell.tier === tier);
}
