import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@/lib/types';

const PARTYKIT_HOST = import.meta.env['VITE_PARTYKIT_HOST'] as string | undefined;

export type MultiplayerRole = 'host' | 'guest' | 'offline';

interface UseMultiplayerResult {
  role: MultiplayerRole;
  isOnline: boolean;
  onlinePlayers: number;
  sendAnswer: (answerIndex: number) => void;
  sendSelectQuestion: (questionId: string) => void;
  sendReaction: (emoji: string) => void;
}

/**
 * Manages online sync when VITE_PARTYKIT_HOST is set.
 *
 * Host: subscribes to game state changes and broadcasts via PartyKit.
 * Guest: receives HOST_SYNC and patches local game state from server.
 *
 * When VITE_PARTYKIT_HOST is not set, returns offline role with no-ops.
 */
export function useMultiplayer(
  roomCode: string | undefined,
  localPlayerId: string | undefined,
  role: MultiplayerRole,
): UseMultiplayerResult {
  const [isOnline, setIsOnline] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState(1);
  const socketRef = useRef<import('partysocket').default | null>(null);
  const roleRef = useRef(role);
  roleRef.current = role;

  // ── Connect / disconnect ────────────────────────────────────────────────
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
      });

      socket.addEventListener('close', () => {
        setIsOnline(false);
      });

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  // ── Message handler ─────────────────────────────────────────────────────
  function handleMessage(msg: Record<string, unknown>) {
    switch (msg['type']) {
      case 'ROOM_SNAPSHOT':
      case 'HOST_SYNC': {
        // Guest receives host game state — apply it
        if (roleRef.current === 'guest' && msg['game']) {
          useGameStore.setState({ game: msg['game'] as GameState });
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

  // ── Host: broadcast state on every game change ─────────────────────────
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

  // ── Guest: send answer to host via relay ────────────────────────────────
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

  const sendReaction = useCallback((emoji: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'REACTION', playerId: localPlayerId, emoji, ts: Date.now() }));
  }, [localPlayerId]);

  // ── Offline fallback ────────────────────────────────────────────────────
  if (!PARTYKIT_HOST) {
    return {
      role: 'offline',
      isOnline: false,
      onlinePlayers: 1,
      sendAnswer: () => {},
      sendSelectQuestion: () => {},
      sendReaction: () => {},
    };
  }

  return { role, isOnline, onlinePlayers, sendAnswer, sendSelectQuestion, sendReaction };
}
