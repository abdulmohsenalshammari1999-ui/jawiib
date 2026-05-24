import { useEffect, useRef, useState } from 'react';

interface HostBubbleProps {
  message: string;
  compact?: boolean;
}

export function HostBubble({ message, compact = false }: HostBubbleProps) {
  const [displayed, setDisplayed] = useState(message);
  const [animating, setAnimating] = useState(false);
  const prevMsg = useRef(message);

  useEffect(() => {
    if (message !== prevMsg.current) {
      setAnimating(true);
      const t = setTimeout(() => {
        setDisplayed(message);
        prevMsg.current = message;
        setAnimating(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [message]);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-jawwib-surface border border-jawwib-border transition-opacity ${
          animating ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="text-base shrink-0">🎙️</span>
        <p className="text-xs text-jawwib-text leading-relaxed line-clamp-2">{displayed}</p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl bg-jawwib-surface border border-jawwib-border mb-4 transition-all duration-200 ${
        animating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-jawwib-gold to-jawwib-gold-light flex items-center justify-center text-xl shadow-lg">
        🎙️
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-gold-gradient font-bold text-sm">مرحبا</span>
          <span className="text-xs text-jawwib-text-dim bg-jawwib-gold/10 px-2 py-0.5 rounded-full">
            مقدم اللعبة
          </span>
        </div>
        <p className="text-jawwib-text text-sm leading-relaxed">{displayed}</p>
      </div>
    </div>
  );
}
