import type { GameState } from '@/lib/types';

interface ResultOverlayProps {
  lastAnswer: NonNullable<GameState['lastAnswer']>;
  currentQuestion: NonNullable<GameState['currentQuestion']>;
  hostMessage: string;
  onContinue: () => void;
  playerName?: string;
  teamColor?: string;
}

export function ResultOverlay({
  lastAnswer,
  currentQuestion,
  hostMessage,
  onContinue,
  playerName,
  teamColor,
}: ResultOverlayProps) {
  const correctAnswer = currentQuestion.options[currentQuestion.correctIndex];
  const isCorrect     = lastAnswer.correct;
  const isBig         = Math.abs(lastAnswer.points) >= 400;
  const isMedium      = Math.abs(lastAnswer.points) >= 200;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="game-card p-6 w-full max-w-sm animate-slide-in-up">
        {/* Result icon */}
        <div className={`text-center mb-4 ${isBig ? 'animate-bounce-in' : 'animate-fade-in'}`}>
          <div className={`text-6xl mb-2 ${isBig ? 'animate-bounce-in' : ''}`}>
            {isCorrect ? (isBig ? '🔥' : isMedium ? '⭐' : '✅') : '❌'}
          </div>
          {playerName && (
            <p className="text-sm font-bold" style={teamColor ? { color: teamColor } : undefined}>
              {playerName}
            </p>
          )}
        </div>

        <h2
          className={`text-xl font-black text-center mb-3 ${
            isCorrect ? 'text-jawwib-green' : 'text-jawwib-red'
          }`}
        >
          {isCorrect ? (isBig ? 'ممتاز! 🎉' : 'إجابة صحيحة!') : 'إجابة خاطئة!'}
        </h2>

        {!isCorrect && (
          <div className="bg-jawwib-green/8 border border-jawwib-green/25 rounded-xl p-3 mb-3 text-center">
            <p className="text-jawwib-text-dim text-xs mb-1">الجواب الصحيح كان</p>
            <p className="text-jawwib-green font-bold">{correctAnswer}</p>
          </div>
        )}

        {/* Points breakdown */}
        <div className="bg-jawwib-surface rounded-xl p-3 mb-3 space-y-1.5">
          {isCorrect && (
            <div className="flex justify-between text-sm">
              <span className="text-jawwib-text-dim">نقاط السؤال</span>
              <span className="text-jawwib-gold font-bold">+{currentQuestion.points}</span>
            </div>
          )}
          {lastAnswer.timeBonus > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-jawwib-text-dim">⚡ بونص السرعة</span>
              <span className="text-jawwib-blue font-bold">+{lastAnswer.timeBonus}</span>
            </div>
          )}
          {lastAnswer.streakMultiplier > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-jawwib-text-dim">🔥 مضاعف السلسلة</span>
              <span className="text-jawwib-purple font-bold">×{lastAnswer.streakMultiplier.toFixed(1)}</span>
            </div>
          )}
          <div className="border-t border-jawwib-border pt-1.5 flex justify-between items-center">
            <span className="font-bold text-sm">الإجمالي</span>
            <span
              className={`font-black text-2xl animate-score-reveal tabular-nums ${
                lastAnswer.points >= 0 ? 'text-jawwib-gold' : 'text-jawwib-red'
              }`}
            >
              {lastAnswer.points >= 0 ? '+' : ''}{lastAnswer.points}
            </span>
          </div>
        </div>

        {/* Host */}
        <div className="flex items-start gap-2 bg-jawwib-surface rounded-xl p-3 mb-4">
          <span className="text-base shrink-0">🎙️</span>
          <p className="text-xs leading-relaxed text-jawwib-text">{hostMessage}</p>
        </div>

        <button onClick={onContinue} className="btn-gold w-full">
          متابعة ←
        </button>
      </div>
    </div>
  );
}
