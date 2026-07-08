import { createServerFn } from '@tanstack/react-start';

// ── Brute-force protection (in-memory per serverless instance) ────────────────
const _attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 15 * 60 * 1000; // 15 minutes

// ── Session token (HMAC-SHA256, daily rotation) ───────────────────────────────
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

export async function validateAdminToken(token: string, clientId: string): Promise<boolean> {
  return token === (await signToken(clientId));
}

// ── Exported server functions ─────────────────────────────────────────────────

/**
 * Login with username + password.
 * Credentials are read from ADMIN_USERNAME (default: admin) and ADMIN_PASSWORD env vars.
 * Returns a signed daily session token on success.
 */
export const adminLogin = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as { username: string; password: string; clientId: string })
  .handler(async ({ data }) => {
    const configUser = process.env['ADMIN_USERNAME'] ?? 'admin';
    const configPass = process.env['ADMIN_PASSWORD'];

    if (!configPass) {
      return { ok: false as const, error: 'not_configured' as const };
    }

    const now    = Date.now();
    const mapKey = data.clientId.slice(0, 64);
    const state  = _attempts.get(mapKey) ?? { count: 0, lockedUntil: 0 };

    if (state.lockedUntil > now) {
      return {
        ok:            false as const,
        error:         'locked' as const,
        retryAfterMin: Math.ceil((state.lockedUntil - now) / 60_000),
      };
    }

    const valid = data.username === configUser && data.password === configPass;

    if (valid) {
      _attempts.delete(mapKey);
      return { ok: true as const, token: await signToken(data.clientId) };
    }

    state.count++;
    const nowLocked = state.count >= MAX_ATTEMPTS;
    if (nowLocked) state.lockedUntil = now + LOCKOUT_MS;
    _attempts.set(mapKey, state);

    return {
      ok:            false as const,
      error:         nowLocked ? 'locked' as const : 'invalid' as const,
      attemptsLeft:  Math.max(0, MAX_ATTEMPTS - state.count),
      retryAfterMin: nowLocked ? 15 : undefined,
    };
  });

export const verifyAdminToken = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as { token: string; clientId: string })
  .handler(async ({ data }) => {
    return { ok: data.token === (await signToken(data.clientId)) };
  });
