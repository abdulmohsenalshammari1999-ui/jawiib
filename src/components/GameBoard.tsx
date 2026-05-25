import { getCategoryById } from '@/lib/categories';
import type { GameBoardCell, CategoryId } from '@/lib/types';

interface GameBoardProps {
  board: GameBoardCell[][];
  categories: CategoryId[];
  onSelectQuestion: (questionId: string) => void;
  isTrial: boolean;
  answeredCount: number;
  activeTeamColor?: string | null;
}

const TIER_COLORS = ['text-emerald-400', 'text-yellow-400', 'text-orange-400'];
const TIER_LABELS = ['⭐', '⭐⭐', '⭐⭐⭐'];

export function GameBoard({
  board,
  categories,
  onSelectQuestion,
  isTrial,
  answeredCount,
  activeTeamColor,
}: GameBoardProps) {
  const trialLimit = 9;

  return (
    <div className="animate-fade-in w-full">
      {/* Tier point headers */}
      <div
        className="grid gap-1.5 mb-2 px-1"
        style={{ gridTemplateColumns: '120px repeat(6, 1fr)' }}
      >
        <div />
        {[100, 100, 200, 200, 300, 300].map((pts, i) => (
          <div
            key={i}
            className={`text-center text-xs font-bold py-1 ${TIER_COLORS[Math.floor(i / 2)]}`}
          >
            {i % 2 === 0 ? pts : ''}
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
              className="grid gap-1.5 items-center"
              style={{ gridTemplateColumns: '120px repeat(6, 1fr)' }}
            >
              {/* Category */}
              <div className="flex items-center gap-1.5 px-1 min-w-0">
                <span className="text-base shrink-0">{cat.icon}</span>
                <span className="text-xs font-bold text-jawwib-text-dim truncate">{cat.name}</span>
              </div>

              {/* Cells */}
              {row.map((cell, colIndex) => {
                const isLocked = isTrial && answeredCount >= trialLimit && !cell.answered;
                const tierIdx = Math.floor(colIndex / 2);
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => !cell.answered && !isLocked && onSelectQuestion(cell.questionId)}
                    disabled={cell.answered || isLocked}
                    className={`board-cell flex items-center justify-center py-3 min-h-[48px] text-center relative ${
                      cell.answered ? 'answered' : ''
                    } ${isLocked ? '!opacity-20 cursor-not-allowed' : ''}`}
                  >
                    {cell.answered ? (
                      <span className="text-jawwib-text-dim text-sm">✓</span>
                    ) : isLocked ? (
                      <span className="text-jawwib-text-dim text-sm">🔒</span>
                    ) : (
                      <span
                        className={`font-bold text-sm ${TIER_COLORS[tierIdx]}`}
                        style={activeTeamColor ? { textShadow: `0 0 8px ${activeTeamColor}40` } : undefined}
                      >
                        {cell.points}
                      </span>
                    )}
                    {/* Tier pip */}
                    {!cell.answered && !isLocked && (
                      <span className="absolute top-0.5 right-1 text-[8px] opacity-40">
                        {TIER_LABELS[tierIdx]}
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
            🔒 تجريبي: {answeredCount}/{trialLimit} أسئلة
          </span>
        </div>
      )}
    </div>
  );
}
