import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@/lib/types';

const SUPABASE_URL      = import.meta.env['VITE_SUPABASE_URL']      as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined;
const PARTYKIT_HOST     = import.meta.env['VITE_PARTYKIT_HOST']     as string | undefined;

// True when at least one backend is configured
const ONLINE_CAPABLE = !!(SUPABASE_URL && SUPABASE_ANON_KEY) || !!PARTYKIT_HOST;

export type MultiplayerRole = 'host' | 'guest' | 'offline';

interface UseMultiplayerOptions {
  guestName?: string;
  guestId?: string;
  onGuestJoined?: (name: string, guestId: string) => void;
  onSnapshotReceived?: () => void;
  onGuestAnswer?: (playerId: string, answerIndex: number) => void;
  onGuestSelectQuestion?: (playerId: string, questionId: string) => void;
  onGuestDraftPick?: (categoryId: string) => void;
}

interface UseMultiplayerResult {
  role: MultiplayerRole;
  isOnline: boolean;
  onlinePlayers: number;
  sendAnswer: (answerIndex: number) => void;
  sendSelectQuestion: (questionId: string) => void;
  sendDraftPick: (categoryId: string) => void;
  sendReaction: (emoji: string) => void;
}

// ── Supabase Realtime transport ───────────────────────────────────────────────

async function createSupabaseChannel(roomCode: string) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  return supabase.channel(`jawib-${roomCode.toLowerCase()}`, {
    config: { broadcast: { self: false } }, // don't echo back to sender
  });
}

type RealtimeChannel = Awaited<ReturnType<typeof createSupabaseChannel>>;

// ── PartyKit transport ────────────────────────────────────────────────────────

async function createPartySocket(host: string, roomCode: string) {
  const PartySocket = (await import('partysocket')).default;
  return new PartySocket({ host, room: roomCode.toLowerCase(), maxRetries: 10 });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMultiplayer(
  roomCode: string | undefined,
  localPlayerId: string | undefined,
  role: MultiplayerRole,
  options: UseMultiplayerOptions = {},
): UseMultiplayerResult {
  const [isOnline, setIsOnline]           = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState(1);

  // Generic send function — swapped in once the channel is ready
  const sendRef    = useRef<((msg: Record<string, unknown>) => void) | null>(null);
  const roleRef    = useRef(role);
  const optionsRef = useRef(options);
  const snapshotDone = useRef(false);
  // Cache guest credentials so reconnect can re-announce even after
  // guestName/guestId are cleared from parent state post-join
  const cachedGuestRef = useRef<{ name: string; id: string } | null>(null);
  roleRef.current    = role;
  optionsRef.current = options;
  if (options.guestName && options.guestId && !cachedGuestRef.current) {
    cachedGuestRef.current = { name: options.guestName, id: options.guestId };
  }

  // ── Message handler (same protocol regardless of transport) ──────────────
  const handleMessage = useCallback((msg: Record<string, unknown>) => {
    switch (msg['type']) {
      case 'ROOM_SNAPSHOT':
      case 'HOST_SYNC': {
        if (roleRef.current !== 'guest' || !msg['game']) break;
        const incoming = msg['game'] as GameState;
        useGameStore.setState({ game: incoming });
        if (!snapshotDone.current) {
          const guestId = optionsRef.current.guestId;
          const confirmed = guestId
            ? incoming.room.players.some((p) => p.id === guestId)
            : true;
          if (confirmed) {
            snapshotDone.current = true;
            optionsRef.current.onSnapshotReceived?.();
          }
        }
        break;
      }
      case 'GUEST_JOIN': {
        if (roleRef.current !== 'host') break;
        const name    = msg['name']    as string | undefined;
        const guestId = msg['guestId'] as string | undefined;
        if (name && guestId) optionsRef.current.onGuestJoined?.(name, guestId);
        break;
      }
      case 'GUEST_ANSWER': {
        if (roleRef.current !== 'host') break;
        const playerId    = msg['playerId']    as string | undefined;
        const answerIndex = msg['answerIndex'] as number | undefined;
        if (playerId && answerIndex !== undefined)
          optionsRef.current.onGuestAnswer?.(playerId, answerIndex);
        break;
      }
      case 'GUEST_SELECT_QUESTION': {
        if (roleRef.current !== 'host') break;
        const playerId   = msg['playerId']   as string | undefined;
        const questionId = msg['questionId'] as string | undefined;
        if (playerId && questionId)
          optionsRef.current.onGuestSelectQuestion?.(playerId, questionId);
        break;
      }
      case 'GUEST_DRAFT_PICK': {
        if (roleRef.current !== 'host') break;
        const categoryId = msg['categoryId'] as string | undefined;
        if (categoryId) optionsRef.current.onGuestDraftPick?.(categoryId);
        break;
      }
      case 'PLAYER_COUNT':
        setOnlinePlayers(Number(msg['count']) || 1);
        break;
      default:
        break;
    }
  }, []);

  // ── Connect ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ONLINE_CAPABLE || !roomCode) return;

    let destroyed = false;
    let supaChannel: RealtimeChannel | null = null;
    let partySocket: import('partysocket').default | null = null;

    async function connect() {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        // ── Supabase Realtime ──────────────────────────────────────────────
        const ch = await createSupabaseChannel(roomCode!);
        if (destroyed) { await ch.unsubscribe(); return; }
        supaChannel = ch;

        ch.on('broadcast', { event: '*' }, ({ event, payload }) => {
          handleMessage({ type: event, ...(payload as Record<string, unknown>) });
        });

        ch.subscribe((status) => {
          if (destroyed) { void ch.unsubscribe(); return; }
          if (status === 'SUBSCRIBED') {
            setIsOnline(true);
            sendRef.current = (msg) => {
              const { type, ...payload } = msg;
              void ch.send({ type: 'broadcast', event: type as string, payload });
            };

            if (roleRef.current === 'host') {
              // Re-broadcast current state immediately so any waiting guests catch up.
              // This fires on both initial connect and reconnect after offline period.
              const currentGame = useGameStore.getState().game;
              if (currentGame) {
                void ch.send({
                  type: 'broadcast',
                  event: 'HOST_SYNC',
                  payload: { game: currentGame, playerId: localPlayerId },
                });
              }
            } else if (roleRef.current === 'guest') {
              // Announce (or re-announce after reconnect) using cached credentials
              const guest = cachedGuestRef.current
                ?? (options.guestId && options.guestName
                  ? { id: options.guestId, name: options.guestName }
                  : null);
              if (guest) {
                void ch.send({
                  type: 'broadcast',
                  event: 'GUEST_JOIN',
                  payload: { name: guest.name, guestId: guest.id, ts: Date.now() },
                });
              }
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsOnline(false);
          }
        });

      } else if (PARTYKIT_HOST) {
        // ── PartyKit fallback ──────────────────────────────────────────────
        const socket = await createPartySocket(PARTYKIT_HOST, roomCode!);
        if (destroyed) { socket.close(); return; }
        partySocket = socket;

        socket.addEventListener('open', () => {
          setIsOnline(true);
          sendRef.current = (msg) => {
            if (socket.readyState === WebSocket.OPEN)
              socket.send(JSON.stringify(msg));
          };
          if (roleRef.current === 'host') {
            const currentGame = useGameStore.getState().game;
            if (currentGame)
              socket.send(JSON.stringify({ type: 'HOST_SYNC', game: currentGame, playerId: localPlayerId }));
          } else if (roleRef.current === 'guest') {
            const guest = cachedGuestRef.current
              ?? (options.guestId && options.guestName
                ? { id: options.guestId, name: options.guestName }
                : null);
            if (guest) {
              socket.send(JSON.stringify({
                type: 'GUEST_JOIN',
                name: guest.name,
                guestId: guest.id,
                ts: Date.now(),
              }));
            }
          }
        });
        socket.addEventListener('close', () => setIsOnline(false));
        socket.addEventListener('message', (e) => {
          try { handleMessage(JSON.parse(e.data as string) as Record<string, unknown>); }
          catch { void 0; }
        });
      }
    }

    void connect();

    return () => {
      destroyed = true;
      sendRef.current = null;
      setIsOnline(false);
      snapshotDone.current = false;
      if (supaChannel) void supaChannel.unsubscribe();
      if (partySocket) partySocket.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  // ── Host: broadcast every Zustand state change ───────────────────────────
  useEffect(() => {
    if (role !== 'host' || !ONLINE_CAPABLE) return;
    const unsub = useGameStore.subscribe(
      (s) => s.game,
      (game) => {
        if (!game || !sendRef.current) return;
        sendRef.current({ type: 'HOST_SYNC', game, playerId: localPlayerId });
      },
    );
    return unsub;
  }, [role, localPlayerId]);

  // ── Guest action senders ──────────────────────────────────────────────────
  const sendAnswer = useCallback((answerIndex: number) => {
    sendRef.current?.({ type: 'GUEST_ANSWER', playerId: localPlayerId, answerIndex, ts: Date.now() });
  }, [localPlayerId]);

  const sendSelectQuestion = useCallback((questionId: string) => {
    sendRef.current?.({ type: 'GUEST_SELECT_QUESTION', playerId: localPlayerId, questionId, ts: Date.now() });
  }, [localPlayerId]);

  const sendDraftPick = useCallback((categoryId: string) => {
    sendRef.current?.({ type: 'GUEST_DRAFT_PICK', playerId: localPlayerId, categoryId, ts: Date.now() });
  }, [localPlayerId]);

  const sendReaction = useCallback((emoji: string) => {
    sendRef.current?.({ type: 'REACTION', playerId: localPlayerId, emoji, ts: Date.now() });
  }, [localPlayerId]);

  // ── Offline fallback ──────────────────────────────────────────────────────
  if (!ONLINE_CAPABLE) {
    return {
      role: 'offline',
      isOnline: false,
      onlinePlayers: 1,
      sendAnswer: () => {},
      sendSelectQuestion: () => {},
      sendDraftPick: () => {},
      sendReaction: () => {},
    };
  }

  return { role, isOnline, onlinePlayers, sendAnswer, sendSelectQuestion, sendDraftPick, sendReaction };
}
