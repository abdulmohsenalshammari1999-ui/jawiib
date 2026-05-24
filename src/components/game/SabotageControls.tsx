import { useState } from 'react';
import { useSabotage } from '@/hooks/useSabotage';
import { SABOTAGE_DEFS } from '@/lib/sabotages';
import type { Player, SabotageType } from '@/lib/types';

interface SabotageControlsProps {
  localPlayerId: string;
  opponents: Player[];
  phase: string;
}

const SELF_TYPES: SabotageType[] = ['double', 'block'];
const BETWEEN_Q_ONLY: SabotageType[] = ['bomb', 'freeze', 'scramble', 'double'];

export function SabotageControls({ localPlayerId, opponents, phase }: SabotageControlsProps) {
  const { defs, incomingEffects, hasBombActive, hasDoubleActive, isImmune, activate } =
    useSabotage(localPlayerId);
  const [selectedType, setSelectedType] = useState<SabotageType | null>(null);

  const canActivateInPhase = (type: SabotageType) => {
    if (phase === 'board') return !BETWEEN_Q_ONLY.includes(type) || SELF_TYPES.includes(type);
    return true;
  };

  const isSelf = (type: SabotageType) => SELF_TYPES.includes(type);

  const handleActivate = (type: SabotageType, targetId: string) => {
    activate(type, targetId);
    setSelectedType(null);
  };

  const handleSelfActivate = (type: SabotageType) => {
    activate(type, localPlayerId);
    setSelectedType(null);
  };

  if (defs.length === 0 && incomingEffects.length === 0) return null;

  return (
    <div className="game-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-jawwib-red font-bold text-sm flex items-center gap-1">
          💣 سلاحك
        </h3>
        {isImmune && (
          <span className="text-xs bg-jawwib-blue/20 text-jawwib-blue px-2 py-0.5 rounded-full">
            🛡️ محصّن
          </span>
        )}
      </div>

      {/* Incoming effects indicators */}
      {incomingEffects.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {hasBombActive && (
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full border border-orange-500/30">
              💣 قنبلة نشطة
            </span>
          )}
          {incomingEffects.some((e) => e.type === 'freeze') && (
            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30">
              🧊 وقت مجمّد
            </span>
          )}
          {incomingEffects.some((e) => e.type === 'scramble') && (
            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30">
              🔀 خيارات مخلوطة
            </span>
          )}
        </div>
      )}

      {hasDoubleActive && (
        <div className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-xl border border-yellow-500/30 text-center font-bold">
          ⚡ رهان نشط — اجاوب صح وتضاعف!
        </div>
      )}

      {/* Sabotage buttons */}
      {!selectedType ? (
        <div className="flex flex-wrap gap-2">
          {defs.map((def) => {
            const disabled = !canActivateInPhase(def.type);
            return (
              <button
                key={def.type}
                disabled={disabled}
                onClick={() => {
                  if (isSelf(def.type)) {
                    handleSelfActivate(def.type);
                  } else {
                    setSelectedType(def.type);
                  }
                }}
                title={def.description}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-all ${
                  disabled
                    ? 'opacity-30 cursor-not-allowed border-jawwib-border text-jawwib-text-dim'
                    : 'border-jawwib-border hover:border-jawwib-red/60 hover:bg-jawwib-red/5 text-jawwib-text'
                }`}
              >
                <span>{def.icon}</span>
                <span className={def.accentClass}>{def.name}</span>
                {(def.count ?? 0) > 1 && (
                  <span className="text-xs text-jawwib-text-dim">×{def.count}</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{SABOTAGE_DEFS[selectedType].icon}</span>
            <div>
              <p className="text-sm font-bold text-jawwib-gold">{SABOTAGE_DEFS[selectedType].name}</p>
              <p className="text-xs text-jawwib-text-dim">{SABOTAGE_DEFS[selectedType].description}</p>
            </div>
          </div>
          <p className="text-xs text-jawwib-text-dim mb-2">اختر الهدف:</p>
          <div className="flex flex-wrap gap-2">
            {opponents.map((opp) => (
              <button
                key={opp.id}
                onClick={() => handleActivate(selectedType, opp.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-jawwib-red/10 border border-jawwib-red/40
                  hover:bg-jawwib-red/20 transition-all text-sm font-bold"
              >
                <span>{opp.avatar}</span>
                <span>{opp.name}</span>
                <span className="text-jawwib-text-dim text-xs">{opp.score}</span>
              </button>
            ))}
            <button
              onClick={() => setSelectedType(null)}
              className="px-3 py-2 rounded-xl bg-jawwib-surface border border-jawwib-border text-xs text-jawwib-text-dim"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
