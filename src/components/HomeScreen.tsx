import { useState } from 'react';
import { categories } from '@/lib/categories';
import type { CategoryId } from '@/lib/types';

interface HomeScreenProps {
  onCreateRoom: (name: string, isTrial: boolean, cats?: CategoryId[], mode?: 'ffa' | 'teams') => void;
  onJoinRoom: (name: string, code: string) => void;
}

type View = 'main' | 'create' | 'join';
type GameMode = 'ffa' | 'teams';

export function HomeScreen({ onCreateRoom, onJoinRoom }: HomeScreenProps) {
  const [view, setView]               = useState<View>('main');
  const [playerName, setPlayerName]   = useState('');
  const [roomCode, setRoomCode]       = useState('');
  const [gameMode, setGameMode]       = useState<GameMode>('teams');
  const [selectedCats, setSelectedCats] = useState<CategoryId[]>(categories.map((c) => c.id));

  const toggleCategory = (id: CategoryId) =>
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  // ── Main ──────────────────────────────────────────────────────────────────────
  if (view === 'main') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 gap-7">
        {/* Logo */}
        <div className="text-center animate-bounce-in">
          <h1 className="text-8xl font-black text-gold-gradient leading-none">جاوب</h1>
          <p className="text-jawwib-text-dim text-sm mt-1">لعبة الثقافة العامة</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="text-xs text-jawwib-text-dim">مع مقدم اللعبة</span>
            <span className="text-gold-gradient font-bold text-xs">مرحبا</span>
            <span>🎙️</span>
          </div>
        </div>

        {/* Rivalry CTA */}
        <div className="w-full max-w-xs">
          <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-jawwib-gold/40 bg-jawwib-gold/5 mb-4">
            <div className="flex-1 text-center">
              <p className="text-jawwib-blue font-black text-lg">الفريق الأزرق</p>
              <p className="text-jawwib-text-dim text-xs">🛡️</p>
            </div>
            <div className="text-2xl font-black text-jawwib-gold">VS</div>
            <div className="flex-1 text-center">
              <p className="text-jawwib-red font-black text-lg">الفريق الأحمر</p>
              <p className="text-jawwib-text-dim text-xs">⚔️</p>
            </div>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-2 mb-4">
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
          </div>

          <button onClick={() => setView('create')} className="btn-gold w-full text-xl py-4 mb-2">
            🎮 أنشئ لعبة
          </button>
          <button
            onClick={() => setView('join')}
            className="w-full py-3.5 text-base font-bold rounded-xl border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
          >
            🔗 انضم بكود
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-center">
          {[
            { n: '456', label: 'سؤال' },
            { n: '22',  label: 'فئة' },
            { n: '6',   label: 'مستوى' },
            { n: '💣',  label: 'تخريب' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-jawwib-gold font-black text-lg leading-none">{s.n}</p>
              <p className="text-jawwib-text-dim text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>

        <p className="text-jawwib-text-dim text-xs opacity-60">
          ✨ 9 أسئلة تجريبية مجانية
        </p>
      </div>
    );
  }

  // ── Join ──────────────────────────────────────────────────────────────────────
  if (view === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full animate-slide-up">
          <button
            onClick={() => setView('main')}
            className="text-jawwib-text-dim text-sm mb-6 flex items-center gap-1 hover:text-jawwib-text transition-colors"
          >
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
                className="w-full px-4 py-3 rounded-xl"
                maxLength={20}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-jawwib-text-dim mb-1">كود الغرفة</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="مثال: ABC12"
                className="w-full px-4 py-3 rounded-xl text-center text-2xl tracking-[0.3em] font-bold"
                dir="ltr"
                maxLength={5}
              />
            </div>
            <button
              onClick={() => onJoinRoom(playerName, roomCode)}
              disabled={!playerName.trim() || roomCode.length < 5}
              className="btn-gold w-full text-lg py-3.5"
            >
              انضم! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Create ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto animate-slide-up">
        <button
          onClick={() => setView('main')}
          className="text-jawwib-text-dim text-sm mb-4 flex items-center gap-1 hover:text-jawwib-text transition-colors"
        >
          ← رجوع
        </button>
        <h2 className="text-2xl font-black text-gold-gradient mb-5 text-center">أنشئ لعبة جديدة</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs text-jawwib-text-dim mb-1">اسمك</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="ادخل اسمك..."
            className="w-full px-4 py-3 rounded-xl"
            maxLength={20}
            autoFocus
          />
        </div>

        {/* Mode */}
        <div className="mb-4">
          <p className="text-xs text-jawwib-text-dim mb-2">وضع اللعب</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGameMode('teams')}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                gameMode === 'teams'
                  ? 'border-jawwib-gold bg-jawwib-gold/10 text-jawwib-gold'
                  : 'border-jawwib-border text-jawwib-text-dim'
              }`}
            >
              <span>🛡️</span>
              <div className="text-right">
                <p className="text-sm leading-none">فريق ضد فريق</p>
                <p className="text-[10px] opacity-60 mt-0.5">أزرق vs أحمر</p>
              </div>
            </button>
            <button
              onClick={() => setGameMode('ffa')}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                gameMode === 'ffa'
                  ? 'border-jawwib-gold bg-jawwib-gold/10 text-jawwib-gold'
                  : 'border-jawwib-border text-jawwib-text-dim'
              }`}
            >
              <span>⚔️</span>
              <div className="text-right">
                <p className="text-sm leading-none">الكل ضد الكل</p>
                <p className="text-[10px] opacity-60 mt-0.5">كل لاعب لحساسبه</p>
              </div>
            </button>
          </div>
        </div>

        {/* Category selection — FFA only; teams mode uses draft */}
        {gameMode === 'ffa' && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-jawwib-text-dim">الفئات ({selectedCats.length}/{categories.length})</label>
              <button
                onClick={() =>
                  setSelectedCats(selectedCats.length === categories.length ? [] : categories.map((c) => c.id))
                }
                className="text-xs text-jawwib-gold hover:text-jawwib-gold-dark"
              >
                {selectedCats.length === categories.length ? 'إلغاء الكل' : 'اختر الكل'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
              {categories.map((cat) => {
                const sel = selectedCats.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-right text-sm ${
                      sel
                        ? 'border-jawwib-gold bg-jawwib-gold/8 text-jawwib-text'
                        : 'border-jawwib-border bg-jawwib-surface text-jawwib-text-dim opacity-60'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="font-bold text-xs">{cat.name}</span>
                    {sel && <span className="text-jawwib-gold text-[10px] mr-auto">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {gameMode === 'teams' && (
          <div className="mb-5 p-3 rounded-xl border border-jawwib-gold/30 bg-jawwib-gold/5 text-center">
            <p className="text-jawwib-gold text-xs font-bold">🎯 كل فريق سيختار فئاته في الجولة التالية</p>
          </div>
        )}

        {/* Start buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onCreateRoom(playerName, false, gameMode === 'teams' ? undefined : selectedCats, gameMode)}
            disabled={!playerName.trim() || (gameMode === 'ffa' && selectedCats.length < 2)}
            className="btn-gold w-full text-lg py-4"
          >
            👑 لعبة كاملة — 4 د.ك
          </button>
          <button
            onClick={() => onCreateRoom(playerName, true, undefined, gameMode)}
            disabled={!playerName.trim()}
            className="w-full py-3.5 text-base font-bold rounded-xl border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
          >
            🆓 جرّب مجانًا — 9 أسئلة
          </button>
        </div>
      </div>
    </div>
  );
}
