// useHostMessage.ts — Watches game state and fires rich host events to the HostEngine.
// Sabotage-triggered host messages are handled by gameStore.useSabotage;
// this hook only emits score-driven and phase-transition events.

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRoomStore } from '@/store/roomStore';
import { hostEngine } from '@/lib/hostEngine';
import type { HostEvent } from '@/lib/hostEngine';
import type { TonePreset } from '@/lib/hostEngine';

interface PrevState {
  phase: string | null;
  /** Map of playerId → score at the last board snapshot */
  scores: Record<string, number>;
  /** Map of playerId → streak at the last snapshot */
  streaks: Record<string, number>;
  /** answeredCount at the last board snapshot */
  answeredCount: number;
  /** Total board cells at last board snapshot */
  totalCells: number;
}

export function useHostMessage(tone?: TonePreset): void {
  const game           = useGameStore((s) => s.game);
  const setHostMessage = useGameStore((s) => s.setHostMessage);
  const answeredCount  = useGameStore((s) => s.answeredCount);
  const teams          = useRoomStore((s) => s.teams);
  const mode           = useRoomStore((s) => s.mode);

  const prev = useRef<PrevState>({
    phase:         null,
    scores:        {},
    streaks:       {},
    answeredCount: 0,
    totalCells:    0,
  });

  useEffect(() => {
    if (!game) return;

    const { phase, room, board, lastAnswer } = game;
    const players = room.players;
    const prevState = prev.current;

    // ── Phase: question → result (answer resolved) ─────────────────────────
    if (prevState.phase === 'question' && phase === 'result' && lastAnswer) {
      const { playerId, correct, points } = lastAnswer;
      const player = players.find((p) => p.id === playerId);

      if (player) {
        const prevStreak = prevState.streaks[playerId] ?? 0;

        if (correct) {
          const newStreak = player.streak;

          if (newStreak >= 3) {
            // streak event takes priority over plain correct
            const streakEvent: HostEvent = {
              type:       'streak',
              playerName: player.name,
              streak:     newStreak,
              teamColor:  mode === 'teams' ? _getTeamColor(playerId, teams) : undefined,
            };
            setHostMessage(hostEngine.react(streakEvent, tone));
          } else {
            const correctEvent: HostEvent = {
              type:       'correct',
              playerName: player.name,
              points,
              streak:     newStreak,
              teamColor:  mode === 'teams' ? _getTeamColor(playerId, teams) : undefined,
            };
            setHostMessage(hostEngine.react(correctEvent, tone));
          }
        } else {
          // Wrong answer — check if a streak was broken
          const wrongEvent: HostEvent = {
            type:       'wrong',
            playerName: player.name,
            // pass the old streak so the engine can detect a broken streak
            streak:     prevStreak,
            teamColor:  mode === 'teams' ? _getTeamColor(playerId, teams) : undefined,
          };
          setHostMessage(hostEngine.react(wrongEvent, tone));
        }

        // Suppress further handling for this tick
        prev.current = {
          ...prevState,
          phase,
          scores:  _buildScoreMap(players),
          streaks: _buildStreakMap(players),
        };
        return;
      }
    }

    // ── Phase: result → board (returning to board) ─────────────────────────
    if (prevState.phase === 'result' && phase === 'board') {
      // Sort players by score descending
      const sorted = [...players].sort((a, b) => b.score - a.score);

      if (sorted.length >= 2) {
        const [leader, trailer] = sorted;
        const delta = leader.score - trailer.score;

        const prevLeaderScore  = prevState.scores[leader.id]  ?? leader.score;
        const prevTrailerScore = prevState.scores[trailer.id] ?? trailer.score;
        const prevDelta        = prevLeaderScore - prevTrailerScore;

        if (delta >= 500) {
          // Domination
          const dominationEvent: HostEvent = {
            type:         'domination',
            leadingName:  leader.name,
            trailingName: trailer.name,
            delta,
          };
          setHostMessage(hostEngine.react(dominationEvent, tone));
        } else if (prevDelta - delta >= 200) {
          // Trailing player closed gap by 200+ pts → comeback
          const comebackEvent: HostEvent = {
            type:         'comeback',
            trailingName: trailer.name,
            leadingName:  leader.name,
            delta,
          };
          setHostMessage(hostEngine.react(comebackEvent, tone));
        }
      }

      // Check sudden death: board >= 70% complete AND top-2 delta < 150
      const totalCells = board.reduce((sum, row) => sum + row.length, 0);
      const boardProgress = totalCells > 0 ? answeredCount / totalCells : 0;

      if (boardProgress >= 0.70 && sorted.length >= 2) {
        const topDelta = sorted[0].score - sorted[1].score;
        if (topDelta < 150) {
          const suddenDeathEvent: HostEvent = {
            type:   'sudden_death',
            score1: sorted[0].score,
            score2: sorted[1].score,
          };
          setHostMessage(hostEngine.react(suddenDeathEvent, tone));
        }
      }

      prev.current = {
        phase,
        scores:        _buildScoreMap(players),
        streaks:       _buildStreakMap(players),
        answeredCount,
        totalCells,
      };
      return;
    }

    // ── Track timeout: timer ran out (phase: question → result, lastAnswer correct=false, points=0) ──
    if (
      prevState.phase === 'question' &&
      phase === 'result' &&
      lastAnswer &&
      !lastAnswer.correct &&
      lastAnswer.points === 0 &&
      game.timer === 0
    ) {
      const player = players.find((p) => p.id === lastAnswer.playerId);
      if (player) {
        const timeoutEvent: HostEvent = {
          type:       'timeout',
          playerName: player.name,
          teamColor:  mode === 'teams' ? _getTeamColor(lastAnswer.playerId, teams) : undefined,
        };
        setHostMessage(hostEngine.react(timeoutEvent, tone));
        prev.current = {
          ...prevState,
          phase,
          scores:  _buildScoreMap(players),
          streaks: _buildStreakMap(players),
        };
        return;
      }
    }

    // ── Game over ─────────────────────────────────────────────────────────
    if (phase === 'finished' && prevState.phase !== 'finished') {
      const winner = [...players].sort((a, b) => b.score - a.score)[0];
      if (winner) {
        const gameOverEvent: HostEvent = {
          type:       'game_over',
          winnerName: winner.name,
          score:      winner.score,
        };
        setHostMessage(hostEngine.react(gameOverEvent, tone));
      }
    }

    // ── Always update phase reference ─────────────────────────────────────
    prev.current = {
      phase,
      scores:        _buildScoreMap(players),
      streaks:       _buildStreakMap(players),
      answeredCount,
      totalCells:    board.reduce((sum, row) => sum + row.length, 0),
    };
  }, [game, tone, setHostMessage, mode, teams, answeredCount]);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _buildScoreMap(players: Array<{ id: string; score: number }>): Record<string, number> {
  const map: Record<string, number> = {};
  for (const p of players) map[p.id] = p.score;
  return map;
}

function _buildStreakMap(players: Array<{ id: string; streak: number }>): Record<string, number> {
  const map: Record<string, number> = {};
  for (const p of players) map[p.id] = p.streak;
  return map;
}

function _getTeamColor(
  playerId: string,
  teams: Record<string, { playerIds: string[]; color: string }>,
): string | undefined {
  for (const team of Object.values(teams)) {
    if (team.playerIds.includes(playerId)) return team.color;
  }
  return undefined;
}
