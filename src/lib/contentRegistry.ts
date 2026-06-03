/**
 * Content registry — merges built-in questions with CSV-loaded content.
 * Call initCsvContent() once at app startup (safe to call multiple times).
 */
import { parseCsvContent, loadCsvContent } from './csvLoader';
import { getQuestionsCSV } from '@/serverFunctions/questions';
import { questions } from './questions';
import { categories } from './categories';
import { globalPool } from '@/engine/questionPool';

let _initialized = false;

export async function initCsvContent(url?: string): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  let result;

  // External URL override (VITE_QUESTIONS_CSV_URL or explicit arg) keeps original fetch path
  if (url || import.meta.env['VITE_QUESTIONS_CSV_URL']) {
    result = await loadCsvContent(url);
  } else {
    // Default: load via server function — CSV is never a public static asset
    const raw = await getQuestionsCSV().catch(() => '');
    result = raw
      ? parseCsvContent(raw)
      : { questions: [], categories: [], errors: [], skipped: 0, loaded: 0 };
  }

  if (result.loaded === 0) return;

  // Merge questions: skip duplicates by ID
  const existingIds = new Set(questions.map((q) => q.id));
  const newQuestions = result.questions.filter((q) => !existingIds.has(q.id));
  questions.push(...newQuestions);

  // Merge categories: built-in definitions take precedence for existing IDs
  const existingCatIds = new Set(categories.map((c) => c.id));
  for (const cat of result.categories) {
    if (!existingCatIds.has(cat.id)) {
      categories.push(cat);
      existingCatIds.add(cat.id);
    }
  }

  globalPool.reinitialize(questions);
}
