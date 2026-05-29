import { createServerFn } from '@tanstack/react-start';

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
  .validator((data: unknown) => data as SurveyPayload)
  .handler(async ({ data }) => {
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
