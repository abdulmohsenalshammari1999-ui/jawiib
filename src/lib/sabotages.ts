import type { SabotageType } from './types';

export interface SabotageDef {
  type: SabotageType;
  name: string;
  icon: string;
  description: string;
  /** Who can be targeted */
  target: 'opponent' | 'self' | 'any';
  /** When it can be activated */
  timing: 'anytime' | 'between_questions' | 'before_answer';
  /** Max activations per game per team/player */
  maxPerGame: number;
  /** Starting count in inventory */
  initialCount: number;
  isSelfEffect: boolean;
  /** Can it be blocked by the block sabotage? */
  isBlockable: boolean;
  accentClass: string;
}

export const SABOTAGE_DEFS: Record<SabotageType, SabotageDef> = {
  steal: {
    type: 'steal',
    name: 'سرقة',
    icon: '💰',
    description: 'اسرق 20% من نقاط الخصم',
    target: 'opponent',
    timing: 'anytime',
    maxPerGame: 1,
    initialCount: 1,
    isSelfEffect: false,
    isBlockable: true,
    accentClass: 'text-yellow-400',
  },
  block: {
    type: 'block',
    name: 'درع',
    icon: '🛡️',
    description: 'يدفع التخريب القادم ضدك',
    target: 'self',
    timing: 'anytime',
    maxPerGame: 2,
    initialCount: 1,
    isSelfEffect: true,
    isBlockable: false,
    accentClass: 'text-blue-400',
  },
  halve: {
    type: 'halve',
    name: 'تنصيف',
    icon: '✂️',
    description: 'قسّم نقاط الخصم على اثنين',
    target: 'opponent',
    timing: 'anytime',
    maxPerGame: 1,
    initialCount: 1,
    isSelfEffect: false,
    isBlockable: true,
    accentClass: 'text-red-400',
  },
  bomb: {
    type: 'bomb',
    name: 'قنبلة',
    icon: '💣',
    description: 'إذا الخصم جاوب غلط يخسر 150 نقطة إضافية',
    target: 'opponent',
    timing: 'between_questions',
    maxPerGame: 2,
    initialCount: 1,
    isSelfEffect: false,
    isBlockable: true,
    accentClass: 'text-orange-400',
  },
  freeze: {
    type: 'freeze',
    name: 'تجميد',
    icon: '🧊',
    description: 'وقت الخصم يصير 8 ثواني بدل 15',
    target: 'opponent',
    timing: 'between_questions',
    maxPerGame: 2,
    initialCount: 1,
    isSelfEffect: false,
    isBlockable: true,
    accentClass: 'text-cyan-400',
  },
  scramble: {
    type: 'scramble',
    name: 'خلط',
    icon: '🔀',
    description: 'خيارات الإجابة تتخلط على الخصم',
    target: 'opponent',
    timing: 'between_questions',
    maxPerGame: 2,
    initialCount: 1,
    isSelfEffect: false,
    isBlockable: true,
    accentClass: 'text-purple-400',
  },
  double: {
    type: 'double',
    name: 'رهان',
    icon: '⚡',
    description: 'إجابة صح = ضعف النقاط، خطأ = -75 نقطة',
    target: 'self',
    timing: 'between_questions',
    maxPerGame: 1,
    initialCount: 1,
    isSelfEffect: true,
    isBlockable: false,
    accentClass: 'text-yellow-300',
  },
  mystery: {
    type: 'mystery',
    name: 'صندوق',
    icon: '🎁',
    description: 'مفاجأة عشوائية — زينة أو شينة!',
    target: 'any',
    timing: 'anytime',
    maxPerGame: 2,
    initialCount: 1,
    isSelfEffect: false,
    isBlockable: false,
    accentClass: 'text-pink-400',
  },
};

export const ALL_SABOTAGE_TYPES = Object.keys(SABOTAGE_DEFS) as SabotageType[];
export const ATTACK_TYPES: SabotageType[] = ['steal', 'halve', 'bomb', 'freeze', 'scramble'];
export const DEFENSE_TYPES: SabotageType[] = ['block'];
export const SELF_TYPES: SabotageType[] = ['double', 'mystery'];

/** Initial inventory for a team (team mode) */
export function initialTeamInventory(): Partial<Record<SabotageType, number>> {
  return { steal: 1, block: 1, halve: 1, bomb: 1, freeze: 1, scramble: 1, double: 1, mystery: 1 };
}

/** Initial inventory for a player (FFA mode) */
export function initialPlayerInventory(): Partial<Record<SabotageType, number>> {
  return { steal: 1, block: 1, halve: 1, bomb: 1, freeze: 1, scramble: 1, double: 1, mystery: 1 };
}

/** Minimum target score to allow halve / steal (anti-frustration) */
export const MIN_SCORE_FOR_HALVE  = 100;
export const MIN_SCORE_FOR_STEAL  = 50;
export const BOMB_DAMAGE          = 150;
export const FREEZE_DURATION_SECS = 8;
export const DOUBLE_PENALTY       = 75;
export const DOUBLE_MULTIPLIER    = 2;
export const IMMUNITY_AFTER_HITS  = 3; // consecutive hits → immune
export const IMMUNITY_DURATION    = 2; // turns of immunity
export const COOLDOWN_TURNS       = 1; // turns before can re-target same team
export const EFFECT_EXPIRE_TURNS  = 3; // auto-expire after N unanswered turns
