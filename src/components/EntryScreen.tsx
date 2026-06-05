import { useState, useEffect } from 'react';
import { useAccountStore } from '@/store/accountStore';
import { RegisterScreen } from './RegisterScreen';

export type StartMode = 'teams' | 'ffa' | 'quick';

interface EntryScreenProps {
  onEnter: () => void;
  onDirectStart?: (name: string, mode: StartMode) => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  account?: { name: string; avatar: string; stats: { gamesPlayed: number; wins: number } } | null;
}

const MODE_OPTIONS: { id: StartMode; icon: string; label: string; sub: string }[] = [
  { id: 'quick',  icon: '⚡', label: 'سريع',        sub: 'فئات عشوائية' },
  { id: 'teams',  icon: '🌊🐪', label: 'فرق',      sub: 'فريق ضد فريق' },
  { id: 'ffa',    icon: '🏆', label: 'كل ضد الكل', sub: 'كل لاعب لحاله' },
];

export function EntryScreen({
  onEnter,
  onDirectStart,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  account,
}: EntryScreenProps) {
  const editProfile = useAccountStore((s) => s.editProfile);
  const [mounted, setMounted]           = useState(false);
  const [mode, setMode]                 = useState<StartMode>('teams');
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    if (onDirectStart && account) {
      onDirectStart(account.name, mode);
    } else {
      onEnter();
    }
  };

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
      className="min-h-screen bg-diwaniya flex flex-col"
      style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s ease-out' }}
    >
      <div className="sadu-accent w-full" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 z-10">

        {/* Logo — compact */}
        <div className="text-center">
          <h1
            className="font-black text-gold-gradient leading-none"
            style={{ fontSize: 'clamp(4rem, 18vw, 7rem)' }}
          >
            جاوب
          </h1>
          <div className="sadu-accent mx-auto mt-2 max-w-[100px]" />
          <p className="text-jawwib-text-dim text-xs mt-2">لعب وتحدّى أصحابك 🎮</p>
        </div>

        {/* Player badge */}
        {account && (
          <div className="w-full max-w-xs flex items-center gap-3 bg-jawwib-surface rounded-2xl px-4 py-3 border border-jawwib-border">
            <span className="text-3xl shrink-0">{account.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-base text-jawwib-text leading-none truncate">{account.name}</p>
              <p className="text-[11px] text-jawwib-text-dim mt-0.5">
                {account.stats.gamesPlayed} ألعاب · {account.stats.wins} انتصار
              </p>
            </div>
            <button
              onClick={() => setEditingProfile(true)}
              className="text-xs text-jawwib-text-dim hover:text-jawwib-gold transition-colors px-2 py-1 rounded-lg shrink-0 tap-target"
            >
              ✏️
            </button>
          </div>
        )}

        {/* Mode selector */}
        <div className="w-full max-w-xs">
          <p className="text-[11px] text-jawwib-text-dim text-center mb-2 font-bold">طريقة اللعب</p>
          <div className="grid grid-cols-3 gap-2">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 transition-all ${
                  mode === opt.id
                    ? 'border-jawwib-gold bg-jawwib-gold/10'
                    : 'border-jawwib-border bg-jawwib-surface opacity-70'
                }`}
              >
                <span className="text-xl leading-none">{opt.icon}</span>
                <span className={`text-xs font-black leading-none ${mode === opt.id ? 'text-jawwib-gold' : 'text-jawwib-text'}`}>
                  {opt.label}
                </span>
                <span className="text-[9px] text-jawwib-text-dim leading-none text-center">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        <div className="w-full max-w-xs space-y-2">
          <button
            onClick={handleStart}
            className="btn-gold w-full text-2xl py-5 font-black tap-target animate-pulse-gold"
          >
            ابدأ الحين 🚀
          </button>

          {/* Audio toggles */}
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

        {/* Stats strip */}
        <div className="flex items-center gap-5 text-center">
          {[
            { n: '456', label: 'سؤال' },
            { n: '22',  label: 'فئة' },
            { n: '5',   label: 'سلاح' },
            { n: '🏴‍☠️', label: 'سرقة' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-jawwib-gold font-black text-sm leading-none">{s.n}</p>
              <p className="text-jawwib-text-dim text-[9px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

      </div>

      <div className="sadu-accent w-full" />

      <p className="text-center text-[10px] text-jawwib-text-dim/40 py-2">
        <a href="/privacy" className="hover:text-jawwib-text-dim transition-colors">
          سياسة الخصوصية · Privacy Policy
        </a>
      </p>
    </div>
  );
}
