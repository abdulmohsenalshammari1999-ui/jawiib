import { useState, useMemo, useEffect } from 'react';
import type { Question } from '@/lib/types';
import { TimerBar } from './game/TimerBar';

interface QuestionCardProps {
  question: Question;
  timer: number;
  maxTimer?: number;
  onAnswer: (index: number) => void;
  disabled?: boolean;
  hasBomb?: boolean;
  hasDouble?: boolean;
  scrambledOptions?: string[] | null;
  teamColor?: string;
}

const OPTION_LABELS = ['أ', 'ب', 'ج', 'د'];

export function QuestionCard({
  question,
  timer,
  maxTimer = 15,
  onAnswer,
  disabled = false,
  hasBomb = false,
  hasDouble = false,
  scrambledOptions,
  teamColor,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed]  = useState(false);

  // Reset when question changes
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [question.id]);

  const displayOptions = useMemo(
    () => scrambledOptions ?? question.options,
    [scrambledOptions, question.options]
  );

  const handleAnswer = (displayIdx: number) => {
    if (selected !== null || disabled) return;
    setSelected(displayIdx);

    // Map back to true index when scrambled
    let trueIdx = displayIdx;
    if (scrambledOptions) {
      const opt = scrambledOptions[displayIdx];
      trueIdx = question.options.indexOf(opt);
    }

    // Brief visual moment then reveal
    setTimeout(() => {
      setRevealed(true);
      setTimeout(() => onAnswer(trueIdx), 350);
    }, 220);
  };

  const tierStars = '⭐'.repeat(question.tier);

  const optionStyle = (idx: number): string => {
    if (selected === null) {
      return disabled
        ? 'border-jawwib-border bg-jawwib-surface opacity-50 cursor-not-allowed'
        : 'answer-option border-jawwib-border bg-jawwib-surface hover:border-jawwib-gold/60 hover:bg-jawwib-card cursor-pointer';
    }
    const isSelected = selected === idx;
    if (!revealed) {
      return isSelected
        ? 'border-jawwib-gold bg-jawwib-gold/20 scale-[0.97] opacity-90'
        : 'border-jawwib-border bg-jawwib-surface opacity-30';
    }
    // Revealed state: show correct/wrong
    const isCorrect = idx === question.correctIndex;
    if (isSelected && isCorrect)   return 'border-green-500 bg-green-500/20 scale-[0.97]';
    if (isSelected && !isCorrect)  return 'border-red-500   bg-red-500/20   scale-[0.97] animate-shake';
    if (!isSelected && isCorrect)  return 'border-green-500 bg-green-500/10';
    return 'border-jawwib-border bg-jawwib-surface opacity-20';
  };

  return (
    <div className="phase-enter animate-slide-up max-w-2xl mx-auto w-full">
      {/* Effect banners */}
      {hasBomb && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-orange-500/15 border border-orange-500/35 flex items-center gap-2 animate-sabotage">
          <span className="text-orange-400 text-xl">💣</span>
          <span className="text-orange-400 text-sm font-bold">قنبلة! إجابة خاطئة = -150 إضافية</span>
        </div>
      )}
      {hasDouble && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-yellow-500/15 border border-yellow-500/35 flex items-center gap-2 animate-sabotage">
          <span className="text-yellow-400 text-xl">⚡</span>
          <span className="text-yellow-400 text-sm font-bold">رهان! صح = ضعف • خطأ = -75</span>
        </div>
      )}
      {scrambledOptions && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2">
          <span className="text-purple-400">🔀</span>
          <span className="text-purple-400 text-xs font-bold">الخيارات مخلوطة</span>
        </div>
      )}

      <div
        className="game-card p-5 transition-all"
        style={teamColor ? { borderColor: `${teamColor}30` } : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-60">{tierStars}</span>
            <span className="font-bold text-lg" style={{ color: teamColor ?? '#D4A017' }}>
              {question.points} نقطة
            </span>
          </div>
          <TimerBar time={timer} maxTime={maxTimer} />
        </div>

        {/* Question */}
        <h2 className="text-lg sm:text-xl font-bold text-center mb-6 leading-relaxed px-2">
          {question.text}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {displayOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null || disabled}
              className={`p-4 rounded-xl border-2 text-right font-bold text-sm transition-all ${optionStyle(idx)}`}
            >
              <span className="text-jawwib-text-dim ml-2 text-xs font-normal">
                {OPTION_LABELS[idx]}
              </span>
              {option}
              {/* Correct indicator */}
              {revealed && idx === question.correctIndex && (
                <span className="mr-2 text-green-400 text-base">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Spectator label */}
        {disabled && selected === null && (
          <p className="text-center text-jawwib-text-dim text-xs mt-4">
            👁️ أنت تشاهد فقط — دور الفريق الآخر
          </p>
        )}
      </div>
    </div>
  );
}
