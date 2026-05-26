/**
 * Future backend integration stubs.
 *
 * These types and placeholders map to the admin/content management system
 * described in the Cliq Techno project quotation. Nothing here is active —
 * the current build uses static in-memory data.
 *
 * When the backend is implemented:
 *  - Replace the static `categories` array with `fetchCategories()`
 *  - Replace the static `QUESTIONS` map with `fetchQuestions(filter)`
 *  - Use `AIQuestionEngine` for question generation instead of the static pool
 *  - Plug `SessionService` into the game store for persistence
 */

// ── Category management ──────────────────────────────────────────────────────

export interface AdminCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  active: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Future: fetch active categories from CMS */
// export async function fetchCategories(): Promise<AdminCategory[]> {
//   return api.get('/admin/categories?active=true');
// }

// ── Question management ──────────────────────────────────────────────────────

export interface AdminQuestion {
  id: string;
  categoryId: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  points: 100 | 200 | 300 | 400 | 500 | 600;
  textAr: string;
  textEn?: string;
  options: string[];         // 4 options, index 0 = correct
  correctIndex: number;
  active: boolean;
  usageCount: number;        // for duplicate prevention
  lastUsedAt: string | null;
  source: 'manual' | 'ai_generated' | 'imported';
  validatedBy?: string;
  createdAt: string;
}

/** Future: fetch questions with filters, pagination, and deduplication */
// export async function fetchQuestions(filter: {
//   categoryId?: string;
//   tier?: number;
//   excludeIds?: string[];   // prevent repeats in same session
//   limit?: number;
// }): Promise<AdminQuestion[]> {
//   return api.get('/admin/questions', filter);
// }

// ── AI question engine ───────────────────────────────────────────────────────

export interface AIGenerationRequest {
  categoryId: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  count: number;
  language: 'ar' | 'en' | 'both';
  existingIds: string[];     // for duplicate prevention
}

export interface AIGenerationResult {
  questions: Omit<AdminQuestion, 'id' | 'createdAt' | 'usageCount' | 'lastUsedAt'>[];
  tokensUsed: number;
  validationPassed: boolean;
  rejectedCount: number;
}

/** Future: generate questions via AI, with validation + fallback flow */
// export async function generateQuestions(req: AIGenerationRequest): Promise<AIGenerationResult> {
//   return api.post('/admin/ai/generate', req);
// }

// ── User sessions ────────────────────────────────────────────────────────────

export interface GameSession {
  sessionId: string;
  roomCode: string;
  mode: 'ffa' | 'teams';
  playerCount: number;
  categoryIds: string[];
  picksPerTeam: number;
  startedAt: string;
  endedAt: string | null;
  winnerTeamId?: string | null;
  questions: Array<{ questionId: string; answeredCorrectly: boolean; responseMs: number }>;
}

/** Future: persist game session for analytics */
// export async function createSession(session: Omit<GameSession, 'sessionId'>): Promise<{ sessionId: string }> {
//   return api.post('/sessions', session);
// }

// ── Subscription / access control ───────────────────────────────────────────

export interface SubscriptionPlan {
  id: 'trial' | 'full' | 'pro';
  nameAr: string;
  nameEn: string;
  priceKwd: number;
  questionLimit: number | null;   // null = unlimited
  sabotageEnabled: boolean;
  multiDeviceEnabled: boolean;
}

/** Future: check user subscription tier */
// export async function getSubscription(userId: string): Promise<SubscriptionPlan> {
//   return api.get(`/users/${userId}/subscription`);
// }

// ── Analytics / reports ──────────────────────────────────────────────────────

export interface CategoryStats {
  categoryId: string;
  totalQuestions: number;
  averageCorrectRate: number;
  averageResponseMs: number;
  popularityRank: number;
}

/** Future: admin dashboard metrics */
// export async function getCategoryStats(): Promise<CategoryStats[]> {
//   return api.get('/admin/reports/categories');
// }
