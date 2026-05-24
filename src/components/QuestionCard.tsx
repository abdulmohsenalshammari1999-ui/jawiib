import { useState, useMemo } from 'react';
import type { Question } from '@/lib/types';
import { TimerBar } from './game/TimerBar';

interface QuestionCardProps {
  question: Question;
  timer: number;
  maxTimer?: number;
  onAnswer: (index: number) => void;
  hasBomb?: boolean;
  hasDouble?: boolean;
  scrambledOptions?: string[] | null;
}

const OPTION_LABELS = ['أ', 'ب', 'ج', 'د'];

export function QuestionCard({
  question,
  timer,
  maxTimer = 15,
  onAnswer,
  hasBomb = false,
  hasDouble = false,
  scrambledOptions,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const displayOptions = useMemo(
    () => scrambledOptions ?? question.options,
    [scrambledOptions, question.options]
  );

  const handleAnswer = (displayIndex: number) => {
    if (selected !== null) return;
    setSelected(displayIndex);

    // Map back to original index if scrambled
    let trueIndex = displayIndex;
    if (scrambledOptions) {
      const displayedOption = scrambledOptions[displayIndex];
      trueIndex = question.options.indexOf(displayedOption);
    }
    setTimeout(() => onAnswer(trueIndex), 280);
  };

  const tierStars = '⭐'.repeat(question.tier);

  return (
    <div className="animate-slide-up max-w-2xl mx-auto w-full">
      {/* Effects banners */}
      {hasBomb && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center gap-2 animate-pulse">
          <span className="text-orange-400 text-xl">💣</span>
          <span className="text-orange-400 text-sm font-bold">
            قنبلة نشطة! إذا غلطت تخسر 150 نقطة إضافية
          </span>
        </div>
      )}
      {hasDouble && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center gap-2">
          <span className="text-yellow-400 text-xl">⚡</span>
          <span className="text-yellow-400 text-sm font-bold">
            رهان! صح = ضعف النقاط • خطأ = -75
          </span>
        </div>
      )}

      <div className="game-card p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-xs text-jawwib-text-dim">{tierStars}</span>
            <span className="text-jawwib-gold font-bold text-lg">{question.points} نقطة</span>
            {scrambledOptions && (
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                🔀 مخلوط
              </span>
            )}
          </div>
          <TimerBar time={timer} maxTime={maxTimer} />
        </div>

        {/* Question text */}
        <h2 className="text-lg font-bold text-center mb-6 leading-relaxed px-2">
          {question.text}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {displayOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null}
              className={`p-4 rounded-xl border-2 text-right font-bold text-sm transition-all ${
                selected === idx
                  ? 'border-jawwib-gold bg-jawwib-gold/20 scale-[0.97]'
                  : selected !== null
                  ? 'border-jawwib-border bg-jawwib-surface opacity-40'
                  : 'border-jawwib-border bg-jawwib-surface hover:border-jawwib-gold/60 hover:bg-jawwib-card active:scale-[0.97]'
              }`}
            >
              <span className="text-jawwib-text-dim ml-2 text-xs font-normal">
                {OPTION_LABELS[idx]}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
