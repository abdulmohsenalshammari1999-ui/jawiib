import type { GameState, Question } from '@/lib/types';
import { EvidenceCard } from './game/EvidenceCard';

interface ResultOverlayProps {
  lastAnswer: NonNullable<GameState['lastAnswer']>;
  currentQuestion: NonNullable<GameState['currentQuestion']>;
  hostMessage: string;
  onContinue: () => void;
  playerName?: string;
  teamColor?: string;
  teamEmoji?: string;
  isFinalQuestion?: boolean;
  crowdVotes?: { correct: number; wrong: number };
  playerStreak?: number;
  /** Hide correct answer & explanation — opposing team's steal chance is still pending */
  pendingSteal?: boolean;
}

function EducationalSection({ question }: { question: Question }) {
  const hasContent = question.explanation || question.funFact || question.didYouKnow || question.source;
  if (!hasContent) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden mt-3"
      style={{
        background: 'linear-gradient(135deg,#F0F9FF,#E0F2FE)',
        border: '1.5px solid #0369A125',
      }}
    >
      <div
        className="h-1"
        style={{ background: 'linear-gradient(90deg,#0369A1,#38BDF8,#0369A1)' }}
      />
      <div className="px-4 py-3.5 space-y-2.5">
        <p className="text-[10px] font-black tracking-wider text-blue-600 uppercase flex items-center gap-1">
          <span>🎓</span>
          <span>تعلّم أكثر</span>
        </p>

        {question.explanation && (
          <div>
            <p className="text-[10px] font-black text-blue-500 mb-0.5 uppercase tracking-wide">
              📌 لماذا هذه الإجابة؟
            </p>
            <p className="text-sm leading-relaxed text-jawwib-text">{question.explanation}</p>
          </div>
        )}

        {question.funFact && (
          <div
            className="rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(176,125,26,0.08)', border: '1px solid rgba(176,125,26,0.2)' }}
          >
            <p className="text-[10px] font-black text-jawwib-gold mb-0.5 uppercase tracking-wide">
              ⚡ حقيقة مثيرة
            </p>
            <p className="text-sm leading-relaxed text-jawwib-text">{question.funFact}</p>
          </div>
        )}

        {question.didYouKnow && (
          <div
            className="rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(21,128,61,0.06)', border: '1px solid rgba(21,128,61,0.18)' }}
          >
            <p className="text-[10px] font-black text-green-700 mb-0.5 uppercase tracking-wide">
              🌿 هل تعلم؟
            </p>
            <p className="text-sm leading-relaxed text-jawwib-text">{question.didYouKnow}</p>
          </div>
        )}

        {question.source && (
          <p className="text-[10px] text-jawwib-text-dim">
            📎 المصدر: <span className="font-medium">{question.source}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function ResultOverlay({
  lastAnswer,
  currentQuestion,
  hostMessage,
  onContinue,
  playerName,
  teamColor,
  teamEmoji,
  isFinalQuestion,
  crowdVotes,
  playerStreak = 0,
  pendingSteal = false,
}: ResultOverlayProps) {
  const correctAnswer  = currentQuestion.options[currentQuestion.correctIndex];
  const isCorrect      = lastAnswer.correct;
  const isBig          = Math.abs(lastAnswer.points) >= 400;
  const isGoldenStreak = playerStreak >= 4;
  const totalVotes     = (crowdVotes?.correct ?? 0) + (crowdVotes?.wrong ?? 0);
  const crowdWasRight  = crowdVotes && totalVotes > 0 &&
    (isCorrect ? crowdVotes.correct >= crowdVotes.wrong : crowdVotes.wrong > crowdVotes.correct);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div
        className={`game-card p-5 w-full max-w-sm animate-slide-in-up overflow-y-auto ${
          isGoldenStreak && isCorrect ? 'golden-streak-state' : ''
        } ${!isCorrect ? 'animate-shame-shake' : ''}`}
        style={{
          ...(teamColor ? { borderColor: `${teamColor}45` } : {}),
          maxHeight: '92dvh',
        }}
      >
        {/* ── Banners ─────────────────────────────────────────────────── */}
        {isFinalQuestion && (
          <div className="text-center mb-3 animate-final-flare">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
              style={{ background: 'linear-gradient(135deg,#B07D1A,#D4A94A)', color: '#fff' }}>
              ⚡ السؤال الأخير!
            </div>
          </div>
        )}
        {isGoldenStreak && isCorrect && (
          <div className="text-center mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-jawwib-gold/15 border border-jawwib-gold/40 text-jawwib-gold">
              👑 سلسلة ذهبية ×{playerStreak}
            </div>
          </div>
        )}
        {!isCorrect && !pendingSteal && (
          <div className="text-center mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-jawwib-red/12 border border-jawwib-red/35 text-jawwib-red">
              🚨 قاعة العار {teamEmoji ?? ''}
            </div>
          </div>
        )}

        {/* ── Result icon & title ─────────────────────────────────────── */}
        <div className={`text-center mb-4 ${isBig ? 'animate-bounce-in' : 'animate-fade-in'}`}>
          <div className={`text-6xl mb-2 ${isBig && isCorrect ? 'animate-bounce-in' : ''}`}>
            {isCorrect
              ? (isGoldenStreak ? '👑' : isBig ? '🔥' : '✅')
              : (isBig ? '💀' : '❌')}
          </div>
          {playerName && (
            <p className="text-sm font-bold" style={teamColor ? { color: teamColor } : undefined}>
              {teamEmoji ? `${teamEmoji} ` : ''}{playerName}
            </p>
          )}
        </div>

        <h2
          className={`text-xl font-black text-center mb-3 ${
            isCorrect ? 'text-jawwib-green' : 'text-jawwib-red'
          }`}
        >
          {isCorrect
            ? (isGoldenStreak ? 'ذهبي! 👑🔥' : isBig ? 'ممتاز! 🎉' : 'إجابة صحيحة!')
            : (isBig ? 'مصيبة! 😂' : 'خطأ فادح! 🚨')}
        </h2>

        {/* ── Correct answer reveal — hidden while steal is pending ───── */}
        {!isCorrect && !pendingSteal && (
          <div className="bg-jawwib-green/8 border border-jawwib-green/25 rounded-xl p-3 mb-3 text-center">
            <p className="text-jawwib-text-dim text-xs mb-1">الجواب الصحيح كان</p>
            <p className="text-jawwib-green font-bold text-base">{correctAnswer}</p>
          </div>
        )}

        {/* ── Steal pending notice ─────────────────────────────────────── */}
        {pendingSteal && (
          <div className="bg-jawwib-purple/8 border border-jawwib-purple/30 rounded-xl p-3 mb-3 text-center">
            <p className="text-jawwib-purple font-black text-sm">🏴‍☠️ الفريق المنافس لديه فرصة للسرقة!</p>
            <p className="text-jawwib-text-dim text-xs mt-1">الإجابة الصحيحة ستُكشف بعد محاولتهم</p>
          </div>
        )}

        {/* ── Points & details — hidden while steal is pending ────────── */}
        {!pendingSteal && (
          <>
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

            {/* Crowd prediction */}
            {crowdVotes && totalVotes > 0 && (
              <div className="bg-jawwib-surface rounded-xl p-3 mb-3">
                <p className="text-jawwib-text-dim text-xs font-bold mb-1.5 text-center">🙋 توقع الجمهور</p>
                <div className="flex gap-2">
                  <div className={`flex-1 rounded-lg p-2 text-center text-xs font-black ${
                    isCorrect ? 'bg-jawwib-green/12 text-jawwib-green border border-jawwib-green/25' : 'bg-jawwib-surface text-jawwib-text-dim'
                  }`}>
                    <p>صح ✅</p>
                    <p className="text-base font-black">{crowdVotes.correct}</p>
                  </div>
                  <div className={`flex-1 rounded-lg p-2 text-center text-xs font-black ${
                    !isCorrect ? 'bg-jawwib-red/12 text-jawwib-red border border-jawwib-red/25' : 'bg-jawwib-surface text-jawwib-text-dim'
                  }`}>
                    <p>غلط ❌</p>
                    <p className="text-base font-black">{crowdVotes.wrong}</p>
                  </div>
                </div>
                {crowdWasRight !== undefined && (
                  <p className="text-center text-[10px] text-jawwib-text-dim mt-1">
                    {crowdWasRight ? '🎯 الجمهور توقع صح!' : '😱 الجمهور انخدع!'}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Host message ─────────────────────────────────────────────── */}
        <div className="flex items-start gap-2 bg-jawwib-surface rounded-xl p-3 mb-3">
          <span className="text-base shrink-0">🎙️</span>
          <p className="text-sm leading-relaxed text-jawwib-text">{hostMessage}</p>
        </div>

        {/* ── Educational reveal & Evidence — hidden while steal pending ─ */}
        {!pendingSteal && (
          <>
            <EducationalSection question={currentQuestion} />
            {currentQuestion.evidence && (
              <EvidenceCard evidence={currentQuestion.evidence} />
            )}
          </>
        )}

        <button onClick={onContinue} className="btn-gold w-full mt-4 tap-target text-base py-4">
          {pendingSteal ? 'فرصة السرقة! ←' : 'متابعة ←'}
        </button>
      </div>
    </div>
  );
}
