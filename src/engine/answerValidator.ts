import type { Question } from '@/lib/types';
import { SPEED_BONUS_PTS, SPEED_BONUS_SECS } from './difficultyAdapter';

const STREAK_THRESHOLD  = 3;
const STREAK_MULTIPLIER = 1.5;

export interface ValidationInput {
  question: Question;
  /** null = timed out */
  answerIndex: number | null;
  timeRemaining: number;
  timerDuration: number;
  playerStreak: number;
  /** Optional external multiplier from DifficultyAdapter */
  pointMultiplier?: number;
}

export interface ValidationResult {
  correct: boolean;
  timedOut: boolean;
  basePoints: number;
  timeBonus: number;
  streakMultiplier: number;
  externalMultiplier: number;
  totalPoints: number;
  newStreak: number;
  /** The text of the correct answer */
  correctOptionText: string;
  /** 0–1 speed rating (1 = answered instantly) */
  speedRating: number;
}

export function validateAnswer(input: ValidationInput): ValidationResult {
  const {
    question,
    answerIndex,
    timeRemaining,
    timerDuration,
    playerStreak,
    pointMultiplier = 1,
  } = input;

  const timedOut  = answerIndex === null || timeRemaining <= 0;
  const correct   = !timedOut && answerIndex === question.correctIndex;
  const newStreak = correct ? playerStreak + 1 : 0;

  const speedRating = timerDuration > 0
    ? Math.max(0, Math.min(1, timeRemaining / timerDuration))
    : 0;

  const timeBonus           = correct && timeRemaining > SPEED_BONUS_SECS ? SPEED_BONUS_PTS : 0;
  const streakMultiplier    = newStreak >= STREAK_THRESHOLD ? STREAK_MULTIPLIER : 1;
  const externalMultiplier  = pointMultiplier;

  const basePoints  = correct ? question.points : 0;
  const totalPoints = correct
    ? Math.round((basePoints + timeBonus) * streakMultiplier * externalMultiplier)
    : 0;

  return {
    correct,
    timedOut,
    basePoints,
    timeBonus,
    streakMultiplier,
    externalMultiplier,
    totalPoints,
    newStreak,
    correctOptionText: question.options[question.correctIndex],
    speedRating,
  };
}

/** Batch-validate for analytics / replay */
export function summarizeRound(results: ValidationResult[]): {
  totalCorrect: number;
  totalWrong: number;
  totalPoints: number;
  accuracy: number;
  avgSpeed: number;
  peakStreak: number;
} {
  const totalCorrect = results.filter((r) => r.correct).length;
  const totalWrong   = results.length - totalCorrect;
  const totalPoints  = results.reduce((s, r) => s + r.totalPoints, 0);
  const accuracy     = results.length > 0 ? totalCorrect / results.length : 0;
  const avgSpeed     = results.length > 0
    ? results.reduce((s, r) => s + r.speedRating, 0) / results.length
    : 0;
  const peakStreak   = results.reduce((max, r) => Math.max(max, r.newStreak), 0);
  return { totalCorrect, totalWrong, totalPoints, accuracy, avgSpeed, peakStreak };
}
