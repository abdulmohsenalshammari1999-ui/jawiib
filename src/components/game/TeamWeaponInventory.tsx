import { useState } from 'react';
import type { WeaponType, TeamId, CategoryId } from '@/lib/types';
import { categories } from '@/lib/categories';
import { useGameStore } from '@/store/gameStore';

interface Props {
  localTeamId: TeamId;
  teamWeapons: Partial<Record<TeamId, WeaponType[]>>;
  activeTeamId: TeamId | null;
  phase: string;
  forcedCategory: { targetTeamId: TeamId; categoryId: CategoryId } | null;
  activeImmunity: Partial<Record<TeamId, boolean>>;
  activeBomb: TeamId | null;
}

const WEAPON_INFO: Record<WeaponType, { name: string; icon: string; color: string; hint: string }> = {
  timer_bomb:      { name: 'قنبلة الوقت',    icon: '💣', color: '#EF4444', hint: 'يقطّع نص وقت الخصم' },
  immunity:        { name: 'درع الحصانة',    icon: '🛡️', color: '#3B82F6', hint: 'لا تخسرون نقاط إذا غلطتوا مرة' },
  forced_category: { name: 'فرض الفئة',     icon: '🎯', color: '#8B5CF6', hint: 'اختاروا للخصم الفئة الجاية' },
  ask_friend:      { name: 'اتصل بصديق',    icon: '📞', color: '#10B981', hint: '+25 ثانية على وقت سؤالكم' },
};

export function TeamWeaponInventory({
  localTeamId,
  teamWeapons,
  activeTeamId,
  phase,
  forcedCategory,
  activeImmunity,
  activeBomb,
}: Props) {
  const useWeapon    = useGameStore((s) => s.useWeapon);
  const [catPicker, setCatPicker] = useState<{ weapon: WeaponType; targetTeam: TeamId } | null>(null);

  const myWeapons     = teamWeapons[localTeamId] ?? [];
  const opponentTeam  = localTeamId === 'alpha' ? 'beta' : 'alpha';

  // Status badges
  const myImmunity  = activeImmunity[localTeamId];
  const bombOnMe    = activeBomb === localTeamId;
  const myForced    = forcedCategory?.targetTeamId === localTeamId;

  if (myWeapons.length === 0 && !myImmunity && !bombOnMe && !myForced) return null;

  const handleActivate = (weapon: WeaponType) => {
    if (weapon === 'timer_bomb') {
      useWeapon(localTeamId, weapon, { targetTeamId: opponentTeam });
    } else if (weapon === 'forced_category') {
      setCatPicker({ weapon, targetTeam: opponentTeam });
    } else {
      useWeapon(localTeamId, weapon);
    }
  };

  const handleCatPick = (catId: CategoryId) => {
    if (!catPicker) return;
    useWeapon(localTeamId, catPicker.weapon, { targetTeamId: catPicker.targetTeam, categoryId: catId });
    setCatPicker(null);
  };

  const isMyTurnToActivate = activeTeamId === localTeamId || phase === 'board';

  return (
    <>
      <div className="game-card p-3 mt-3">
        <p className="text-xs font-bold text-jawwib-gold mb-2">⚔️ أسلحتك</p>

        {/* Active effect badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {myImmunity && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 border border-blue-500/30 font-bold">
              🛡️ حصانة نشطة
            </span>
          )}
          {bombOnMe && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 border border-red-500/30 font-bold">
              💣 قنبلة وقت قادمة!
            </span>
          )}
          {myForced && forcedCategory && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 border border-purple-500/30 font-bold">
              🎯 {categories.find((c) => c.id === forcedCategory.categoryId)?.name ?? forcedCategory.categoryId} مفروضة!
            </span>
          )}
        </div>

        {/* Weapon buttons */}
        {myWeapons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {myWeapons.map((w, i) => {
              const info = WEAPON_INFO[w];
              return (
                <button
                  key={`${w}-${i}`}
                  onClick={() => handleActivate(w)}
                  disabled={!isMyTurnToActivate}
                  title={info.hint}
                  className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                  style={{
                    borderColor: `${info.color}50`,
                    background:  `${info.color}12`,
                    color:       info.color,
                  }}
                >
                  <span>{info.icon}</span>
                  <span>{info.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Category picker modal for forced_category */}
      {catPicker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[55] p-4">
          <div className="game-card p-4 w-full max-w-xs">
            <h3 className="text-sm font-bold text-center mb-3 text-jawwib-gold">
              🎯 اختر الفئة للخصم
            </h3>
            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCatPick(cat.id)}
                  className="flex items-center gap-1.5 text-xs font-bold px-2 py-2 rounded-lg border border-jawwib-border hover:border-jawwib-gold hover:text-jawwib-gold transition-all text-right"
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setCatPicker(null)}
              className="mt-2 w-full text-xs text-jawwib-text-dim hover:text-jawwib-text py-1.5"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </>
  );
}
