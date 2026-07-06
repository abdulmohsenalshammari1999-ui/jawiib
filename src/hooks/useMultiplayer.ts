import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@/lib/types';

const PARTYKIT_HOST = import.meta.env['VITE_PARTYKIT_HOST'] as string | undefined;

export type MultiplayerRole = 'host' | 'guest' | 'offline';

interface UseMultiplayerOptions {
  /** Guest's display name — sent as GUEST_JOIN on connect */
  guestName?: string;
  /** Guest's stable player ID — same ID used on host side */
  guestId?: string;
  /** Host: called when a guest announces themselves */
  onGuestJoined?: (name: string, guestId: string) => void;
  /** Guest: called once after the guest's ID appears in game.room.players */
  onSnapshotReceived?: () => void;
  /** Host: guest relayed an answer — apply it to the game */
  onGuestAnswer?: (playerId: string, answerIndex: number) => void;
  /** Host: guest selected a board question */
  onGuestSelectQuestion?: (playerId: string, questionId: string) => void;
  /** Host: guest picked a draft category */
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

/**
 * Manages online sync when VITE_PARTYKIT_HOST is set.
 *
 * Host: subscribes to game state changes and broadcasts via PartyKit.
 * Guest: receives HOST_SYNC and patches local game state from server.
 *   On connect, guest sends GUEST_JOIN so the host can register them.
 *   Host calls onGuestJoined() which triggers addPlayer() with the same ID.
 *
 * When VITE_PARTYKIT_HOST is not set, returns offline role with no-ops.
 */
export function useMultiplayer(
  roomCode: string | undefined,
  localPlayerId: string | undefined,
  role: MultiplayerRole,
  options: UseMultiplayerOptions = {},
): UseMultiplayerResult {
  const [isOnline, setIsOnline]       = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState(1);
  const socketRef  = useRef<import('partysocket').default | null>(null);
  const roleRef    = useRef(role);
  const optionsRef = useRef(options);
  roleRef.current    = role;
  optionsRef.current = options;
  const snapshotDone = useRef(false);

  // ── Connect / disconnect ──────────────────────────────────────────────────
  useEffect(() => {
    if (!PARTYKIT_HOST || !roomCode) return;

    let socket: import('partysocket').default;

    async function connect() {
      const PartySocket = (await import('partysocket')).default;
      socket = new PartySocket({
        host: PARTYKIT_HOST!,
        room: roomCode!.toLowerCase(),
        maxRetries: 10,
      });

      socket.addEventListener('open', () => {
        setIsOnline(true);
        socketRef.current = socket;

        // Guest announces themselves immediately on connect
        if (roleRef.current === 'guest' && optionsRef.current.guestId && optionsRef.current.guestName) {
          socket.send(JSON.stringify({
            type: 'GUEST_JOIN',
            name: optionsRef.current.guestName,
            guestId: optionsRef.current.guestId,
            ts: Date.now(),
          }));
        }
      });

      socket.addEventListener('close', () => setIsOnline(false));

      socket.addEventListener('message', (e) => {
        try {
          const msg = JSON.parse(e.data as string) as Record<string, unknown>;
          handleMessage(msg);
        } catch { void 0; }
      });
    }

    void connect();

    return () => {
      socket?.close();
      socketRef.current = null;
      setIsOnline(false);
      snapshotDone.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  // ── Message handler ───────────────────────────────────────────────────────
  function handleMessage(msg: Record<string, unknown>) {
    switch (msg['type']) {
      case 'ROOM_SNAPSHOT':
      case 'HOST_SYNC': {
        if (roleRef.current === 'guest' && msg['game']) {
          const incoming = msg['game'] as GameState;
          useGameStore.setState({ game: incoming });
          // Fire once — but only after our player ID appears in the game,
          // so we know the host has processed our GUEST_JOIN.
          if (!snapshotDone.current) {
            const guestId = optionsRef.current.guestId;
            const confirmed = guestId
              ? incoming.room.players.some((p) => p.id === guestId)
              : true; // no guestId = offline spectator, fire immediately
            if (confirmed) {
              snapshotDone.current = true;
              optionsRef.current.onSnapshotReceived?.();
            }
          }
        }
        break;
      }

      case 'GUEST_JOIN': {
        if (roleRef.current === 'host') {
          const name    = msg['name'] as string | undefined;
          const guestId = msg['guestId'] as string | undefined;
          if (name && guestId) optionsRef.current.onGuestJoined?.(name, guestId);
        }
        break;
      }

      case 'GUEST_ANSWER': {
        if (roleRef.current === 'host') {
          const playerId    = msg['playerId'] as string | undefined;
          const answerIndex = msg['answerIndex'] as number | undefined;
          if (playerId && answerIndex !== undefined) {
            optionsRef.current.onGuestAnswer?.(playerId, answerIndex);
          }
        }
        break;
      }

      case 'GUEST_SELECT_QUESTION': {
        if (roleRef.current === 'host') {
          const playerId   = msg['playerId'] as string | undefined;
          const questionId = msg['questionId'] as string | undefined;
          if (playerId && questionId) {
            optionsRef.current.onGuestSelectQuestion?.(playerId, questionId);
          }
        }
        break;
      }

      case 'GUEST_DRAFT_PICK': {
        if (roleRef.current === 'host') {
          const categoryId = msg['categoryId'] as string | undefined;
          if (categoryId) optionsRef.current.onGuestDraftPick?.(categoryId);
        }
        break;
      }

      case 'PLAYER_COUNT': {
        setOnlinePlayers(Number(msg['count']) || 1);
        break;
      }

      default:
        break;
    }
  }

  // ── Host: broadcast state on every game change ─────────────────��──────────
  useEffect(() => {
    if (role !== 'host' || !PARTYKIT_HOST) return;

    const unsub = useGameStore.subscribe(
      (state) => state.game,
      (game) => {
        if (!game || !socketRef.current) return;
        const socket = socketRef.current;
        if (socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ type: 'HOST_SYNC', game, playerId: localPlayerId }));
      },
    );
    return unsub;
  }, [role, localPlayerId]);

  // ── Guest: send answer to host via relay ─────────────────────��────────────
  const sendAnswer = useCallback((answerIndex: number) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({
      type: 'GUEST_ANSWER',
      playerId: localPlayerId,
      answerIndex,
      ts: Date.now(),
    }));
  }, [localPlayerId]);

  const sendSelectQuestion = useCallback((questionId: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({
      type: 'GUEST_SELECT_QUESTION',
      playerId: localPlayerId,
      questionId,
      ts: Date.now(),
    }));
  }, [localPlayerId]);

  const sendDraftPick = useCallback((categoryId: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'GUEST_DRAFT_PICK', playerId: localPlayerId, categoryId, ts: Date.now() }));
  }, [localPlayerId]);

  const sendReaction = useCallback((emoji: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'REACTION', playerId: localPlayerId, emoji, ts: Date.now() }));
  }, [localPlayerId]);

  // ── Offline fallback ──────────────────────────────────────────────────────
  if (!PARTYKIT_HOST) {
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
