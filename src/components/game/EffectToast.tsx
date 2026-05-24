import { useEffect, useState } from 'react';
import type { ActivationResult } from '@/engine/sabotageEngine';

interface Toast {
  id: number;
  icon: string;
  title: string;
  body: string;
  color: string;
}

interface EffectToastProps {
  lastResult: ActivationResult | null;
}

const SABOTAGE_META: Record<string, { icon: string; title: string; color: string }> = {
  steal:   { icon: '💰', title: 'سرقة!',    color: '#F5D060' },
  block:   { icon: '🛡️', title: 'درع!',      color: '#3B82F6' },
  halve:   { icon: '✂️', title: 'تنصيف!',   color: '#EF4444' },
  bomb:    { icon: '💣', title: 'قنبلة!',   color: '#F97316' },
  freeze:  { icon: '🧊', title: 'تجميد!',   color: '#06B6D4' },
  scramble:{ icon: '🔀', title: 'خلط!',     color: '#8B5CF6' },
  double:  { icon: '⚡', title: 'رهان!',    color: '#EAB308' },
  mystery: { icon: '🎁', title: 'صندوق!',   color: '#EC4899' },
};

let _toastId = 0;

export function EffectToast({ lastResult }: EffectToastProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!lastResult) return;
    const sabType = lastResult.newEffect?.type ?? 'mystery';
    const meta = SABOTAGE_META[sabType] ?? (lastResult.mystery ? SABOTAGE_META['mystery'] : null);
    if (!meta) return;

    const body = lastResult.blockConsumed
      ? '🛡️ الهجوم تصدّى له الدرع!'
      : lastResult.hostMessage ?? meta.title;

    const toast: Toast = {
      id: ++_toastId,
      icon: meta.icon,
      title: lastResult.blockConsumed ? 'محجوب!' : meta.title,
      body,
      color: meta.color,
    };

    setToasts((prev) => [...prev, toast].slice(-3));
    const t = setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== toast.id)), 3200);
    return () => clearTimeout(t);
  }, [lastResult]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-sm animate-slide-up"
          style={{
            background: `${t.color}18`,
            borderColor: `${t.color}60`,
            boxShadow: `0 0 20px ${t.color}30`,
          }}
        >
          <span className="text-2xl shrink-0">{t.icon}</span>
          <div className="min-w-0">
            <p className="font-black text-sm" style={{ color: t.color }}>{t.title}</p>
            <p className="text-xs text-jawwib-text leading-tight line-clamp-1">{t.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
