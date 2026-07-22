import { useState } from 'react';

interface ShareCardProps {
  winnerName: string;
  winnerEmoji: string;
  winnerScore: number;
  loserName?: string;
  loserEmoji?: string;
  loserScore?: number;
  mvpName?: string;
  mvpAvatar?: string;
  isTeams: boolean;
  isTie?: boolean;
  onClose: () => void;
}

function fmt(n: number) {
  return n.toLocaleString('ar-KW');
}

export function ShareCard({
  winnerName, winnerEmoji, winnerScore,
  loserName, loserEmoji, loserScore,
  mvpName, mvpAvatar,
  isTeams, isTie,
  onClose,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const caption = isTeams
    ? isTie
      ? `🤝 تعادل مذهل في جاوب!\n${winnerEmoji} ${winnerName}: ${fmt(winnerScore)}\n👉 jawib.app\n#جاوب #ثقافة_عامة`
      : `🏆 فاز ${winnerEmoji} ${winnerName} في جاوب بـ${fmt(winnerScore)} نقطة!\n${loserEmoji} ${loserName}: ${fmt(loserScore ?? 0)}\n👉 jawib.app\n#جاوب #ثقافة_عامة`
    : `🏆 ${winnerEmoji} ${winnerName} حطّم الجميع في جاوب!\n${fmt(winnerScore)} نقطة 🔥\n👉 jawib.app\n#جاوب #ثقافة_عامة`;

  async function copyCaption() {
    try { await navigator.clipboard.writeText(caption); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = caption; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const gap = isTeams && loserScore !== undefined ? winnerScore - loserScore : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm space-y-3">

        {/* ── The postable card ───────────────────────────────────────────── */}
        <div
          id="jawib-share-card"
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #0A0A18 0%, #0F0F24 60%, #06060F 100%)',
            border: '1.5px solid rgba(176,125,26,0.35)',
            boxShadow: '0 0 60px rgba(176,125,26,0.18), 0 0 0 1px rgba(176,125,26,0.08)',
          }}
        >
          {/* Gold top bar */}
          <div style={{ background: 'linear-gradient(90deg, #B07D1A, #D4A94A, #B07D1A)', height: 3 }} />

          <div className="p-6 text-center">
            {/* Logo */}
            <div className="mb-4">
              <h1
                className="text-5xl font-black leading-none"
                style={{
                  background: 'linear-gradient(135deg, #B07D1A, #D4A94A, #F5E6C8, #D4A94A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                جاوب
              </h1>
              <div
                className="mx-auto mt-1.5"
                style={{
                  height: 2,
                  width: 48,
                  background: 'linear-gradient(90deg, transparent, #D4A94A, transparent)',
                }}
              />
            </div>

            {/* Result */}
            {isTie ? (
              <div className="mb-4">
                <p className="text-4xl mb-2">🤝</p>
                <p className="text-xl font-black text-white mb-1">تعادل!</p>
                <p className="text-jawwib-text-dim text-sm">{winnerEmoji} {winnerName}</p>
              </div>
            ) : (
              <div className="mb-5">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black mb-3"
                  style={{ background: 'rgba(176,125,26,0.15)', color: '#D4A94A', border: '1px solid rgba(176,125,26,0.3)' }}
                >
                  🏆 الفائز
                </div>
                <p className="text-5xl mb-2">{winnerEmoji}</p>
                <p className="text-2xl font-black text-white mb-1">{winnerName}</p>
                <p
                  className="text-4xl font-black tabular-nums mb-1"
                  style={{ color: '#D4A94A' }}
                >
                  {fmt(winnerScore)}
                </p>
                <p className="text-xs text-jawwib-text-dim">نقطة</p>
              </div>
            )}

            {/* Score comparison bar (teams only) */}
            {isTeams && !isTie && loserName && loserScore !== undefined && (
              <div
                className="rounded-2xl p-3 mb-4 space-y-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-white">{winnerEmoji} {winnerName}</span>
                  <span className="font-black tabular-nums" style={{ color: '#D4A94A' }}>{fmt(winnerScore)}</span>
                </div>
                {/* Progress bar showing gap */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (winnerScore / (winnerScore + loserScore)) * 100)}%`,
                      background: 'linear-gradient(90deg,#B07D1A,#D4A94A)',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm opacity-60">
                  <span className="font-bold text-white">{loserEmoji} {loserName}</span>
                  <span className="font-black tabular-nums text-white">{fmt(loserScore)}</span>
                </div>
                {gap > 0 && (
                  <p className="text-[10px] text-center" style={{ color: 'rgba(176,125,26,0.7)' }}>
                    فارق {fmt(gap)} نقطة
                  </p>
                )}
              </div>
            )}

            {/* MVP */}
            {mvpName && (
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                style={{ background: 'rgba(176,125,26,0.12)', border: '1px solid rgba(176,125,26,0.25)' }}
              >
                <span>{mvpAvatar}</span>
                <span className="text-xs font-bold" style={{ color: '#D4A94A' }}>{mvpName}</span>
                <span className="text-xs opacity-60 text-white">MVP ⭐</span>
              </div>
            )}

            {/* Cultural strip */}
            <p className="text-xs opacity-30 mb-3 tracking-widest">🌴 🐪 ☕ 🌊 🌴</p>

            {/* App URL */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(176,125,26,0.1)', border: '1px solid rgba(176,125,26,0.2)' }}
            >
              <span className="text-sm">🎮</span>
              <span className="text-sm font-black" style={{ color: '#D4A94A' }}>jawib.app</span>
            </div>
          </div>

          {/* Gold bottom bar */}
          <div style={{ background: 'linear-gradient(90deg, #B07D1A, #D4A94A, #B07D1A)', height: 3 }} />
        </div>

        {/* ── Controls ──────────────────────────────────────────────────────── */}
        <div className="game-card p-3 space-y-2">
          <p className="text-center text-xs font-bold text-jawwib-text-dim">
            📸 خذ سكرين شوت للكارد وشاركه
          </p>
          <button
            onClick={copyCaption}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all tap-target"
            style={{
              background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(176,125,26,0.12)',
              border: `1.5px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(176,125,26,0.3)'}`,
              color: copied ? '#22C55E' : '#D4A94A',
            }}
          >
            {copied ? '✓ تم نسخ الكابشن!' : '📋 انسخ كابشن انستغرام / سناب'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full text-xs text-jawwib-text-dim py-2 tap-target"
        >
          إغلاق ✕
        </button>
      </div>
    </div>
  );
}
