/**
 * Content registry — merges built-in questions with CSV-loaded content.
 * Call initCsvContent() once at app startup (safe to call multiple times).
 */
import { loadCsvContent, parseCsvContent } from './csvLoader';
import { questions } from './questions';
import { categories } from './categories';
import { globalPool } from '@/engine/questionPool';

let _initialized = false;

/** Reset the initialization flag so initCsvContent() runs again on next call. */
export function resetContentRegistry(): void {
  _initialized = false;
}

export async function initCsvContent(url?: string): Promise<void> {
  if (_initialized) return;
  _initialized = true;

  // Check for admin CSV override first
  const overrideCsv =
    typeof localStorage !== 'undefined' ? localStorage.getItem('jawib_csv_override') : null;
  const result = overrideCsv ? parseCsvContent(overrideCsv) : await loadCsvContent(url);

  if (result.loaded > 0) {
    // Merge questions: skip duplicates by ID
    const existingIds = new Set(questions.map((q) => q.id));
    const newQs = result.questions.filter((q) => !existingIds.has(q.id));
    questions.push(...newQs);

    // Merge categories: built-in definitions take precedence for existing IDs
    const existingCatIds = new Set(categories.map((c) => c.id as string));
    for (const cat of result.categories) {
      if (!existingCatIds.has(cat.id as string)) {
        (categories as unknown as Array<typeof cat>).push(cat);
        existingCatIds.add(cat.id as string);
      }
    }

    globalPool.reinitialize(questions);
  }

  // Load admin custom categories into the game
  try {
    const raw =
      typeof localStorage !== 'undefined' ? localStorage.getItem('jawib_custom_cats') : null;
    if (raw) {
      const customCats = JSON.parse(raw) as Array<{
        id: string;
        name: string;
        icon: string;
        color: string;
      }>;
      const existingCatIds = new Set(categories.map((c) => c.id as string));
      for (const cat of customCats) {
        if (cat.id && !existingCatIds.has(cat.id)) {
          (categories as unknown as typeof customCats).push(cat);
          existingCatIds.add(cat.id);
        }
      }
    }
  } catch {
    /* ignore */
  }
}
