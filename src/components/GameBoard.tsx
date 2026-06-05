import { getCategoryById } from '@/lib/categories';
import { TRIAL_QUESTION_LIMIT } from '@/store/gameStore';
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

const TIER_STYLES: Record<number, { text: string; glow: string }> = {
  100: { text: '#15803D', glow: 'rgba(21,128,61,0.25)' },
  200: { text: '#0369A1', glow: 'rgba(3,105,161,0.25)' },
  300: { text: '#C8880A', glow: 'rgba(200,136,10,0.25)' },
  600: { text: '#6D28D9', glow: 'rgba(109,40,217,0.3)' },
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
            style={{ color: TIER_STYLES[pts].text }}
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
              {/* Category label */}
              <div className="board-category-col flex items-center gap-1 px-1 min-w-0">
                <span className={`shrink-0 ${tvMode ? 'text-base' : 'text-sm'}`}>{cat.icon}</span>
                <span className={`font-bold truncate leading-tight ${tvMode ? 'text-xs' : 'text-[11px]'} ${
                  forcedCategoryId === cat.id ? 'text-jawwib-purple' : 'text-jawwib-text-dim'
                }`}>{cat.name}</span>
                {forcedCategoryId === cat.id && <span className="text-[9px] text-jawwib-purple font-black shrink-0">🎯</span>}
              </div>

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
                          } as React.CSSProperties)
                        : undefined
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
