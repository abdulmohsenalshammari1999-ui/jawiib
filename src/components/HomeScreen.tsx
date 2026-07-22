import { useState } from 'react';
import { categories } from '@/lib/categories';
import { APP_CONFIG } from '@/lib/appConfig';
import type { CategoryId } from '@/lib/types';
import { loadCustomGames, type CustomGame } from '@/lib/customGames';

interface HomeScreenProps {
  onCreateRoom: (name: string, isTrial: boolean, cats?: CategoryId[], mode?: 'ffa' | 'teams') => void;
  onJoinRoom: (name: string, code: string) => void;
  onQuickPlay?: (name: string) => void;
  onCustomGame?: (game: CustomGame, playerName: string) => void;
  onMysteryGame?: () => void;
  accountName?: string;
  accountAvatar?: string;
}

type View = 'main' | 'create' | 'join' | 'quickplay' | 'customgame';
type GameMode = 'ffa' | 'teams';

export function HomeScreen({ onCreateRoom, onJoinRoom, onQuickPlay, onCustomGame, onMysteryGame, accountName, accountAvatar }: HomeScreenProps) {
  const [view, setView]               = useState<View>('main');
  const [playerName, setPlayerName]   = useState(accountName ?? '');
  const [roomCode, setRoomCode]       = useState('');
  const [gameMode, setGameMode]       = useState<GameMode>('teams');
  const [selectedCats, setSelectedCats] = useState<CategoryId[]>(categories.map((c) => c.id));
  const [customGames]                 = useState<CustomGame[]>(() => loadCustomGames());

  const toggleCategory = (id: CategoryId) =>
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  // ── Main ──────────────────────────────────────────────────────────────────────
  if (view === 'main') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 gap-7">
        {/* Logo */}
        <div className="text-center animate-bounce-in">
          <h1 className="text-8xl font-black text-gold-gradient leading-none">جاوب</h1>
          <div className="sadu-accent mx-auto mt-2 mb-1" style={{ maxWidth: 120 }} />
          <p className="text-jawwib-text-dim text-sm">لعبة الثقافة العامة العربية</p>
          <div className="cultural-strip mt-2">
            🌴 🐪 ☕ 🦅 🌊
          </div>
        </div>

        {/* Team vs Team CTA */}
        <div className="w-full max-w-xs">
          <div className="flex items-stretch gap-2 p-3 rounded-2xl border-2 border-jawwib-gold/40 bg-jawwib-gold/5 mb-4">
            <div className="flex-1 text-center">
              <p className="text-2xl mb-0.5">🔵</p>
              <p className="text-jawwib-blue font-black text-sm">فريقك</p>
              <p className="text-[9px] text-jawwib-text-dim mt-0.5 opacity-75">أنت تختار الاسم</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-xl font-black text-jawwib-gold leading-none">VS</p>
              <p className="text-[8px] text-jawwib-text-dim mt-0.5">منافسة</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-2xl mb-0.5">🔴</p>
              <p className="text-jawwib-red font-black text-sm">منافسيك</p>
              <p className="text-[9px] text-jawwib-text-dim mt-0.5 opacity-75">هم يختارون الاسم</p>
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
              <span className="text-xl">🌊🐪</span>
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
              <span className="text-xl">🏆</span>
              <span>الكل ضد الكل</span>
            </button>
          </div>

          {onQuickPlay && (
            <button
              onClick={() => {
                if (playerName.trim()) { onQuickPlay(playerName.trim()); }
                else { setView('quickplay'); }
              }}
              className="w-full text-xl py-4 mb-2 rounded-xl font-black transition-all"
              style={{ background: 'linear-gradient(135deg,#5FA98C,#4A8C74)', color: '#16100B', boxShadow: '0 4px 18px rgba(95,169,140,0.35)' }}
            >
              ⚡ لعبة سريعة
            </button>
          )}
          <button onClick={() => setView('create')} className="btn-gold w-full text-xl py-4 mb-2">
            🎮 أنشئ لعبة
          </button>
          <button
            onClick={() => setView('join')}
            className="w-full py-3.5 text-base font-bold rounded-xl border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
          >
            🔗 انضم بكود
          </button>
          {onCustomGame && (
            <button
              onClick={() => setView('customgame')}
              className="w-full py-3 text-sm font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-2"
              style={{ borderColor: 'rgba(200,90,52,0.5)', color: '#C85A34', background: 'rgba(200,90,52,0.08)' }}
            >
              <span>🎨</span>
              <span>لعبة مخصصة</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black" style={{ background: '#C85A34', color: '#fff' }}>
                مميز
              </span>
            </button>
          )}
          {onMysteryGame && (
            <button
              onClick={onMysteryGame}
              className="w-full rounded-2xl text-right transition-all hover:scale-[1.01] active:scale-[.99]"
              style={{
                background: 'linear-gradient(135deg,#120709 0%,#1A0B0E 60%,#0F1015 100%)',
                border: '1.5px solid rgba(139,0,0,.55)',
                boxShadow: '0 4px 24px rgba(139,0,0,.22), inset 0 1px 0 rgba(255,255,255,.04)',
                padding: 0, overflow: 'hidden',
              }}
            >
              {/* Crime tape stripe */}
              <div style={{ height: '4px', background: 'repeating-linear-gradient(45deg,#8B0000 0,#8B0000 8px,transparent 8px,transparent 16px)' }} />
              <div style={{ padding: '14px 16px 16px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '22px' }}>🔍</span>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 900, color: '#EDEEF0', margin: 0, lineHeight: 1 }}>مَن الفاعل؟</p>
                      <p style={{ fontSize: '9.5px', color: '#A6A9AE', margin: '2px 0 0' }}>لعبة تحقيق تعاونية</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 900, padding: '3px 7px', borderRadius: '5px', background: '#8B0000', color: '#fff', letterSpacing: '.04em' }}>جديد</span>
                </div>
                {/* Suspects row */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                  {['👨‍💼','👩‍🏫','🧔','👩','👦','🤵'].map((e) => (
                    <span key={e} style={{ fontSize: '16px', padding: '4px 5px', background: 'rgba(255,255,255,.04)', borderRadius: '7px', border: '1px solid rgba(255,255,255,.07)' }}>{e}</span>
                  ))}
                </div>
                {/* Feature tags */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {['🎙️ أصوات مجسّمة','📋 دفتر أدلة','🤝 تعاون الفريق','🎭 216 قضية'].map((tag) => (
                    <span key={tag} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', background: 'rgba(255,255,255,.06)', color: '#A6A9AE', border: '1px solid rgba(255,255,255,.08)' }}>{tag}</span>
                  ))}
                </div>
                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px', borderRadius: '10px', background: 'linear-gradient(135deg,#8B0000,#5C0000)', boxShadow: '0 3px 12px rgba(139,0,0,.5)' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 900, color: '#fff' }}>ابدأ التحقيق</span>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-center">
          {[
            { n: '456',    label: 'سؤال' },
            { n: '22',     label: 'فئة' },
            { n: '🏴‍☠️', label: 'سرقة' },
            { n: '5',      label: 'سلاح' },
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

  // ── Quick Play ────────────────────────────────────────────────────────────────
  if (view === 'quickplay') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full animate-slide-up">
          <button
            onClick={() => setView('main')}
            className="text-jawwib-text-dim text-sm mb-6 flex items-center gap-1 hover:text-jawwib-text transition-colors"
          >
            ← رجوع
          </button>
          <div className="text-center mb-6">
            <p className="text-4xl mb-2">⚡</p>
            <h2 className="text-2xl font-black text-gold-gradient">لعبة سريعة</h2>
            <p className="text-jawwib-text-dim text-sm mt-1">5 فئات عشوائية، ابدأ فورًا!</p>
          </div>
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
            <button
              onClick={() => { if (playerName.trim() && onQuickPlay) onQuickPlay(playerName.trim()); }}
              disabled={!playerName.trim()}
              className="w-full text-xl py-4 rounded-xl font-black transition-all"
              style={{ background: 'linear-gradient(135deg,#5FA98C,#4A8C74)', color: '#16100B', boxShadow: '0 4px 18px rgba(95,169,140,0.35)', opacity: playerName.trim() ? 1 : 0.5 }}
            >
              ⚡ انطلق!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Custom Game ───────────────────────────────────────────────────────────────
  if (view === 'customgame') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full animate-slide-up">
          <button
            onClick={() => setView('main')}
            className="text-jawwib-text-dim text-sm mb-6 flex items-center gap-1 hover:text-jawwib-text transition-colors"
          >
            ← رجوع
          </button>
          <h2 className="text-2xl font-black mb-1 text-center" style={{ color: '#C85A34' }}>🎨 لعبة مخصصة</h2>
          <p className="text-jawwib-text-dim text-xs text-center mb-5">ألعابك المحفوظة من لوحة التحكم</p>

          {/* Player name */}
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

          {customGames.length === 0 ? (
            <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(200,90,52,0.3)', color: '#C85A34' }}>
              <p className="text-3xl mb-2">📭</p>
              <p className="font-bold text-sm mb-1">لا توجد ألعاب مخصصة بعد</p>
              <p className="text-jawwib-text-dim text-xs">أنشئ لعبة من لوحة التحكم على /admin</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {customGames.map((game) => (
                <button
                  key={game.id}
                  disabled={!playerName.trim() || game.questions.length === 0}
                  onClick={() => onCustomGame?.(game, playerName.trim())}
                  className="w-full text-right p-3.5 rounded-xl border-2 transition-all disabled:opacity-40"
                  style={{ borderColor: game.color + '60', background: game.color + '12' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{game.emoji}</span>
                    <div className="flex-1">
                      <p className="font-black text-sm text-jawwib-text">{game.name}</p>
                      <p className="text-[10px] text-jawwib-text-dim mt-0.5">
                        {game.questions.length} سؤال
                        {game.description ? ` · ${game.description}` : ''}
                      </p>
                    </div>
                    <span className="text-jawwib-gold text-sm">▶</span>
                  </div>
                </button>
              ))}
            </div>
          )}
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
          <div className="flex items-center gap-2">
            {accountAvatar && (
              <span className="text-2xl shrink-0">{accountAvatar}</span>
            )}
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="ادخل اسمك..."
              className="flex-1 px-4 py-3 rounded-xl"
              maxLength={20}
              autoFocus
            />
          </div>
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
              <span>🔵🔴</span>
              <div className="text-right">
                <p className="text-sm leading-none">فريق ضد فريق</p>
                <p className="text-[10px] opacity-60 mt-0.5">سمّ فريقك أنت</p>
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
              <span>🏆</span>
              <div className="text-right">
                <p className="text-sm leading-none">الكل ضد الكل</p>
                <p className="text-[10px] opacity-60 mt-0.5">كل لاعب لحسابه</p>
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
            👑 لعبة كاملة — {APP_CONFIG.currencyAmount} {APP_CONFIG.currencyLabel}
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
