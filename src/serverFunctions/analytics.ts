import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { getUser } from '@netlify/identity';
import { _getLocalReviews } from './survey';

// ── In-memory visit log ───────────────────────────────────────────────────────
export interface VisitEntry {
  ts:         number;
  playerName: string;
  platform:   string;
  userAgent:  string;
  country:    string;
  ip:         string;
}

const _visits: VisitEntry[] = [];
const MAX_VISITS = 500;

// ── Server functions ──────────────────────────────────────────────────────────

export const recordVisit = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data as {
    playerName: string;
    platform:   string;
    userAgent:  string;
    country?:   string;
  })
  .handler(async ({ data }) => {
    let ip = 'unknown';
    try {
      const fwd = getRequestHeader('x-forwarded-for') ?? getRequestHeader('x-nf-client-connection-ip');
      if (fwd) ip = fwd.split(',')[0]?.trim() ?? 'unknown';
    } catch {
      // headers not available (e.g. during SSR or test)
    }

    const entry: VisitEntry = {
      ts:         Date.now(),
      playerName: data.playerName,
      platform:   data.platform,
      userAgent:  data.userAgent,
      country:    data.country ?? '',
      ip,
    };

    _visits.push(entry);
    if (_visits.length > MAX_VISITS) _visits.splice(0, _visits.length - MAX_VISITS);

    return { ok: true as const };
  });

export const getVisits = createServerFn({ method: 'GET' })
  .handler(async () => {
    const user = await getUser();
    if (!user) return { ok: false as const, visits: [] as VisitEntry[] };
    return { ok: true as const, visits: [..._visits] };
  });

export const getReviews = createServerFn({ method: 'GET' })
  .handler(async () => {
    const user = await getUser();
    if (!user) return { ok: false as const, reviews: _getLocalReviews().slice(0, 0) };
    return { ok: true as const, reviews: _getLocalReviews() };
  });
