/**
 * In-App Purchase abstraction.
 *
 * Web  → opens VITE_PAYMENT_URL or WhatsApp fallback (existing behaviour).
 * iOS  → RevenueCat + StoreKit  (Apple takes 30%, you get 70%).
 * Android → RevenueCat + Google Play Billing.
 *
 * Setup checklist (one-time, done in dashboards):
 *  1. App Store Connect → In-App Purchases → create Non-Consumable
 *     Product ID: jawib_full_game   Price: your tier
 *  2. RevenueCat dashboard → create project → add iOS app → paste API key in
 *     VITE_REVENUECAT_API_KEY (iOS build env)
 *  3. RevenueCat → Entitlements → "full_game" → attach product
 *  4. RevenueCat → Offerings → Default → add Package (Lifetime) → attach product
 *  5. Set VITE_PLATFORM=ios in your Capacitor / Netlify iOS build env
 */

import { APP_CONFIG } from './appConfig';

export interface IAPProductInfo {
  productId: string;
  title: string;
  priceString: string;
  currencyCode: string;
}

export type PurchaseStatus =
  | 'idle'
  | 'loading'
  | 'purchasing'
  | 'restoring'
  | 'success'
  | 'cancelled'
  | 'error';

export interface PurchaseResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
  restored?: boolean;
}

// ── Platform detection ──────────────────────────────────────────────────────

export function isNative(): boolean {
  return APP_CONFIG.platform === 'ios' || APP_CONFIG.platform === 'android';
}

export function isIOS(): boolean {
  return APP_CONFIG.platform === 'ios';
}

// ── RevenueCat lazy initialisation ──────────────────────────────────────────

let _rcReady = false;

async function initRC(): Promise<typeof import('@revenuecat/purchases-capacitor')> {
  const rc = await import('@revenuecat/purchases-capacitor');
  if (!_rcReady && APP_CONFIG.revenueCatApiKey) {
    await rc.Purchases.configure({ apiKey: APP_CONFIG.revenueCatApiKey });
    _rcReady = true;
  }
  return rc;
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Fetch the current offering's first package price from the store. */
export async function fetchProductInfo(): Promise<IAPProductInfo | null> {
  if (!isNative()) return null;
  try {
    const rc = await initRC();
    const offerings = await rc.Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    if (!pkg) return null;
    return {
      productId:    pkg.product.identifier,
      title:        pkg.product.title,
      priceString:  pkg.product.priceString,
      currencyCode: pkg.product.currencyCode ?? '',
    };
  } catch {
    return null;
  }
}

/** Trigger purchase. On web redirects to payment URL instead. */
export async function purchaseGame(): Promise<PurchaseResult> {
  // ── Web / no IAP configured ───────────────────────────────────────────
  if (!isNative()) {
    const url = (import.meta.env['VITE_PAYMENT_URL'] as string | undefined)
      ?? (APP_CONFIG.supportWhatsApp ? `https://wa.me/${APP_CONFIG.supportWhatsApp}` : null);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    // Caller shows the "confirm after payment" step
    return { success: false, error: 'redirect' };
  }

  // ── Native IAP ────────────────────────────────────────────────────────
  try {
    const rc  = await initRC();
    const offerings = await rc.Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    if (!pkg) return { success: false, error: 'no_product' };

    const result = await rc.Purchases.purchasePackage({ aPackage: pkg });
    const unlocked = APP_CONFIG.iapEntitlement in result.customerInfo.entitlements.active;
    return { success: unlocked };
  } catch (err: unknown) {
    const e = err as { userCancelled?: boolean; message?: string };
    if (e?.userCancelled) return { success: false, cancelled: true };
    return { success: false, error: e?.message ?? 'purchase_failed' };
  }
}

/** Restore previously purchased entitlement (required by App Store guidelines). */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isNative()) return { success: false };
  try {
    const rc = await initRC();
    const { customerInfo } = await rc.Purchases.restorePurchases();
    const unlocked = APP_CONFIG.iapEntitlement in customerInfo.entitlements.active;
    return { success: unlocked, restored: true };
  } catch {
    return { success: false, error: 'restore_failed' };
  }
}

/** Check whether the entitlement is already active (for app-start gating). */
export async function checkEntitlement(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const rc = await initRC();
    const info = await rc.Purchases.getCustomerInfo();
    return APP_CONFIG.iapEntitlement in info.customerInfo.entitlements.active;
  } catch {
    return false;
  }
}
