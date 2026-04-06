import { useState } from 'react';
import { categories } from '@/lib/categories';
import type { CategoryId } from '@/lib/types';

interface HomeScreenProps {
  onCreateRoom: (name: string, isTrial: boolean, categories?: CategoryId[]) => void;
  onJoinRoom: (name: string, code: string) => void;
}

export function HomeScreen({ onCreateRoom, onJoinRoom }: HomeScreenProps) {
  const [view, setView] = useState<'main' | 'create' | 'join'>('main');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedCats, setSelectedCats] = useState<CategoryId[]>(
    categories.map((c) => c.id)
  );

  const toggleCategory = (id: CategoryId) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  if (view === 'main') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <div className="mb-8 animate-bounce-in">
            <h1 className="text-7xl font-black text-gold-gradient mb-2">جاوب</h1>
            <p className="text-jawwib-text-dim text-lg">لعبة المعلومات العامة</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm text-jawwib-text-dim">مع</span>
              <span className="text-gold-gradient font-bold">مرحبا</span>
              <span className="text-sm">🎙️</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setView('create')}
              className="btn-gold w-full text-xl py-4"
            >
              🎮 أنشئ لعبة جديدة
            </button>
            <button
              onClick={() => setView('join')}
              className="w-full py-4 text-xl font-bold rounded-xl border-2 border-jawwib-gold text-jawwib-gold
                hover:bg-jawwib-gold/10 transition-all"
            >
              🔗 انضم للعبة
            </button>
          </div>

          {/* Features preview */}
          <div className="mt-8 grid grid-cols-2 gap-3 text-right">
            <div className="game-card p-3">
              <span className="text-2xl">🧠</span>
              <p className="text-xs mt-1 text-jawwib-text-dim">288 سؤال</p>
            </div>
            <div className="game-card p-3">
              <span className="text-2xl">📂</span>
              <p className="text-xs mt-1 text-jawwib-text-dim">16 فئة</p>
            </div>
            <div className="game-card p-3">
              <span className="text-2xl">💣</span>
              <p className="text-xs mt-1 text-jawwib-text-dim">تخريب</p>
            </div>
            <div className="game-card p-3">
              <span className="text-2xl">🔥</span>
              <p className="text-xs mt-1 text-jawwib-text-dim">مضاعف ×1.5</p>
            </div>
          </div>

          {/* Trial badge */}
          <div className="mt-6 p-3 rounded-xl bg-jawwib-gold/5 border border-jawwib-gold/20">
            <p className="text-jawwib-gold text-sm font-bold">✨ جرّب مجاناً! 9 أسئلة تجريبية</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <button
            onClick={() => setView('main')}
            className="text-jawwib-text-dim text-sm mb-6 hover:text-jawwib-text transition-colors"
          >
            → رجوع
          </button>

          <h2 className="text-2xl font-bold text-gold-gradient mb-6 text-center">
            انضم للعبة
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-jawwib-text-dim mb-1">اسمك</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="ادخل اسمك..."
                className="w-full px-4 py-3 rounded-xl bg-jawwib-surface border border-jawwib-border
                  text-jawwib-text placeholder:text-jawwib-text-dim/50 focus:border-jawwib-gold
                  focus:outline-none transition-colors"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm text-jawwib-text-dim mb-1">كود الغرفة</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="مثال: ABC12"
                className="w-full px-4 py-3 rounded-xl bg-jawwib-surface border border-jawwib-border
                  text-jawwib-text placeholder:text-jawwib-text-dim/50 focus:border-jawwib-gold
                  focus:outline-none transition-colors text-center text-2xl tracking-[0.3em] font-bold"
                dir="ltr"
                maxLength={5}
              />
            </div>

            <button
              onClick={() => onJoinRoom(playerName, roomCode)}
              disabled={!playerName.trim() || roomCode.length < 5}
              className="btn-gold w-full text-lg py-3 mt-4"
            >
              انضم! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create room view
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => setView('main')}
          className="text-jawwib-text-dim text-sm mb-4 hover:text-jawwib-text transition-colors"
        >
          → رجوع
        </button>

        <h2 className="text-2xl font-bold text-gold-gradient mb-6 text-center">
          أنشئ لعبة جديدة
        </h2>

        {/* Player name */}
        <div className="mb-6">
          <label className="block text-sm text-jawwib-text-dim mb-1">اسمك</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="ادخل اسمك..."
            className="w-full px-4 py-3 rounded-xl bg-jawwib-surface border border-jawwib-border
              text-jawwib-text placeholder:text-jawwib-text-dim/50 focus:border-jawwib-gold
              focus:outline-none transition-colors"
            maxLength={20}
          />
        </div>

        {/* Category selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-jawwib-text-dim">اختر الفئات</label>
            <button
              onClick={() =>
                setSelectedCats(
                  selectedCats.length === categories.length
                    ? []
                    : categories.map((c) => c.id)
                )
              }
              className="text-xs text-jawwib-gold hover:text-jawwib-gold-light"
            >
              {selectedCats.length === categories.length ? 'إلغاء الكل' : 'اختر الكل'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCats.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-right text-sm ${
                    isSelected
                      ? 'border-jawwib-gold bg-jawwib-gold/10'
                      : 'border-jawwib-border bg-jawwib-surface opacity-60'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-bold">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Game mode buttons */}
        <div className="space-y-3">
          <button
            onClick={() => onCreateRoom(playerName, false, selectedCats)}
            disabled={!playerName.trim() || selectedCats.length < 2}
            className="btn-gold w-full text-lg py-4"
          >
            👑 لعبة كاملة (4 د.ك)
          </button>
          <button
            onClick={() => onCreateRoom(playerName, true)}
            disabled={!playerName.trim()}
            className="w-full py-4 text-lg font-bold rounded-xl border-2 border-jawwib-border text-jawwib-text-dim
              hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
          >
            🆓 تجربة مجانية
          </button>
          <p className="text-center text-xs text-jawwib-text-dim">
            التجربة: 9 أسئلة • فئتين عشوائية • بدون مضاعفات
          </p>
        </div>
      </div>
    </div>
  );
}
