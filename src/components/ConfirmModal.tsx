interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="game-card p-5 w-full max-w-sm animate-bounce-in text-center">
        <div className="text-4xl mb-2">🏠</div>
        <h2 className="text-lg font-black text-jawwib-text mb-1.5">{title}</h2>
        <p className="text-sm text-jawwib-text-dim mb-5 leading-relaxed">{message}</p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onCancel}
            className="py-3 rounded-xl border-2 border-jawwib-border text-jawwib-text font-bold text-sm tap-target transition-all hover:border-jawwib-gold/40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="py-3 rounded-xl border-2 border-jawwib-red/40 bg-jawwib-red/10 text-jawwib-red font-black text-sm tap-target transition-all hover:bg-jawwib-red/20"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
