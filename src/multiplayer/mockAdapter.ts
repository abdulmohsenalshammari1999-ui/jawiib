import { BaseAdapter } from './adapter';
import type { ClientEvent } from './events';
import { mockRooms, mockPlayers } from '@/mock';

const LATENCY_MS = 40;

function delay(ms = LATENCY_MS) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export class MockAdapter extends BaseAdapter {
  async connect(roomId: string, _playerId: string): Promise<void> {
    this._state = 'connecting';
    await delay(60);
    this._state = 'open';
    this.emitInternal({ type: 'CONNECTION_OPEN', payload: { roomId } });
  }

  disconnect(): void {
    this._state = 'closed';
    this.emitInternal({ type: 'CONNECTION_CLOSE', payload: { code: 1000, reason: 'manual disconnect' } });
  }

  send(event: ClientEvent): void {
    if (this._state !== 'open') return;
    this.handleClientEvent(event);
  }

  private async handleClientEvent(event: ClientEvent): Promise<void> {
    await delay();
    switch (event.type) {
      case 'CREATE_ROOM': {
        const room = mockRooms.empty(event.payload.categories);
        const player = mockPlayers.host(event.payload.hostName);
        this.emitServer({
          type: 'ROOM_CREATED',
          payload: { roomId: room.id, code: room.code, player },
        });
        break;
      }
      case 'JOIN_ROOM': {
        const player = mockPlayers.guest(event.payload.playerName);
        this.emitServer({ type: 'PLAYER_JOINED', payload: { player } });
        break;
      }
      case 'PING': {
        this.emitServer({ type: 'PONG', payload: { ts: event.payload.ts, serverTs: Date.now() } });
        break;
      }
      default:
        break;
    }
  }
}
