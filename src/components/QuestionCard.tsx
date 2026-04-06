import { useState } from 'react';
import type { Question } from '@/lib/types';
import { Timer } from './Timer';

interface QuestionCardProps {
  question: Question;
  timer: number;
  onAnswer: (index: number) => void;
}

export function QuestionCard({ question, timer, onAnswer }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setTimeout(() => onAnswer(index), 300);
  };

  const tierLabel = question.tier === 1 ? '⭐' : question.tier === 2 ? '⭐⭐' : '⭐⭐⭐';

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      <div className="game-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-jawwib-text-dim">{tierLabel}</span>
            <span className="text-jawwib-gold font-bold text-lg">{question.points} نقطة</span>
          </div>
          <Timer time={timer} maxTime={15} />
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold text-center mb-8 leading-relaxed">
          {question.text}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selected !== null}
              className={`p-4 rounded-xl border-2 text-right font-bold text-base transition-all ${
                selected === index
                  ? 'border-jawwib-gold bg-jawwib-gold/20 scale-95'
                  : 'border-jawwib-border bg-jawwib-surface hover:border-jawwib-gold/50 hover:bg-jawwib-card'
              } ${selected !== null && selected !== index ? 'opacity-50' : ''}`}
            >
              <span className="text-jawwib-text-dim ml-2 text-sm">
                {['أ', 'ب', 'ج', 'د'][index]}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
