import { useState, useEffect } from 'react';
import type { WeaponType } from '@/lib/types';

interface Props {
  teamId: 'alpha' | 'beta';
  teamName: string;
  teamColor: string;
  weapon: WeaponType;
  onCollect: () => void;
}

const WEAPON_INFO: Record<WeaponType, { name: string; icon: string; color: string; description: string }> = {
  timer_bomb:      { name: 'قنبلة الوقت',    icon: '💣', color: '#EF4444', description: 'يقطّع نص وقت الخصم على سؤاله الجاي!' },
  immunity:        { name: 'درع الحصانة',    icon: '🛡️', color: '#3B82F6', description: 'يحمي فريقك من خسارة نقاط إذا غلطتوا مرة واحدة' },
  forced_category: { name: 'فرض الفئة',     icon: '🎯', color: '#8B5CF6', description: 'تختارون للخصم من أي فئة يلزم يجاوب!' },
  ask_friend:      { name: 'اتصل بصديق',    icon: '📞', color: '#10B981', description: '+25 ثانية على وقت سؤالكم الجاي' },
};

export function MysteryBoxOverlay({ teamId, teamName, teamColor, weapon, onCollect }: Props) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const info = WEAPON_INFO[weapon];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="game-card p-6 w-full max-w-sm text-center animate-slide-in-up">
        {/* Team badge */}
        <p className="text-sm font-bold mb-3" style={{ color: teamColor }}>
          {teamId === 'alpha' ? '🛡️' : '⚔️'} {teamName}
        </p>

        <h2 className="text-xl font-black text-gold-gradient mb-4">
          صندوق الغموض!
        </h2>

        {/* Box / weapon reveal */}
        <div className="relative flex items-center justify-center mb-5" style={{ minHeight: 100 }}>
          {!revealed ? (
            <span
              className="text-7xl select-none"
              style={{ animation: 'box-shake 0.4s ease-in-out infinite alternate' }}
            >
              🎁
            </span>
          ) : (
            <div className="animate-bounce-in flex flex-col items-center gap-2">
              <span className="text-6xl">{info.icon}</span>
              <p
                className="text-lg font-black"
                style={{ color: info.color }}
              >
                {info.name}
              </p>
              <p className="text-xs text-jawwib-text-dim leading-relaxed max-w-[240px]">
                {info.description}
              </p>
            </div>
          )}
        </div>

        {revealed && (
          <button onClick={onCollect} className="btn-gold w-full animate-fade-in">
            تم! احتفظ بالسلاح ✓
          </button>
        )}

        {!revealed && (
          <p className="text-jawwib-text-dim text-xs animate-pulse-gold">جاري الكشف...</p>
        )}
      </div>

      <style>{`
        @keyframes box-shake {
          from { transform: rotate(-8deg) scale(1.05); }
          to   { transform: rotate(8deg)  scale(0.95); }
        }
      `}</style>
    </div>
  );
}
