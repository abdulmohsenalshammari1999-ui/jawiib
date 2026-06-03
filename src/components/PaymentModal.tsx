import { useState, useEffect } from 'react';
import { APP_CONFIG } from '@/lib/appConfig';
import {
  isNative, isIOS, fetchProductInfo, purchaseGame, restorePurchases,
  type IAPProductInfo, type PurchaseStatus,
} from '@/lib/iap';

interface PaymentModalProps {
  onClose:     () => void;
  onPurchase:  () => void;  // called when external URL is opened (web fallback)
  onConfirmed: () => void;  // called when purchase/IAP succeeds → start game
}

const FEATURES = [
  { label: 'عدد الأسئلة',       free: '9 فقط',      paid: '456 سؤال' },
  { label: 'الفئات',             free: '2 عشوائية',  paid: '22 فئة' },
  { label: 'التخريب 💣',         free: 'مقفل',       paid: 'مفتوح!' },
  { label: 'الأسلحة ⚔️',        free: 'مقفلة',      paid: '5 أسلحة' },
  { label: 'سرقة النقاط 🏴‍☠️',  free: 'مقفلة',      paid: 'مفتوحة!' },
];

export function PaymentModal({ onClose, onPurchase, onConfirmed }: PaymentModalProps) {
  const native = isNative();
  const ios    = isIOS();

  // ── State ────────────────────────────────────────────────────────────────
  const [status,  setStatus]  = useState<PurchaseStatus>('idle');
  const [product, setProduct] = useState<IAPProductInfo | null>(null);
  const [step,    setStep]    = useState<'info' | 'confirm' | 'success'>('info');
  const [errMsg,  setErrMsg]  = useState('');

  // Pre-load product price from the store
  useEffect(() => {
    if (!native) return;
    setStatus('loading');
    fetchProductInfo().then((p) => {
      setProduct(p);
      setStatus('idle');
    });
  }, [native]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handlePurchase() {
    setStatus('purchasing');
    setErrMsg('');
    const result = await purchaseGame();

    if (result.success) {
      setStatus('success');
      setStep('success');
      setTimeout(onConfirmed, 1800);
      return;
    }
    if (result.cancelled) {
      setStatus('idle');
      return;
    }
    if (result.error === 'redirect') {
      // Web: payment URL was opened → show confirm step
      onPurchase();
      setStep('confirm');
      setStatus('idle');
      return;
    }
    setStatus('error');
    setErrMsg(result.error ?? 'حدث خطأ غير متوقع');
  }

  async function handleRestore() {
    setStatus('restoring');
    setErrMsg('');
    const result = await restorePurchases();
    if (result.success) {
      setStatus('success');
      setStep('success');
      setTimeout(onConfirmed, 1800);
    } else {
      setStatus('error');
      setErrMsg('لا توجد مشتريات سابقة لاستعادتها');
      setTimeout(() => { setStatus('idle'); setErrMsg(''); }, 3000);
    }
  }

  const busy = status === 'purchasing' || status === 'restoring' || status === 'loading';

  // ── Display price ─────────────────────────────────────────────────────────
  const displayPrice = native
    ? (status === 'loading' ? '...' : (product?.priceString ?? `${APP_CONFIG.currencyAmount} ${APP_CONFIG.currencyLabel}`))
    : `${APP_CONFIG.currencyAmount} ${APP_CONFIG.currencyLabel}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="game-card p-6 max-w-md w-full animate-bounce-in overflow-y-auto max-h-[90vh]">

        {/* ── SUCCESS ─────────────────────────────────────────────────────── */}
        {step === 'success' && (
          <div className="text-center py-6">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-black text-gold-gradient mb-2">تم الفتح!</h2>
            <p className="text-jawwib-text-dim text-sm">جاوب الآن متاح بالكامل. ابدأ اللعبة!</p>
          </div>
        )}

        {/* ── INFO step ───────────────────────────────────────────────────── */}
        {step === 'info' && (
          <>
            {/* Header */}
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">👑</div>
              <h2 className="text-2xl font-bold text-gold-gradient mb-1">النسخة الكاملة</h2>
              <p className="text-jawwib-text-dim text-sm">افتح كل الميزات واستمتع باللعب!</p>
            </div>

            {/* Feature comparison */}
            <div className="space-y-2 mb-5">
              {FEATURES.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-jawwib-surface"
                >
                  <span className="text-sm text-jawwib-text">{row.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-jawwib-text-dim text-xs line-through opacity-60">{row.free}</span>
                    <span className="text-jawwib-green text-xs font-bold">{row.paid}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price display */}
            <div className="text-center mb-5">
              <div className="flex items-baseline justify-center gap-2">
                {status === 'loading' ? (
                  <span className="text-jawwib-text-dim text-sm animate-pulse">جاري تحميل السعر...</span>
                ) : (
                  <>
                    <span className="text-4xl font-black text-gold-gradient">
                      {native ? (product?.priceString ?? displayPrice) : APP_CONFIG.currencyAmount}
                    </span>
                    {!native && (
                      <span className="text-xl text-jawwib-gold font-bold">{APP_CONFIG.currencyLabel}</span>
                    )}
                  </>
                )}
              </div>
              <p className="text-jawwib-text-dim text-xs mt-1">لكل لعبة • دفعة واحدة</p>
            </div>

            {/* Platform badge */}
            {native && (
              <div
                className="flex items-center justify-center gap-2 mb-4 p-2.5 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-base">{ios ? '🍎' : '🤖'}</span>
                <span className="text-xs text-jawwib-text-dim font-bold">
                  {ios ? 'الدفع عبر App Store — آمن وسريع' : 'الدفع عبر Google Play'}
                </span>
              </div>
            )}

            {/* Error */}
            {status === 'error' && errMsg && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {errMsg}
              </div>
            )}

            {/* CTA buttons */}
            <div className="space-y-2">
              {/* Primary purchase button */}
              <button
                onClick={handlePurchase}
                disabled={busy}
                className="btn-gold w-full text-lg py-3.5 flex items-center justify-center gap-2"
              >
                {status === 'purchasing' ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ الشراء...</span>
                  </>
                ) : native ? (
                  <><span>{ios ? '🍎' : '🤖'}</span><span>اشترِ الآن</span></>
                ) : (import.meta.env['VITE_PAYMENT_URL'] as string | undefined) ? (
                  <>💳 ادفع الآن</>
                ) : APP_CONFIG.supportWhatsApp ? (
                  <>💬 تواصل للدفع</>
                ) : null}
              </button>

              {/* Restore purchases (native only — required by Apple guidelines) */}
              {native && (
                <button
                  onClick={handleRestore}
                  disabled={busy}
                  className="w-full py-2.5 text-sm text-jawwib-text-dim hover:text-jawwib-text transition-colors"
                >
                  {status === 'restoring' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border border-jawwib-text-dim/40 border-t-jawwib-text-dim rounded-full animate-spin" />
                      جارٍ الاستعادة...
                    </span>
                  ) : (
                    '↩ استعادة المشتريات'
                  )}
                </button>
              )}

              <button
                onClick={onClose}
                disabled={busy}
                className="w-full py-2.5 text-sm text-jawwib-text-dim hover:text-jawwib-text transition-colors"
              >
                لا شكراً، أكمل التجربة
              </button>
            </div>

            {/* Legal (required by Apple) */}
            {native && ios && (
              <p className="text-center text-[10px] text-jawwib-text-dim/50 mt-4 leading-relaxed">
                سيتم خصم المبلغ من حساب iTunes الخاص بك عند تأكيد الشراء.
                {' '}لا تتجدد هذه المشتريات تلقائياً.
              </p>
            )}
          </>
        )}

        {/* ── CONFIRM step (web fallback after external URL opened) ─────── */}
        {step === 'confirm' && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-xl font-bold text-jawwib-text mb-2">هل اكتملت عملية الدفع؟</h2>
              <p className="text-jawwib-text-dim text-sm leading-relaxed">
                بعد إتمام الدفع اضغط زر التأكيد أدناه لبدء اللعبة كاملة.
              </p>
            </div>
            <div className="space-y-2">
              <button onClick={onConfirmed} className="btn-gold w-full text-lg py-3.5">
                تأكيد الدفع — ابدأ اللعبة 🚀
              </button>
              <button
                onClick={() => setStep('info')}
                className="w-full py-2.5 text-sm text-jawwib-text-dim hover:text-jawwib-text transition-colors"
              >
                ← رجوع
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
