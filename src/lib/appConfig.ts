/**
 * App-level feature flags, seasonal themes, and localisation.
 *
 * Ramadan mode: set VITE_SEASONAL_THEME=ramadan in your .env
 * This wires up the .ramadan-mode CSS class on <body>, enabling
 * seasonal palette overrides, sound packs, and category boosts
 * without touching game logic.
 *
 * Future seasonal slots:
 *   - 'national_day'  → National Day
 *   - 'eid'           → Eid Al Fitr / Adha
 *   - 'gulf_cup'      → GCC football season
 *
 * Localisation env vars (set in .env or Netlify UI):
 *   VITE_APP_URL             — public app URL, default: jawib.app
 *   VITE_CURRENCY_LABEL      — currency symbol shown in UI, default: د.ك
 *   VITE_CURRENCY_AMOUNT     — price per full game, default: 4
 *   VITE_SUPPORT_WHATSAPP    — support WhatsApp number (e.g. 96512345678), no default
 *   VITE_PAYMENT_URL         — external payment link, no default
 *
 * Native IAP (Capacitor iOS / Android):
 *   VITE_PLATFORM            — 'ios' | 'android' | 'web' (default: 'web')
 *   VITE_REVENUECAT_API_KEY  — from RevenueCat dashboard (separate key per platform)
 *   VITE_IAP_ENTITLEMENT     — RevenueCat entitlement ID, default: 'full_game'
 */
export type SeasonalTheme = 'default' | 'ramadan' | 'national_day' | 'eid' | 'gulf_cup';
export type AppPlatform   = 'web' | 'ios' | 'android';

export const APP_CONFIG = {
  seasonalTheme:    (import.meta.env['VITE_SEASONAL_THEME'] ?? 'default') as SeasonalTheme,
  platform:         (import.meta.env['VITE_PLATFORM']       ?? 'web')     as AppPlatform,
  appUrl:           (import.meta.env['VITE_APP_URL']         as string | undefined) ?? 'jawib.app',
  currencyLabel:    (import.meta.env['VITE_CURRENCY_LABEL']  as string | undefined) ?? 'د.ك',
  currencyAmount:   (import.meta.env['VITE_CURRENCY_AMOUNT'] as string | undefined) ?? '4',
  supportWhatsApp:  (import.meta.env['VITE_SUPPORT_WHATSAPP'] as string | undefined) ?? null,
  revenueCatApiKey: (import.meta.env['VITE_REVENUECAT_API_KEY'] as string | undefined) ?? null,
  iapEntitlement:   (import.meta.env['VITE_IAP_ENTITLEMENT']   as string | undefined) ?? 'full_game',
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
