import type { Player, SabotageType } from '@/lib/types';
import { useState } from 'react';

interface SabotagePanelProps {
  currentPlayerId: string;
  players: Player[];
  availableSabotages: SabotageType[];
  onUseSabotage: (type: SabotageType, targetId: string) => void;
}

const sabotageInfo: Record<SabotageType, { name: string; icon: string; description: string }> = {
  steal: { name: 'سرقة', icon: '💰', description: 'اسرق 100 نقطة من لاعب' },
  block: { name: 'حجب', icon: '🚫', description: 'امنع لاعب من الجواب التالي' },
  halve: { name: 'تنصيف', icon: '✂️', description: 'قسّم نقاط لاعب على اثنين' },
};

export function SabotagePanel({
  currentPlayerId,
  players,
  availableSabotages,
  onUseSabotage,
}: SabotagePanelProps) {
  const [selectedType, setSelectedType] = useState<SabotageType | null>(null);
  const otherPlayers = players.filter((p) => p.id !== currentPlayerId);

  if (availableSabotages.length === 0) return null;

  return (
    <div className="game-card p-4">
      <h3 className="text-jawwib-red font-bold text-sm mb-3 flex items-center gap-2">
        💣 التخريب
      </h3>

      {!selectedType ? (
        <div className="flex gap-2 flex-wrap">
          {availableSabotages.map((type) => {
            const info = sabotageInfo[type];
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-jawwib-surface border border-jawwib-border
                  hover:border-jawwib-red/50 transition-all text-sm"
              >
                <span>{info.icon}</span>
                <span>{info.name}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <p className="text-xs text-jawwib-text-dim mb-2">
            {sabotageInfo[selectedType].description} — اختر اللاعب:
          </p>
          <div className="flex gap-2 flex-wrap">
            {otherPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => {
                  onUseSabotage(selectedType, player.id);
                  setSelectedType(null);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-jawwib-red/10 border border-jawwib-red/30
                  hover:bg-jawwib-red/20 transition-all text-sm"
              >
                <span>{player.avatar}</span>
                <span>{player.name}</span>
              </button>
            ))}
            <button
              onClick={() => setSelectedType(null)}
              className="px-3 py-2 rounded-lg bg-jawwib-surface border border-jawwib-border text-sm text-jawwib-text-dim"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
