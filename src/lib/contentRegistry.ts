/**
 * Content registry — merges built-in questions with CSV-loaded content.
 * Call initCsvContent() once at app startup (safe to call multiple times).
 */
import { loadCsvContent } from './csvLoader';
import { questions } from './questions';
import { categories } from './categories';
import { globalPool } from '@/engine/questionPool';

let _initialized = false;

export async function initCsvContent(url?: string): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  const result = await loadCsvContent(url);
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

  // Rebuild the global question pool with the extended set
  globalPool.reinitialize(questions);

  if (result.errors.length > 0) {
    console.warn('[Jawib] CSV validation errors:', result.errors);
  }
  console.info(
    `[Jawib] CSV: +${newQuestions.length} questions, ${result.skipped} skipped, ${result.errors.length} errors`
  );
}
