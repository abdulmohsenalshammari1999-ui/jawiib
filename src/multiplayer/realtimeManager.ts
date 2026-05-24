import type { RoomAdapter } from './adapter';
import type { ClientEvent, ServerEvent, InternalEvent } from './events';
import { MockAdapter } from './mockAdapter';
import { useUIStore } from '@/store/uiStore';

let _adapter: RoomAdapter | null = null;

function getAdapter(): RoomAdapter {
  if (!_adapter) _adapter = new MockAdapter();
  return _adapter;
}

export function setAdapter(adapter: RoomAdapter): void {
  _adapter?.disconnect();
  _adapter = adapter;
}

export async function connectRoom(roomId: string, playerId: string): Promise<void> {
  const adapter = getAdapter();
  const { setConnectionStatus } = useUIStore.getState();
  setConnectionStatus('connecting');
  try {
    await adapter.connect(roomId, playerId);
    setConnectionStatus('connected');
  } catch {
    setConnectionStatus('error');
    throw new Error('Failed to connect to room');
  }
}

export function disconnectRoom(): void {
  _adapter?.disconnect();
  _adapter = null;
  useUIStore.getState().setConnectionStatus('disconnected');
}

export function sendEvent(event: ClientEvent): void {
  getAdapter().send(event);
}

export function onServerEvent(handler: (event: ServerEvent) => void): () => void {
  return getAdapter().onServerEvent(handler);
}

export function onInternalEvent(handler: (event: InternalEvent) => void): () => void {
  return getAdapter().onInternalEvent(handler);
}
