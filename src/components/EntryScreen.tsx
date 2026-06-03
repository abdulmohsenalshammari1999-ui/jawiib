import { useState, useEffect } from 'react';
import { HowToPlayModal, useFirstVisit } from './HowToPlayModal';
import { useAccountStore } from '@/store/accountStore';
import { RegisterScreen } from './RegisterScreen';

interface EntryScreenProps {
  onEnter: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  account?: { name: string; avatar: string; stats: { gamesPlayed: number; wins: number } } | null;
}

export function EntryScreen({
  onEnter,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  account,
}: EntryScreenProps) {
  const editProfile = useAccountStore((s) => s.editProfile);
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const { isFirstVisit, markSeen } = useFirstVisit();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Auto-open on first visit once the entry screen is fully visible
  useEffect(() => {
    if (isFirstVisit && mounted) {
      const t = setTimeout(() => setShowHowTo(true), 600);
      return () => clearTimeout(t);
    }
  }, [isFirstVisit, mounted]);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 380);
  };

  const visible = mounted && !exiting;

  if (editingProfile) {
    return (
      <RegisterScreen
        onComplete={() => setEditingProfile(false)}
        editMode
        initialName={account?.name}
        initialAvatar={account?.avatar}
        onSave={(name, avatar) => { editProfile(name, avatar); setEditingProfile(false); }}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-diwaniya flex flex-col relative overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.38s ease-out' }}
    >
      <div className="sadu-accent w-full" />

      {/* How-to-play trigger */}
      <button
        onClick={() => setShowHowTo(true)}
        className="absolute top-3 left-3 z-20 w-9 h-9 flex items-center justify-center rounded-full text-sm font-black transition-all tap-target"
        style={{
          background: 'rgba(176,125,26,0.12)',
          border: '1.5px solid rgba(176,125,26,0.35)',
          color: '#B07D1A',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.55s 0.4s ease-out',
        }}
        aria-label="How to play"
        title="How to play / كيف تلعب"
      >
        ?
      </button>

      {/* Ambient glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 22% 12%, rgba(176,125,26,0.11) 0%, transparent 50%),' +
            'radial-gradient(ellipse at 78% 88%, rgba(26,95,168,0.09) 0%, transparent 44%)',
        }}
      />

      <div className="dune-silhouette" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 z-10">

        {/* Logo */}
        <div
          className="text-center"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.55s ease-out, transform 0.55s ease-out',
          }}
        >
          <h1 className="text-[5.5rem] sm:text-[7rem] font-black text-gold-gradient leading-none tracking-tight">
            جاوب
          </h1>
          <div className="sadu-accent mx-auto mt-3 max-w-[144px]" />
          <p className="text-jawwib-text-dim text-sm mt-2 font-medium">
            لعبة الثقافة العامة العربية
          </p>
          <div className="cultural-strip mt-3">
            🌴 🐪 ☕ 🦅 🌊 🌴
          </div>
        </div>

        {/* Stats */}
        <div
          className="flex items-center gap-5 text-center"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.55s 0.12s ease-out',
          }}
        >
          {[
            { n: '456',    label: 'سؤال' },
            { n: '22',     label: 'فئة' },
            { n: '🏴‍☠️', label: 'سرقة' },
            { n: '5',      label: 'سلاح' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-jawwib-gold font-black text-lg leading-none">{s.n}</p>
              <p className="text-jawwib-text-dim text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Differentiator strip */}
        <div
          className="flex items-center justify-center gap-2 text-[10px] text-jawwib-text-dim"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.55s 0.15s ease-out',
          }}
        >
          <span>🎯 22 فئة متنوعة</span>
          <span className="opacity-40">·</span>
          <span>🏴‍☠️ آلية السرقة</span>
          <span className="opacity-40">·</span>
          <span>⚔️ 5 أسلحة</span>
        </div>

        {/* Host welcome */}
        <div
          className="w-full max-w-sm"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.55s 0.08s ease-out, transform 0.55s 0.08s ease-out',
          }}
        >
          <div className="flex items-center gap-3 bg-jawwib-surface rounded-2xl px-4 py-3 border border-jawwib-border">
            <span className="text-2xl shrink-0">🎙️</span>
            <p className="text-jawwib-text text-sm font-bold leading-snug">
              أهلاً وسهلاً في جاوب — لعبة الثقافة العامة العربية! 🏆✨
            </p>
          </div>
        </div>

        {/* Account badge */}
        {account && (
          <div
            className="w-full max-w-sm"
            style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.55s 0.18s ease-out' }}
          >
            <div className="flex items-center justify-between bg-jawwib-surface rounded-2xl px-4 py-2.5 border border-jawwib-border">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{account.avatar}</span>
                <div>
                  <p className="font-black text-sm text-jawwib-text leading-none">{account.name}</p>
                  <p className="text-[10px] text-jawwib-text-dim mt-0.5">
                    {account.stats.gamesPlayed} {account.stats.gamesPlayed === 1 ? 'لعبة' : 'ألعاب'} ·{' '}
                    {account.stats.wins} {account.stats.wins === 1 ? 'فوز' : 'انتصار'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProfile(true)}
                className="text-xs text-jawwib-text-dim hover:text-jawwib-gold transition-colors px-2 py-1 rounded-lg tap-target"
              >
                ✏️ تعديل
              </button>
            </div>
          </div>
        )}

        {/* CTA + toggles */}
        <div
          className="w-full max-w-sm space-y-3"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.55s 0.2s ease-out, transform 0.55s 0.2s ease-out',
          }}
        >
          <button
            onClick={handleEnter}
            className="btn-gold w-full text-xl py-5 animate-pulse-gold tap-target"
          >
            ابدأ اللعبة 🚀
          </button>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onToggleSound}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all tap-target ${
                soundEnabled
                  ? 'border-jawwib-gold/40 text-jawwib-gold bg-jawwib-gold/8'
                  : 'border-jawwib-border text-jawwib-text-dim opacity-50'
              }`}
            >
              {soundEnabled ? '🔊' : '🔇'} {soundEnabled ? 'صوت' : 'صامت'}
            </button>
            <button
              onClick={onToggleMusic}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all tap-target ${
                musicEnabled
                  ? 'border-jawwib-gold/40 text-jawwib-gold bg-jawwib-gold/8'
                  : 'border-jawwib-border text-jawwib-text-dim opacity-50'
              }`}
            >
              {musicEnabled ? '🎵' : '🔕'} {musicEnabled ? 'موسيقى' : 'بدون'}
            </button>
          </div>
        </div>

        {/* Team preview */}
        <div
          className="w-full max-w-sm"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.55s 0.3s ease-out',
          }}
        >
          <div className="flex items-stretch gap-3">
            <div className="flex-1 text-center p-3 rounded-2xl border-2 border-jawwib-blue/35 bg-blue-50/40">
              <p className="text-2xl mb-1">🔵</p>
              <p className="text-jawwib-blue font-black text-sm leading-tight">فريقك</p>
              <p className="text-jawwib-text-dim text-[10px] mt-1 leading-snug opacity-80">
                أنت تختار<br/>اسم فريقك
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5">
              <p className="text-xl font-black text-jawwib-gold leading-none">VS</p>
              <p className="text-[9px] text-jawwib-text-dim text-center">فريق<br/>ضد فريق</p>
            </div>
            <div className="flex-1 text-center p-3 rounded-2xl border-2 border-jawwib-red/35 bg-red-50/40">
              <p className="text-2xl mb-1">🔴</p>
              <p className="text-jawwib-red font-black text-sm leading-tight">منافسيك</p>
              <p className="text-jawwib-text-dim text-[10px] mt-1 leading-snug opacity-80">
                هم يختارون<br/>اسم فريقهم
              </p>
            </div>
          </div>
          <p className="text-center text-[10px] text-jawwib-text-dim mt-2 opacity-70">
            سمّ فريقك واثبت أنك الأفضل 🏆
          </p>
        </div>

      </div>

      <div className="sadu-accent w-full" />

      {showHowTo && (
        <HowToPlayModal
          onClose={() => {
            markSeen();
            setShowHowTo(false);
          }}
        />
      )}
    </div>
  );
}
