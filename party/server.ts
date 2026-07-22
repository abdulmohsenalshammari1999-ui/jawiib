import type * as Party from 'partykit/server';

interface StoredState {
  game: unknown;
  ts: number;
}

/**
 * Jawib game relay server.
 *
 * Architecture: host-relay model.
 * - The host device runs all game logic locally (Zustand stores).
 * - After each state change, the host sends HOST_SYNC to broadcast to guests.
 * - Guests receive HOST_SYNC and apply the state directly to their local store.
 * - Guest answers → GUEST_ANSWER → relayed to host → host processes.
 *
 * The server has zero game logic — it's a message relay + state snapshot store.
 */
export default class JawibGameServer implements Party.Server {
  readonly room: Party.Room;

  constructor(room: Party.Room) {
    this.room = room;
  }

  // ── Connection open ───────────────────────────────────────────────────────

  async onConnect(connection: Party.Connection, _ctx: Party.ConnectionContext) {
    // Send the latest known game snapshot so joining guests catch up immediately
    const stored = await this.room.storage.get<StoredState>('state');
    if (stored) {
      connection.send(JSON.stringify({ type: 'ROOM_SNAPSHOT', game: stored.game, ts: stored.ts }));
    }

    // Broadcast presence update to everyone
    this.room.broadcast(
      JSON.stringify({ type: 'PLAYER_COUNT', count: [...this.room.getConnections()].length }),
      []
    );
  }

  // ── Connection close ──────────────────────────────────────────────────────

  onClose(_connection: Party.Connection) {
    this.room.broadcast(
      JSON.stringify({ type: 'PLAYER_COUNT', count: [...this.room.getConnections()].length }),
      []
    );
  }

  // ── Message received ──────────────────────────────────────────────────────

  async onMessage(rawMsg: string, sender: Party.Connection) {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(rawMsg) as Record<string, unknown>;
    } catch {
      return;
    }

    switch (msg['type']) {
      case 'HOST_SYNC': {
        // Host is broadcasting its full game state — store + relay to guests
        if (msg['game']) {
          await this.room.storage.put<StoredState>('state', { game: msg['game'], ts: Date.now() });
        }
        // Relay to all clients except the sender (host)
        this.room.broadcast(rawMsg, [sender.id]);
        break;
      }

      case 'GUEST_ANSWER':
      case 'GUEST_SELECT_QUESTION':
      case 'GUEST_JOIN': {
        // Guest actions — relay to host only (host is whoever originally set the state)
        // We broadcast to all and let the host's client decide to process it
        this.room.broadcast(rawMsg, [sender.id]);
        break;
      }

      case 'CHAT':
      case 'REACTION': {
        // Social features — relay to all
        this.room.broadcast(rawMsg, [sender.id]);
        break;
      }

      default:
        // Unknown message type — relay to all (forward compatibility)
        this.room.broadcast(rawMsg, [sender.id]);
    }
  }
}
