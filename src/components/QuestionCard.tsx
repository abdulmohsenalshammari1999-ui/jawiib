import { useState, useMemo, useEffect } from 'react';
import type { Question } from '@/lib/types';
import { TimerBar } from './game/TimerBar';
import { ImageMedia, AudioMedia, VideoMedia } from './game/MediaRenderer';

interface QuestionCardProps {
  question: Question;
  timer: number;
  maxTimer?: number;
  onAnswer: (index: number) => void;
  suppressCorrectReveal?: boolean;
  disabled?: boolean;
  hasBomb?: boolean;
  hasDouble?: boolean;
  scrambledOptions?: string[] | null;
  teamColor?: string;
  teamId?: 'alpha' | 'beta';
}

const OPTION_LABELS = ['أ', 'ب', 'ج', 'د'];

const POINT_COLORS: Record<number, { text: string; bg: string }> = {
  100: { text: '#15803D', bg: '#DCFCE7' },
  200: { text: '#0369A1', bg: '#DBEAFE' },
  300: { text: '#B45309', bg: '#FEF3C7' },

  600: { text: '#6D28D9', bg: '#EDE9FE' },
};

const TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  image:    { icon: '🖼️',  label: 'سؤال صورة' },
  audio:    { icon: '🎵',  label: 'سؤال صوت' },
  video:    { icon: '🎬',  label: 'فيديو' },
  math:     { icon: '🔢',  label: 'رياضيات' },
  riddle:   { icon: '🧩',  label: 'لغز' },
  guess:    { icon: '🎭',  label: 'خمّن' },
  scene:    { icon: '🎞️', label: 'وش جرى؟' },
  identify: { icon: '👂',  label: 'عرّف' },
  ordering: { icon: '🔢',  label: 'رتّب' },
  map:      { icon: '🗺️', label: 'خريطة' },
};

// ── Ordering question sub-component ──────────────────────────────────────────
function OrderingUI({
  items,
  correctOrder,
  onResult,
  disabled,
}: {
  items: string[];
  correctOrder: number[];
  onResult: (correct: boolean) => void;
  disabled: boolean;
}) {
  const [order, setOrder] = useState<number[]>(() => {
    const arr = items.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const swap = (a: number, b: number) => {
    if (submitted || disabled) return;
    setOrder((prev) => {
      const n = [...prev];
      [n[a], n[b]] = [n[b], n[a]];
      return n;
    });
  };

  const handleSubmit = () => {
    if (submitted || disabled) return;
    const correct = order.every((itemIdx, pos) => correctOrder[pos] === itemIdx);
    setIsCorrect(correct);
    setSubmitted(true);
    setTimeout(() => onResult(correct), 400);
  };

  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-gray-500 mb-3 font-bold">
        رتّب بـ ▲▼ وبعدين اضغط تأكيد
      </p>
      {order.map((itemIdx, pos) => {
        const posCorrect = submitted && correctOrder[pos] === itemIdx;
        return (
          <div
            key={itemIdx}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              !submitted
                ? 'bg-gray-50 border-gray-200'
                : posCorrect
                ? 'bg-green-50 border-green-400'
                : 'bg-red-50 border-red-400'
            }`}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
              style={{ background: '#FEF3C7', color: '#B07D1A' }}
            >
              {pos + 1}
            </span>
            <span className="flex-1 font-bold text-gray-900 text-sm sm:text-base leading-snug">
              {items[itemIdx]}
            </span>
            {!submitted && !disabled && (
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => swap(pos, pos - 1)}
                  disabled={pos === 0}
                  className="w-7 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-20 text-xs font-black transition-colors"
                >
                  ▲
                </button>
                <button
                  onClick={() => swap(pos, pos + 1)}
                  disabled={pos === order.length - 1}
                  className="w-7 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-20 text-xs font-black transition-colors"
                >
                  ▼
                </button>
              </div>
            )}
            {submitted && (
              <span className={`text-lg shrink-0 ${posCorrect ? 'text-green-600' : 'text-red-500'}`}>
                {posCorrect ? '✓' : '✗'}
              </span>
            )}
          </div>
        );
      })}

      {!submitted && !disabled && (
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl font-black text-white text-base mt-3 transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg,#B07D1A,#D4A94A)', boxShadow: '0 4px 16px rgba(176,125,26,0.35)' }}
        >
          تأكيد ✓
        </button>
      )}
      {submitted && (
        <div className={`text-center py-3 rounded-xl font-black text-base ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isCorrect ? '🎉 ترتيب صح!' : '❌ ترتيب غلط'}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function QuestionCard({
  question,
  timer,
  maxTimer = 30,
  onAnswer,
  disabled = false,
  hasBomb = false,
  hasDouble = false,
  scrambledOptions,
  teamColor,
  teamId,
  suppressCorrectReveal = false,
}: QuestionCardProps) {
  const [selected, setSelected]   = useState<number | null>(null);
  const [revealed, setRevealed]   = useState(false);
  const [lockPhase, setLockPhase] = useState(true);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setLockPhase(true);
    const t = setTimeout(() => setLockPhase(false), 600);
    return () => clearTimeout(t);
  }, [question.id]);

  const displayOptions = useMemo(
    () => scrambledOptions ?? question.options,
    [scrambledOptions, question.options]
  );

  const qType = question.type ?? 'text';
  const typeInfo = TYPE_LABELS[qType];
  const isActuallyDisabled = disabled || lockPhase;
  const ptInfo = POINT_COLORS[question.points] ?? POINT_COLORS[300];

  const handleAnswer = (displayIdx: number) => {
    if (selected !== null || isActuallyDisabled) return;
    setSelected(displayIdx);
    let trueIdx = displayIdx;
    if (scrambledOptions) {
      const opt = scrambledOptions[displayIdx];
      trueIdx = question.options.indexOf(opt);
    }
    if (suppressCorrectReveal) {
      setTimeout(() => onAnswer(trueIdx), 300);
    } else {
      setTimeout(() => {
        setRevealed(true);
        setTimeout(() => onAnswer(trueIdx), 350);
      }, 220);
    }
  };

  const handleOrderingResult = (correct: boolean) => {
    setSelected(0);
    setRevealed(true);
    setTimeout(
      () => onAnswer(correct ? question.correctIndex : (question.correctIndex + 1) % Math.max(question.options.length, 2)),
      400,
    );
  };

  const optionStyle = (idx: number): string => {
    const base = 'p-4 rounded-xl border-2 text-right transition-all leading-snug flex items-center select-none';
    if (selected === null) {
      return isActuallyDisabled
        ? `${base} border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed`
        : `${base} border-gray-200 bg-gray-50 hover:border-amber-400 hover:bg-amber-50 cursor-pointer active:scale-[0.97]`;
    }
    const isSelected = selected === idx;
    if (!revealed) {
      return isSelected
        ? `${base} border-amber-400 bg-amber-50 scale-[0.97]`
        : `${base} border-gray-200 bg-gray-50 opacity-25`;
    }
    const isCorrect = idx === question.correctIndex;
    if (isSelected && isCorrect)  return `${base} border-green-500 bg-green-50`;
    if (isSelected && !isCorrect) return `${base} border-red-500 bg-red-50 animate-shake`;
    if (!isSelected && isCorrect) return `${base} border-green-400 bg-green-50`;
    return `${base} border-gray-200 bg-gray-50 opacity-20`;
  };

  return (
    <div className={`max-w-2xl mx-auto w-full ${lockPhase ? 'animate-countdown-pop' : 'phase-enter'}`}>

      {/* ── Effect banners ─────────────────────────────────────────────────── */}
      {hasBomb && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-300 flex items-center gap-2">
          <span className="text-orange-500 text-xl">💣</span>
          <span className="text-orange-700 text-sm font-bold">قنبلة! إذا غلطت −150 زيادة</span>
        </div>
      )}
      {hasDouble && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-yellow-50 border border-yellow-300 flex items-center gap-2">
          <span className="text-yellow-600 text-xl">⚡</span>
          <span className="text-yellow-700 text-sm font-bold">رهان! صح = ضعف • غلط = −75</span>
        </div>
      )}
      {scrambledOptions && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2">
          <span className="text-purple-500">🔀</span>
          <span className="text-purple-700 text-xs font-bold">الخيارات مقلوبة 🔀</span>
        </div>
      )}

      {/* ── Main card — WHITE ───────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl p-5 sm:p-6 transition-all"
        style={{
          boxShadow: teamColor
            ? `0 8px 40px ${teamColor}22, 0 2px 12px rgba(0,0,0,0.10)`
            : '0 8px 40px rgba(0,0,0,0.14)',
          border: teamColor ? `2px solid ${teamColor}28` : '2px solid rgba(0,0,0,0.05)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0 flex-wrap"
            style={{ background: ptInfo.bg }}
          >
            <span className="font-black text-2xl tabular-nums leading-none" style={{ color: ptInfo.text }}>
              {question.points}
            </span>
            <span className="text-xs font-bold" style={{ color: ptInfo.text }}>نقطة</span>
            {typeInfo && (
              <span className="text-xs font-bold opacity-70" style={{ color: ptInfo.text }}>
                · {typeInfo.icon} {typeInfo.label}
              </span>
            )}
          </div>
          <div className={`shrink-0 ${teamId === 'alpha' ? 'timer-team-alpha' : teamId === 'beta' ? 'timer-team-beta' : ''}`}>
            <TimerBar time={timer} maxTime={maxTimer} compact teamColor={teamColor} />
          </div>
        </div>

        {lockPhase && !disabled && (
          <div className="text-center mb-3">
            <span className="text-amber-600 text-sm font-black animate-pulse">جهّزك...</span>
          </div>
        )}

        {question.teaser && selected === null && (
          <div className="text-center text-sm text-gray-500 italic mb-3">{question.teaser}</div>
        )}

        {/* Media */}
        {question.mediaUrl && (qType === 'image' || qType === 'guess' || qType === 'scene' || qType === 'map') && (
          <div className="mb-4"><ImageMedia src={question.mediaUrl} alt={question.mediaAlt ?? question.text} /></div>
        )}
        {question.mediaUrl && (qType === 'audio' || qType === 'identify') && (
          <div className="mb-4">
            <AudioMedia
              src={question.mediaUrl}
              duration={question.mediaDuration}
              autoPlay
              label={qType === 'identify' ? '👂 استمع واعرف من هو / ما هو' : '🎵 استمع جيداً ثم أجب'}
            />
          </div>
        )}
        {question.mediaUrl && qType === 'video' && (
          <div className="mb-4"><VideoMedia src={question.mediaUrl} caption={question.mediaAlt} /></div>
        )}

        {/* Question text */}
        {qType === 'math' ? (
          <div className="mb-5 rounded-2xl p-4 text-center bg-blue-50 border border-blue-200">
            <p className="text-xs font-bold text-blue-500 mb-2 tracking-widest">🔢 رياضيات</p>
            <p className="font-display text-2xl sm:text-3xl text-blue-800 leading-relaxed" dir="ltr">{question.text}</p>
          </div>
        ) : qType === 'riddle' ? (
          <div className="mb-5 rounded-2xl p-4 text-center bg-amber-50 border border-amber-200">
            <p className="text-xs font-bold text-amber-600 mb-2 tracking-widest">🧩 لغز</p>
            <p className="text-xl font-black text-gray-900 leading-relaxed">{question.text}</p>
          </div>
        ) : qType === 'ordering' ? (
          <div className="mb-4 text-center">
            <p className="text-lg sm:text-xl font-black text-gray-900 leading-snug">{question.text}</p>
          </div>
        ) : (
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-5 px-1 leading-snug">
            {question.text}
          </h2>
        )}

        {/* Ordering UI */}
        {qType === 'ordering' && (
          <OrderingUI
            items={question.options}
            correctOrder={question.correctOrder ?? question.options.map((_, i) => i)}
            onResult={handleOrderingResult}
            disabled={isActuallyDisabled}
          />
        )}

        {/* Standard options */}
        {qType !== 'ordering' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={selected !== null || isActuallyDisabled}
                aria-label={`الخيار ${OPTION_LABELS[idx]}: ${option}`}
                className={optionStyle(idx)}
              >
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ml-3 shrink-0"
                  style={{ background: '#FEF3C7', color: '#B07D1A', border: '1.5px solid #F59E0B40' }}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className="font-bold text-sm sm:text-base text-gray-900 flex-1 leading-snug">{option}</span>
                {revealed && idx === question.correctIndex && (
                  <span className="mr-2 text-green-600 text-base shrink-0 font-black">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {disabled && selected === null && !lockPhase && qType !== 'ordering' && (
          <p className="text-center text-gray-500 text-sm mt-4 font-medium">
            👁️ أنت تشوف بس — دور الفريق الثاني
          </p>
        )}
      </div>
    </div>
  );
}
