import { createServerFn } from '@tanstack/react-start';

// ── Brute-force protection (in-memory per serverless instance) ────────────────
const _attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 30 * 60 * 1000; // 30 minutes

/**
 * Compute the expected PIN entirely on the server.
 *
 * Priority:
 *   1. ADMIN_PIN env var — a static password you set in Netlify dashboard.
 *      This is the recommended production approach: set it once, use it forever.
 *   2. HOTP fallback — daily rotating 6-digit code derived from ADMIN_SECRET
 *      (default: JAWIB_ADMIN_2025). The PIN is printed to the server log
 *      (Netlify Functions → logs), never to the browser console.
 *
 * Neither the secret nor the PIN ever reaches the client bundle.
 */
async function computeExpectedPin(): Promise<string> {
  const staticPin = process.env['ADMIN_PIN'];
  if (staticPin) return staticPin.trim();

  const secret  = process.env['ADMIN_SECRET'] ?? 'JAWIB_ADMIN_2025';
  const counter = Math.floor(Date.now() / 86_400_000);

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'],
  );
  const buf = new ArrayBuffer(8);
  new DataView(buf).setUint32(4, counter, false);
  const sig   = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
  const off   = sig[19]! & 0x0f;
  const code  =
    ((sig[off]!     & 0x7f) << 24) |
    ((sig[off + 1]! & 0xff) << 16) |
    ((sig[off + 2]! & 0xff) <<  8) |
    ( sig[off + 3]! & 0xff);
  const pin = String(code % 1_000_000).padStart(6, '0');

  // Server-only log — use process.stdout so drop_console:true in Terser doesn't strip it
  process.stdout.write(`[Jawib Admin] Daily PIN: ${pin}\n`);
  return pin;
}

/** Sign a short-lived session token that proves this client authenticated today. */
async function signToken(clientId: string): Promise<string> {
  const secret = process.env['ADMIN_SECRET'] ?? 'JAWIB_ADMIN_2025';
  const day    = Math.floor(Date.now() / 86_400_000);
  const enc    = new TextEncoder();
  const key    = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`admin:${clientId}:${day}`));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// ── Exported server functions ─────────────────────────────────────────────────

export const verifyAdminPin = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as { pin: string; clientId: string })
  .handler(async ({ data }) => {
    const now    = Date.now();
    const mapKey = data.clientId.slice(0, 64);
    const state  = _attempts.get(mapKey) ?? { count: 0, lockedUntil: 0 };

    if (state.lockedUntil > now) {
      return {
        ok: false as const,
        locked: true,
        retryAfterMin: Math.ceil((state.lockedUntil - now) / 60_000),
      };
    }

    const expected = await computeExpectedPin();
    const ok       = data.pin.trim() === expected;

    if (ok) {
      _attempts.delete(mapKey);
      const token = await signToken(data.clientId);
      return { ok: true as const, token };
    }

    state.count++;
    if (state.count >= MAX_ATTEMPTS) state.lockedUntil = now + LOCKOUT_MS;
    _attempts.set(mapKey, state);

    return {
      ok: false as const,
      locked: state.count >= MAX_ATTEMPTS,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - state.count),
    };
  });

export const verifyAdminToken = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as { token: string; clientId: string })
  .handler(async ({ data }) => {
    const expected = await signToken(data.clientId);
    return { ok: data.token === expected };
  });
