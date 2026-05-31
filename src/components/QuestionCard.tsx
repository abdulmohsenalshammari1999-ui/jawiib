import { useState, useMemo, useEffect } from 'react';
import type { Question } from '@/lib/types';
import { TimerBar } from './game/TimerBar';
import { ImageMedia, AudioMedia, VideoMedia } from './game/MediaRenderer';

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

const POINT_COLORS: Record<number, string> = {
  100: '#15803D',
  200: '#0369A1',
  300: '#C8880A',
  400: '#B45309',
  500: '#B91C1C',
  600: '#6D28D9',
};

// Human-friendly question type labels
const TYPE_LABELS: Record<string, { icon: string; label: string; bg: string }> = {
  image:  { icon: '🖼️',  label: 'سؤال صوري',      bg: '#0369A120' },
  audio:  { icon: '🎵',  label: 'سؤال صوتي',      bg: '#7C3AED20' },
  video:  { icon: '🎬',  label: 'سؤال مرئي',      bg: '#B9182020' },
  math:   { icon: '🔢',  label: 'تحدي رياضي',      bg: '#1D4ED820' },
  riddle: { icon: '🧩',  label: 'لغز وأحجية',      bg: '#B07D1A20' },
};

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
  const ptColor = POINT_COLORS[question.points] ?? '#C8880A';

  const handleAnswer = (displayIdx: number) => {
    if (selected !== null || isActuallyDisabled) return;
    setSelected(displayIdx);
    let trueIdx = displayIdx;
    if (scrambledOptions) {
      const opt = scrambledOptions[displayIdx];
      trueIdx = question.options.indexOf(opt);
    }
    setTimeout(() => {
      setRevealed(true);
      setTimeout(() => onAnswer(trueIdx), 350);
    }, 220);
  };

  const optionStyle = (idx: number): string => {
    if (selected === null) {
      return isActuallyDisabled
        ? 'border-jawwib-border bg-jawwib-surface opacity-40 cursor-not-allowed'
        : 'answer-option border-jawwib-border bg-jawwib-card hover:border-jawwib-gold/60 hover:bg-jawwib-surface cursor-pointer';
    }
    const isSelected = selected === idx;
    if (!revealed) {
      return isSelected
        ? 'border-jawwib-gold bg-jawwib-gold/15 scale-[0.97] opacity-90'
        : 'border-jawwib-border bg-jawwib-surface opacity-25';
    }
    const isCorrect = idx === question.correctIndex;
    if (isSelected && isCorrect)  return 'border-jawwib-green bg-jawwib-green/12 scale-[0.97]';
    if (isSelected && !isCorrect) return 'border-jawwib-red bg-jawwib-red/12 scale-[0.97] animate-shake';
    if (!isSelected && isCorrect) return 'border-jawwib-green bg-jawwib-green/8';
    return 'border-jawwib-border bg-jawwib-surface opacity-20';
  };

  return (
    <div className={`max-w-2xl mx-auto w-full ${lockPhase ? 'animate-countdown-pop' : 'phase-enter'}`}>

      {/* ── Effect banners ──────────────────────────────────────────────── */}
      {hasBomb && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-300 flex items-center gap-2 animate-sabotage">
          <span className="text-orange-500 text-xl">💣</span>
          <span className="text-orange-600 text-sm font-bold">قنبلة! إجابة خاطئة = −150 إضافية</span>
        </div>
      )}
      {hasDouble && (
        <div className="mb-3 px-4 py-2.5 rounded-xl bg-yellow-50 border border-yellow-300 flex items-center gap-2 animate-sabotage">
          <span className="text-yellow-600 text-xl">⚡</span>
          <span className="text-yellow-700 text-sm font-bold">رهان! صح = ضعف • خطأ = −75</span>
        </div>
      )}
      {scrambledOptions && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-jawwib-purple/8 border border-jawwib-purple/25 flex items-center gap-2">
          <span className="text-jawwib-purple">🔀</span>
          <span className="text-jawwib-purple text-xs font-bold">الخيارات مخلوطة</span>
        </div>
      )}

      {/* ── Main card ───────────────────────────────────────────────────── */}
      <div
        className="game-card p-5 transition-all"
        style={teamColor ? { borderColor: `${teamColor}25` } : undefined}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className="font-black text-xl tabular-nums leading-none"
              style={{ color: ptColor }}
            >
              {question.points}
            </span>
            <span className="text-jawwib-text-dim text-xs font-medium">نقطة</span>
            {/* Question type badge */}
            {typeInfo && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: typeInfo.bg, color: ptColor }}
              >
                {typeInfo.icon} {typeInfo.label}
              </span>
            )}
          </div>
          <TimerBar time={timer} maxTime={maxTimer} compact />
        </div>

        {/* Ready indicator */}
        {lockPhase && !disabled && (
          <div className="text-center mb-3">
            <span className="text-jawwib-gold text-sm font-bold animate-pulse">استعد...</span>
          </div>
        )}

        {/* ── Media section ─────────────────────────────────────────────── */}
        {question.mediaUrl && qType === 'image' && (
          <div className="mb-4">
            <ImageMedia src={question.mediaUrl} alt={question.text} />
          </div>
        )}
        {question.mediaUrl && qType === 'audio' && (
          <div className="mb-4">
            <AudioMedia
              src={question.mediaUrl}
              duration={question.mediaDuration}
              label="🎵 استمع جيداً ثم أجب"
            />
          </div>
        )}
        {question.mediaUrl && qType === 'video' && (
          <div className="mb-4">
            <VideoMedia src={question.mediaUrl} />
          </div>
        )}

        {/* ── Math mode ─────────────────────────────────────────────────── */}
        {qType === 'math' && (
          <div
            className="mb-4 rounded-2xl p-4 text-center border"
            style={{
              background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
              borderColor: '#1D4ED840',
            }}
          >
            <p className="text-[10px] font-black text-blue-500 mb-1 tracking-widest uppercase">
              تحدي رياضي
            </p>
            <p
              className="font-black text-2xl text-blue-700 leading-relaxed"
              dir="ltr"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {question.text}
            </p>
          </div>
        )}

        {/* ── Riddle mode ───────────────────────────────────────────────── */}
        {qType === 'riddle' && (
          <div
            className="mb-4 rounded-2xl p-4 text-center border"
            style={{
              background: 'linear-gradient(135deg,#FEF3C7,#FDE68A20)',
              borderColor: '#B07D1A40',
            }}
          >
            <p className="text-[10px] font-black text-jawwib-gold mb-2 tracking-widest">
              🧩 لغز واحجية
            </p>
            <p className="font-bold text-lg text-jawwib-text leading-relaxed">
              {question.text}
            </p>
          </div>
        )}

        {/* ── Standard question text ────────────────────────────────────── */}
        {qType !== 'math' && qType !== 'riddle' && (
          <h2 className="text-lg sm:text-xl font-bold text-center mb-5 leading-relaxed px-1">
            {question.text}
          </h2>
        )}

        {/* ── Answer options ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {displayOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null || isActuallyDisabled}
              aria-label={`الخيار ${OPTION_LABELS[idx]}: ${option}`}
              className={`p-4 rounded-xl border-2 text-right font-bold text-base transition-all leading-snug ${optionStyle(idx)}`}
            >
              <span className="text-jawwib-text-dim ml-2 text-sm font-normal">
                {OPTION_LABELS[idx]}
              </span>
              {option}
              {revealed && idx === question.correctIndex && (
                <span className="mr-2 text-jawwib-green text-base">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Spectator label */}
        {disabled && selected === null && !lockPhase && (
          <p className="text-center text-jawwib-text-dim text-sm mt-4 font-medium">
            👁️ أنت تشاهد فقط — دور الفريق الآخر
          </p>
        )}
      </div>
    </div>
  );
}
