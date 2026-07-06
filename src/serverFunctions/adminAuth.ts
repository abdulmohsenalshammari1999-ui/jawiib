import { createServerFn } from '@tanstack/react-start';

// ── Brute-force protection (in-memory per serverless instance) ────────────────
const _attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 30 * 60 * 1000; // 30 minutes

// ── Base32 codec (RFC 4648, alphabet A–Z + 2–7) ───────────────────────────────
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input: string): Uint8Array<ArrayBuffer> {
  const s = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  const tmp: number[] = [];
  let buf = 0, bits = 0;
  for (const ch of s) {
    const v = B32.indexOf(ch);
    if (v < 0) continue;
    buf = (buf << 5) | v;
    bits += 5;
    if (bits >= 8) { bits -= 8; tmp.push((buf >> bits) & 0xff); }
  }
  const result = new Uint8Array(tmp.length);
  for (let i = 0; i < tmp.length; i++) result[i] = tmp[i]!;
  return result;
}

function base32Encode(bytes: Uint8Array): string {
  let out = '', buf = 0, bits = 0;
  for (const b of bytes) {
    buf = (buf << 8) | b;
    bits += 8;
    while (bits >= 5) { bits -= 5; out += B32[(buf >> bits) & 0x1f]; }
  }
  if (bits > 0) out += B32[(buf << (5 - bits)) & 0x1f];
  return out;
}

// ── TOTP (RFC 6238 / RFC 4226) ────────────────────────────────────────────────
async function totpCode(secret: string, step: number): Promise<string> {
  const keyBytes = base32Decode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'],
  );
  // 8-byte big-endian counter (step fits in 32 bits for decades)
  const buf = new ArrayBuffer(8);
  new DataView(buf).setUint32(4, step >>> 0, false); // high 32 bits = 0
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
  const off = sig[19]! & 0x0f;
  const n =
    ((sig[off]!     & 0x7f) << 24) |
    ((sig[off + 1]! & 0xff) << 16) |
    ((sig[off + 2]! & 0xff) <<  8) |
    ( sig[off + 3]! & 0xff);
  return String(n % 1_000_000).padStart(6, '0');
}

/** Verify token against ±1 time-step window (handles clock skew). */
async function checkTotp(secret: string, token: string): Promise<boolean> {
  const step = Math.floor(Date.now() / 30_000);
  const t = token.trim();
  for (const delta of [-1, 0, 1]) {
    if (await totpCode(secret, step + delta) === t) return true;
  }
  return false;
}

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

/** Server-side helper for other server functions to validate admin tokens. */
export async function validateAdminToken(token: string, clientId: string): Promise<boolean> {
  return token === (await signToken(clientId));
}

// ── Exported server functions ─────────────────────────────────────────────────

/**
 * Check whether ADMIN_TOTP_SECRET is configured.
 * If not, generates a candidate secret for display (caller must save it).
 */
export const getTotpSetupInfo = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as { clientId: string })
  .handler(async () => {
    if (process.env['ADMIN_TOTP_SECRET']) {
      return { needsSetup: false as const };
    }
    const bytes     = crypto.getRandomValues(new Uint8Array(20));
    const secret    = base32Encode(bytes);
    const otpauthUrl = `otpauth://totp/Jawib%20Admin?secret=${secret}&issuer=Jawib`;
    process.stdout.write(`[Jawib Admin] TOTP not configured — add env var:\n  ADMIN_TOTP_SECRET=${secret}\n`);
    return { needsSetup: true as const, secret, otpauthUrl };
  });

/**
 * Verify a 6-digit TOTP code against ADMIN_TOTP_SECRET.
 * If the env var is not set, returns { needsSetup: true } so the UI can show setup screen.
 */
export const verifyAdminPin = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as { totp: string; clientId: string })
  .handler(async ({ data }) => {
    const totpSecret = process.env['ADMIN_TOTP_SECRET'];

    if (!totpSecret) {
      const bytes    = crypto.getRandomValues(new Uint8Array(20));
      const secret   = base32Encode(bytes);
      const setupUrl = `otpauth://totp/Jawib%20Admin?secret=${secret}&issuer=Jawib`;
      process.stdout.write(`[Jawib Admin] TOTP not configured — setup URL: ${setupUrl}\n`);
      return { needsSetup: true as const, setupUrl };
    }

    const now    = Date.now();
    const mapKey = data.clientId.slice(0, 64);
    const state  = _attempts.get(mapKey) ?? { count: 0, lockedUntil: 0 };

    if (state.lockedUntil > now) {
      return {
        ok:           false as const,
        locked:       true  as const,
        attemptsLeft: 0,
        retryAfterMin: Math.ceil((state.lockedUntil - now) / 60_000),
      };
    }

    const valid = await checkTotp(totpSecret, data.totp);
    if (valid) {
      _attempts.delete(mapKey);
      return { ok: true as const, token: await signToken(data.clientId) };
    }

    state.count++;
    const nowLocked = state.count >= MAX_ATTEMPTS;
    if (nowLocked) state.lockedUntil = now + LOCKOUT_MS;
    _attempts.set(mapKey, state);

    return {
      ok:           false as const,
      locked:       nowLocked,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - state.count),
      retryAfterMin: nowLocked ? 30 : undefined,
    };
  });

export const verifyAdminToken = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as { token: string; clientId: string })
  .handler(async ({ data }) => {
    return { ok: data.token === (await signToken(data.clientId)) };
  });
