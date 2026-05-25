import type { Question, CategoryId } from '@/lib/types';
import { questions as ALL_QUESTIONS } from '@/lib/questions';

type Tier = 1 | 2 | 3;

interface PoolStats {
  total: number;
  used: number;
  remaining: number;
}

export class QuestionPool {
  private _used = new Set<string>();
  // category → tier → shuffled question list
  private _index = new Map<CategoryId, Map<Tier, Question[]>>();

  constructor(source: Question[] = ALL_QUESTIONS) {
    for (const q of source) {
      if (!this._index.has(q.category)) this._index.set(q.category, new Map());
      const cat = this._index.get(q.category)!;
      if (!cat.has(q.tier)) cat.set(q.tier, []);
      cat.get(q.tier)!.push(q);
    }
    // Pre-shuffle each bucket so sequential draws feel random
    for (const catMap of this._index.values()) {
      for (const [tier, qs] of catMap) {
        catMap.set(tier, [...qs].sort(() => Math.random() - 0.5));
      }
    }
  }

  /** Draw one unused question from exactly this category+tier */
  draw(category: CategoryId, tier: Tier): Question | null {
    const bucket = this._index.get(category)?.get(tier) ?? [];
    const q = bucket.find((x) => !this._used.has(x.id)) ?? null;
    if (q) this._used.add(q.id);
    return q;
  }

  /**
   * Draw with tier fallback when preferred tier is exhausted.
   * Falls back: preferredTier → adjacent tiers → any unused question.
   */
  drawFallback(category: CategoryId, preferredTier: Tier): Question | null {
    const tiers: Tier[] = [preferredTier, ...([1, 2, 3] as Tier[]).filter((t) => t !== preferredTier)];
    for (const tier of tiers) {
      const q = this.draw(category, tier);
      if (q) return q;
    }
    // Last resort: any unused question from any category
    for (const catMap of this._index.values()) {
      for (const bucket of catMap.values()) {
        const q = bucket.find((x) => !this._used.has(x.id)) ?? null;
        if (q) { this._used.add(q.id); return q; }
      }
    }
    return null;
  }

  /** Draw N unique questions for a category+tier (used when building board) */
  drawN(category: CategoryId, tier: Tier, n: number): Question[] {
    const result: Question[] = [];
    for (let i = 0; i < n; i++) {
      const q = this.draw(category, tier);
      if (!q) break;
      result.push(q);
    }
    return result;
  }

  /** Mark a question as used without drawing it (e.g. when loading persisted board) */
  markUsed(questionId: string): void {
    this._used.add(questionId);
  }

  /** Release a question back into the pool (e.g. abandoned mid-question) */
  release(questionId: string): void {
    this._used.delete(questionId);
  }

  isUsed(questionId: string): boolean {
    return this._used.has(questionId);
  }

  remaining(category: CategoryId, tier: Tier): number {
    const bucket = this._index.get(category)?.get(tier) ?? [];
    return bucket.filter((q) => !this._used.has(q.id)).length;
  }

  totalRemaining(): number {
    let n = 0;
    for (const catMap of this._index.values())
      for (const bucket of catMap.values())
        n += bucket.filter((q) => !this._used.has(q.id)).length;
    return n;
  }

  stats(category: CategoryId): Record<Tier, PoolStats> {
    const result = {} as Record<Tier, PoolStats>;
    for (const tier of [1, 2, 3] as Tier[]) {
      const bucket = this._index.get(category)?.get(tier) ?? [];
      const used = bucket.filter((q) => this._used.has(q.id)).length;
      result[tier] = { total: bucket.length, used, remaining: bucket.length - used };
    }
    return result;
  }

  reset(): void {
    this._used.clear();
    // Re-shuffle on reset so repeated games feel fresh
    for (const catMap of this._index.values())
      for (const [tier, qs] of catMap)
        catMap.set(tier, [...qs].sort(() => Math.random() - 0.5));
  }
}

/** Singleton pool — reset on each new game via questionEngine.newGame() */
export const globalPool = new QuestionPool();
