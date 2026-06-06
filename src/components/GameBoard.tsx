import { getCategoryById } from '@/lib/categories';
import { TRIAL_QUESTION_LIMIT } from '@/store/gameStore';
import { CATEGORY_CONTEXT_IMAGES } from '@/lib/categoryMedia';
import type { GameBoardCell, CategoryId } from '@/lib/types';

interface GameBoardProps {
  board: GameBoardCell[][];
  categories: CategoryId[];
  onSelectQuestion: (questionId: string) => void;
  isTrial: boolean;
  answeredCount: number;
  activeTeamColor?: string | null;
  isMyTurn?: boolean;
  forcedCategoryId?: CategoryId;
  tvMode?: boolean;
}

const TIER_POINTS = [100, 200, 300, 600] as const;

const TIER_STYLES: Record<number, { text: string; bg: string; glow: string }> = {
  100: { text: '#FFFFFF', bg: '#166534', glow: 'rgba(16,185,129,0.50)' },
  200: { text: '#FFFFFF', bg: '#1E40AF', glow: 'rgba(59,130,246,0.50)' },
  300: { text: '#FFFFFF', bg: '#92400E', glow: 'rgba(245,158,11,0.50)' },
  600: { text: '#FFFFFF', bg: '#5B21B6', glow: 'rgba(139,92,246,0.55)' },
};

export function GameBoard({
  board,
  categories,
  onSelectQuestion,
  isTrial,
  answeredCount,
  activeTeamColor,
  isMyTurn = true,
  forcedCategoryId,
  tvMode = false,
}: GameBoardProps) {
  const trialLimit = TRIAL_QUESTION_LIMIT;
  const catColWidth = tvMode ? '130px' : '100px';
  const gridCols = `${catColWidth} repeat(4, 1fr)`;

  return (
    <div className="animate-fade-in w-full">
      {/* Point column headers */}
      <div
        className="grid gap-1.5 mb-2 px-1"
        style={{ gridTemplateColumns: gridCols }}
      >
        <div />
        {TIER_POINTS.map((pts) => (
          <div
            key={pts}
            className="text-center text-xs font-black py-1 tracking-tight"
            style={{ color: TIER_STYLES[pts].bg }}
          >
            {pts}
          </div>
        ))}
      </div>

      {/* Board rows */}
      <div className="space-y-1.5">
        {board.map((row, rowIndex) => {
          const cat = getCategoryById(categories[rowIndex]);
          return (
            <div
              key={cat.id}
              className={`grid gap-1.5 items-center rounded-lg transition-all ${
                forcedCategoryId === cat.id ? 'bg-jawwib-purple/8 ring-1 ring-jawwib-purple/30' : ''
              }`}
              style={{ gridTemplateColumns: gridCols }}
            >
              {/* Category label — with image background when available */}
              {(() => {
                const catImg = CATEGORY_CONTEXT_IMAGES[cat.id];
                return (
                  <div
                    className={`board-category-col relative overflow-hidden rounded-lg min-w-0 ${tvMode ? 'min-h-[56px]' : 'min-h-[44px]'} ${
                      forcedCategoryId === cat.id ? 'ring-1 ring-jawwib-purple/60' : ''
                    }`}
                  >
                    {catImg ? (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${catImg.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: catImg.position ?? 'center',
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/50 to-black/65" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-jawwib-surface" />
                    )}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-0.5 py-1 text-center">
                      <span className={`leading-none ${tvMode ? 'text-sm' : 'text-xs'}`}>{cat.icon}</span>
                      <span
                        className={`font-bold leading-tight mt-0.5 line-clamp-2 ${tvMode ? 'text-[10px]' : 'text-[8.5px]'} ${
                          catImg ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' :
                          forcedCategoryId === cat.id ? 'text-jawwib-purple' : 'text-jawwib-text-dim'
                        }`}
                      >
                        {cat.name}
                      </span>
                      {forcedCategoryId === cat.id && <span className="text-[9px] text-jawwib-purple font-black mt-0.5">🎯</span>}
                    </div>
                  </div>
                );
              })()}

              {/* Cells */}
              {row.map((cell, colIndex) => {
                const pts = cell.points;
                const style = TIER_STYLES[pts] ?? TIER_STYLES[TIER_POINTS[colIndex]];
                const isLocked = isTrial && answeredCount >= trialLimit && !cell.answered;
                const isForcedOut = !cell.answered && !!forcedCategoryId && cell.category !== forcedCategoryId;
                const canClick = !cell.answered && !isLocked && !isForcedOut && isMyTurn;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => canClick && onSelectQuestion(cell.questionId)}
                    disabled={cell.answered || isLocked || isForcedOut || !isMyTurn}
                    className={`board-cell flex items-center justify-center py-2.5 text-center relative ${tvMode ? 'min-h-[56px]' : 'min-h-[44px]'} ${
                      cell.answered ? 'answered' : ''
                    } ${isLocked || isForcedOut ? '!opacity-20 cursor-not-allowed' : ''} ${
                      !isMyTurn && !cell.answered ? 'cursor-default opacity-60' : ''
                    }`}
                    style={
                      canClick
                        ? ({
                            '--cell-hover-color': style.text,
                            '--cell-glow-color': style.glow,
                            background: style.bg,
                          } as React.CSSProperties)
                        : { background: cell.answered ? undefined : style.bg }
                    }
                  >
                    {cell.answered ? (
                      <span className="text-jawwib-text-dim text-xs">✓</span>
                    ) : isLocked ? (
                      <span className="text-jawwib-text-dim text-xs">🔒</span>
                    ) : (
                      <span
                        className="font-black text-sm tabular-nums"
                        style={{
                          color: style.text,
                          textShadow: activeTeamColor ? `0 0 8px ${activeTeamColor}30` : undefined,
                        }}
                      >
                        {pts}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {isTrial && (
        <div className="mt-3 p-2 rounded-xl bg-jawwib-gold/10 border border-jawwib-gold/20 text-center">
          <span className="text-jawwib-gold text-xs font-bold">
            🔒 تجريبي: {answeredCount}/{trialLimit} سؤال
          </span>
        </div>
      )}
    </div>
  );
}
