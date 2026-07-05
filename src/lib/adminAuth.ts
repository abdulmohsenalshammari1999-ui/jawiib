/**
 * Daily PIN generation for the Jawib admin dashboard.
 *
 * Algorithm: HOTP (RFC 4226) using the current day counter as the moving factor.
 *   counter = Math.floor(Date.now() / 86_400_000)  — increments once per UTC day
 *   key     = UTF-8 bytes of JAWIB_ADMIN_2025
 *
 * Web Crypto HMAC-SHA1 implementation — no external library needed.
 */

const SECRET = 'JAWIB_ADMIN_2025';

function stringToBytes(s: string): ArrayBuffer {
  return new TextEncoder().encode(s).buffer as ArrayBuffer;
}

function counterToBytes(n: number): ArrayBuffer {
  // HOTP requires an 8-byte big-endian counter
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  // JavaScript numbers are safe up to 2^53; handle as two 32-bit halves
  view.setUint32(0, Math.floor(n / 0x100000000), false);
  view.setUint32(4, n >>> 0, false);
  return buf;
}

async function hmacSha1(keyBytes: ArrayBuffer, data: ArrayBuffer): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return new Uint8Array(signature);
}

function hotpTruncate(hmacResult: Uint8Array): string {
  // Dynamic truncation per RFC 4226
  const offset = hmacResult[19] & 0x0f;
  const code =
    ((hmacResult[offset]     & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) <<  8) |
    ( hmacResult[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}

/**
 * Returns today's 6-digit admin PIN as a string (e.g. "042731").
 * The PIN changes once per UTC day.
 */
export async function getDailyPin(): Promise<string> {
  const dayCounter = Math.floor(Date.now() / 86_400_000);
  const keyBytes   = stringToBytes(SECRET);
  const counterBytes = counterToBytes(dayCounter);
  const mac = await hmacSha1(keyBytes, counterBytes);
  return hotpTruncate(mac);
}
