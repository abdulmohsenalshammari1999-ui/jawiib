import { useState, useCallback } from 'react';
import { CategoryDraftManager } from '@/engine/categoryDraft';
import type { DraftState } from '@/engine/categoryDraft';
import { useRoomStore } from '@/store/roomStore';
import { useGameStore } from '@/store/gameStore';
import { categories as ALL_CATS } from '@/lib/categories';
import type { CategoryId, TeamId } from '@/lib/types';

export interface CategoryDraftHook {
  draft: DraftState | null;
  isDraftMode: boolean;
  isMyTeamsTurn: boolean;
  startDraft: (picksPerTeam?: number) => void;
  pick: (categoryId: CategoryId) => void;
  skipDraft: () => void;
  selectedCategories: CategoryId[];
  alphaCategories: CategoryId[];
  betaCategories: CategoryId[];
}

export function useCategoryDraft(): CategoryDraftHook {
  const [manager, setManager] = useState<CategoryDraftManager | null>(null);
  const [draft,   setDraft]   = useState<DraftState | null>(null);

  const mode          = useRoomStore((s) => s.mode);
  const teams         = useRoomStore((s) => s.teams);
  const localPlayerId = useGameStore((s) => s.localPlayerId);

  const localTeamId: TeamId | null = (() => {
    if (!localPlayerId) return null;
    if (teams.alpha.playerIds.includes(localPlayerId)) return 'alpha';
    if (teams.beta.playerIds.includes(localPlayerId))  return 'beta';
    return null;
  })();

  const isDraftMode    = mode === 'teams';
  const isMyTeamsTurn  = draft !== null && draft.currentTeam === localTeamId;

  const startDraft = useCallback((picksPerTeam = 3) => {
    const available = ALL_CATS.map((c) => c.id);
    const mgr = new CategoryDraftManager(available, picksPerTeam, 'snake', 'alpha');
    setManager(mgr);
    setDraft(mgr.state);
  }, []);

  const pick = useCallback((categoryId: CategoryId) => {
    if (!manager || !draft || draft.isComplete) return;
    // Host can pick for any team in local/same-device play
    const storeState = useGameStore.getState();
    const isHost = storeState.localPlayerId
      ? storeState.game?.room.hostId === storeState.localPlayerId
      : false;
    if (!isHost && draft.currentTeam !== localTeamId) return;
    try {
      const next = manager.pick(draft.currentTeam, categoryId);
      setDraft({ ...next });
    } catch {
      // invalid pick
    }
  }, [manager, draft, localTeamId]);

  const skipDraft = useCallback(() => {
    if (!manager) return;
    const completed = manager.autoComplete(localTeamId ?? 'alpha');
    setDraft({ ...completed });
  }, [manager, localTeamId]);

  return {
    draft,
    isDraftMode,
    isMyTeamsTurn,
    startDraft,
    pick,
    skipDraft,
    selectedCategories: draft?.picks.map((p) => p.categoryId) ?? [],
    alphaCategories:    draft?.teamAllotments.alpha ?? [],
    betaCategories:     draft?.teamAllotments.beta  ?? [],
  };
}
