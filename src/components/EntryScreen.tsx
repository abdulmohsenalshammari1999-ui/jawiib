import { useState, useEffect } from 'react';

interface EntryScreenProps {
  onEnter: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export function EntryScreen({
  onEnter,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
}: EntryScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 420);
  };

  const visible = mounted && !exiting;

  return (
    <div
      className="min-h-screen bg-diwaniya flex flex-col relative overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.42s ease-out' }}
    >
      <div className="sadu-accent w-full" />

      {/* Ambient glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 25% 15%, rgba(176,125,26,0.09) 0%, transparent 52%),' +
            'radial-gradient(ellipse at 75% 85%, rgba(26,95,168,0.07) 0%, transparent 45%)',
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-7 z-10">

        {/* Logo */}
        <div
          className="text-center"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.65s ease-out, transform 0.65s ease-out',
          }}
        >
          <h1 className="text-[5.5rem] sm:text-[7rem] font-black text-gold-gradient leading-none tracking-tight">
            جاوب
          </h1>
          <div className="sadu-accent mx-auto mt-3 max-w-[144px]" />
          <p className="text-jawwib-text-dim text-sm mt-2 font-medium">
            لعبة الثقافة العامة الخليجية
          </p>
        </div>

        {/* Stats */}
        <div
          className="flex items-center gap-5 text-center"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.65s 0.18s ease-out',
          }}
        >
          {[
            { n: '456', label: 'سؤال' },
            { n: '22',  label: 'فئة' },
            { n: '6',   label: 'مستوى' },
            { n: '💣',  label: 'تخريب' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-jawwib-gold font-black text-lg leading-none">{s.n}</p>
              <p className="text-jawwib-text-dim text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Host welcome */}
        <div
          className="w-full max-w-sm"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.65s 0.12s ease-out, transform 0.65s 0.12s ease-out',
          }}
        >
          <div className="flex items-center gap-3 bg-jawwib-surface rounded-2xl px-4 py-3 border border-jawwib-border">
            <span className="text-2xl shrink-0">🎙️</span>
            <p className="text-jawwib-text text-sm font-bold leading-snug">
              أهلاً وسهلاً في جاوب — هل أنتم جاهزون للمنافسة؟
            </p>
          </div>
        </div>

        {/* CTA + toggles */}
        <div
          className="w-full max-w-sm space-y-3"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.65s 0.28s ease-out, transform 0.65s 0.28s ease-out',
          }}
        >
          <button
            onClick={handleEnter}
            className="btn-gold w-full text-xl py-5 animate-pulse-gold"
          >
            ابدأ اللعبة 🚀
          </button>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onToggleSound}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                soundEnabled
                  ? 'border-jawwib-gold/40 text-jawwib-gold bg-jawwib-gold/8'
                  : 'border-jawwib-border text-jawwib-text-dim opacity-50'
              }`}
            >
              {soundEnabled ? '🔊' : '🔇'} {soundEnabled ? 'صوت' : 'صامت'}
            </button>
            <button
              onClick={onToggleMusic}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                musicEnabled
                  ? 'border-jawwib-gold/40 text-jawwib-gold bg-jawwib-gold/8'
                  : 'border-jawwib-border text-jawwib-text-dim opacity-50'
              }`}
            >
              {musicEnabled ? '🎵' : '🔕'} {musicEnabled ? 'موسيقى' : 'بدون'}
            </button>
          </div>
        </div>

        {/* Rivalry teaser */}
        <div
          className="flex items-center gap-3 w-full max-w-sm"
          style={{
            opacity: mounted ? 0.8 : 0,
            transition: 'opacity 0.65s 0.38s ease-out',
          }}
        >
          <div className="flex-1 text-center p-3 rounded-xl border-2 border-jawwib-blue/30 bg-blue-50/40">
            <p className="text-jawwib-blue font-black text-sm">الفريق الأزرق</p>
            <p className="text-base">🛡️</p>
          </div>
          <div className="text-lg font-black text-jawwib-gold">VS</div>
          <div className="flex-1 text-center p-3 rounded-xl border-2 border-jawwib-red/30 bg-red-50/40">
            <p className="text-jawwib-red font-black text-sm">الفريق الأحمر</p>
            <p className="text-base">⚔️</p>
          </div>
        </div>
      </div>

      <div className="sadu-accent w-full" />
    </div>
  );
}
