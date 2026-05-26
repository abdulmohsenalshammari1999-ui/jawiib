import { useEffect, useState } from 'react';
import { categories } from '@/lib/categories';

interface DraftState {
  picks: Array<{ teamId: 'alpha' | 'beta'; categoryId: string }>;
  currentTeam: 'alpha' | 'beta';
  round: number;
  complete: boolean;
  alphaCategories: string[];
  betaCategories: string[];
}

interface CategoryDraftScreenProps {
  draftState: DraftState;
  localTeamId: 'alpha' | 'beta' | null;
  isHost: boolean;
  availableCategories: Array<{ id: string; name: string; icon: string; color: string }>;
  requiredPerTeam?: number;
  alphaTeamName?: string;
  betaTeamName?: string;
  onPick: (categoryId: string) => void;
  onSkipDraft: () => void;
  onStartGame: () => void;
}

function ProgressDots({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <div className="flex gap-1 items-center justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i < filled ? 10 : 8,
            height: i < filled ? 10 : 8,
            background: i < filled ? color : '#C9A87A',
            opacity: i < filled ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

export function CategoryDraftScreen({
  draftState,
  localTeamId,
  isHost,
  availableCategories,
  requiredPerTeam = 3,
  alphaTeamName = 'الفريق الأزرق',
  betaTeamName  = 'الفريق الأحمر',
  onPick,
  onSkipDraft,
  onStartGame,
}: CategoryDraftScreenProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { picks, currentTeam, complete, alphaCategories, betaCategories } = draftState;
  const pickedIds = new Set(picks.map((p) => p.categoryId));
  const pickMap   = new Map(picks.map((p) => [p.categoryId, p.teamId]));

  const alphaCount = alphaCategories.length;
  const betaCount  = betaCategories.length;
  const alphaDone  = alphaCount >= requiredPerTeam;
  const betaDone   = betaCount  >= requiredPerTeam;
  const bothDone   = alphaDone && betaDone;

  const isMyTurn = localTeamId === currentTeam;
  const canPick  = !complete && !bothDone && (isHost || isMyTurn);
  const canStart = bothDone && isHost;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-diwaniya p-4 flex flex-col" dir="rtl">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-4 flex-1">

        {/* Header */}
        <div className="text-center animate-slide-up">
          <h1 className="text-2xl font-black text-gold-gradient mb-0.5">اختر الفئات</h1>
          <p className="text-xs text-jawwib-text-dim">كل فريق يختار {requiredPerTeam} فئات بالتناوب</p>
          <div className="sadu-accent mx-auto mt-2 max-w-xs" />
        </div>

        {/* Team counters */}
        <div className="grid grid-cols-2 gap-3">
          {/* Alpha */}
          <div
            className={`rounded-2xl p-3 border-2 transition-all ${
              currentTeam === 'alpha' && !bothDone
                ? 'border-jawwib-blue bg-blue-50/70 shadow-sm'
                : alphaDone
                ? 'border-jawwib-green/50 bg-green-50/50'
                : 'border-jawwib-border bg-jawwib-surface opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm" style={{ color: '#1A5FA8' }}>
                {currentTeam === 'alpha' && !bothDone && '◉ '}{alphaTeamName}
              </span>
              <span className={`text-xs font-black ${alphaDone ? 'text-jawwib-green' : 'text-jawwib-text-dim'}`}>
                {alphaDone ? '✓ اكتمل' : `${alphaCount}/${requiredPerTeam}`}
              </span>
            </div>
            <ProgressDots filled={alphaCount} total={requiredPerTeam} color="#1A5FA8" />
            {/* Picked categories mini-list */}
            <div className="flex flex-wrap gap-1 mt-2">
              {alphaCategories.map((cid) => {
                const cat = availableCategories.find((c) => c.id === cid);
                return cat ? (
                  <span key={cid} className="text-[10px] bg-blue-100 text-jawwib-blue px-1.5 py-0.5 rounded-full font-bold">
                    {cat.icon} {cat.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Beta */}
          <div
            className={`rounded-2xl p-3 border-2 transition-all ${
              currentTeam === 'beta' && !bothDone
                ? 'border-jawwib-red bg-red-50/70 shadow-sm'
                : betaDone
                ? 'border-jawwib-green/50 bg-green-50/50'
                : 'border-jawwib-border bg-jawwib-surface opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm" style={{ color: '#B82118' }}>
                {currentTeam === 'beta' && !bothDone && '◉ '}{betaTeamName}
              </span>
              <span className={`text-xs font-black ${betaDone ? 'text-jawwib-green' : 'text-jawwib-text-dim'}`}>
                {betaDone ? '✓ اكتمل' : `${betaCount}/${requiredPerTeam}`}
              </span>
            </div>
            <ProgressDots filled={betaCount} total={requiredPerTeam} color="#B82118" />
            <div className="flex flex-wrap gap-1 mt-2">
              {betaCategories.map((cid) => {
                const cat = availableCategories.find((c) => c.id === cid);
                return cat ? (
                  <span key={cid} className="text-[10px] bg-red-100 text-jawwib-red px-1.5 py-0.5 rounded-full font-bold">
                    {cat.icon} {cat.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* Turn prompt */}
        {!bothDone && (
          <div className="text-center">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-black animate-pulse-gold"
              style={{
                background: currentTeam === 'alpha' ? 'rgba(26,95,168,0.1)' : 'rgba(184,33,24,0.1)',
                border: `2px solid ${currentTeam === 'alpha' ? 'rgba(26,95,168,0.4)' : 'rgba(184,33,24,0.4)'}`,
                color: currentTeam === 'alpha' ? '#1A5FA8' : '#B82118',
              }}
            >
              {currentTeam === 'alpha' ? alphaDone ? `دور ${betaTeamName}` : `دور ${alphaTeamName}` : betaDone ? `دور ${alphaTeamName}` : `دور ${betaTeamName}`}
              {` — اختر فئة`}
            </span>
          </div>
        )}

        {/* Both done banner */}
        {bothDone && (
          <div className="game-card p-3 text-center border-jawwib-gold/50 animate-bounce-in">
            <p className="text-jawwib-gold font-black">✅ اكتمل الاختيار — جاهزون للمنافسة!</p>
          </div>
        )}

        {/* Category grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableCategories.map((cat, i) => {
            const pickedBy  = pickMap.get(cat.id);
            const isPicked  = pickedIds.has(cat.id);
            const isAlpha   = pickedBy === 'alpha';
            const isClickable = canPick && !isPicked;
            const catFromLib = categories.find((c) => c.id === cat.id);
            const catColor   = catFromLib?.color ?? cat.color;

            return (
              <button
                key={cat.id}
                onClick={() => isClickable && onPick(cat.id)}
                disabled={!isClickable}
                className={[
                  'relative p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 text-center',
                  'transition-all duration-200 animate-fade-in',
                  isPicked
                    ? isAlpha
                      ? 'border-blue-400/50 bg-blue-50/70 opacity-70 cursor-default'
                      : 'border-red-400/50 bg-red-50/70 opacity-70 cursor-default'
                    : isClickable
                      ? 'border-jawwib-border bg-jawwib-card cursor-pointer hover:border-jawwib-gold hover:bg-jawwib-gold/5 hover:scale-105'
                      : 'border-jawwib-border bg-jawwib-surface opacity-30 cursor-not-allowed',
                ].join(' ')}
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[11px] font-bold text-jawwib-text leading-tight">{cat.name}</span>
                {isPicked && (
                  <span
                    className={`absolute top-1 left-1 text-[9px] font-bold px-1 py-0.5 rounded-full ${
                      isAlpha ? 'bg-blue-100 text-jawwib-blue' : 'bg-red-100 text-jawwib-red'
                    }`}
                  >
                    {isAlpha ? '🛡️' : '⚔️'}
                  </span>
                )}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-50"
                  style={{ backgroundColor: catColor }}
                />
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pb-4">
          {canStart && (
            <button onClick={onStartGame} className="btn-gold w-full text-lg py-4 animate-bounce-in">
              ابدأ اللعبة! 🚀
            </button>
          )}
          {!bothDone && isHost && (
            <button
              onClick={onSkipDraft}
              className="w-full py-2.5 rounded-xl text-sm font-bold border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
            >
              🎲 اختيار عشوائي
            </button>
          )}
          {!isHost && !bothDone && (
            <p className="text-center text-jawwib-text-dim text-sm py-2">
              ⏳ {isMyTurn ? 'دورك — اختر فئة!' : 'بانتظار الفريق الآخر...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
