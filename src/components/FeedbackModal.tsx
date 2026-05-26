import { useState } from 'react';

interface FeedbackModalProps {
  onClose: () => void;
}

interface FeedbackData {
  stars: number;
  fair: boolean | null;
  comment: string;
}

function saveFeedback(data: FeedbackData) {
  try {
    const prev = JSON.parse(localStorage.getItem('jawib_feedback') ?? '[]');
    prev.push({ ...data, ts: Date.now() });
    localStorage.setItem('jawib_feedback', JSON.stringify(prev.slice(-50)));
    const count = parseInt(localStorage.getItem('jawib_match_count') ?? '0') + 1;
    localStorage.setItem('jawib_match_count', String(count));
  } catch {}
}

export function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [stars, setStars]     = useState(0);
  const [fair, setFair]       = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    saveFeedback({ stars, fair, comment });
    setSubmitted(true);
    setTimeout(onClose, 1500);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="game-card p-8 max-w-xs w-full text-center animate-bounce-in">
          <div className="text-5xl mb-3">🙏</div>
          <p className="font-black text-xl text-gold-gradient">شكراً!</p>
          <p className="text-jawwib-text-dim text-sm mt-1">رأيك يساعدنا نطوّر اللعبة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="game-card p-6 w-full max-w-sm animate-slide-in-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gold-gradient">قيّم المباراة</h2>
          <button onClick={onClose} className="text-jawwib-text-dim hover:text-jawwib-text text-xl leading-none">×</button>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setStars(s)}
              className={`text-3xl transition-transform hover:scale-110 ${s <= stars ? '' : 'opacity-25'}`}
            >
              ⭐
            </button>
          ))}
        </div>

        {/* Fair? */}
        <div className="mb-4">
          <p className="text-xs text-jawwib-text-dim mb-2 text-center">هل كانت اللعبة عادلة؟</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFair(true)}
              className={`py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                fair === true ? 'border-jawwib-green bg-jawwib-green/10 text-jawwib-green' : 'border-jawwib-border text-jawwib-text-dim'
              }`}
            >
              ✅ نعم
            </button>
            <button
              onClick={() => setFair(false)}
              className={`py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                fair === false ? 'border-jawwib-red bg-jawwib-red/10 text-jawwib-red' : 'border-jawwib-border text-jawwib-text-dim'
              }`}
            >
              ❌ لا
            </button>
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="أي تعليق؟ (اختياري)"
            className="w-full px-3 py-2 rounded-xl text-sm resize-none"
            rows={2}
            maxLength={200}
          />
        </div>

        {/* Bug report */}
        <p className="text-center text-xs text-jawwib-text-dim mb-3">
          لاحظت خطأ؟{' '}
          <a
            href="https://github.com/abdulmohsenalshammari1999-ui/jawiib/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-jawwib-gold underline"
          >
            أبلغ عنه هنا 🐛
          </a>
        </p>

        <button
          onClick={handleSubmit}
          disabled={stars === 0}
          className="btn-gold w-full"
        >
          إرسال التقييم
        </button>
      </div>
    </div>
  );
}
