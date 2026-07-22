import { createServerFn } from '@tanstack/react-start';

// ── In-memory store for local review access ───────────────────────────────────
const _localStore: SurveyPayload[] = [];
const MAX_LOCAL = 200;

/** Returns a snapshot of locally stored survey submissions. */
export function _getLocalReviews(): SurveyPayload[] {
  return [..._localStore];
}

export interface SurveyPayload {
  // Auto-filled game context
  timestamp: string;
  mode: 'ffa' | 'teams';
  isTrial: boolean;
  alphaTeamName?: string;
  betaTeamName?: string;
  alphaScore?: number;
  betaScore?: number;
  questionsAnswered: number;
  categoriesPlayed: string[];

  // Survey fields
  rating: number;
  difficulty: 'easy' | 'medium' | 'hard';
  funScore: number;
  ageGroup: 'under18' | '18-25' | '26-35' | '36-50' | 'over50';
  playAgain: boolean;
  recommend: boolean;
  playerName?: string;
  comment?: string;
}

export const submitSurvey = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as SurveyPayload)
  .handler(async ({ data }) => {
    // Always save locally so admin can view reviews regardless of webhook config
    _localStore.push(data);
    if (_localStore.length > MAX_LOCAL) _localStore.splice(0, _localStore.length - MAX_LOCAL);

    const webhookUrl = process.env['SURVEY_WEBHOOK_URL'];
    if (!webhookUrl) {
      return { ok: true, stored: 'local' as const };
    }
    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return { ok: resp.ok, stored: 'remote' as const };
    } catch {
      return { ok: false, stored: 'failed' as const };
    }
  });
