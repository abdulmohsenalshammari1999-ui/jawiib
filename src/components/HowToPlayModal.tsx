import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'jawib_seen_howtoplay_v1';

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setIsFirstVisit(true);
    }
  }, []);

  const markSeen = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setIsFirstVisit(false);
  };

  return { isFirstVisit, markSeen };
}

interface Slide {
  icon: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  accent: string;      // jawwib palette hex
  accentCls: string;   // tailwind text class
  bullets?: { en: string; ar: string }[];
}

const SLIDES: Slide[] = [
  {
    icon: '🧠',
    titleEn: 'Welcome to Jawib!',
    titleAr: 'أهلاً في جاويب!',
    accent: '#B07D1A',
    accentCls: 'text-jawwib-gold',
    bodyEn: 'A team trivia battle for 2–8 players. Two teams compete on a question board — answer fast, steal points, and deploy weapons!',
    bodyAr: 'لعبة معلومات فريق. فريقان يتنافسان على لوحة أسئلة — أجب بسرعة، اسرق النقاط، واستخدم أسلحتك!',
  },
  {
    icon: '👥',
    titleEn: 'Two Teams',
    titleAr: 'فريقان',
    accent: '#1A5FA8',
    accentCls: 'text-jawwib-blue',
    bodyEn: 'Split into two teams before starting. Each team picks a name and plays on the same device.',
    bodyAr: 'انقسموا إلى فريقين قبل البدء. كل فريق يختار اسمه ويلعب على نفس الجهاز.',
    bullets: [
      { en: '🌊 Team Alpha — plays first, blue colour', ar: '🌊 فريق البحر — يلعب أولاً، اللون الأزرق' },
      { en: '🌿 Team Beta — plays second, red colour',  ar: '🌿 فريق البر — يلعب ثانياً، اللون الأحمر' },
      { en: 'Teams ALTERNATE turns every question',     ar: 'الفريقان يتناوبان الدور كل سؤال' },
    ],
  },
  {
    icon: '🗂️',
    titleEn: 'Draft Your Categories',
    titleAr: 'اختاروا فئاتكم',
    accent: '#6B4CAA',
    accentCls: 'text-jawwib-purple',
    bodyEn: 'Before the game, teams snake-draft 3–4 categories each from 22 topics. Choose what your team knows!',
    bodyAr: 'قبل اللعبة، كل فريق يختار ٣–٤ فئات من ٢٢ موضوع. اختر ما يُتقنه فريقك!',
    bullets: [
      { en: '📚 Culture  ⚽ Sport  📜 History  🕌 Quran', ar: '📚 ثقافة  ⚽ رياضة  📜 تاريخ  🕌 قرآن' },
      { en: '🇰🇼 Kuwait  ☕ Diwaniya  🎭 Drama  🌙 Ramadan', ar: '🇰🇼 كويت  ☕ ديوانية  🎭 دراما  🌙 رمضان' },
      { en: '…and 14 more topics!', ar: 'و ١٤ موضوعاً آخر!' },
    ],
  },
  {
    icon: '🎮',
    titleEn: 'The Game Board',
    titleAr: 'لوحة اللعب',
    accent: '#B07D1A',
    accentCls: 'text-jawwib-gold',
    bodyEn: 'Your drafted categories become rows on the board. Each row has 6 cells worth 100–600 points. Higher = harder!',
    bodyAr: 'فئاتك المختارة تصبح صفوفاً على اللوحة. كل صف به ٦ خانات تساوي ١٠٠–٦٠٠ نقطة. الأعلى = الأصعب!',
    bullets: [
      { en: '🟢 100 pts — Easiest', ar: '🟢 ١٠٠ نقطة — الأسهل' },
      { en: '🟡 300 pts — Medium',  ar: '🟡 ٣٠٠ نقطة — متوسط' },
      { en: '🟣 600 pts — Legend!', ar: '🟣 ٦٠٠ نقطة — أسطوري!' },
    ],
  },
  {
    icon: '⏱️',
    titleEn: 'Answer the Question',
    titleAr: 'أجب على السؤال',
    accent: '#B07D1A',
    accentCls: 'text-jawwib-gold',
    bodyEn: 'The active team picks a cell. A 4-option question appears with a 30-second timer.',
    bodyAr: 'الفريق الفعال يختار خانة. يظهر سؤال بـ ٤ خيارات وعداد ٣٠ ثانية.',
    bullets: [
      { en: '✅ Correct — earn points + time bonus',   ar: '✅ صح — تكسب النقاط + مكافأة الوقت' },
      { en: '❌ Wrong / time out — steal phase opens!', ar: '❌ خطأ / انتهى الوقت — يفتح باب السرقة!' },
      { en: '⚡ 3 correct in a row = +25% streak bonus', ar: '⚡ ٣ صح متتالية = +٢٥٪ مكافأة تتالي' },
    ],
  },
  {
    icon: '🏴‍☠️',
    titleEn: 'The Steal!',
    titleAr: 'السرقة!',
    accent: '#B82118',
    accentCls: 'text-jawwib-red',
    bodyEn: "Wrong answer or timeout? The other team gets 15 seconds to STEAL the question for FULL points.",
    bodyAr: 'إجابة خاطئة أو انتهى الوقت؟ الفريق الآخر يحصل على ١٥ ثانية ليسرق بكامل النقاط.',
    bullets: [
      { en: 'Steal correct → they earn the full value', ar: 'السرقة صح → يكسبون كامل القيمة' },
      { en: 'Steal wrong → nobody gets the points',     ar: 'السرقة خطأ → لا نقاط لأحد' },
      { en: 'Stay sharp even on your opponent\'s turn!', ar: 'ركّز حتى في دور الخصم!' },
    ],
  },
  {
    icon: '⚔️',
    titleEn: 'Weapons',
    titleAr: 'الأسلحة',
    accent: '#6B4CAA',
    accentCls: 'text-jawwib-purple',
    bodyEn: 'Earn weapons during play. Use them to gain an edge or disrupt your opponents.',
    bodyAr: 'اكسب أسلحة أثناء اللعب. استخدمها للتقدم أو تعطيل خصمك.',
    bullets: [
      { en: '💣 Timer Bomb — halves opponent\'s timer',   ar: '💣 قنبلة الوقت — تقطع وقت الخصم للنصف' },
      { en: '🛡️ Immunity — no point loss if wrong',       ar: '🛡️ حصانة — لا خسارة عند الخطأ' },
      { en: '🎯 Force Category — pick their next topic',  ar: '🎯 فرض الفئة — اختر موضوعهم القادم' },
      { en: '⏱️ Extra Time  •  📞 Ask a Friend',          ar: '⏱️ وقت إضافي  •  📞 اتصل بصديق' },
    ],
  },
  {
    icon: '🏆',
    titleEn: 'Win the Game!',
    titleAr: 'الفوز!',
    accent: '#1A7A42',
    accentCls: 'text-jawwib-green',
    bodyEn: 'When all board cells are answered, the team with the most points wins. Use Last Stand for a comeback!',
    bodyAr: 'عند الإجابة على كل الخانات، الفريق الأكثر نقاطاً يفوز. استخدم الوقفة الأخيرة للعودة!',
    bullets: [
      { en: '🏅 Score = (Base + Time Bonus) × Streak',      ar: '🏅 النقاط = (الأساس + الوقت) × التتالي' },
      { en: '⚡ Last Stand: losing by 400? Get 3× points!', ar: '⚡ متأخر بـ ٤٠٠؟ احصل على ٣× نقاط!' },
      { en: '🔄 Rematch any time with new categories',       ar: '🔄 أعد المباراة بفئات جديدة في أي وقت' },
    ],
  },
];

interface HowToPlayModalProps {
  onClose: () => void;
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  const [index, setIndex]       = useState(0);
  const [dir, setDir]           = useState<1 | -1>(1);
  const [animating, setAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = SLIDES.length;
  const slide = SLIDES[index];
  const isLast = index === total - 1;

  const goTo = (next: number, direction: 1 | -1) => {
    if (animating || next < 0 || next >= total) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => { setIndex(next); setAnimating(false); }, 175);
  };

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    onClose();
  };

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 44) return;
    if (dx < 0 && index < total - 1) goTo(index + 1,  1);
    if (dx > 0 && index > 0)         goTo(index - 1, -1);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(index - 1, -1);
      if (e.key === 'ArrowLeft')  goTo(index + 1,  1);
      if (e.key === 'Escape')     handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(26,18,8,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="relative w-full max-w-md mx-auto rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          background: '#FBF8EE',        /* jawwib-surface */
          border: `2px solid #C9A87A`, /* jawwib-border */
          boxShadow: '0 -8px 48px rgba(176,125,26,0.18), 0 4px 24px rgba(0,0,0,0.18)',
          maxHeight: '92dvh',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Sadu top accent bar */}
        <div className="sadu-accent w-full" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-xs font-black transition-all tap-target"
          style={{ background: '#F4EED8', color: '#7A6040', border: '1px solid #C9A87A' }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Progress dots */}
        <div className="absolute top-3.5 right-4 flex gap-1 z-10 items-center">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > index ? 1 : -1)}
              className="rounded-full transition-all tap-target"
              style={{
                width:  i === index ? '16px' : '5px',
                height: '5px',
                background: i === index ? slide.accent : '#C9A87A',
                opacity: i === index ? 1 : 0.45,
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Scrollable content */}
        <div
          className="px-5 pt-10 pb-3 overflow-y-auto"
          style={{
            maxHeight: '78dvh',
            opacity: animating ? 0 : 1,
            transform: animating ? `translateX(${dir * 16}px)` : 'translateX(0)',
            transition: 'opacity 0.175s ease, transform 0.175s ease',
          }}
        >
          {/* Icon + decorative bar */}
          <div className="text-center mb-4">
            <div className="text-6xl mb-2 leading-none">{slide.icon}</div>
            <div
              className="sadu-accent mx-auto max-w-[80px] mb-3"
              style={{ background: slide.accent }}
            />
            <h2
              className={`font-black text-xl leading-tight mb-0.5 ${slide.accentCls}`}
            >
              {slide.titleEn}
            </h2>
            <h3 className="font-black text-lg text-jawwib-text leading-tight">
              {slide.titleAr}
            </h3>
          </div>

          {/* Body card */}
          <div
            className="rounded-2xl p-4 mb-3 text-center"
            style={{
              background: `${slide.accent}10`,
              border: `1.5px solid ${slide.accent}35`,
            }}
          >
            <p className="text-sm text-jawwib-text leading-relaxed mb-2">{slide.bodyEn}</p>
            <p
              className="text-sm leading-relaxed font-medium"
              style={{ color: slide.accent }}
              dir="rtl"
            >
              {slide.bodyAr}
            </p>
          </div>

          {/* Bullet points */}
          {slide.bullets && (
            <ul className="space-y-1.5 mb-2">
              {slide.bullets.map((b, i) => (
                <li
                  key={i}
                  className="game-card flex flex-col gap-0.5 px-4 py-2.5 !rounded-xl"
                >
                  <span className="text-sm text-jawwib-text">{b.en}</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: slide.accent }}
                    dir="rtl"
                  >
                    {b.ar}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Navigation footer */}
        <div
          className="flex items-center gap-2.5 px-5 py-4"
          style={{ borderTop: '1.5px solid #C9A87A' }}
        >
          <button
            onClick={() => goTo(index - 1, -1)}
            disabled={index === 0}
            className="flex-1 py-3 rounded-2xl font-bold text-sm text-jawwib-text-dim transition-all disabled:opacity-25 tap-target"
            style={{ background: '#F4EED8', border: '1.5px solid #C9A87A' }}
          >
            ← السابق
          </button>

          {isLast ? (
            <button
              onClick={handleClose}
              className="flex-[2] btn-gold py-3 rounded-2xl font-black text-sm tap-target"
            >
              🚀 ابدأ اللعبة!
            </button>
          ) : (
            <button
              onClick={() => goTo(index + 1, 1)}
              className="flex-[2] btn-gold py-3 rounded-2xl font-black text-sm tap-target"
            >
              التالي ← {index + 1}/{total}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
