import type { GameState } from '@/lib/types';

interface ResultOverlayProps {
  lastAnswer: NonNullable<GameState['lastAnswer']>;
  currentQuestion: NonNullable<GameState['currentQuestion']>;
  hostMessage: string;
  onContinue: () => void;
}

export function ResultOverlay({
  lastAnswer,
  currentQuestion,
  hostMessage,
  onContinue,
}: ResultOverlayProps) {
  const correctAnswer = currentQuestion.options[currentQuestion.correctIndex];

  return (
    <div className="animate-fade-in fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="game-card p-8 max-w-md w-full text-center animate-bounce-in">
        {/* Result icon */}
        <div className="text-6xl mb-4">
          {lastAnswer.correct ? '🎉' : '😅'}
        </div>

        {/* Result text */}
        <h2
          className={`text-2xl font-bold mb-2 ${
            lastAnswer.correct ? 'text-jawwib-green' : 'text-jawwib-red'
          }`}
        >
          {lastAnswer.correct ? 'إجابة صحيحة!' : 'إجابة خاطئة!'}
        </h2>

        {!lastAnswer.correct && (
          <p className="text-jawwib-text-dim mb-3">
            الجواب الصحيح: <span className="text-jawwib-green font-bold">{correctAnswer}</span>
          </p>
        )}

        {/* Points breakdown */}
        {lastAnswer.correct && (
          <div className="bg-jawwib-surface rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-jawwib-text-dim">النقاط الأساسية</span>
              <span className="text-jawwib-gold font-bold">+{currentQuestion.points}</span>
            </div>
            {lastAnswer.timeBonus > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-jawwib-text-dim">مكافأة السرعة ⚡</span>
                <span className="text-jawwib-blue font-bold">+{lastAnswer.timeBonus}</span>
              </div>
            )}
            {lastAnswer.streakMultiplier > 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-jawwib-text-dim">مضاعف السلسلة 🔥</span>
                <span className="text-jawwib-purple font-bold">×{lastAnswer.streakMultiplier}</span>
              </div>
            )}
            <div className="border-t border-jawwib-border pt-2 flex justify-between">
              <span className="font-bold">المجموع</span>
              <span className="text-jawwib-gold font-bold text-lg">+{lastAnswer.points}</span>
            </div>
          </div>
        )}

        {/* Host message */}
        <div className="bg-jawwib-surface rounded-xl p-3 mb-6 flex items-start gap-2">
          <span className="text-xl">🎙️</span>
          <p className="text-sm text-right leading-relaxed">{hostMessage}</p>
        </div>

        <button onClick={onContinue} className="btn-gold w-full text-lg">
          متابعة ←
        </button>
      </div>
    </div>
  );
}
