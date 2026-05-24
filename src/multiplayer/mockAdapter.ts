import { BaseAdapter } from './adapter';
import type { ClientEvent } from './events';
import { mockRooms, mockPlayers } from '@/mock';
import { createTeams, autoAssignTeam, applyTeamAssignment } from '@/lib/teams';
import { getQuestionById, questions } from '@/lib/questions';
import type { Team, TeamId } from '@/lib/types';

const BASE_LATENCY_MS = 40;
const TIMER_TICK_MS   = 1_000;

function delay(ms = BASE_LATENCY_MS) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export class MockAdapter extends BaseAdapter {
  private _teams: Record<TeamId, Team> = createTeams();
  private _activeQuestionId: string | null = null;
  private _timerInterval: ReturnType<typeof setInterval> | null = null;

  async connect(roomId: string, _playerId: string): Promise<void> {
    this._state = 'connecting';
    await delay(80);
    this._teams  = createTeams();
    this._state  = 'open';
    this.emitInternal({ type: 'CONNECTION_OPEN', payload: { roomId } });
  }

  disconnect(): void {
    this._stopTimer();
    this._state = 'closed';
    this.emitInternal({ type: 'CONNECTION_CLOSE', payload: { code: 1000, reason: 'manual' } });
  }

  send(event: ClientEvent): void {
    if (this._state !== 'open') return;
    this._handle(event);
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private async _handle(event: ClientEvent): Promise<void> {
    await delay();

    switch (event.type) {
      case 'CREATE_ROOM': {
        const room   = mockRooms.empty(event.payload.categories);
        const player = mockPlayers.host(event.payload.hostName);
        const teamId = autoAssignTeam(this._teams);
        this._teams  = applyTeamAssignment(this._teams, player.id, teamId);
        this.emitServer({
          type: 'ROOM_CREATED',
          payload: { roomId: room.id, code: room.code, player, teams: this._teams },
        });
        break;
      }

      case 'JOIN_ROOM': {
        const player = mockPlayers.guest(event.payload.playerName);
        const teamId = autoAssignTeam(this._teams);
        this._teams  = applyTeamAssignment(this._teams, player.id, teamId);
        this.emitServer({
          type: 'PLAYER_JOINED',
          payload: { player, teamId, teams: { ...this._teams } },
        });
        break;
      }

      case 'ASSIGN_TEAM': {
        this._teams = applyTeamAssignment(this._teams, event.payload.playerId, event.payload.teamId);
        this.emitServer({
          type: 'TEAM_ASSIGNED',
          payload: { playerId: event.payload.playerId, teamId: event.payload.teamId, teams: { ...this._teams } },
        });
        break;
      }

      case 'SELECT_QUESTION': {
        const q = getQuestionById(event.payload.questionId)
               ?? questions[Math.floor(Math.random() * questions.length)];
        this._activeQuestionId = q.id;
        const timerRemaining = 15;
        const timerServerTs  = Date.now();
        this.emitServer({
          type: 'QUESTION_SELECTED',
          payload: { question: q, activePlayerId: event.payload.playerId, timerRemaining, timerServerTs },
        });
        this._startTimer(q.id, timerRemaining);
        break;
      }

      case 'SUBMIT_ANSWER': {
        this._stopTimer();
        const q = (this._activeQuestionId ? getQuestionById(this._activeQuestionId) : null)
               ?? questions[0];
        const correct = event.payload.answerIndex === q.correctIndex;
        const timeBonus = event.payload.timeRemaining > 5 ? 25 : 0;
        const points    = correct ? q.points + timeBonus : 0;

        this.emitServer({
          type: 'ANSWER_RESULT',
          payload: {
            playerId: event.payload.playerId,
            teamId: null,
            correct,
            points,
            timeBonus,
            streakMultiplier: 1,
            updatedPlayers: [],
            updatedTeams: { ...this._teams },
            boardCell: { questionId: q.id, answered: true, answeredBy: event.payload.playerId },
          },
        });
        break;
      }

      case 'REQUEST_SYNC': {
        // Mock: emit a lightweight HOST_MESSAGE to confirm we're in sync
        this.emitServer({ type: 'HOST_MESSAGE', payload: { message: 'تمت المزامنة ✓' } });
        break;
      }

      case 'PING': {
        this.emitServer({ type: 'PONG', payload: { ts: event.payload.ts, serverTs: Date.now() } });
        break;
      }

      default:
        break;
    }
  }

  private _startTimer(questionId: string, remaining: number): void {
    this._stopTimer();
    let r = remaining;
    this._timerInterval = setInterval(async () => {
      r -= 1;
      await delay(2);
      if (r > 0) {
        this.emitServer({ type: 'TIMER_SYNC', payload: { remaining: r, serverTs: Date.now() } });
      } else {
        this._stopTimer();
        this.emitServer({ type: 'TIMER_EXPIRED', payload: { questionId } });
      }
    }, TIMER_TICK_MS);
  }

  private _stopTimer(): void {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }
}
