interface PaymentModalProps {
  onClose: () => void;
  onPurchase: () => void;
}

export function PaymentModal({ onClose, onPurchase }: PaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="game-card p-6 max-w-md w-full animate-bounce-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">👑</div>
          <h2 className="text-2xl font-bold text-gold-gradient mb-1">النسخة الكاملة</h2>
          <p className="text-jawwib-text-dim text-sm">افتح كل الميزات واستمتع باللعب!</p>
        </div>

        {/* Features comparison */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-jawwib-surface">
            <span className="text-sm">عدد الأسئلة</span>
            <div className="flex gap-4">
              <span className="text-jawwib-text-dim text-xs line-through">9 فقط</span>
              <span className="text-jawwib-green text-xs font-bold">456 سؤال</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-jawwib-surface">
            <span className="text-sm">الفئات</span>
            <div className="flex gap-4">
              <span className="text-jawwib-text-dim text-xs line-through">2 عشوائية</span>
              <span className="text-jawwib-green text-xs font-bold">22 فئة كاملة</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-jawwib-surface">
            <span className="text-sm">التخريب 💣</span>
            <div className="flex gap-4">
              <span className="text-jawwib-text-dim text-xs line-through">مقفل</span>
              <span className="text-jawwib-green text-xs font-bold">مفتوح!</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-jawwib-surface">
            <span className="text-sm">الأسلحة ⚔️</span>
            <div className="flex gap-4">
              <span className="text-jawwib-text-dim text-xs line-through">مقفلة</span>
              <span className="text-jawwib-green text-xs font-bold">5 أسلحة!</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-jawwib-surface">
            <span className="text-sm">سرقة النقاط 🏴‍☠️</span>
            <div className="flex gap-4">
              <span className="text-jawwib-text-dim text-xs line-through">مقفلة</span>
              <span className="text-jawwib-green text-xs font-bold">مفتوحة!</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="text-center mb-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-gold-gradient">4</span>
            <span className="text-xl text-jawwib-gold font-bold">د.ك</span>
          </div>
          <p className="text-jawwib-text-dim text-xs mt-1">لكل لعبة • دفعة واحدة</p>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button onClick={onPurchase} className="btn-gold w-full text-lg py-3">
            اشتري الآن 💳
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-sm text-jawwib-text-dim hover:text-jawwib-text transition-colors"
          >
            لا شكراً، أكمل التجربة
          </button>
        </div>
      </div>
    </div>
  );
}
