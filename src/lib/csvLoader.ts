/**
 * CSV/Spreadsheet content loader for Jawib question bank.
 *
 * Reads from /public/questions.csv (static) or a Google Sheets CSV URL.
 * Set VITE_QUESTIONS_CSV_URL env var to override the default path.
 *
 * CSV Column order (header row required):
 *   category_id, category_name_ar, category_name_en, category_group,
 *   category_icon, difficulty_points, question_ar, question_en,
 *   option_a, option_b, option_c, option_d, correct_option,
 *   question_type, media_url, media_duration,
 *   explanation_ar, fun_fact_ar, did_you_know_ar, source,
 *   evidence_image, evidence_audio, evidence_video,
 *   evidence_title, evidence_description, active
 *
 * question_type: text | image | audio | video | math | riddle  (default: text)
 * media_duration: integer seconds (hint for audio/video clips)
 */
import type { Question, CategoryId, Evidence, QuestionType } from './types';
import type { Category } from './types';

export interface CsvValidationError {
  row: number;
  field: string;
  message: string;
}

export interface CsvLoadResult {
  questions: Question[];
  categories: Category[];
  errors: CsvValidationError[];
  skipped: number;
  loaded: number;
}

const VALID_POINTS = new Set([100, 200, 300, 400, 500, 600]);
const CORRECT_MAP: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inQuotes) {
      inQuotes = true;
    } else if (ch === '"' && inQuotes) {
      if (line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = false;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseCsvText(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] ?? '').trim(); });
    rows.push(row);
  }

  return rows;
}

export function parseCsvContent(text: string): CsvLoadResult {
  const rows = parseCsvText(text);
  const questions: Question[] = [];
  const categoryMap = new Map<string, Category>();
  const errors: CsvValidationError[] = [];
  let skipped = 0;
  let csvIdx = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-based + header offset

    // Skip inactive rows
    const activeVal = (row['active'] ?? '').toLowerCase();
    if (activeVal === 'false' || activeVal === '0' || activeVal === 'no') {
      skipped++;
      continue;
    }

    const rowErrors: CsvValidationError[] = [];

    if (!row['category_id']) rowErrors.push({ row: rowNum, field: 'category_id', message: 'مطلوب' });
    if (!row['question_ar']) rowErrors.push({ row: rowNum, field: 'question_ar', message: 'مطلوب' });
    if (!row['option_a'])    rowErrors.push({ row: rowNum, field: 'option_a', message: 'مطلوب' });
    if (!row['option_b'])    rowErrors.push({ row: rowNum, field: 'option_b', message: 'مطلوب' });
    if (!row['option_c'])    rowErrors.push({ row: rowNum, field: 'option_c', message: 'مطلوب' });
    if (!row['option_d'])    rowErrors.push({ row: rowNum, field: 'option_d', message: 'مطلوب' });

    const points = parseInt(row['difficulty_points'] ?? '100', 10);
    if (!VALID_POINTS.has(points)) {
      rowErrors.push({ row: rowNum, field: 'difficulty_points', message: 'يجب أن يكون 100 أو 200 أو 300 أو 400 أو 500 أو 600' });
    }

    const correctKey = (row['correct_option'] ?? '').toLowerCase().trim();
    if (!(correctKey in CORRECT_MAP)) {
      rowErrors.push({ row: rowNum, field: 'correct_option', message: 'يجب أن يكون a أو b أو c أو d' });
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      skipped++;
      continue;
    }

    csvIdx++;
    const tier = (points / 100) as 1 | 2 | 3 | 4 | 5 | 6;
    const categoryId = row['category_id'] as CategoryId;

    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        id: categoryId,
        name: row['category_name_ar'] || categoryId,
        icon: row['category_icon'] || '📝',
        color: '#B07D1A',
      });
    }

    const options = [row['option_a'], row['option_b'], row['option_c'], row['option_d']];
    const correctIndex = CORRECT_MAP[correctKey];

    // Multimedia fields
    const VALID_TYPES = new Set<string>(['text','image','audio','video','math','riddle','guess','scene','identify','ordering']);
    const rawType = (row['question_type'] ?? 'text').toLowerCase().trim();
    const qType: QuestionType = VALID_TYPES.has(rawType) ? rawType as QuestionType : 'text';

    // Ordering question: parse correct_order column (e.g. "a,c,b,d" or "0,2,1,3")
    let correctOrder: number[] | undefined;
    if (qType === 'ordering' && row['correct_order']) {
      const parts = row['correct_order'].split(',').map((s) => s.trim().toLowerCase());
      correctOrder = parts.map((p) => (p in CORRECT_MAP ? CORRECT_MAP[p] : parseInt(p, 10)));
    }
    const mediaUrl     = row['media_url']      || undefined;
    const mediaDurRaw  = parseInt(row['media_duration'] ?? '', 10);
    const mediaDuration = isNaN(mediaDurRaw) ? undefined : mediaDurRaw;

    // Educational reveal fields
    const explanation = row['explanation_ar'] || undefined;
    const funFact     = row['fun_fact_ar']    || undefined;
    const didYouKnow  = row['did_you_know_ar']|| undefined;
    const source      = row['source']         || undefined;

    // Evidence card
    let evidence: Evidence | undefined;
    if (row['evidence_title'] || row['evidence_description']) {
      evidence = {
        title:       row['evidence_title']       || '',
        description: row['evidence_description'] || '',
        imageUrl:    row['evidence_image']        || undefined,
        audioUrl:    row['evidence_audio']        || undefined,
        videoUrl:    row['evidence_video']        || undefined,
      };
    }

    questions.push({
      id: `${categoryId}-${tier}-csv${csvIdx}`,
      category: categoryId,
      tier,
      points:      points as 100 | 200 | 300 | 400 | 500 | 600,
      text:        row['question_ar'],
      options,
      correctIndex: qType === 'ordering' ? 0 : correctIndex,
      correctOrder,
      type:        qType,
      mediaUrl,
      mediaDuration,
      explanation,
      funFact,
      didYouKnow,
      source,
      evidence,
    });
  }

  return { questions, categories: [...categoryMap.values()], errors, skipped, loaded: questions.length };
}

export async function loadCsvContent(url?: string): Promise<CsvLoadResult> {
  const csvUrl = url
    ?? (import.meta.env['VITE_QUESTIONS_CSV_URL'] as string | undefined)
    ?? '/questions.csv';

  try {
    const res = await fetch(csvUrl);
    if (!res.ok) {
      if (res.status === 404) return { questions: [], categories: [], errors: [], skipped: 0, loaded: 0 };
      throw new Error(`HTTP ${res.status}`);
    }
    const text = await res.text();
    return parseCsvContent(text);
  } catch (err) {
    void err;
    return { questions: [], categories: [], errors: [], skipped: 0, loaded: 0 };
  }
}
