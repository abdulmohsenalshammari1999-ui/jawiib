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
  100: { text: '#CDBFA5', bg: 'rgba(176,137,104,0.18)' },
  200: { text: '#D0A24A', bg: 'rgba(208,162,74,0.18)' },
  300: { text: '#E9A23C', bg: 'rgba(233,162,60,0.20)' },
  600: { text: '#F5C0A0', bg: 'rgba(200,90,52,0.22)' },
};

const TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  image:    { icon: '🖼️',  label: 'سؤال صوري' },
  audio:    { icon: '🎵',  label: 'سؤال صوتي' },
  video:    { icon: '🎬',  label: 'سؤال مرئي' },
  math:     { icon: '🔢',  label: 'تحدي رياضي' },
  riddle:   { icon: '🧩',  label: 'لغز وأحجية' },
  guess:    { icon: '🎭',  label: 'خمّن من/ماذا' },
  scene:    { icon: '🎞️', label: 'ماذا حدث هنا؟' },
  identify: { icon: '👂',  label: 'عرّف الصوت' },
  ordering: { icon: '🔢',  label: 'رتّب بالترتيب' },
  map:      { icon: '🗺️', label: 'سؤال خريطة' },
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
      <p className="text-center text-xs text-jawwib-text-dim mb-3 font-bold">
        رتّب العناصر بالضغط على ▲▼ ثم اضغط تأكيد
      </p>
      {order.map((itemIdx, pos) => {
        const posCorrect = submitted && correctOrder[pos] === itemIdx;
        return (
          <div
            key={itemIdx}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              !submitted
                ? 'border-white/10'
                : posCorrect
                ? 'bg-jawwib-oasis/15 border-jawwib-oasis'
                : 'bg-jawwib-terra/15 border-jawwib-terra'
            }`}
            style={{ background: !submitted ? 'rgba(255,255,255,0.04)' : undefined }}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
              style={{ background: 'rgba(245,166,35,0.15)', color: '#FFD166' }}
            >
              {pos + 1}
            </span>
            <span className="flex-1 font-bold text-jawwib-text text-sm sm:text-base leading-snug">
              {items[itemIdx]}
            </span>
            {!submitted && !disabled && (
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => swap(pos, pos - 1)}
                  disabled={pos === 0}
                  className="w-7 h-6 flex items-center justify-center rounded text-jawwib-text-dim hover:text-jawwib-text hover:bg-white/10 disabled:opacity-20 text-xs font-black transition-colors"
                >
                  ▲
                </button>
                <button
                  onClick={() => swap(pos, pos + 1)}
                  disabled={pos === order.length - 1}
                  className="w-7 h-6 flex items-center justify-center rounded text-jawwib-text-dim hover:text-jawwib-text hover:bg-white/10 disabled:opacity-20 text-xs font-black transition-colors"
                >
                  ▼
                </button>
              </div>
            )}
            {submitted && (
              <span className={`text-lg shrink-0 ${posCorrect ? 'text-jawwib-oasis' : 'text-jawwib-terra'}`}>
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
          تأكيد الترتيب ✓
        </button>
      )}
      {submitted && (
        <div className={`text-center py-3 rounded-xl font-black text-base ${isCorrect ? 'bg-jawwib-oasis/15 text-jawwib-oasis' : 'bg-jawwib-terra/15 text-jawwib-terra'}`}>
          {isCorrect ? '🎉 ترتيب صحيح!' : '❌ ترتيب خاطئ'}
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

  // Always shuffle options so the correct answer has no positional/length tell.
  // Re-shuffle only when the question changes; scrambledOptions (sabotage) override the base order.
  const { displayOptions, displayCorrectIndex } = useMemo(() => {
    const base = scrambledOptions ?? question.options;
    const indices = base.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const shuffled = indices.map((i) => base[i]);
    const correctText = question.options[question.correctIndex];
    const displayCorrect = shuffled.indexOf(correctText);
    return {
      displayOptions: shuffled,
      displayCorrectIndex: displayCorrect >= 0 ? displayCorrect : question.correctIndex,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, scrambledOptions]);

  const qType = question.type ?? 'text';
  const typeInfo = TYPE_LABELS[qType];
  const isActuallyDisabled = disabled || lockPhase;
  const ptInfo = POINT_COLORS[question.points] ?? POINT_COLORS[300];

  const handleAnswer = (displayIdx: number) => {
    if (selected !== null || isActuallyDisabled) return;
    setSelected(displayIdx);
    // Map display index back to original options index
    const opt = displayOptions[displayIdx];
    const trueIdx = question.options.indexOf(opt);
    if (suppressCorrectReveal) {
      setTimeout(() => onAnswer(trueIdx >= 0 ? trueIdx : displayIdx), 300);
    } else {
      setTimeout(() => {
        setRevealed(true);
        setTimeout(() => onAnswer(trueIdx >= 0 ? trueIdx : displayIdx), 350);
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
    const base = 'p-4 rounded-xl border-2 text-right transition-all leading-snug flex items-center select-none answer-option';
    if (selected === null) {
      return isActuallyDisabled
        ? `${base} opacity-40 cursor-not-allowed`
        : `${base} cursor-pointer active:scale-[0.97]`;
    }
    const isSelected = selected === idx;
    if (!revealed) {
      return isSelected
        ? `${base} border-yellow-400 scale-[0.97]`
        : `${base} opacity-25`;
    }
    const isCorrect = idx === displayCorrectIndex;
    if (isSelected && isCorrect)  return `${base} border-jawwib-oasis bg-jawwib-oasis/15`;
    if (isSelected && !isCorrect) return `${base} border-jawwib-terra bg-jawwib-terra/15 animate-shake`;
    if (!isSelected && isCorrect) return `${base} border-jawwib-oasis/70 bg-jawwib-oasis/10`;
    return `${base} opacity-20`;
  };

  return (
    <div className={`max-w-2xl mx-auto w-full ${lockPhase ? 'animate-countdown-pop' : 'phase-enter'}`}>

      {/* ── Effect banners ─────────────────────────────────────────────────── */}
      {hasBomb && (
        <div className="mb-3 px-4 py-2.5 rounded-xl flex items-center gap-2" style={{ background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.30)' }}>
          <span className="text-orange-400 text-xl">💣</span>
          <span className="text-orange-300 text-sm font-bold">قنبلة! إجابة خاطئة = −150 إضافية</span>
        </div>
      )}
      {hasDouble && (
        <div className="mb-3 px-4 py-2.5 rounded-xl flex items-center gap-2" style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.30)' }}>
          <span className="text-yellow-400 text-xl">⚡</span>
          <span className="text-yellow-300 text-sm font-bold">رهان! صح = ضعف • خطأ = −75</span>
        </div>
      )}
      {scrambledOptions && (
        <div className="mb-3 px-4 py-2 rounded-xl flex items-center gap-2" style={{ background: 'rgba(176,137,104,0.12)', border: '1px solid rgba(176,137,104,0.28)' }}>
          <span className="text-jawwib-camel">🔀</span>
          <span className="text-jawwib-camel text-xs font-bold">الخيارات مخلوطة</span>
        </div>
      )}

      {/* ── Main card ───────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6 pt-[1.375rem] sm:pt-[1.625rem] transition-all"
        style={{
          background: '#1C150E',
          boxShadow: teamColor
            ? `0 8px 40px ${teamColor}30, 0 2px 12px rgba(0,0,0,0.30)`
            : '0 8px 40px rgba(0,0,0,0.40)',
          border: teamColor ? `2px solid ${teamColor}40` : '2px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Gold accent strip */}
        <div
          className="absolute top-0 inset-x-0 h-1.5"
          style={{ background: 'linear-gradient(90deg,#B07D1A,#F5A623,#B07D1A)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0"
              style={{ background: ptInfo.bg }}
            >
              <span className="font-black text-2xl tabular-nums leading-none" style={{ color: ptInfo.text }}>
                {question.points}
              </span>
              <span className="text-xs font-bold" style={{ color: ptInfo.text }}>نقطة</span>
            </div>
            {typeInfo && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black shrink-0"
                style={{ background: 'rgba(245,166,35,0.14)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.30)' }}
              >
                <span>{typeInfo.icon}</span>
                <span>{typeInfo.label}</span>
              </span>
            )}
          </div>
          <div className={`shrink-0 ${teamId === 'alpha' ? 'timer-team-alpha' : teamId === 'beta' ? 'timer-team-beta' : ''}`}>
            <TimerBar time={timer} maxTime={maxTimer} compact teamColor={teamColor} />
          </div>
        </div>

        {lockPhase && !disabled && (
          <div className="text-center mb-3">
            <span className="text-amber-600 text-sm font-black animate-pulse">استعد...</span>
          </div>
        )}

        {question.teaser && selected === null && (
          <div className="text-center text-sm text-jawwib-text-muted italic mb-3">{question.teaser}</div>
        )}

        {/* Media */}
        {question.mediaUrl && (qType === 'image' || qType === 'guess' || qType === 'map') && (
          <div className="mb-4"><ImageMedia src={question.mediaUrl} alt={question.mediaAlt ?? question.text} /></div>
        )}
        {question.mediaUrl && qType === 'scene' && (
          <div className="mb-4">
            {/\.(mp4|webm|mov|ogg)(\?|$)/i.test(question.mediaUrl)
              ? <VideoMedia src={question.mediaUrl} caption={question.mediaAlt} />
              : <ImageMedia src={question.mediaUrl} alt={question.mediaAlt ?? question.text} progressive timer={timer} maxTimer={maxTimer} />}
          </div>
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
          <div className="mb-5 rounded-2xl p-4 text-center" style={{ background: 'rgba(208,162,74,0.10)', border: '1.5px solid rgba(208,162,74,0.28)' }}>
            <p className="text-xs font-bold text-jawwib-amber mb-2 tracking-widest">🔢 تحدي رياضي</p>
            <p className="font-display text-2xl sm:text-3xl text-jawwib-text leading-relaxed" dir="ltr">{question.text}</p>
          </div>
        ) : qType === 'riddle' ? (
          <div className="mb-5 rounded-2xl p-4 text-center" style={{ background: 'rgba(245,166,35,0.10)', border: '1.5px solid rgba(245,166,35,0.22)' }}>
            <p className="text-xs font-bold text-yellow-400 mb-2 tracking-widest">🧩 لغز وأحجية</p>
            <p className="text-xl font-black text-jawwib-text leading-relaxed">{question.text}</p>
          </div>
        ) : qType === 'ordering' ? (
          <div className="mb-4 text-center">
            <p className="text-lg sm:text-xl font-black text-jawwib-text leading-snug">{question.text}</p>
          </div>
        ) : (
          <h2 className="text-xl sm:text-2xl font-black text-jawwib-text text-center mb-5 px-1 leading-snug">
            {question.text}
          </h2>
        )}

        {/* Ordering UI */}
        {qType === 'ordering' && (
          <OrderingUI
            key={question.id}
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
                  style={{ background: 'rgba(245,166,35,0.15)', color: '#FFD166', border: '1.5px solid rgba(245,166,35,0.30)' }}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className="font-bold text-sm sm:text-base text-jawwib-text flex-1 leading-snug">{option}</span>
                {revealed && idx === displayCorrectIndex && (
                  <span className="mr-2 text-jawwib-oasis text-base shrink-0 font-black">✓</span>
                )}
                {revealed && selected === idx && idx !== displayCorrectIndex && (
                  <span className="mr-2 text-jawwib-terra text-base shrink-0 font-black">✗</span>
                )}
              </button>
            ))}
          </div>
        )}

        {disabled && selected === null && !lockPhase && qType !== 'ordering' && (
          <p className="text-center text-jawwib-text-dim text-sm mt-4 font-medium">
            👁️ أنت تشاهد فقط — دور الفريق الآخر
          </p>
        )}
      </div>
    </div>
  );
}
