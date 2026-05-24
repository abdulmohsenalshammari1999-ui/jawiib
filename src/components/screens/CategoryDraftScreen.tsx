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
  onPick: (categoryId: string) => void;
  onSkipDraft: () => void;
  onStartGame: () => void;
}

const TOTAL_ROUNDS = 3;

function TeamPill({
  teamId,
  active,
}: {
  teamId: 'alpha' | 'beta';
  active: boolean;
}) {
  const isAlpha = teamId === 'alpha';
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
        isAlpha
          ? active
            ? 'border-blue-500 bg-blue-500/15 shadow-[0_0_20px_rgba(59,130,246,0.45)]'
            : 'border-blue-500/25 bg-blue-500/5 opacity-45'
          : active
            ? 'border-red-500 bg-red-500/15 shadow-[0_0_20px_rgba(239,68,68,0.45)]'
            : 'border-red-500/25 bg-red-500/5 opacity-45'
      }`}
    >
      <span>{isAlpha ? '🛡️' : '⚔️'}</span>
      <span className={`font-bold text-sm ${isAlpha ? 'text-blue-400' : 'text-red-400'}`}>
        {isAlpha ? 'الفريق الأزرق' : 'الفريق الأحمر'}
      </span>
      {active && (
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${isAlpha ? 'bg-blue-400' : 'bg-red-400'}`}
        />
      )}
    </div>
  );
}

function DraftedList({
  teamId,
  categoryIds,
  allCategories,
}: {
  teamId: 'alpha' | 'beta';
  categoryIds: string[];
  allCategories: Array<{ id: string; name: string; icon: string; color: string }>;
}) {
  const isAlpha = teamId === 'alpha';
  const borderColor = isAlpha ? 'border-blue-500/35' : 'border-red-500/35';
  const labelColor = isAlpha ? 'text-blue-400' : 'text-red-400';
  const bgColor = isAlpha ? 'bg-blue-500/5' : 'bg-red-500/5';

  return (
    <div className={`flex-1 rounded-2xl border ${borderColor} ${bgColor} p-3`}>
      <p className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${labelColor}`}>
        <span>{isAlpha ? '🛡️' : '⚔️'}</span>
        <span>{isAlpha ? 'الأزرق' : 'الأحمر'}</span>
        <span className="opacity-60">({categoryIds.length})</span>
      </p>
      <div className="flex flex-col gap-1.5">
        {categoryIds.map((cid, i) => {
          const cat = allCategories.find((c) => c.id === cid);
          if (!cat) return null;
          return (
            <div
              key={cid}
              className="animate-slide-up flex items-center gap-2 px-2 py-1.5 rounded-lg bg-jawwib-card border border-jawwib-border/40"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="text-sm">{cat.icon}</span>
              <span className="text-xs font-bold text-jawwib-text truncate">{cat.name}</span>
            </div>
          );
        })}
        {categoryIds.length === 0 && (
          <p className="text-xs text-jawwib-text-dim opacity-40 text-center py-3">—</p>
        )}
      </div>
    </div>
  );
}

export function CategoryDraftScreen({
  draftState,
  localTeamId,
  isHost,
  availableCategories,
  onPick,
  onSkipDraft,
  onStartGame,
}: CategoryDraftScreenProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { picks, currentTeam, round, complete, alphaCategories, betaCategories } = draftState;

  const pickedIds = new Set(picks.map((p) => p.categoryId));
  const pickMap = new Map(picks.map((p) => [p.categoryId, p.teamId]));

  const isMyTurn = localTeamId === currentTeam;
  const canPick = !complete && (isHost || isMyTurn);

  const snakeLabel =
    'اختار فريق، اختار فريق، اختار اثنين... (snake draft)';

  if (!mounted) return null;

  return (
    <div className="animate-fade-in min-h-screen p-4 flex flex-col" dir="rtl">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-4 flex-1">

        {/* Header */}
        <div className="text-center animate-slide-up">
          <h1 className="text-3xl font-black text-gold-gradient mb-1">Draft الفئات</h1>
          <p className="text-xs text-jawwib-text-dim">{snakeLabel}</p>
        </div>

        {/* Round indicator */}
        <div
          className="flex items-center justify-center gap-3 animate-slide-up"
          style={{ animationDelay: '60ms' }}
        >
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black border-2 transition-all duration-300 ${
                i + 1 < round
                  ? 'border-jawwib-gold bg-jawwib-gold/20 text-jawwib-gold'
                  : i + 1 === round
                    ? 'border-jawwib-gold bg-jawwib-gold text-jawwib-bg animate-pulse-gold'
                    : 'border-jawwib-border text-jawwib-text-dim opacity-35'
              }`}
            >
              {i + 1 < round ? '✓' : i + 1}
            </div>
          ))}
          <span className="text-xs text-jawwib-text-dim">
            جولة {round} من {TOTAL_ROUNDS}
          </span>
        </div>

        {/* Turn indicator */}
        {!complete && (
          <div
            className="flex items-center justify-center gap-3 animate-bounce-in"
            style={{ animationDelay: '80ms' }}
          >
            <TeamPill teamId="alpha" active={currentTeam === 'alpha'} />
            <span className="text-jawwib-text-dim text-xs font-bold">دور</span>
            <TeamPill teamId="beta" active={currentTeam === 'beta'} />
          </div>
        )}

        {/* My turn prompt */}
        {!complete && isMyTurn && !isHost && (
          <div className="animate-bounce-in text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-jawwib-gold/10 border border-jawwib-gold/40 text-jawwib-gold text-sm font-black animate-pulse-gold">
              ⚡ دورك! اختر فئة
            </span>
          </div>
        )}

        {/* Draft complete banner */}
        {complete && (
          <div className="animate-bounce-in text-center game-card p-3 border-jawwib-gold/50">
            <p className="text-jawwib-gold font-black text-lg">✅ اكتمل الـ Draft!</p>
          </div>
        )}

        {/* Category grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 animate-fade-in"
          style={{ animationDelay: '100ms' }}
        >
          {availableCategories.map((cat, i) => {
            const pickedBy = pickMap.get(cat.id);
            const isPicked = pickedIds.has(cat.id);
            const isAlphaPick = pickedBy === 'alpha';
            const isClickable = canPick && !isPicked;

            const catFromLib = categories.find((c) => c.id === cat.id);
            const catColor = catFromLib?.color ?? cat.color;

            return (
              <button
                key={cat.id}
                onClick={() => isClickable && onPick(cat.id)}
                disabled={!isClickable}
                className={[
                  'relative p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-center',
                  'transition-all duration-200 animate-fade-in',
                  isPicked
                    ? isAlphaPick
                      ? 'border-blue-500/45 bg-blue-500/8 opacity-65 cursor-default'
                      : 'border-red-500/45 bg-red-500/8 opacity-65 cursor-default'
                    : isClickable
                      ? 'border-jawwib-border bg-jawwib-card cursor-pointer hover:border-jawwib-gold hover:bg-jawwib-gold/5 hover:shadow-[0_0_14px_rgba(212,160,23,0.3)] hover:scale-105'
                      : 'border-jawwib-border bg-jawwib-surface opacity-35 cursor-not-allowed',
                ].join(' ')}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-bold text-jawwib-text leading-tight">
                  {cat.name}
                </span>

                {/* Picked-by badge */}
                {isPicked && (
                  <span
                    className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isAlphaPick
                        ? 'bg-blue-500/25 text-blue-400'
                        : 'bg-red-500/25 text-red-400'
                    }`}
                  >
                    {isAlphaPick ? '🛡️' : '⚔️'}
                  </span>
                )}

                {/* Category color stripe */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-50"
                  style={{ backgroundColor: catColor }}
                />
              </button>
            );
          })}
        </div>

        {/* Drafted lists */}
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '140ms' }}>
          <DraftedList
            teamId="alpha"
            categoryIds={alphaCategories}
            allCategories={availableCategories}
          />
          <DraftedList
            teamId="beta"
            categoryIds={betaCategories}
            allCategories={availableCategories}
          />
        </div>

        {/* Action buttons */}
        <div
          className="flex flex-col gap-2 animate-slide-up pb-4"
          style={{ animationDelay: '180ms' }}
        >
          {complete && isHost && (
            <button
              onClick={onStartGame}
              className="btn-gold w-full text-lg py-4 animate-bounce-in"
            >
              ابدأ اللعبة! 🚀
            </button>
          )}

          {!complete && isHost && (
            <button
              onClick={onSkipDraft}
              className="w-full py-3 rounded-xl text-sm font-bold border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
            >
              🎲 تخطي الـ Draft — اختيار عشوائي
            </button>
          )}

          {!isHost && !complete && (
            <div className="text-center text-jawwib-text-dim text-sm py-2">
              {isMyTurn ? null : '⏳ بانتظار الفريق الآخر...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
