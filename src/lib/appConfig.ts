/**
 * App-level feature flags and seasonal themes.
 *
 * Ramadan mode: set VITE_SEASONAL_THEME=ramadan in your .env
 * This wires up the .ramadan-mode CSS class on <body>, enabling
 * seasonal palette overrides, sound packs, and category boosts
 * without touching game logic.
 *
 * Future seasonal slots:
 *   - 'national_day'  → Kuwait National Day (Feb 25–26)
 *   - 'eid'           → Eid Al Fitr / Adha
 *   - 'gulf_cup'      → GCC football season
 */
export type SeasonalTheme = 'default' | 'ramadan' | 'national_day' | 'eid' | 'gulf_cup';

export const APP_CONFIG = {
  seasonalTheme: (import.meta.env['VITE_SEASONAL_THEME'] ?? 'default') as SeasonalTheme,
  /** Categories to surface first during Ramadan */
  ramadanFeaturedCategories: ['ramadan', 'quran', 'culture', 'kuwait_history'],
  /** Categories to surface first during Gulf Cup */
  gulfCupFeaturedCategories: ['gcc_football', 'sport', 'gulf', 'kuwait_celebs'],
} as const;

export function isRamadanMode(): boolean {
  return APP_CONFIG.seasonalTheme === 'ramadan';
}

export function applySeasonalBodyClass(): void {
  const { seasonalTheme } = APP_CONFIG;
  if (seasonalTheme !== 'default') {
    document.body.classList.add(`${seasonalTheme}-mode`);
  }
}
