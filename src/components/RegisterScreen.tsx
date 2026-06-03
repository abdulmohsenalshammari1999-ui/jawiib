import { useState, useEffect, useRef } from 'react';
import { useAccountStore } from '@/store/accountStore';

interface RegisterScreenProps {
  onComplete: () => void;
  editMode?: boolean;
  initialName?: string;
  initialAvatar?: string;
  onSave?: (name: string, avatar: string) => void;
}

const AVATARS = [
  '🦅', '🐪', '🌊', '🏆', '⚡', '🦁',
  '🐯', '🦊', '🐺', '🦝', '🦄', '🐻',
  '🎯', '🔥', '💫', '⭐', '🌙', '☀️',
  '👑', '💎', '🎮', '🎲', '🎭', '🏴‍☠️',
  '🌴', '☕', '🌺', '🐬', '🦋', '🐉',
];

const STEP_LABELS = ['اسمك', 'أفاتارك', 'جاهز!'];

export function RegisterScreen({ onComplete, editMode = false, initialName, initialAvatar, onSave }: RegisterScreenProps) {
  const createAccount = useAccountStore((s) => s.createAccount);

  const [step, setStep]     = useState(editMode ? 0 : 0);
  const [name, setName]     = useState(initialName ?? '');
  const [avatar, setAvatar] = useState(initialAvatar ?? '🦅');
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Focus name input when on step 0
  useEffect(() => {
    if (step === 0 && mounted) {
      const t = setTimeout(() => nameRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [step, mounted]);

  function goNext() {
    if (animating) return;
    setDirection('forward');
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setAnimating(false);
    }, 200);
  }

  function goBack() {
    if (animating || step === 0) return;
    setDirection('back');
    setAnimating(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setAnimating(false);
    }, 200);
  }

  function handleFinish() {
    if (editMode && onSave) {
      onSave(name, avatar);
    } else {
      createAccount(name, avatar);
      onComplete();
    }
  }

  const slideClass = animating
    ? direction === 'forward'
      ? 'opacity-0 -translate-x-4'
      : 'opacity-0 translate-x-4'
    : 'opacity-100 translate-x-0';

  return (
    <div
      className="min-h-screen bg-diwaniya flex flex-col relative overflow-hidden"
      style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.38s ease-out' }}
    >
      <div className="sadu-accent w-full" />

      {/* Ambient glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 10%, rgba(176,125,26,0.13) 0%, transparent 50%),' +
            'radial-gradient(ellipse at 80% 90%, rgba(26,95,168,0.09) 0%, transparent 44%)',
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">

        {/* Logo mark */}
        <div
          className="text-center mb-6"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.1s ease-out' }}
        >
          <h1 className="text-5xl font-black text-gold-gradient leading-none">جاوب</h1>
          <div className="sadu-accent mx-auto mt-2" style={{ maxWidth: 80 }} />
          {editMode && (
            <p className="text-xs text-jawwib-text-dim mt-2">تعديل الملف الشخصي</p>
          )}
        </div>

        {/* Step progress */}
        <div
          className="flex items-center gap-3 mb-8"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.15s ease-out' }}
        >
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
                  style={
                    i < step
                      ? { background: '#B07D1A', color: '#fff' }
                      : i === step
                      ? { background: 'linear-gradient(135deg,#B07D1A,#D4A94A)', color: '#fff', boxShadow: '0 0 14px rgba(176,125,26,0.45)' }
                      : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1.5px solid rgba(176,125,26,0.2)' }
                  }
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span
                  className="text-[9px] mt-1 font-bold transition-colors duration-300"
                  style={{ color: i === step ? '#D4A94A' : i < step ? '#B07D1A' : 'rgba(255,255,255,0.25)' }}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className="w-8 h-px mb-4 transition-all duration-300"
                  style={{ background: i < step ? '#B07D1A' : 'rgba(176,125,26,0.2)' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div
          className={`w-full max-w-sm transition-all duration-200 ${slideClass}`}
        >

          {/* ── Step 0: Name ──────────────────────────────────────────────────── */}
          {step === 0 && (
            <div className="game-card p-6 space-y-5">
              <div className="text-center">
                <p className="text-3xl mb-2">👤</p>
                <h2 className="text-xl font-black text-jawwib-text mb-1">ما اسمك؟</h2>
                <p className="text-xs text-jawwib-text-dim">سيظهر اسمك للجميع أثناء اللعبة</p>
              </div>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && name.trim().length >= 2 && goNext()}
                placeholder="مثال: أحمد، سارة، الشبح..."
                className="w-full px-4 py-4 rounded-xl text-center text-lg font-bold"
                maxLength={20}
                autoComplete="off"
                dir="auto"
              />
              <div className="flex justify-between items-center text-[10px] text-jawwib-text-dim">
                <span>{name.trim().length}/20 حرف</span>
                <span>{name.trim().length < 2 ? 'حرفان على الأقل' : '✓ ممتاز'}</span>
              </div>
              <button
                onClick={goNext}
                disabled={name.trim().length < 2}
                className="btn-gold w-full py-4 text-lg"
              >
                التالي →
              </button>
            </div>
          )}

          {/* ── Step 1: Avatar ────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="game-card p-5 space-y-4">
              <div className="text-center">
                <div
                  className="text-5xl mx-auto mb-3 w-20 h-20 flex items-center justify-center rounded-2xl transition-all duration-300"
                  style={{ background: 'rgba(176,125,26,0.12)', border: '2px solid rgba(176,125,26,0.35)' }}
                >
                  {avatar}
                </div>
                <h2 className="text-xl font-black text-jawwib-text mb-1">اختر أفاتارك</h2>
                <p className="text-xs text-jawwib-text-dim">هذه صورتك الشخصية في اللعبة</p>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className="aspect-square flex items-center justify-center text-2xl rounded-xl transition-all duration-200 tap-target"
                    style={
                      a === avatar
                        ? { background: 'rgba(176,125,26,0.25)', border: '2px solid #D4A94A', transform: 'scale(1.15)' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.07)' }
                    }
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={goBack}
                  className="py-3 px-5 rounded-xl border border-jawwib-border text-jawwib-text-dim text-sm font-bold hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
                >
                  ← رجوع
                </button>
                <button onClick={goNext} className="btn-gold flex-1 py-3 text-base">
                  التالي →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Ready ─────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="game-card p-6 space-y-5 text-center">
              <div>
                <p className="text-6xl mb-3">{avatar}</p>
                <h2 className="text-2xl font-black text-gold-gradient mb-1">{name}</h2>
                <p className="text-jawwib-text-dim text-sm">
                  {editMode ? 'هذا ما سيراه الآخرون' : 'حساب جاوب الخاص بك جاهز!'}
                </p>
              </div>

              {/* Profile card preview */}
              <div
                className="rounded-2xl p-4 text-right space-y-2"
                style={{ background: 'rgba(176,125,26,0.07)', border: '1.5px solid rgba(176,125,26,0.25)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-jawwib-text-dim text-xs">الاسم</span>
                  <span className="font-black text-sm">{name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-jawwib-text-dim text-xs">الأفاتار</span>
                  <span className="text-xl">{avatar}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-jawwib-text-dim text-xs">الألعاب</span>
                  <span className="font-bold text-sm text-jawwib-gold">0 لعبة</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleFinish}
                  className="btn-gold w-full text-xl py-5 animate-pulse-gold"
                >
                  {editMode ? 'حفظ التغييرات ✓' : 'يلا نلعب! 🚀'}
                </button>
                <button
                  onClick={goBack}
                  className="text-xs text-jawwib-text-dim hover:text-jawwib-text transition-colors"
                >
                  ← تعديل
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Subtle footer note */}
        <p
          className="mt-6 text-[10px] text-jawwib-text-dim opacity-50 text-center"
          style={{ opacity: mounted ? 0.5 : 0, transition: 'opacity 0.5s 0.4s ease-out' }}
        >
          بياناتك محفوظة محلياً على جهازك فقط 🔒
        </p>
      </div>

      <div className="sadu-accent w-full" />
    </div>
  );
}
