import { useState } from 'react';

interface TeamSetupScreenProps {
  alphaName: string;
  betaName: string;
  onConfirm: (alphaName: string, betaName: string) => void;
}

export function TeamSetupScreen({ alphaName, betaName, onConfirm }: TeamSetupScreenProps) {
  const [alpha, setAlpha] = useState(alphaName);
  const [beta, setBeta]   = useState(betaName);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 gap-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-black text-gold-gradient mb-1">حدّد الفرق</h1>
        <p className="text-jawwib-text-dim text-sm">اختر اسم كل فريق قبل بدء المنافسة</p>
      </div>

      {/* VS layout */}
      <div className="w-full max-w-sm">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-6">
          {/* Alpha */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-lg">🛡️</span>
              <span className="text-jawwib-blue font-bold text-xs">الفريق الأزرق</span>
            </div>
            <input
              type="text"
              value={alpha}
              onChange={(e) => setAlpha(e.target.value)}
              placeholder="الفريق الأزرق"
              maxLength={18}
              className="w-full px-3 py-2.5 rounded-xl text-center font-bold text-sm border-2 border-jawwib-blue/40 bg-blue-50/50 text-jawwib-blue focus:border-jawwib-blue focus:outline-none"
              dir="rtl"
            />
          </div>

          <div className="text-2xl font-black text-jawwib-gold self-center">VS</div>

          {/* Beta */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-lg">⚔️</span>
              <span className="text-jawwib-red font-bold text-xs">الفريق الأحمر</span>
            </div>
            <input
              type="text"
              value={beta}
              onChange={(e) => setBeta(e.target.value)}
              placeholder="الفريق الأحمر"
              maxLength={18}
              className="w-full px-3 py-2.5 rounded-xl text-center font-bold text-sm border-2 border-jawwib-red/40 bg-red-50/50 text-jawwib-red focus:border-jawwib-red focus:outline-none"
              dir="rtl"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-jawwib-surface border border-jawwib-border mb-5">
          <span className="font-bold text-sm text-jawwib-blue truncate">{alpha || 'الفريق الأزرق'}</span>
          <span className="text-jawwib-gold font-black mx-3">🏆</span>
          <span className="font-bold text-sm text-jawwib-red truncate text-left">{beta || 'الفريق الأحمر'}</span>
        </div>

        <button
          onClick={() => onConfirm(alpha || 'الفريق الأزرق', beta || 'الفريق الأحمر')}
          className="btn-gold w-full text-lg py-4"
        >
          تأكيد الفرق ⚔️
        </button>
      </div>
    </div>
  );
}
