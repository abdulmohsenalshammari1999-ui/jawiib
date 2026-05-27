import type { Question, CategoryId } from '@/lib/types';
import { questions as ALL_QUESTIONS } from '@/lib/questions';

export type Tier = 1 | 2 | 3 | 4 | 5 | 6;
const ALL_TIERS: Tier[] = [1, 2, 3, 4, 5, 6];

interface PoolStats {
  total: number;
  used: number;
  remaining: number;
}

export class QuestionPool {
  private _used = new Set<string>();
  private _index = new Map<CategoryId, Map<Tier, Question[]>>();

  constructor(source: Question[] = ALL_QUESTIONS) {
    for (const q of source) {
      if (!this._index.has(q.category)) this._index.set(q.category, new Map());
      const cat = this._index.get(q.category)!;
      if (!cat.has(q.tier as Tier)) cat.set(q.tier as Tier, []);
      cat.get(q.tier as Tier)!.push(q);
    }
    for (const catMap of this._index.values()) {
      for (const [tier, qs] of catMap) {
        catMap.set(tier, [...qs].sort(() => Math.random() - 0.5));
      }
    }
  }

  draw(category: CategoryId, tier: Tier): Question | null {
    const bucket = this._index.get(category)?.get(tier) ?? [];
    const q = bucket.find((x) => !this._used.has(x.id)) ?? null;
    if (q) this._used.add(q.id);
    return q;
  }

  drawFallback(category: CategoryId, preferredTier: Tier): Question | null {
    const others = ALL_TIERS.filter((t) => t !== preferredTier);
    for (const tier of [preferredTier, ...others]) {
      const q = this.draw(category, tier);
      if (q) return q;
    }
    for (const catMap of this._index.values()) {
      for (const bucket of catMap.values()) {
        const q = bucket.find((x) => !this._used.has(x.id)) ?? null;
        if (q) { this._used.add(q.id); return q; }
      }
    }
    return null;
  }

  drawN(category: CategoryId, tier: Tier, n: number): Question[] {
    const result: Question[] = [];
    for (let i = 0; i < n; i++) {
      const q = this.draw(category, tier);
      if (!q) break;
      result.push(q);
    }
    return result;
  }

  markUsed(questionId: string): void { this._used.add(questionId); }
  release(questionId: string): void  { this._used.delete(questionId); }
  isUsed(questionId: string): boolean { return this._used.has(questionId); }

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
    for (const tier of ALL_TIERS) {
      const bucket = this._index.get(category)?.get(tier) ?? [];
      const used = bucket.filter((q) => this._used.has(q.id)).length;
      result[tier] = { total: bucket.length, used, remaining: bucket.length - used };
    }
    return result;
  }

  reset(): void {
    this._used.clear();
    for (const catMap of this._index.values())
      for (const [tier, qs] of catMap)
        catMap.set(tier, [...qs].sort(() => Math.random() - 0.5));
  }

  reinitialize(source: Question[]): void {
    this._used.clear();
    this._index.clear();
    for (const q of source) {
      if (!this._index.has(q.category)) this._index.set(q.category, new Map());
      const cat = this._index.get(q.category)!;
      if (!cat.has(q.tier as Tier)) cat.set(q.tier as Tier, []);
      cat.get(q.tier as Tier)!.push(q);
    }
    for (const catMap of this._index.values())
      for (const [tier, qs] of catMap)
        catMap.set(tier, [...qs].sort(() => Math.random() - 0.5));
  }
}

export const globalPool = new QuestionPool();
