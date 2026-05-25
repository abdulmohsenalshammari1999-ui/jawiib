import { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRoomStore } from '@/store/roomStore';
import { getPlayerTeam } from '@/lib/teams';
import type { Question } from '@/lib/types';

export interface QuestionFlowState {
  question:      Question | null;
  phase:         string;
  timer:         number;
  isMyTurn:      boolean;
  canAnswer:     boolean;
  answerPhase:   string;
  isTeamMode:    boolean;
  /** Index the local player selected (optimistic), null if not yet answered */
  selectedIndex: number | null;
  submitAnswer:  (index: number) => void;
  skipToBoard:   () => void;
}

export function useQuestionFlow(): QuestionFlowState {
  const game          = useGameStore((s) => s.game);
  const localPlayerId = useGameStore((s) => s.localPlayerId);
  const answerQuestion = useGameStore((s) => s.answerQuestion);
  const returnToBoard  = useGameStore((s) => s.returnToBoard);

  const mode        = useRoomStore((s) => s.mode);
  const teams       = useRoomStore((s) => s.teams);
  const answerPhase = useRoomStore((s) => s.answerPhase);
  const pendingAnswer    = useRoomStore((s) => s.pendingAnswer);
  const submitAnswerRoom = useRoomStore((s) => s.submitAnswer);
  const resolveAnswer    = useRoomStore((s) => s.resolveAnswer);

  const isTeamMode = mode === 'teams';

  // In team mode: anyone on the active team can answer
  const isMyTurn = (() => {
    if (!game || !localPlayerId) return false;
    if (isTeamMode) {
      const localTeam  = getPlayerTeam(teams, localPlayerId);
      const activeTeam = game.activePlayer
        ? getPlayerTeam(teams, game.activePlayer)
        : null;
      return localTeam !== null && localTeam === activeTeam;
    }
    return game.activePlayer === localPlayerId;
  })();

  const canAnswer =
    game?.phase === 'question' &&
    isMyTurn;

  const submitAnswer = useCallback(
    (index: number) => {
      if (!canAnswer || !localPlayerId) return;
      // Optimistic local state
      submitAnswerRoom(game!.currentQuestion!.id, index);
      // Apply to game store (local/offline mode)
      answerQuestion(localPlayerId, index);
      // Immediately resolve for local mode
      resolveAnswer('confirmed');
    },
    [canAnswer, localPlayerId, game, submitAnswerRoom, answerQuestion, resolveAnswer],
  );

  const skipToBoard = useCallback(() => {
    returnToBoard();
  }, [returnToBoard]);

  return {
    question:      game?.currentQuestion ?? null,
    phase:         game?.phase ?? 'lobby',
    timer:         game?.timer ?? 0,
    isMyTurn,
    canAnswer,
    answerPhase,
    isTeamMode,
    selectedIndex: pendingAnswer?.answerIndex ?? null,
    submitAnswer,
    skipToBoard,
  };
}
