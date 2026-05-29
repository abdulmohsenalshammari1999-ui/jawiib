import { useState } from 'react';
import type { WeaponType, TeamId, CategoryId } from '@/lib/types';
import { categories } from '@/lib/categories';
import { useGameStore } from '@/store/gameStore';
import { audio } from '@/lib/audio';

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
  timer_bomb:      { name: 'قنبلة الوقت',    icon: '💣', color: '#EF4444', hint: 'يقطّع نص وقت الخصم على سؤاله الجاي' },
  immunity:        { name: 'درع الحصانة',    icon: '🛡️', color: '#3B82F6', hint: 'لا تخسرون نقاط إذا غلطتوا مرة' },
  forced_category: { name: 'فرض الفئة',     icon: '🎯', color: '#8B5CF6', hint: 'اختاروا للخصم الفئة الجاية' },
  ask_friend:      { name: 'اتصل بصديق',    icon: '📞', color: '#10B981', hint: '+25 ثانية على وقت سؤالكم' },
  extra_time:      { name: 'وقت إضافي',      icon: '⏱️', color: '#F59E0B', hint: '+15 ثانية على الوقت الحالي' },
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
  const [pending, setPending]     = useState<WeaponType | null>(null);

  const myWeapons     = teamWeapons[localTeamId] ?? [];
  const opponentTeam  = localTeamId === 'alpha' ? 'beta' : 'alpha';

  const myImmunity = activeImmunity[localTeamId];
  const bombOnMe   = activeBomb === localTeamId;
  const myForced   = forcedCategory?.targetTeamId === localTeamId;

  if (myWeapons.length === 0 && !myImmunity && !bombOnMe && !myForced) return null;

  const isActivatable = activeTeamId === localTeamId || phase === 'board' || phase === 'steal';

  const confirmAndActivate = (weapon: WeaponType) => {
    if (!isActivatable) return;
    setPending(weapon);
  };

  const handleConfirm = () => {
    if (!pending) return;
    // Immunity gets a distinct magical sound; extra_time gets chime; others get sparkle
    if (pending === 'immunity') audio.playImmunityActivated();
    else if (pending === 'extra_time') audio.playExtraTime();
    else audio.playWeaponActivated();

    if (pending === 'timer_bomb') {
      useWeapon(localTeamId, pending, { targetTeamId: opponentTeam });
    } else if (pending === 'forced_category') {
      setCatPicker({ weapon: pending, targetTeam: opponentTeam });
    } else {
      useWeapon(localTeamId, pending);
    }
    setPending(null);
  };

  const handleCatPick = (catId: CategoryId) => {
    if (!catPicker) return;
    useWeapon(localTeamId, catPicker.weapon, { targetTeamId: catPicker.targetTeam, categoryId: catId });
    setCatPicker(null);
  };

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

        {/* Weapon cards */}
        {myWeapons.length > 0 && (
          <div className="flex flex-col gap-2">
            {myWeapons.map((w, i) => {
              const info = WEAPON_INFO[w];
              return (
                <div
                  key={`${w}-${i}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl border transition-all"
                  style={{
                    borderColor: `${info.color}40`,
                    background:  `${info.color}0A`,
                  }}
                >
                  <span className="text-2xl shrink-0">{info.icon}</span>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-black text-sm leading-tight" style={{ color: info.color }}>{info.name}</p>
                    <p className="text-[11px] text-jawwib-text-dim leading-snug mt-0.5">{info.hint}</p>
                  </div>
                  <button
                    onClick={() => confirmAndActivate(w)}
                    disabled={!isActivatable}
                    className="shrink-0 px-3 py-2 rounded-lg font-black text-sm transition-all disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 tap-target"
                    style={{
                      background: isActivatable ? info.color : undefined,
                      color: isActivatable ? '#fff' : info.color,
                      border: `1.5px solid ${info.color}`,
                    }}
                  >
                    استخدم
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {pending && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[55] p-4">
          <div className="game-card p-5 w-full max-w-xs text-center">
            <p className="text-4xl mb-3">{WEAPON_INFO[pending].icon}</p>
            <h3 className="font-black text-lg mb-1" style={{ color: WEAPON_INFO[pending].color }}>
              {WEAPON_INFO[pending].name}
            </h3>
            <p className="text-xs text-jawwib-text-dim mb-4 leading-relaxed">{WEAPON_INFO[pending].hint}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPending(null)}
                className="flex-1 py-2.5 rounded-xl border border-jawwib-border text-jawwib-text-dim text-sm font-bold hover:border-jawwib-gold transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl font-black text-sm text-white active:scale-95 transition-all"
                style={{ background: WEAPON_INFO[pending].color }}
              >
                استخدم الآن!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category picker modal for forced_category */}
      {catPicker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[56] p-4">
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
