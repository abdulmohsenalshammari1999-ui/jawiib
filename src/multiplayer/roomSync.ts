import type { StatePatch, RoomSnapshot } from '@/lib/types';

const SNAPSHOT_GAP_THRESHOLD = 5;

type PatchHandler = (patch: StatePatch) => void;
type SnapshotHandler = (snapshot: RoomSnapshot) => void;
type SnapshotRequestFn = () => void;

export class RoomSyncManager {
  private _version = 0;
  private _pendingPatches: StatePatch[] = [];
  private _patchHandlers = new Set<PatchHandler>();
  private _snapshotHandlers = new Set<SnapshotHandler>();
  private _onSnapshotRequest: SnapshotRequestFn;

  constructor(onSnapshotRequest: SnapshotRequestFn = () => {}) {
    this._onSnapshotRequest = onSnapshotRequest;
  }

  get version(): number {
    return this._version;
  }

  onPatch(handler: PatchHandler): () => void {
    this._patchHandlers.add(handler);
    return () => this._patchHandlers.delete(handler);
  }

  onSnapshot(handler: SnapshotHandler): () => void {
    this._snapshotHandlers.add(handler);
    return () => this._snapshotHandlers.delete(handler);
  }

  receivePatch(patch: StatePatch): void {
    if (patch.version <= this._version) return; // duplicate / stale

    if (patch.version === this._version + 1) {
      this._applyPatch(patch);
      this._drainPending();
    } else {
      this._pendingPatches.push(patch);
      this._pendingPatches.sort((a, b) => a.version - b.version);
      if (patch.version > this._version + SNAPSHOT_GAP_THRESHOLD) {
        this._onSnapshotRequest();
      }
    }
  }

  receiveSnapshot(snapshot: RoomSnapshot): void {
    this._version = snapshot.version;
    this._pendingPatches = this._pendingPatches.filter((p) => p.version > snapshot.version);
    this._snapshotHandlers.forEach((h) => h(snapshot));
    this._drainPending();
  }

  reset(): void {
    this._version = 0;
    this._pendingPatches = [];
  }

  private _applyPatch(patch: StatePatch): void {
    this._version = patch.version;
    this._patchHandlers.forEach((h) => h(patch));
  }

  private _drainPending(): void {
    while (
      this._pendingPatches.length > 0 &&
      this._pendingPatches[0].version === this._version + 1
    ) {
      this._applyPatch(this._pendingPatches.shift()!);
    }
  }
}

export const roomSync = new RoomSyncManager();
