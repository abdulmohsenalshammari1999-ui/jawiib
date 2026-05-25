import { useState } from 'react';
import { categories } from '@/lib/categories';
import type { CategoryId } from '@/lib/types';

interface HomeScreenProps {
  onCreateRoom: (name: string, isTrial: boolean, cats?: CategoryId[], mode?: 'ffa' | 'teams') => void;
  onJoinRoom: (name: string, code: string) => void;
}

type View = 'main' | 'create' | 'join';
type GameMode = 'ffa' | 'teams';

const FEATURES = [
  { icon: '🧠', label: '288 سؤال' },
  { icon: '📂', label: '16 فئة' },
  { icon: '💣', label: 'تخريب' },
  { icon: '👥', label: 'فريق مقابل فريق' },
];

export function HomeScreen({ onCreateRoom, onJoinRoom }: HomeScreenProps) {
  const [view, setView]               = useState<View>('main');
  const [playerName, setPlayerName]   = useState('');
  const [roomCode, setRoomCode]       = useState('');
  const [gameMode, setGameMode]       = useState<GameMode>('ffa');
  const [selectedCats, setSelectedCats] = useState<CategoryId[]>(categories.map((c) => c.id));

  const toggleCategory = (id: CategoryId) =>
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  // ── Main screen ─────────────────────────────────────────────────────────────
  if (view === 'main') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
        {/* Logo */}
        <div className="text-center animate-bounce-in">
          <h1 className="text-8xl font-black text-gold-gradient leading-none mb-2">جاوب</h1>
          <p className="text-jawwib-text-dim text-base">لعبة المعلومات العامة</p>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <span className="text-sm text-jawwib-text-dim">مع</span>
            <span className="text-gold-gradient font-black">مرحبا</span>
            <span>🎙️</span>
          </div>
        </div>

        {/* Mode selector */}
        <div className="w-full max-w-xs">
          <p className="text-center text-xs text-jawwib-text-dim mb-2">وضع اللعب</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGameMode('ffa')}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                gameMode === 'ffa'
                  ? 'border-jawwib-gold bg-jawwib-gold/10 text-jawwib-gold'
                  : 'border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold/40'
              }`}
            >
              <span className="text-xl">⚔️</span>
              <span>الكل ضد الكل</span>
            </button>
            <button
              onClick={() => setGameMode('teams')}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                gameMode === 'teams'
                  ? 'border-jawwib-gold bg-jawwib-gold/10 text-jawwib-gold'
                  : 'border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold/40'
              }`}
            >
              <span className="text-xl">🛡️</span>
              <span>فريق ضد فريق</span>
            </button>
          </div>
        </div>

        {/* Main buttons */}
        <div className="w-full max-w-xs space-y-2">
          <button onClick={() => setView('create')} className="btn-gold w-full text-xl py-4">
            🎮 أنشئ لعبة جديدة
          </button>
          <button
            onClick={() => setView('join')}
            className="w-full py-4 text-xl font-bold rounded-xl border-2 border-jawwib-gold text-jawwib-gold hover:bg-jawwib-gold/10 transition-all"
          >
            🔗 انضم للعبة
          </button>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
          {FEATURES.map((f) => (
            <div key={f.label} className="game-card p-2 text-center">
              <span className="text-xl block mb-1">{f.icon}</span>
              <span className="text-xs text-jawwib-text-dim leading-tight">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Trial badge */}
        <div className="w-full max-w-xs p-3 rounded-xl bg-jawwib-gold/5 border border-jawwib-gold/20 text-center">
          <p className="text-jawwib-gold text-xs font-bold">✨ 9 أسئلة تجريبية مجانية</p>
        </div>
      </div>
    );
  }

  // ── Join screen ──────────────────────────────────────────────────────────────
  if (view === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full animate-slide-up">
          <button onClick={() => setView('main')} className="text-jawwib-text-dim text-sm mb-6 flex items-center gap-1 hover:text-jawwib-text transition-colors">
            ← رجوع
          </button>
          <h2 className="text-2xl font-black text-gold-gradient mb-6 text-center">انضم للعبة</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-jawwib-text-dim mb-1">اسمك</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="ادخل اسمك..."
                className="w-full px-4 py-3 rounded-xl bg-jawwib-surface border border-jawwib-border text-jawwib-text placeholder:text-jawwib-text-dim/50 focus:border-jawwib-gold focus:outline-none transition-colors"
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-xs text-jawwib-text-dim mb-1">كود الغرفة</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="مثال: ABC12"
                className="w-full px-4 py-3 rounded-xl bg-jawwib-surface border border-jawwib-border text-jawwib-text placeholder:text-jawwib-text-dim/50 focus:border-jawwib-gold focus:outline-none transition-colors text-center text-2xl tracking-[0.3em] font-bold"
                dir="ltr"
                maxLength={5}
              />
            </div>
            <button
              onClick={() => onJoinRoom(playerName, roomCode)}
              disabled={!playerName.trim() || roomCode.length < 5}
              className="btn-gold w-full text-lg py-3"
            >
              انضم! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Create room screen ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto animate-slide-up">
        <button onClick={() => setView('main')} className="text-jawwib-text-dim text-sm mb-4 flex items-center gap-1 hover:text-jawwib-text transition-colors">
          ← رجوع
        </button>
        <h2 className="text-2xl font-black text-gold-gradient mb-5 text-center">أنشئ لعبة جديدة</h2>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-xs text-jawwib-text-dim mb-1">اسمك</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="ادخل اسمك..."
            className="w-full px-4 py-3 rounded-xl bg-jawwib-surface border border-jawwib-border text-jawwib-text placeholder:text-jawwib-text-dim/50 focus:border-jawwib-gold focus:outline-none transition-colors"
            maxLength={20}
          />
        </div>

        {/* Mode (inherited from main screen, show label) */}
        <div className="mb-5 flex items-center gap-3 p-3 rounded-xl bg-jawwib-surface border border-jawwib-border">
          <span className="text-xl">{gameMode === 'teams' ? '🛡️' : '⚔️'}</span>
          <div>
            <p className="text-sm font-bold">{gameMode === 'teams' ? 'فريق ضد فريق' : 'الكل ضد الكل'}</p>
            <p className="text-xs text-jawwib-text-dim">
              {gameMode === 'teams' ? 'فريقين — أزرق وأحمر' : 'كل لاعب يلعب لحساسبه'}
            </p>
          </div>
          <button
            onClick={() => setGameMode((m) => m === 'ffa' ? 'teams' : 'ffa')}
            className="mr-auto text-xs text-jawwib-gold hover:underline"
          >
            تغيير
          </button>
        </div>

        {/* Category selection */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-jawwib-text-dim">الفئات ({selectedCats.length})</label>
            <button
              onClick={() => setSelectedCats(selectedCats.length === categories.length ? [] : categories.map((c) => c.id))}
              className="text-xs text-jawwib-gold hover:text-jawwib-gold-light"
            >
              {selectedCats.length === categories.length ? 'إلغاء الكل' : 'اختر الكل'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto">
            {categories.map((cat) => {
              const sel = selectedCats.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-right text-sm ${
                    sel ? 'border-jawwib-gold bg-jawwib-gold/10' : 'border-jawwib-border bg-jawwib-surface opacity-60'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="font-bold text-xs">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onCreateRoom(playerName, false, selectedCats, gameMode)}
            disabled={!playerName.trim() || selectedCats.length < 2}
            className="btn-gold w-full text-lg py-4"
          >
            👑 لعبة كاملة (4 د.ك)
          </button>
          <button
            onClick={() => onCreateRoom(playerName, true, undefined, gameMode)}
            disabled={!playerName.trim()}
            className="w-full py-3.5 text-base font-bold rounded-xl border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
          >
            🆓 تجربة مجانية — 9 أسئلة
          </button>
        </div>
      </div>
    </div>
  );
}
