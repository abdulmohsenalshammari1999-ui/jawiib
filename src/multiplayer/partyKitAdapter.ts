import PartySocket from 'partysocket';
import { BaseAdapter } from './adapter';
import type { ClientEvent, ServerEvent } from './events';

/**
 * PartyKit-backed WebSocket adapter.
 *
 * Usage:
 *   const adapter = new PartyKitAdapter('your-project.username.partykit.dev', roomCode);
 *   await adapter.connect(roomCode, playerId);
 *   adapter.onServerEvent((e) => { ... });
 */
export class PartyKitAdapter extends BaseAdapter {
  private socket: PartySocket | null = null;
  private readonly host: string;
  private roomCode = '';

  constructor(host: string) {
    super();
    this.host = host;
  }

  async connect(roomCode: string, _playerId: string): Promise<void> {
    if (this.socket) this.disconnect();
    this.roomCode = roomCode;
    this._state = 'connecting';

    return new Promise((resolve, reject) => {
      const socket = new PartySocket({
        host: this.host,
        room: roomCode.toLowerCase(),
        // Reconnect settings
        maxRetries: 8,
        startClosed: false,
      });

      socket.addEventListener('open', () => {
        this._state = 'open';
        this.emitInternal({ type: 'CONNECTION_OPEN', payload: { roomId: roomCode } });
        resolve();
      });

      socket.addEventListener('close', (e) => {
        this._state = 'closed';
        this.emitInternal({
          type: 'CONNECTION_CLOSE',
          payload: { code: e.code, reason: e.reason ?? 'closed' },
        });
      });

      socket.addEventListener('error', () => {
        this._state = 'error';
        const msg = 'PartyKit connection error';
        this.emitInternal({ type: 'CONNECTION_ERROR', payload: { error: msg } });
        reject(new Error(msg));
      });

      socket.addEventListener('message', (e) => {
        try {
          const data = JSON.parse(e.data as string) as ServerEvent;
          this.emitServer(data);
        } catch { void 0; }
      });

      this.socket = socket;
    });
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this._state = 'closed';
  }

  send(event: ClientEvent): void {
    if (this._state !== 'open' || !this.socket) return;
    this.socket.send(JSON.stringify(event));
  }

  /** Send a raw multiplayer message (host sync, guest answer, etc.) */
  sendRaw(msg: Record<string, unknown>): void {
    if (this._state !== 'open' || !this.socket) return;
    this.socket.send(JSON.stringify(msg));
  }

  get currentRoom(): string {
    return this.roomCode;
  }
}
