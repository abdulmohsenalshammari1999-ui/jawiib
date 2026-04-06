import type { Player } from '@/lib/types';

interface ScoreboardProps {
  players: Player[];
  activePlayerId: string | null;
}

export function Scoreboard({ players, activePlayerId }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="game-card p-4">
      <h3 className="text-jawwib-gold font-bold text-lg mb-3 flex items-center gap-2">
        🏆 النتائج
      </h3>
      <div className="space-y-2">
        {sorted.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              player.id === activePlayerId
                ? 'bg-jawwib-gold/10 border border-jawwib-gold/30'
                : 'bg-jawwib-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-jawwib-text-dim w-6">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
              </span>
              <span className="text-xl">{player.avatar}</span>
              <div>
                <span className="font-bold text-sm">{player.name}</span>
                {player.streak >= 3 && (
                  <span className="mr-1 text-xs text-jawwib-gold">🔥×{player.streak}</span>
                )}
              </div>
            </div>
            <div className="text-left">
              <span className="text-jawwib-gold font-bold text-lg">{player.score}</span>
              <span className="text-jawwib-text-dim text-xs mr-1">نقطة</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
