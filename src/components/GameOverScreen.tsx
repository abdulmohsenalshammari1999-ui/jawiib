import type { Player } from '@/lib/types';

interface GameOverScreenProps {
  players: Player[];
  hostMessage: string;
  onPlayAgain: () => void;
}

export function GameOverScreen({ players, hostMessage, onPlayAgain }: GameOverScreenProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="animate-fade-in min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Trophy */}
        <div className="text-8xl mb-4 animate-bounce-in">🏆</div>

        <h1 className="text-3xl font-bold text-gold-gradient mb-2">انتهت اللعبة!</h1>

        {/* Winner announcement */}
        {winner && (
          <div className="game-card p-6 mb-6 animate-pulse-gold">
            <p className="text-jawwib-text-dim text-sm mb-2">الفائز</p>
            <div className="text-4xl mb-2">{winner.avatar}</div>
            <h2 className="text-2xl font-bold text-jawwib-gold mb-1">{winner.name}</h2>
            <p className="text-3xl font-bold text-jawwib-gold-light">{winner.score} نقطة</p>
          </div>
        )}

        {/* Host roast */}
        <div className="bg-jawwib-surface rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">🎙️</span>
          <p className="text-base text-right leading-relaxed">{hostMessage}</p>
        </div>

        {/* All scores */}
        <div className="game-card p-4 mb-6">
          <h3 className="text-jawwib-gold font-bold mb-3">الترتيب النهائي</h3>
          <div className="space-y-2">
            {sorted.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-xl bg-jawwib-surface"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-jawwib-text-dim">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </span>
                  <span>{player.avatar}</span>
                  <span className="font-bold text-sm">{player.name}</span>
                </div>
                <span className="text-jawwib-gold font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onPlayAgain} className="btn-gold w-full text-lg">
          العب مرة ثانية 🎮
        </button>
      </div>
    </div>
  );
}
