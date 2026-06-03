import { useState, useMemo, useEffect } from 'react';
import type { Question } from '@/lib/types';
import { TimerBar } from './game/TimerBar';
import { ImageMedia, AudioMedia, VideoMedia } from './game/MediaRenderer';
import { CATEGORY_CONTEXT_IMAGES } from '@/lib/categoryMedia';

interface QuestionCardProps {
  question: Question;
  timer: number;
  maxTimer?: number;
  onAnswer: (index: number) => void;
  /** In teams mode: suppress correct-answer green highlight so steal team can't see it */
  suppressCorrectReveal?: boolean;
  disabled?: boolean;
  hasBomb?: boolean;
  hasDouble?: boolean;
  scrambledOptions?: string[] | null;
  teamColor?: string;
  teamId?: 'alpha' | 'beta';
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

const TYPE_LABELS: Record<string, { icon: string; label: string; bg: string; textColor?: string }> = {
  image:    { icon: '🖼️',  label: 'سؤال صوري',     bg: '#0369A120', textColor: '#0369A1' },
  audio:    { icon: '🎵',  label: 'سؤال صوتي',     bg: '#7C3AED20', textColor: '#7C3AED' },
  video:    { icon: '🎬',  label: 'سؤال مرئي',     bg: '#B9182020', textColor: '#B91820' },
  math:     { icon: '🔢',  label: 'تحدي رياضي',    bg: '#1D4ED820', textColor: '#1D4ED8' },
  riddle:   { icon: '🧩',  label: 'لغز وأحجية',    bg: '#B07D1A20', textColor: '#B07D1A' },
  guess:    { icon: '🎭',  label: 'خمّن من/ماذا',  bg: '#15803D18', textColor: '#15803D' },
  scene:    { icon: '🎞️', label: 'ماذا حدث هنا؟', bg: '#EA580C18', textColor: '#EA580C' },
  identify: { icon: '👂',  label: 'عرّف الصوت',    bg: '#6D28D918', textColor: '#6D28D9' },
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
  const ptColor = POINT_COLORS[question.points] ?? '#C8880A';
  // Show a contextual background image for the category when no explicit mediaUrl
  const contextMedia = !question.mediaUrl ? (CATEGORY_CONTEXT_IMAGES[question.category] ?? null) : null;

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
          <span className="text-orange-700 text-sm font-bold">قنبلة! إجابة خاطئة = −150 إضافية</span>
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
        style={teamColor ? { borderColor: `${teamColor}30`, boxShadow: `0 4px 24px ${teamColor}14` } : undefined}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className="score-display font-black text-2xl tabular-nums leading-none shrink-0"
              style={{ color: ptColor }}
            >
              {question.points}
            </span>
            <span className="text-jawwib-text-dim text-xs font-bold shrink-0">نقطة</span>
            {typeInfo && (
              <span
                className="category-label px-2.5 py-0.5 rounded-full shrink-0"
                style={{ background: typeInfo.bg, color: typeInfo.textColor ?? ptColor }}
              >
                {typeInfo.icon} {typeInfo.label}
              </span>
            )}
          </div>
          <div className={`shrink-0 ${teamId === 'alpha' ? 'timer-team-alpha' : teamId === 'beta' ? 'timer-team-beta' : ''}`}>
            <TimerBar time={timer} maxTime={maxTimer} compact teamColor={teamColor} />
          </div>
        </div>

        {/* Ready indicator */}
        {lockPhase && !disabled && (
          <div className="text-center mb-3">
            <span className="text-jawwib-gold text-sm font-bold animate-pulse">استعد...</span>
          </div>
        )}

        {/* ── Teaser (shown only before answer) ────────────────────────── */}
        {question.teaser && selected === null && (
          <div className="teaser-text mb-3">{question.teaser}</div>
        )}

        {/* ── Category contextual image (shown when no explicit mediaUrl) ── */}
        {contextMedia && (
          <div
            className="relative w-full rounded-xl overflow-hidden mb-4"
            style={{ height: '150px' }}
          >
            <img
              src={contextMedia.url}
              alt={contextMedia.alt}
              className="w-full h-full object-cover"
              style={{ objectPosition: contextMedia.position ?? 'center' }}
              loading="lazy"
              onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
            />
            {/* Fade into the white card at bottom */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(255,255,255,0.97) 100%)' }}
            />
            {/* Alt text caption bottom-left */}
            <span
              className="absolute bottom-1.5 right-2 text-[9px] font-bold opacity-40"
              style={{ color: '#1A1208' }}
            >
              {contextMedia.alt}
            </span>
          </div>
        )}

        {/* ── Media section ─────────────────────────────────────────────── */}
        {question.mediaUrl && (qType === 'image' || qType === 'guess') && (
          <div className="mb-4">
            <ImageMedia src={question.mediaUrl} alt={question.mediaAlt ?? question.text} />
          </div>
        )}
        {question.mediaUrl && qType === 'scene' && !question.mediaUrl.match(/\.(mp4|webm|ogg)$/i) && (
          <div className="mb-4">
            <ImageMedia src={question.mediaUrl} alt={question.mediaAlt ?? question.text} />
          </div>
        )}
        {question.mediaUrl && (qType === 'audio' || qType === 'identify') && (
          <div className="mb-4">
            <AudioMedia
              src={question.mediaUrl}
              duration={question.mediaDuration}
              label={qType === 'identify' ? '👂 استمع واعرف من هو / ما هو' : '🎵 استمع جيداً ثم أجب'}
            />
          </div>
        )}
        {question.mediaUrl && (qType === 'video' || (qType === 'scene' && question.mediaUrl.match(/\.(mp4|webm|ogg)$/i))) && (
          <div className="mb-4">
            <VideoMedia src={question.mediaUrl} caption={question.mediaAlt} />
          </div>
        )}

        {/* ── Math mode ─────────────────────────────────────────────────── */}
        {qType === 'math' && (
          <div
            className="mb-5 rounded-2xl p-5 text-center border"
            style={{ background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', borderColor: '#1D4ED825' }}
          >
            <p className="category-label text-blue-500 mb-2 tracking-widest">🔢 تحدي رياضي</p>
            <p
              className="font-display text-2xl sm:text-3xl text-blue-700 leading-relaxed"
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
            className="mb-5 rounded-2xl p-4 text-center border"
            style={{ background: 'linear-gradient(135deg,#FEF3C7,#FDE68A18)', borderColor: '#B07D1A30' }}
          >
            <p className="category-label text-jawwib-gold mb-2 tracking-widest">🧩 لغز واحجية</p>
            <p className="question-text font-bold text-jawwib-text leading-relaxed">{question.text}</p>
          </div>
        )}

        {/* ── Guess mode — identify person / place / object ─────────────── */}
        {qType === 'guess' && (
          <div className="question-type-guess p-4 mb-4 text-center">
            <p className="category-label text-green-700 mb-2 tracking-widest">🎭 خمّن من / ماذا / أين</p>
            <p className="question-text text-jawwib-text leading-relaxed">{question.text}</p>
          </div>
        )}

        {/* ── Scene mode — "what happened here?" ───────────────────────── */}
        {qType === 'scene' && (
          <div className="question-type-scene p-4 mb-4 text-center">
            <p className="category-label text-orange-600 mb-2 tracking-widest">🎞️ ماذا حدث في هذا المشهد؟</p>
            <p className="question-text text-jawwib-text leading-relaxed">{question.text}</p>
          </div>
        )}

        {/* ── Identify mode — sound / voice / song recognition ──────────── */}
        {qType === 'identify' && (
          <div className="question-type-identify p-4 mb-4 text-center">
            <p className="category-label text-purple-700 mb-2 tracking-widest">👂 عرّف هذا الصوت / الأغنية</p>
            <p className="question-text text-jawwib-text leading-relaxed">{question.text}</p>
          </div>
        )}

        {/* ── Standard question text ────────────────────────────────────── */}
        {qType !== 'math' && qType !== 'riddle' && qType !== 'guess' && qType !== 'scene' && qType !== 'identify' && (
          <h2 className="question-text text-center mb-5 px-1">
            {question.text}
          </h2>
        )}

        {/* ── Answer options ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null || isActuallyDisabled}
              aria-label={`الخيار ${OPTION_LABELS[idx]}: ${option}`}
              className={`p-4 rounded-xl border-2 text-right transition-all leading-snug flex items-center ${optionStyle(idx)}`}
            >
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ml-2.5 shrink-0"
                style={{ background: 'rgba(176,125,26,0.12)', color: '#B07D1A' }}
              >
                {OPTION_LABELS[idx]}
              </span>
              <span className="font-bold text-sm sm:text-base flex-1">{option}</span>
              {revealed && idx === question.correctIndex && (
                <span className="mr-2 text-jawwib-green text-base shrink-0">✓</span>
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
