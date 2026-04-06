import { getCategoryById } from '@/lib/categories';
import type { GameBoardCell, CategoryId } from '@/lib/types';

interface GameBoardProps {
  board: GameBoardCell[][];
  categories: CategoryId[];
  onSelectQuestion: (rowIndex: number, colIndex: number) => void;
  isTrial: boolean;
  answeredCount: number;
}

export function GameBoard({
  board,
  categories,
  onSelectQuestion,
  isTrial,
  answeredCount,
}: GameBoardProps) {
  const trialLimit = 9;

  return (
    <div className="animate-fade-in">
      {/* Tier headers */}
      <div className="grid grid-cols-[140px_repeat(6,1fr)] gap-2 mb-2 px-2">
        <div />
        <div className="col-span-2 text-center text-jawwib-gold font-bold text-sm py-1">
          100 نقطة
        </div>
        <div className="col-span-2 text-center text-jawwib-gold font-bold text-sm py-1">
          200 نقطة
        </div>
        <div className="col-span-2 text-center text-jawwib-gold font-bold text-sm py-1">
          300 نقطة
        </div>
      </div>

      {/* Board rows */}
      <div className="space-y-2">
        {board.map((row, rowIndex) => {
          const cat = getCategoryById(categories[rowIndex]);
          return (
            <div
              key={cat.id}
              className="grid grid-cols-[140px_repeat(6,1fr)] gap-2 items-center"
            >
              {/* Category label */}
              <div className="flex items-center gap-2 px-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-xs font-bold text-jawwib-text-dim truncate">
                  {cat.name}
                </span>
              </div>

              {/* Question cells */}
              {row.map((cell, colIndex) => {
                const isLocked =
                  isTrial && answeredCount >= trialLimit && !cell.answered;
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() =>
                      !cell.answered && !isLocked && onSelectQuestion(rowIndex, colIndex)
                    }
                    disabled={cell.answered || isLocked}
                    className={`board-cell flex items-center justify-center py-3 px-2 min-h-[52px] text-center ${
                      cell.answered ? 'answered' : ''
                    } ${isLocked ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {cell.answered ? (
                      <span className="text-jawwib-text-dim text-lg">✓</span>
                    ) : isLocked ? (
                      <span className="text-jawwib-text-dim text-lg">🔒</span>
                    ) : (
                      <span
                        className="font-bold text-sm"
                        style={{ color: cat.color }}
                      >
                        {cell.points}
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
        <div className="mt-4 p-3 rounded-xl bg-jawwib-gold/10 border border-jawwib-gold/30 text-center">
          <span className="text-jawwib-gold text-sm font-bold">
            🔒 النسخة التجريبية: {answeredCount}/{trialLimit} أسئلة
          </span>
        </div>
      )}
    </div>
  );
}
