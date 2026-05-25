import type { ClientEvent, ServerEvent, InternalEvent } from './events';

export type ConnectionState = 'idle' | 'connecting' | 'open' | 'closing' | 'closed' | 'error';

export type EventHandler<T> = (event: T) => void;

export interface RoomAdapter {
  readonly state: ConnectionState;

  connect(roomId: string, playerId: string): Promise<void>;
  disconnect(): void;

  send(event: ClientEvent): void;

  onServerEvent(handler: EventHandler<ServerEvent>): () => void;
  onInternalEvent(handler: EventHandler<InternalEvent>): () => void;
}

export abstract class BaseAdapter implements RoomAdapter {
  protected _state: ConnectionState = 'idle';
  private serverHandlers = new Set<EventHandler<ServerEvent>>();
  private internalHandlers = new Set<EventHandler<InternalEvent>>();

  get state(): ConnectionState {
    return this._state;
  }

  abstract connect(roomId: string, playerId: string): Promise<void>;
  abstract disconnect(): void;
  abstract send(event: ClientEvent): void;

  onServerEvent(handler: EventHandler<ServerEvent>): () => void {
    this.serverHandlers.add(handler);
    return () => this.serverHandlers.delete(handler);
  }

  onInternalEvent(handler: EventHandler<InternalEvent>): () => void {
    this.internalHandlers.add(handler);
    return () => this.internalHandlers.delete(handler);
  }

  protected emitServer(event: ServerEvent): void {
    this.serverHandlers.forEach((h) => h(event));
  }

  protected emitInternal(event: InternalEvent): void {
    this.internalHandlers.forEach((h) => h(event));
  }
}
