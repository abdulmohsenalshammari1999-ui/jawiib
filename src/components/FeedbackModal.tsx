import { useState } from 'react';
import { submitSurvey } from '@/serverFunctions/survey';
import type { SurveyPayload } from '@/serverFunctions/survey';

export interface GameContext {
  mode: 'ffa' | 'teams';
  isTrial: boolean;
  alphaTeamName?: string;
  betaTeamName?: string;
  alphaScore?: number;
  betaScore?: number;
  questionsAnswered: number;
  categoriesPlayed: string[];
}

interface FeedbackModalProps {
  onClose: () => void;
  gameContext?: GameContext;
}

type AgeGroup = 'under18' | '18-25' | '26-35' | '36-50' | 'over50';
type Difficulty = 'easy' | 'medium' | 'hard';

function saveLocalFeedback(data: SurveyPayload) {
  try {
    const prev = JSON.parse(localStorage.getItem('jawib_feedback') ?? '[]');
    prev.push(data);
    localStorage.setItem('jawib_feedback', JSON.stringify(prev.slice(-50)));
  } catch {}
}

const AGE_LABELS: Record<AgeGroup, string> = {
  under18: 'أقل من 18',
  '18-25': '18–25',
  '26-35': '26–35',
  '36-50': '36–50',
  over50:  'فوق 50',
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy:   'سهلة 😊',
  medium: 'متوسطة 😐',
  hard:   'صعبة 😅',
};

export function FeedbackModal({ onClose, gameContext }: FeedbackModalProps) {
  const [rating, setRating]       = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [funScore, setFunScore]   = useState(0);
  const [ageGroup, setAgeGroup]   = useState<AgeGroup | null>(null);
  const [playAgain, setPlayAgain] = useState<boolean | null>(null);
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [comment, setComment]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]  = useState(false);

  const canSubmit = rating > 0 && difficulty !== null && funScore > 0
    && ageGroup !== null && playAgain !== null && recommend !== null;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    const payload: SurveyPayload = {
      timestamp: new Date().toISOString(),
      mode: gameContext?.mode ?? 'teams',
      isTrial: gameContext?.isTrial ?? false,
      alphaTeamName: gameContext?.alphaTeamName,
      betaTeamName: gameContext?.betaTeamName,
      alphaScore: gameContext?.alphaScore,
      betaScore: gameContext?.betaScore,
      questionsAnswered: gameContext?.questionsAnswered ?? 0,
      categoriesPlayed: gameContext?.categoriesPlayed ?? [],
      rating,
      difficulty: difficulty!,
      funScore,
      ageGroup: ageGroup!,
      playAgain: playAgain!,
      recommend: recommend!,
      playerName: playerName.trim() || undefined,
      comment: comment.trim() || undefined,
    };

    saveLocalFeedback(payload);

    try {
      await submitSurvey({ data: payload });
    } catch {
      // Server fn failure is non-fatal — local copy already saved
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="game-card p-8 max-w-xs w-full text-center animate-bounce-in">
          <div className="text-5xl mb-3">🙏</div>
          <p className="font-black text-xl text-gold-gradient">شكراً!</p>
          <p className="text-jawwib-text-dim text-sm mt-1">رأيك يساعدنا نطوّر جاوب</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-3">
      <div className="game-card p-5 w-full max-w-sm max-h-[92dvh] overflow-y-auto animate-slide-in-up space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gold-gradient">قيّم المباراة</h2>
          <button onClick={onClose} className="text-jawwib-text-dim hover:text-jawwib-text text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
        </div>

        {/* Game context badge */}
        {gameContext && (
          <div className="flex flex-wrap gap-1.5">
            {gameContext.mode === 'teams' && gameContext.alphaTeamName && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-jawwib-blue/10 text-jawwib-blue border border-jawwib-blue/20 font-bold">
                {gameContext.alphaTeamName} {gameContext.alphaScore !== undefined ? `(${gameContext.alphaScore})` : ''}
              </span>
            )}
            {gameContext.mode === 'teams' && gameContext.betaTeamName && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-jawwib-red/10 text-jawwib-red border border-jawwib-red/20 font-bold">
                {gameContext.betaTeamName} {gameContext.betaScore !== undefined ? `(${gameContext.betaScore})` : ''}
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-jawwib-surface border border-jawwib-border text-jawwib-text-dim">
              {gameContext.questionsAnswered} سؤال
            </span>
          </div>
        )}

        {/* 1. Overall rating */}
        <div>
          <p className="text-xs text-jawwib-text-dim mb-2 font-bold">١. كيف كانت المباراة؟ <span className="text-jawwib-red">*</span></p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)}
                className={`text-3xl transition-transform hover:scale-110 ${s <= rating ? '' : 'opacity-25'}`}>
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* 2. Difficulty */}
        <div>
          <p className="text-xs text-jawwib-text-dim mb-2 font-bold">٢. صعوبة الأسئلة؟ <span className="text-jawwib-red">*</span></p>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setDifficulty(k)}
                className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                  difficulty === k
                    ? 'border-jawwib-gold bg-jawwib-gold/10 text-jawwib-gold'
                    : 'border-jawwib-border text-jawwib-text-dim'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Fun score */}
        <div>
          <p className="text-xs text-jawwib-text-dim mb-2 font-bold">٣. مدى الاستمتاع؟ <span className="text-jawwib-red">*</span></p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setFunScore(s)}
                className={`text-2xl transition-transform hover:scale-110 ${s <= funScore ? '' : 'opacity-25'}`}>
                🎉
              </button>
            ))}
          </div>
        </div>

        {/* 4. Age group */}
        <div>
          <p className="text-xs text-jawwib-text-dim mb-2 font-bold">٤. عمرك؟ <span className="text-jawwib-red">*</span></p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.entries(AGE_LABELS) as [AgeGroup, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setAgeGroup(k)}
                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${
                  ageGroup === k
                    ? 'border-jawwib-gold bg-jawwib-gold/10 text-jawwib-gold'
                    : 'border-jawwib-border text-jawwib-text-dim'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Play again + recommend */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-jawwib-text-dim mb-2 font-bold">٥. تلعب مرة ثانية؟ <span className="text-jawwib-red">*</span></p>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => setPlayAgain(true)}
                className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                  playAgain === true ? 'border-jawwib-green bg-jawwib-green/10 text-jawwib-green' : 'border-jawwib-border text-jawwib-text-dim'
                }`}>
                نعم ✅
              </button>
              <button onClick={() => setPlayAgain(false)}
                className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                  playAgain === false ? 'border-jawwib-red bg-jawwib-red/10 text-jawwib-red' : 'border-jawwib-border text-jawwib-text-dim'
                }`}>
                لا ❌
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-jawwib-text-dim mb-2 font-bold">٦. توصي بها؟ <span className="text-jawwib-red">*</span></p>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => setRecommend(true)}
                className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                  recommend === true ? 'border-jawwib-green bg-jawwib-green/10 text-jawwib-green' : 'border-jawwib-border text-jawwib-text-dim'
                }`}>
                نعم ✅
              </button>
              <button onClick={() => setRecommend(false)}
                className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                  recommend === false ? 'border-jawwib-red bg-jawwib-red/10 text-jawwib-red' : 'border-jawwib-border text-jawwib-text-dim'
                }`}>
                لا ❌
              </button>
            </div>
          </div>
        </div>

        {/* 7. Optional name */}
        <div>
          <p className="text-xs text-jawwib-text-dim mb-1.5 font-bold">٧. اسمك (اختياري)</p>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="اكتب اسمك..."
            className="w-full px-3 py-2 rounded-xl text-sm"
            maxLength={40}
          />
        </div>

        {/* 8. Comment */}
        <div>
          <p className="text-xs text-jawwib-text-dim mb-1.5 font-bold">٨. أي اقتراح؟ (اختياري)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="رأيك يفرق..."
            className="w-full px-3 py-2 rounded-xl text-sm resize-none"
            rows={2}
            maxLength={300}
          />
        </div>

        {/* Bug report */}
        <p className="text-center text-xs text-jawwib-text-dim">
          لاحظت خطأ؟{' '}
          <a
            href="https://github.com/abdulmohsenalshammari1999-ui/jawiib/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-jawwib-gold underline"
          >
            أبلغ عنه 🐛
          </a>
        </p>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn-gold w-full"
        >
          {submitting ? '⏳ جاري الإرسال...' : 'إرسال التقييم 📊'}
        </button>
      </div>
    </div>
  );
}
