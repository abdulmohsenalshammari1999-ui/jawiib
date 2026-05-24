type Tier = 1 | 2 | 3;

export type DifficultyLabel = 'easy' | 'medium' | 'hard' | 'extreme';

export interface DifficultyContext {
  /** 0–1 fraction of board cells already answered */
  boardProgress: number;
  /** Current player's consecutive-correct streak */
  playerStreak: number;
  /** localTeam.score - opponent.score (negative = trailing) */
  teamScoreDelta: number;
  /** Consecutive wrongs for the current player */
  playerColdStreak: number;
  /** Is this the first question of the game? */
  isOpening: boolean;
}

export interface DifficultyProfile {
  tier: Tier;
  timeLimit: number;
  pointMultiplier: number;
  label: DifficultyLabel;
  /** Suggested display hint for the UI (e.g. progress ring color) */
  accentColor: string;
}

const HOT_STREAK_THRESHOLD  = 3;
const COLD_STREAK_THRESHOLD = 3;
const COMEBACK_DELTA        = -300;
const LATE_GAME_THRESHOLD   = 0.70;
const SPEED_BONUS_PTS       = 25;
const SPEED_BONUS_SECS      = 5;

export { SPEED_BONUS_PTS, SPEED_BONUS_SECS };

export function computeDifficulty(ctx: DifficultyContext): DifficultyProfile {
  // ── Base tier from board progress (pacing: easy → medium → hard) ──────────
  let tier: Tier;
  if (ctx.isOpening || ctx.boardProgress < 0.30) tier = 1;
  else if (ctx.boardProgress < 0.65)             tier = 2;
  else                                           tier = 3;

  // Late game always hard (tension)
  if (ctx.boardProgress >= LATE_GAME_THRESHOLD) tier = 3;

  // ── Hot-streak escalation ─────────────────────────────────────────────────
  if (ctx.playerStreak >= HOT_STREAK_THRESHOLD && tier < 3)
    tier = (tier + 1) as Tier;

  // ── Cold-streak relief ────────────────────────────────────────────────────
  if (ctx.playerColdStreak >= COLD_STREAK_THRESHOLD && tier > 1)
    tier = (tier - 1) as Tier;

  // ── Comeback mechanic: trailing by a lot → slightly easier ────────────────
  if (ctx.teamScoreDelta <= COMEBACK_DELTA && tier > 1)
    tier = (tier - 1) as Tier;

  // ── Multipliers ───────────────────────────────────────────────────────────
  const pointMultiplier =
    ctx.playerStreak >= HOT_STREAK_THRESHOLD ? 1.5
    : ctx.boardProgress >= LATE_GAME_THRESHOLD ? 1.25
    : 1.0;

  // ── Time limits: harder questions get tighter clocks ─────────────────────
  const timeLimit = tier === 1 ? 15 : tier === 2 ? 15 : 12;

  // ── Labels & colors ───────────────────────────────────────────────────────
  const label: DifficultyLabel =
    tier === 1 ? 'easy'
    : tier === 2 ? 'medium'
    : pointMultiplier >= 1.5 ? 'extreme'
    : 'hard';

  const accentColor =
    label === 'easy'    ? '#22C55E'
    : label === 'medium'  ? '#F59E0B'
    : label === 'hard'    ? '#EF4444'
    : '#8B5CF6'; // extreme = purple

  return { tier, timeLimit, pointMultiplier, label, accentColor };
}

/** Recommended tier for selecting a cell on the board */
export function recommendedTier(boardProgress: number): Tier {
  if (boardProgress < 0.30) return 1;
  if (boardProgress < 0.65) return 2;
  return 3;
}
