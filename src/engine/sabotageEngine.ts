import { v4 as uuid } from 'uuid';
import type {
  SabotageType,
  TeamId,
  ActiveSabotageEffect,
  ScrambleMap,
  MysteryOutcome,
  MysteryOutcomeEffect,
  SabotageInventory,
} from '@/lib/types';
import {
  SABOTAGE_DEFS,
  initialTeamInventory,
  initialPlayerInventory,
  MIN_SCORE_FOR_HALVE,
  MIN_SCORE_FOR_STEAL,
  BOMB_DAMAGE,
  FREEZE_DURATION_SECS,
  DOUBLE_PENALTY,
  DOUBLE_MULTIPLIER,
  IMMUNITY_AFTER_HITS,
  IMMUNITY_DURATION,
  COOLDOWN_TURNS,
  EFFECT_EXPIRE_TURNS,
} from '@/lib/sabotages';

// ─── Result types ─────────────────────────────────────────────────────────────

export interface ActivationResult {
  success: boolean;
  failReason?: 'no_inventory' | 'max_uses_exceeded' | 'target_immune' | 'cooldown' | 'min_score' | 'blocked' | 'wrong_phase';
  scoreDeltas: { playerId: string; delta: number }[];
  newEffect:  ActiveSabotageEffect | null;
  scramble:   ScrambleMap | null;
  mystery:    MysteryOutcome | null;
  blockConsumed: boolean;
  hostMessage: string;
}

export interface EffectResolution {
  additionalDelta: number;
  resolvedEffectIds: string[];
  hostMessage: string | null;
}

interface ActivationParams {
  fromPlayerId: string;
  fromTeamId:   TeamId | null;
  type:         SabotageType;
  targetPlayerId: string;
  targetTeamId:   TeamId | null;
  targetScore:    number;
  currentTurn:    number;
  questionOptions?: string[];
}

// ─── Mystery box ──────────────────────────────────────────────────────────────

const MYSTERY_TABLE: Array<{ weight: number; effect: MysteryOutcomeEffect; value: number; message: string; emoji: string }> = [
  { weight: 4, effect: 'bonus_points',  value: 100, message: '+100 نقطة مجانية!',         emoji: '🎉' },
  { weight: 3, effect: 'bonus_points',  value: 200, message: '+200 نقطة! يا حظك!',        emoji: '🌟' },
  { weight: 2, effect: 'easy_next',     value: 0,   message: 'سؤالك الجاي من الطبقة الأولى!', emoji: '😊' },
  { weight: 2, effect: 'steal_random',  value: 100, message: 'سرقت 100 نقطة من الخصم!',  emoji: '🦊' },
  { weight: 2, effect: 'immunity',      value: 2,   message: 'حصانة لدورتين!',             emoji: '🛡️' },
  { weight: 2, effect: 'double_next',   value: 0,   message: 'سؤالك الجاي بضعف النقاط!', emoji: '⚡' },
  { weight: 2, effect: 'random_bomb',   value: 0,   message: 'قنبلة عشوائية على الخصم!', emoji: '💣' },
  { weight: 1, effect: 'lose_points',   value: 75,  message: 'عقوبة! خسرت 75 نقطة 😬',   emoji: '💸' },
];

function rollMystery(): typeof MYSTERY_TABLE[number] {
  const total = MYSTERY_TABLE.reduce((s, r) => s + r.weight, 0);
  let rand = Math.random() * total;
  for (const row of MYSTERY_TABLE) {
    rand -= row.weight;
    if (rand <= 0) return row;
  }
  return MYSTERY_TABLE[0];
}

// ─── Main engine ─────────────────────────────────────────────────────────────

export class SabotageEngine {
  private _inventories = new Map<string, SabotageInventory>(); // ownerId → inventory
  private _activeEffects: ActiveSabotageEffect[] = [];
  private _scrambles = new Map<string, ScrambleMap>();         // targetPlayerId → scramble
  private _currentTurn = 0;

  // ─── Setup ─────────────────────────────────────────────────────────────────

  initTeamInventories(teamIds: TeamId[]): void {
    this._inventories.clear();
    for (const id of teamIds) {
      this._inventories.set(id, {
        ownerId: id,
        available: initialTeamInventory(),
        usedThisGame: [],
        consecutiveHitsReceived: 0,
        immunityExpiresTurn: 0,
        lastUsedAgainstId: null,
        lastUsedAgainstTurn: -999,
      });
    }
  }

  initPlayerInventories(playerIds: string[]): void {
    this._inventories.clear();
    for (const id of playerIds) {
      this._inventories.set(id, {
        ownerId: id,
        available: initialPlayerInventory(),
        usedThisGame: [],
        consecutiveHitsReceived: 0,
        immunityExpiresTurn: 0,
        lastUsedAgainstId: null,
        lastUsedAgainstTurn: -999,
      });
    }
  }

  // ─── Activation ────────────────────────────────────────────────────────────

  activate(p: ActivationParams): ActivationResult {
    const def     = SABOTAGE_DEFS[p.type];
    const ownerId = p.fromTeamId ?? p.fromPlayerId;
    const inv     = this._inventories.get(ownerId);

    // Inventory check
    if (!inv || (inv.available[p.type] ?? 0) <= 0) {
      return this._fail('no_inventory', p.type);
    }

    // Max uses check
    const used = inv.usedThisGame.filter((t) => t === p.type).length;
    if (used >= def.maxPerGame) {
      return this._fail('max_uses_exceeded', p.type);
    }

    // Anti-frustration immunity check (target side)
    const targetOwnerId = p.targetTeamId ?? p.targetPlayerId;
    const targetInv     = this._inventories.get(targetOwnerId);
    if (def.isBlockable && targetInv && p.currentTurn < targetInv.immunityExpiresTurn) {
      return this._fail('target_immune', p.type);
    }

    // Cooldown check (same target too soon)
    if (inv.lastUsedAgainstId === targetOwnerId &&
        p.currentTurn - inv.lastUsedAgainstTurn <= COOLDOWN_TURNS) {
      return this._fail('cooldown', p.type);
    }

    // Min score protection
    if (p.type === 'halve' && p.targetScore < MIN_SCORE_FOR_HALVE) {
      return this._fail('min_score', p.type);
    }
    if (p.type === 'steal' && p.targetScore < MIN_SCORE_FOR_STEAL) {
      return this._fail('min_score', p.type);
    }

    // Block interception
    if (def.isBlockable && targetInv) {
      const blockCount = targetInv.available.block ?? 0;
      if (blockCount > 0) {
        targetInv.available.block = blockCount - 1;
        this._updateInventory(targetOwnerId, targetInv);
        return {
          success: false,
          failReason: 'blocked',
          scoreDeltas: [],
          newEffect: null,
          scramble: null,
          mystery: null,
          blockConsumed: true,
          hostMessage: 'الدرع اشتغل! 🛡️ التخريب اتصدّ',
        };
      }
    }

    // Consume from inventory
    inv.available[p.type] = Math.max(0, (inv.available[p.type] ?? 0) - 1);
    inv.usedThisGame.push(p.type);
    inv.lastUsedAgainstId   = targetOwnerId;
    inv.lastUsedAgainstTurn = p.currentTurn;
    this._updateInventory(ownerId, inv);

    // Record hit on target for anti-frustration tracking
    if (def.isBlockable && targetInv) {
      targetInv.consecutiveHitsReceived++;
      if (targetInv.consecutiveHitsReceived >= IMMUNITY_AFTER_HITS) {
        targetInv.immunityExpiresTurn = p.currentTurn + IMMUNITY_DURATION;
        targetInv.consecutiveHitsReceived = 0;
      }
      this._updateInventory(targetOwnerId, targetInv);
    }

    // Apply effect
    return this._applyEffect(p);
  }

  // ─── Effect resolution ─────────────────────────────────────────────────────

  /** Called after a player answers — resolves bomb and double effects */
  resolveAnswer(
    targetPlayerId: string,
    correct: boolean,
    currentTurn: number,
  ): EffectResolution {
    const relevant = this._activeEffects.filter(
      (e) => !e.resolved && e.targetPlayerId === targetPlayerId &&
             (e.type === 'bomb' || e.type === 'double'),
    );
    if (relevant.length === 0) return { additionalDelta: 0, resolvedEffectIds: [], hostMessage: null };

    let delta = 0;
    const msgs: string[] = [];
    const resolved: string[] = [];

    for (const effect of relevant) {
      effect.resolved = true;
      resolved.push(effect.id);

      if (effect.type === 'bomb' && !correct) {
        delta -= effect.data.bombDamage;
        msgs.push(`القنبلة انفجرت! -${effect.data.bombDamage} نقطة 💥`);
      }
      if (effect.type === 'double') {
        if (correct) {
          // Store the doubling — caller must apply it to points
          delta = 0; // caller handles doubling via getDoubleMultiplier()
        } else {
          delta -= effect.data.doublePenalty;
          msgs.push(`خسرت الرهان! -${effect.data.doublePenalty} نقطة 💸`);
        }
        effect.resolved = true;
      }
    }

    // Reset consecutive-hit counter on successful answer
    if (correct) {
      for (const [id, inv] of this._inventories) {
        if (inv.ownerId === targetPlayerId || id === targetPlayerId) {
          inv.consecutiveHitsReceived = 0;
          this._updateInventory(id, inv);
        }
      }
    }

    this._expireOldEffects(currentTurn);
    return { additionalDelta: delta, resolvedEffectIds: resolved, hostMessage: msgs[0] ?? null };
  }

  // ─── Queries ───────────────────────────────────────────────────────────────

  /** Returns the frozen timer duration if the player has an active freeze, or null */
  getFreezeFor(playerId: string): number | null {
    const effect = this._activeEffects.find(
      (e) => !e.resolved && e.type === 'freeze' && e.targetPlayerId === playerId,
    );
    if (!effect) return null;
    effect.resolved = true; // consume on question start
    return effect.data.frozenDuration;
  }

  getScrambleFor(playerId: string): ScrambleMap | null {
    return this._scrambles.get(playerId) ?? null;
  }

  clearScramble(playerId: string): void {
    this._scrambles.delete(playerId);
  }

  /** Returns double multiplier if active, null if not (caller applies to points) */
  getDoubleMultiplierFor(playerId: string): number | null {
    const effect = this._activeEffects.find(
      (e) => !e.resolved && e.type === 'double' && e.targetPlayerId === playerId,
    );
    return effect ? effect.data.doubleMultiplier : null;
  }

  hasDoubleActive(playerId: string): boolean {
    return this._activeEffects.some(
      (e) => !e.resolved && e.type === 'double' && e.targetPlayerId === playerId,
    );
  }

  hasBombActive(playerId: string): boolean {
    return this._activeEffects.some(
      (e) => !e.resolved && e.type === 'bomb' && e.targetPlayerId === playerId,
    );
  }

  getInventory(ownerId: string): SabotageInventory | null {
    return this._inventories.get(ownerId) ?? null;
  }

  getAllActiveEffects(): ActiveSabotageEffect[] {
    return this._activeEffects.filter((e) => !e.resolved);
  }

  // ─── Earning ───────────────────────────────────────────────────────────────

  earnSabotage(ownerId: string, type: SabotageType): void {
    const inv = this._inventories.get(ownerId);
    if (!inv) return;
    const def = SABOTAGE_DEFS[type];
    const used = inv.usedThisGame.filter((t) => t === type).length;
    const current = inv.available[type] ?? 0;
    if (current + used < def.maxPerGame) {
      inv.available[type] = current + 1;
      this._updateInventory(ownerId, inv);
    }
  }

  /** Call each turn to age out expired effects */
  advanceTurn(): void {
    this._currentTurn++;
    this._expireOldEffects(this._currentTurn);
  }

  reset(): void {
    this._inventories.clear();
    this._activeEffects = [];
    this._scrambles.clear();
    this._currentTurn = 0;
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private _applyEffect(p: ActivationParams): ActivationResult {
    const EMPTY: ActivationResult = {
      success: true, scoreDeltas: [], newEffect: null, scramble: null,
      mystery: null, blockConsumed: false, hostMessage: '',
    };

    switch (p.type) {
      case 'steal': {
        const stolen = Math.max(0, Math.floor(p.targetScore * 0.2));
        return {
          ...EMPTY,
          scoreDeltas: [
            { playerId: p.targetPlayerId, delta: -stolen },
            { playerId: p.fromPlayerId,   delta:  stolen },
          ],
          hostMessage: `سرق ${stolen} نقطة منه! 💰`,
        };
      }

      case 'halve': {
        const lost = Math.floor(p.targetScore / 2);
        return {
          ...EMPTY,
          scoreDeltas: [{ playerId: p.targetPlayerId, delta: -lost }],
          hostMessage: `قسّم نقاطه على اثنين! ✂️`,
        };
      }

      case 'block': {
        const effect = this._makeEffect(p, { expiresAfterTurns: 5 });
        this._activeEffects.push(effect);
        return { ...EMPTY, newEffect: effect, hostMessage: 'ناشط الدرع! 🛡️' };
      }

      case 'bomb': {
        const effect = this._makeEffect(p, {
          data: { bombDamage: BOMB_DAMAGE, frozenDuration: 0, doublePenalty: 0, doubleMultiplier: 1 },
        });
        this._activeEffects.push(effect);
        return {
          ...EMPTY,
          newEffect: effect,
          hostMessage: `زرع قنبلة على ${p.targetPlayerId}! 💣 إذا جاوب غلط يخسر ${BOMB_DAMAGE}`,
        };
      }

      case 'freeze': {
        const effect = this._makeEffect(p, {
          data: { bombDamage: 0, frozenDuration: FREEZE_DURATION_SECS, doublePenalty: 0, doubleMultiplier: 1 },
        });
        this._activeEffects.push(effect);
        return {
          ...EMPTY,
          newEffect: effect,
          hostMessage: `جمّد وقته! 🧊 ${FREEZE_DURATION_SECS} ثواني بس`,
        };
      }

      case 'scramble': {
        const opts = p.questionOptions ?? [];
        const shuffleMap = [...opts.keys()].sort(() => Math.random() - 0.5);
        const scramble: ScrambleMap = {
          targetPlayerId: p.targetPlayerId,
          questionId: '',  // filled when question is selected
          scrambledOptions: shuffleMap.map((i) => opts[i]),
          indexMap: shuffleMap,
        };
        this._scrambles.set(p.targetPlayerId, scramble);
        const effect = this._makeEffect(p, {});
        this._activeEffects.push(effect);
        return {
          ...EMPTY,
          newEffect: effect,
          scramble,
          hostMessage: 'خلط خياراته! 🔀 تعب يفرّق الصح',
        };
      }

      case 'double': {
        const effect = this._makeEffect(p, {
          data: { bombDamage: 0, frozenDuration: 0, doublePenalty: DOUBLE_PENALTY, doubleMultiplier: DOUBLE_MULTIPLIER },
        });
        effect.targetPlayerId = p.fromPlayerId; // self-targeted
        this._activeEffects.push(effect);
        return {
          ...EMPTY,
          newEffect: effect,
          hostMessage: `راهن على نفسه! ⚡ إجابة صح = ضعف النقاط، غلط = -${DOUBLE_PENALTY}`,
        };
      }

      case 'mystery':
        return this._applyMystery(p);

      default:
        return { ...EMPTY, success: false, failReason: 'no_inventory' };
    }
  }

  private _applyMystery(p: ActivationParams): ActivationResult {
    const roll = rollMystery();
    const EMPTY: ActivationResult = {
      success: true, scoreDeltas: [], newEffect: null, scramble: null,
      mystery: null, blockConsumed: false, hostMessage: '',
    };

    const outcome: MysteryOutcome = {
      effect: roll.effect,
      value:  roll.value,
      message: roll.message,
      emoji:   roll.emoji,
    };

    switch (roll.effect) {
      case 'bonus_points':
        return {
          ...EMPTY,
          scoreDeltas: [{ playerId: p.fromPlayerId, delta: roll.value }],
          mystery: outcome,
          hostMessage: `${roll.emoji} ${roll.message}`,
        };

      case 'lose_points':
        return {
          ...EMPTY,
          scoreDeltas: [{ playerId: p.fromPlayerId, delta: -roll.value }],
          mystery: outcome,
          hostMessage: `${roll.emoji} ${roll.message}`,
        };

      case 'steal_random': {
        outcome.targetPlayerId = p.targetPlayerId;
        return {
          ...EMPTY,
          scoreDeltas: [
            { playerId: p.targetPlayerId, delta: -roll.value },
            { playerId: p.fromPlayerId,   delta:  roll.value },
          ],
          mystery: outcome,
          hostMessage: `${roll.emoji} ${roll.message}`,
        };
      }

      case 'immunity': {
        const ownerId = p.fromTeamId ?? p.fromPlayerId;
        const inv     = this._inventories.get(ownerId);
        if (inv) {
          inv.immunityExpiresTurn = this._currentTurn + roll.value;
          this._updateInventory(ownerId, inv);
        }
        return { ...EMPTY, mystery: outcome, hostMessage: `${roll.emoji} ${roll.message}` };
      }

      case 'double_next': {
        const effect = this._makeEffect(p, {
          data: { bombDamage: 0, frozenDuration: 0, doublePenalty: DOUBLE_PENALTY, doubleMultiplier: DOUBLE_MULTIPLIER },
        });
        effect.targetPlayerId = p.fromPlayerId;
        this._activeEffects.push(effect);
        return { ...EMPTY, newEffect: effect, mystery: outcome, hostMessage: `${roll.emoji} ${roll.message}` };
      }

      case 'random_bomb': {
        const effect = this._makeEffect(p, {
          data: { bombDamage: BOMB_DAMAGE, frozenDuration: 0, doublePenalty: 0, doubleMultiplier: 1 },
        });
        this._activeEffects.push(effect);
        return { ...EMPTY, newEffect: effect, mystery: outcome, hostMessage: `${roll.emoji} ${roll.message}` };
      }

      case 'easy_next':
      default:
        // Caller handles easy_next by checking mystery outcome
        return { ...EMPTY, mystery: outcome, hostMessage: `${roll.emoji} ${roll.message}` };
    }
  }

  private _makeEffect(
    p: ActivationParams,
    overrides: Partial<Pick<ActiveSabotageEffect, 'data' | 'expiresAfterTurns'>>,
  ): ActiveSabotageEffect {
    return {
      id:             uuid(),
      type:           p.type,
      fromPlayerId:   p.fromPlayerId,
      fromTeamId:     p.fromTeamId,
      targetPlayerId: p.targetPlayerId,
      plantedTurn:    p.currentTurn,
      expiresAfterTurns: overrides.expiresAfterTurns ?? EFFECT_EXPIRE_TURNS,
      resolved:       false,
      data: overrides.data ?? { bombDamage: 0, frozenDuration: 0, doublePenalty: 0, doubleMultiplier: 1 },
    };
  }

  private _fail(reason: ActivationResult['failReason'], _type: SabotageType): ActivationResult {
    return {
      success: false,
      failReason: reason,
      scoreDeltas: [],
      newEffect: null,
      scramble: null,
      mystery: null,
      blockConsumed: false,
      hostMessage: '',
    };
  }

  private _expireOldEffects(currentTurn: number): void {
    this._activeEffects = this._activeEffects.filter(
      (e) => e.resolved || currentTurn - e.plantedTurn < e.expiresAfterTurns,
    );
  }

  private _updateInventory(id: string, inv: SabotageInventory): void {
    this._inventories.set(id, { ...inv });
  }
}

export const sabotageEngine = new SabotageEngine();
