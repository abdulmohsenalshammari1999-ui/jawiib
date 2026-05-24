import { useCallback, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSabotageStore } from '@/store/sabotageStore';
import { SABOTAGE_DEFS } from '@/lib/sabotages';
import type { SabotageType } from '@/lib/types';

export function useSabotage(playerId?: string) {
  const game          = useGameStore((s) => s.game);
  const useSabotageAct = useGameStore((s) => s.useSabotage);
  const inventories   = useSabotageStore((s) => s.inventories);
  const activeEffects = useSabotageStore((s) => s.activeEffects);
  const lastResult    = useSabotageStore((s) => s.lastResult);

  const localPlayerId = useGameStore((s) => s.localPlayerId);
  const ownerId = playerId ?? localPlayerId ?? '';

  const inventory = useMemo(() => inventories[ownerId] ?? null, [inventories, ownerId]);

  // Available sabotage types (count > 0 in engine inventory)
  const availableTypes = useMemo((): SabotageType[] => {
    if (!inventory) return [];
    return (Object.keys(inventory.available) as SabotageType[]).filter(
      (t) => (inventory.available[t] ?? 0) > 0,
    );
  }, [inventory]);

  // Effects currently active on this player (as target)
  const incomingEffects = useMemo(
    () => activeEffects.filter((e) => e.targetPlayerId === ownerId),
    [activeEffects, ownerId],
  );

  const hasFreezeActive = useMemo(
    () => incomingEffects.some((e) => e.type === 'freeze'),
    [incomingEffects],
  );

  const hasBombActive = useMemo(
    () => incomingEffects.some((e) => e.type === 'bomb'),
    [incomingEffects],
  );

  const hasDoubleActive = useMemo(
    () => activeEffects.some((e) => e.fromPlayerId === ownerId && e.type === 'double'),
    [activeEffects, ownerId],
  );

  const currentTurn = useSabotageStore((s) => s.currentTurn);
  const isImmune = useMemo(
    () => inventory != null && inventory.immunityExpiresTurn > currentTurn,
    [inventory, currentTurn],
  );

  const activate = useCallback(
    (type: SabotageType, targetId: string) => {
      if (!game || !ownerId) return;
      useSabotageAct(ownerId, type, targetId);
    },
    [game, ownerId, useSabotageAct],
  );

  // Metadata for rendering
  const defs = useMemo(
    () => availableTypes.map((t) => ({ ...SABOTAGE_DEFS[t], count: inventory?.available[t] ?? 0 })),
    [availableTypes, inventory],
  );

  return {
    availableTypes,
    defs,
    inventory,
    incomingEffects,
    hasFreezeActive,
    hasBombActive,
    hasDoubleActive,
    isImmune,
    lastResult,
    activate,
  };
}
