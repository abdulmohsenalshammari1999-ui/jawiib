interface HostBubbleProps {
  message: string;
}

export function HostBubble({ message }: HostBubbleProps) {
  return (
    <div className="animate-fade-in flex items-start gap-3 p-4 rounded-2xl bg-jawwib-surface border border-jawwib-border mb-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-jawwib-gold to-jawwib-gold-light flex items-center justify-center text-2xl">
        🎙️
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gold-gradient font-bold text-lg">مرحبا</span>
          <span className="text-xs text-jawwib-text-dim">مقدم اللعبة</span>
        </div>
        <p className="text-jawwib-text text-base leading-relaxed m-0">{message}</p>
      </div>
    </div>
  );
}
