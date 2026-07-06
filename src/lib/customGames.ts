/**
 * Custom game banks — premium feature.
 * Stored in localStorage under 'jawib_custom_games'.
 */
import type { CategoryId, QuestionType } from './types';

export interface CustomQuestion {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  points: 100 | 200 | 300 | 400 | 500 | 600;
  imageUrl?: string; // data: URI or https URL
  explanation?: string;
}

export interface CustomGame {
  id: string;
  name: string;
  description?: string;
  emoji: string;
  color: string;
  createdAt: number;
  questions: CustomQuestion[];
}

const STORAGE_KEY = 'jawib_custom_games';

export function loadCustomGames(): CustomGame[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveCustomGames(games: CustomGame[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function createCustomGame(
  name: string,
  emoji = '🎮',
  color = '#E9A23C',
  description = '',
): CustomGame {
  const game: CustomGame = {
    id: `cg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    description,
    emoji,
    color,
    createdAt: Date.now(),
    questions: [],
  };
  const all = loadCustomGames();
  saveCustomGames([...all, game]);
  return game;
}

export function updateCustomGame(updated: CustomGame): void {
  const all = loadCustomGames().map((g) => (g.id === updated.id ? updated : g));
  saveCustomGames(all);
}

export function deleteCustomGame(id: string): void {
  saveCustomGames(loadCustomGames().filter((g) => g.id !== id));
}

export function addQuestionToGame(gameId: string, q: Omit<CustomQuestion, 'id'>): CustomQuestion {
  const all = loadCustomGames();
  const game = all.find((g) => g.id === gameId);
  if (!game) throw new Error('Game not found');
  const question: CustomQuestion = {
    ...q,
    id: `cq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  game.questions = [...game.questions, question];
  saveCustomGames(all);
  return question;
}

export function removeQuestionFromGame(gameId: string, questionId: string): void {
  const all = loadCustomGames();
  const game = all.find((g) => g.id === gameId);
  if (!game) return;
  game.questions = game.questions.filter((q) => q.id !== questionId);
  saveCustomGames(all);
}

// Convert CustomGame questions → Question[] shape for the game engine
export function customGameToQuestions(game: CustomGame) {
  return game.questions.map((q) => ({
    id: q.id,
    category: 'culture' as CategoryId, // placeholder; not used in custom mode
    tier: Math.max(1, Math.min(6, q.points / 100)) as 1 | 2 | 3 | 4 | 5 | 6,
    points: q.points,
    text: q.text,
    options: q.options,
    correctIndex: q.correctIndex,
    type: (q.imageUrl ? 'image' : 'text') as QuestionType,
    mediaUrl: q.imageUrl,
    explanation: q.explanation,
  }));
}

// ── Admin image overrides ──────────────────────────────────────────────────────
// Stored separately from questions so they survive question bank reloads.
const IMG_KEY = 'jawib_admin_images';

export interface AdminImage {
  key: string;       // e.g. 'cat:sport' or 'q:some-question-id'
  dataUrl: string;
  label: string;
  uploadedAt: number;
}

export function loadAdminImages(): AdminImage[] {
  try { return JSON.parse(localStorage.getItem(IMG_KEY) ?? '[]'); } catch { return []; }
}

export function saveAdminImage(img: AdminImage): void {
  const all = loadAdminImages().filter((i) => i.key !== img.key);
  localStorage.setItem(IMG_KEY, JSON.stringify([...all, img]));
}

export function deleteAdminImage(key: string): void {
  localStorage.setItem(IMG_KEY, JSON.stringify(loadAdminImages().filter((i) => i.key !== key)));
}

export function getAdminImageForCategory(catId: string): string | null {
  return loadAdminImages().find((i) => i.key === `cat:${catId}`)?.dataUrl ?? null;
}
