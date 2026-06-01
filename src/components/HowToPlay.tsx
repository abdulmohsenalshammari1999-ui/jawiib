import { useState } from 'react';

interface HowToPlayProps {
  onClose: () => void;
}

function HowToPlayModal({ onClose }: HowToPlayProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: '🎮',
      title: 'أنشئ غرفة أو انضم',
      body: 'أنشئ غرفة جديدة وشارك الكود مع أصدقائك، أو ادخل كود الغرفة للانضمام. يمكن للجميع الانضمام من هاتفهم بدون تنزيل.',
    },
    {
      icon: '🗂️',
      title: 'لوحة الأسئلة',
      body: 'اللعبة تتكون من لوحة أسئلة بفئات مختلفة (تاريخ، رياضة، علوم...) وثلاث مستويات صعوبة. كل مستوى يعطيك نقاط أكثر.',
      extra: (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { stars: '⭐', pts: '100 نقطة', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
            { stars: '⭐⭐', pts: '200 نقطة', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
            { stars: '⭐⭐⭐', pts: '300 نقطة', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
          ].map((t) => (
            <div key={t.pts} className={`rounded-xl border px-2 py-2 text-center text-xs font-bold ${t.color}`}>
              <div className="text-base mb-0.5">{t.stars}</div>
              <div>{t.pts}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: '⏱️',
      title: 'اختر واجب!',
      body: 'في دورك، اختر سؤالاً من اللوحة. عندك 15 ثانية للإجابة. الإجابة الصحيحة = نقاط. الخاطئة = تنقص نقاطك.',
      extra: (
        <div className="flex gap-2 mt-3">
          <div className="flex-1 rounded-xl border border-green-500/30 bg-green-500/10 p-2 text-center text-xs font-bold text-green-400">✓ صح = +نقاط</div>
          <div className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-center text-xs font-bold text-red-400">✗ خطأ = -نقاط</div>
        </div>
      ),
    },
    {
      icon: '💣',
      title: 'التخريب — السلاح السري',
      body: 'مع تراكم النقاط، تفتح قدرات تخريبية على منافسيك. استخدمها بذكاء!',
      extra: (
        <div className="space-y-2 mt-3">
          {[
            { icon: '💣', name: 'قنبلة', desc: 'الخطأ يكلفه نقاطاً إضافية', color: 'text-orange-400' },
            { icon: '⚡', name: 'رهان', desc: 'إجابة صح = ضعف • خطأ = خسارة', color: 'text-yellow-400' },
            { icon: '🔀', name: 'خلط', desc: 'يخلط ترتيب الخيارات عليه', color: 'text-purple-400' },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-3 p-2 rounded-lg bg-jawwib-surface">
              <span className="text-xl w-7 text-center">{s.icon}</span>
              <div>
                <p className={`text-xs font-bold ${s.color}`}>{s.name}</p>
                <p className="text-[11px] text-jawwib-text-dim">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: '🏆',
      title: 'الفوز',
      body: 'تنتهي اللعبة عند الإجابة على جميع الأسئلة. من يملك أكثر النقاط يفوز! في وضع الفرق — الفريق ذو المجموع الأعلى ينتصر.',
      extra: (
        <div className="mt-3 flex flex-col items-center gap-2">
          <div className="text-5xl animate-bounce-in">🥇</div>
          <p className="text-jawwib-gold font-bold text-sm">الأذكى ينتصر!</p>
        </div>
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,6,15,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm animate-slide-up">
        {/* Card */}
        <div className="game-card rounded-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-jawwib-surface">
            <div
              className="h-full bg-jawwib-gold transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-xs text-jawwib-text-dim font-bold tracking-wider uppercase">
              كيف تلعب؟ {step + 1}/{steps.length}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-jawwib-surface flex items-center justify-center text-jawwib-text-dim hover:text-jawwib-text hover:bg-jawwib-card transition-all text-sm"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="px-5 pb-5">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">{current.icon}</div>
              <h3 className="text-xl font-black text-gold-gradient mb-2">{current.title}</h3>
              <p className="text-sm text-jawwib-text leading-relaxed">{current.body}</p>
            </div>

            {current.extra && <div>{current.extra}</div>}

            {/* Navigation */}
            <div className="flex gap-2 mt-5">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 rounded-xl border-2 border-jawwib-border text-jawwib-text-dim font-bold text-sm hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
                >
                  ← السابق
                </button>
              )}
              <button
                onClick={() => (isLast ? onClose() : setStep(step + 1))}
                className="flex-1 btn-gold py-3 text-sm font-bold"
              >
                {isLast ? '🎮 العب الآن!' : 'التالي →'}
              </button>
            </div>

            {/* Step dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`rounded-full transition-all ${
                    i === step
                      ? 'w-5 h-2 bg-jawwib-gold'
                      : 'w-2 h-2 bg-jawwib-border hover:bg-jawwib-gold/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowToPlayButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border-2 border-jawwib-border bg-jawwib-surface hover:border-jawwib-gold hover:bg-jawwib-gold/5 transition-all group"
        aria-label="كيف تلعب؟"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">❓</span>
        <span className="text-xs font-bold text-jawwib-text-dim group-hover:text-jawwib-gold transition-colors whitespace-nowrap">
          كيف تلعب؟
        </span>
      </button>

      {open && <HowToPlayModal onClose={() => setOpen(false)} />}
    </>
  );
}
