import type { ReconnectSession, TeamId } from '@/lib/types';

const SESSION_KEY    = 'jawwib_session_v1';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function saveSession(session: Omit<ReconnectSession, 'savedAt'>): void {
  try {
    const full: ReconnectSession = { ...session, savedAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(full));
  } catch {
    // localStorage unavailable (SSR / private mode)
  }
}

export function loadSession(): ReconnectSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ReconnectSession;
    if (Date.now() - session.savedAt > SESSION_TTL_MS) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function updateSessionTeam(teamId: TeamId): void {
  const session = loadSession();
  if (session) saveSession({ ...session, teamId });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export function useReconnectSession(): {
  session: ReconnectSession | null;
  dismiss: () => void;
} {
  const [session, setSession] = useState<ReconnectSession | null>(null);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  const dismiss = () => {
    clearSession();
    setSession(null);
  };

  return { session, dismiss };
}
