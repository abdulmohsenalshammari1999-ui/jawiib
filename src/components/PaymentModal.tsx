import { useState } from 'react';
import { APP_CONFIG } from '@/lib/appConfig';

interface PaymentModalProps {
  onClose: () => void;
  onPurchase: () => void;
  onConfirmed: () => void;
}

const PAYMENT_URL = import.meta.env['VITE_PAYMENT_URL'] as string | undefined;

export function PaymentModal({ onClose, onPurchase, onConfirmed }: PaymentModalProps) {
  const [step, setStep] = useState<'info' | 'confirm'>('info');

  function handleBuyNow() {
    onPurchase();
    setStep('confirm');
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="game-card p-6 max-w-md w-full animate-bounce-in">

        {step === 'info' ? (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">👑</div>
              <h2 className="text-2xl font-bold text-gold-gradient mb-1">النسخة الكاملة</h2>
              <p className="text-jawwib-text-dim text-sm">افتح كل الميزات واستمتع باللعب!</p>
            </div>

            <div className="space-y-2 mb-6">
              {[
                { label: 'عدد الأسئلة',    free: '9 فقط',       paid: '456 سؤال' },
                { label: 'الفئات',          free: '2 عشوائية',   paid: '22 فئة كاملة' },
                { label: 'التخريب 💣',      free: 'مقفل',        paid: 'مفتوح!' },
                { label: 'الأسلحة ⚔️',     free: 'مقفلة',       paid: '5 أسلحة!' },
                { label: 'سرقة النقاط 🏴‍☠️', free: 'مقفلة',      paid: 'مفتوحة!' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between p-3 rounded-xl bg-jawwib-surface">
                  <span className="text-sm">{row.label}</span>
                  <div className="flex gap-4">
                    <span className="text-jawwib-text-dim text-xs line-through">{row.free}</span>
                    <span className="text-jawwib-green text-xs font-bold">{row.paid}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mb-5">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-gold-gradient">{APP_CONFIG.currencyAmount}</span>
                <span className="text-xl text-jawwib-gold font-bold">{APP_CONFIG.currencyLabel}</span>
              </div>
              <p className="text-jawwib-text-dim text-xs mt-1">لكل لعبة • دفعة واحدة</p>
            </div>

            <div className="space-y-2">
              {PAYMENT_URL ? (
                <button onClick={handleBuyNow} className="btn-gold w-full text-lg py-3">
                  ادفع الآن 💳
                </button>
              ) : APP_CONFIG.supportWhatsApp ? (
                <a
                  href={`https://wa.me/${APP_CONFIG.supportWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold block w-full text-lg py-3 text-center"
                  onClick={() => setStep('confirm')}
                >
                  تواصل للدفع 💬
                </a>
              ) : null}
              <button onClick={onClose} className="w-full py-3 text-sm text-jawwib-text-dim hover:text-jawwib-text transition-colors">
                لا شكراً، أكمل التجربة
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-xl font-bold text-jawwib-text mb-2">هل اكتملت عملية الدفع؟</h2>
              <p className="text-jawwib-text-dim text-sm leading-relaxed">
                بعد إتمام الدفع اضغط زر التأكيد أدناه لبدء اللعبة كاملة.
              </p>
            </div>

            <div className="space-y-2">
              <button onClick={onConfirmed} className="btn-gold w-full text-lg py-3">
                تأكيد الدفع — ابدأ اللعبة 🚀
              </button>
              <button onClick={() => setStep('info')} className="w-full py-3 text-sm text-jawwib-text-dim hover:text-jawwib-text transition-colors">
                ← رجوع
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
