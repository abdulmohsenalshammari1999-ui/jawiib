import { useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { APP_CONFIG } from '@/lib/appConfig';

interface TeamResult {
  name: string;
  score: number;
  emoji: string;
  color: string;
}

interface ResultCardProps {
  winnerTeam?: TeamResult | null;
  loserTeam?: TeamResult | null;
  winnerName?: string;
  winnerEmoji?: string;
  winnerScore?: number;
  mvpName?: string;
  mvpAvatar?: string;
  isTeams: boolean;
  isTie?: boolean;
  mode?: 'ffa' | 'teams';
  onClose: () => void;
}

const GOLD      = '#D4A94A';
const GOLD_DIM  = '#B07D1A';
const DARK      = '#16100B';
const DARK2     = '#1C150E';
const SADU_COLORS = ['#B07D1A', '#5FA98C', '#C85A34', '#16100B', '#D4A94A', '#B08968', '#B07D1A'];

function fmt(n: number) { return n.toLocaleString('ar-EG'); }

function SaduStripe({ height = 8 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', height, overflow: 'hidden', flexShrink: 0 }}>
      {Array.from({ length: 32 }, (_, i) => (
        <div key={i} style={{ flex: 1, backgroundColor: SADU_COLORS[i % SADU_COLORS.length] }} />
      ))}
    </div>
  );
}

function Glow({ color, opacity = 0.4 }: { color: string; opacity?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 65%)`,
        pointerEvents: 'none',
      }}
    />
  );
}

export function ResultCard({
  winnerTeam,
  loserTeam,
  winnerName = '',
  winnerEmoji = '🏆',
  winnerScore = 0,
  mvpName,
  mvpAvatar,
  isTeams,
  isTie,
  onClose,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const playAgainUrl = `https://${APP_CONFIG.appUrl}`;
  const challengeUrl = `https://${APP_CONFIG.appUrl}`;

  const mainName  = winnerTeam?.name  ?? winnerName;
  const mainEmoji = winnerTeam?.emoji ?? winnerEmoji;
  const mainScore = winnerTeam?.score ?? winnerScore;
  const mainColor = winnerTeam?.color ?? '#D4A94A';

  const instagramCaption = isTeams && winnerTeam && loserTeam && !isTie
    ? `🏆 ${winnerTeam.emoji} ${winnerTeam.name} حطّم ${loserTeam.name} في جاوب!\n${fmt(winnerTeam.score)} vs ${fmt(loserTeam.score)} — فارق ${fmt(winnerTeam.score - loserTeam.score)} نقطة\n\n👉 ${APP_CONFIG.appUrl}\n#جاوب #ثقافة_عامة #تحدي`
    : isTie
    ? `🤝 تعادل مذهل في جاوب! هل تجرؤ على كسره؟\n👉 ${APP_CONFIG.appUrl}\n#جاوب #ثقافة_عامة`
    : `🏆 ${mainEmoji} ${mainName} حطّم الكل في جاوب بـ${fmt(mainScore)} نقطة 🔥\n👉 ${APP_CONFIG.appUrl}\n#جاوب #ثقافة_عامة`;

  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(instagramCaption); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = instagramCaption;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [instagramCaption]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'جاوب', text: instagramCaption, url: challengeUrl });
        return;
      } catch { void 0; }
    }
    void handleCopy();
  }, [instagramCaption, challengeUrl, handleCopy]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.94)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full flex flex-col items-center gap-3"
        style={{ maxWidth: 420 }}
      >
        {/* ── The shareable card ───────────────────────────────────────── */}
        <div
          id="jawib-result-card"
          style={{
            width: '100%',
            background: `linear-gradient(170deg, ${DARK} 0%, ${DARK2} 55%, #060614 100%)`,
            borderRadius: 28,
            overflow: 'hidden',
            border: `1.5px solid rgba(212,169,74,0.35)`,
            boxShadow: `0 0 100px rgba(176,125,26,0.2), 0 0 0 1px rgba(176,125,26,0.06)`,
            position: 'relative',
          }}
        >
          {isTie ? (
            <Glow color="#D4A94A" opacity={0.22} />
          ) : (
            <Glow color={mainColor} opacity={0.25} />
          )}

          <SaduStripe />

          <div style={{ padding: '28px 28px 24px', position: 'relative', zIndex: 1 }}>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  lineHeight: 1,
                  background: `linear-gradient(135deg, ${GOLD_DIM}, ${GOLD}, #F5E6C8, ${GOLD})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                جاوب
              </div>
              <div
                style={{
                  height: 2,
                  width: 44,
                  margin: '6px auto 0',
                  background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                }}
              />
            </div>

            {/* ── Win state ───────────────────────────────────────────── */}
            {isTie ? (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 10 }}>🤝</div>
                <div
                  style={{
                    fontSize: 28, fontWeight: 900, color: '#fff',
                    marginBottom: 6,
                  }}
                >
                  تعادل مثير!
                </div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                  كلا الفريقين استحق النصر
                </div>
              </div>
            ) : (
              <>
                {/* Champion announcement */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 14px',
                      borderRadius: 100,
                      background: 'rgba(176,125,26,0.15)',
                      border: `1px solid rgba(176,125,26,0.3)`,
                      color: GOLD,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      marginBottom: 14,
                    }}
                  >
                    🏆 الفائز
                  </div>

                  <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 8 }}>{mainEmoji}</div>

                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: '#fff',
                      marginBottom: 6,
                      textShadow: `0 0 24px ${mainColor}55`,
                    }}
                  >
                    {mainName}
                  </div>

                  <div
                    style={{
                      fontSize: 52,
                      fontWeight: 900,
                      lineHeight: 1,
                      background: `linear-gradient(135deg, ${GOLD_DIM}, ${GOLD}, #F5E6C8)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: 4,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {fmt(mainScore)}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>نقطة</div>
                </div>
              </>
            )}

            {/* ── Teams comparison ────────────────────────────────────── */}
            {isTeams && winnerTeam && loserTeam && !isTie && (
              <div
                style={{
                  borderRadius: 18,
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  marginBottom: 18,
                }}
              >
                {/* Winner row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 18 }}>{winnerTeam.emoji}</span>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: 13 }}>{winnerTeam.name}</span>
                  </div>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: 15,
                      color: GOLD,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {fmt(winnerTeam.score)}
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: 5,
                    borderRadius: 100,
                    background: 'rgba(255,255,255,0.07)',
                    marginBottom: 8,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(98, Math.round((winnerTeam.score / Math.max(1, winnerTeam.score + loserTeam.score)) * 100))}%`,
                      background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD})`,
                      borderRadius: 100,
                    }}
                  />
                </div>

                {/* Loser row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.55 }}>
                    <span style={{ fontSize: 18 }}>{loserTeam.emoji}</span>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>{loserTeam.name}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(loserTeam.score)}
                  </span>
                </div>

                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'rgba(176,125,26,0.6)',
                      fontWeight: 700,
                    }}
                  >
                    فارق {fmt(winnerTeam.score - loserTeam.score)} نقطة
                  </span>
                </div>
              </div>
            )}

            {/* MVP */}
            {mvpName && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 18px',
                    borderRadius: 100,
                    background: 'rgba(176,125,26,0.1)',
                    border: '1px solid rgba(176,125,26,0.22)',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{mvpAvatar}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>{mvpName}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>MVP ⭐</span>
                </div>
              </div>
            )}

            {/* QR + challenge CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 18,
                background: 'rgba(212,169,74,0.06)',
                border: '1px solid rgba(212,169,74,0.18)',
                marginBottom: 16,
              }}
            >
              <div style={{ background: '#fff', borderRadius: 10, padding: 6, flexShrink: 0 }}>
                <QRCodeSVG value={playAgainUrl} size={72} fgColor={DARK} bgColor="#ffffff" level="M" />
              </div>
              <div>
                <div style={{ color: GOLD, fontWeight: 900, fontSize: 14, marginBottom: 3 }}>
                  هل تجرؤ على التحدي؟
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 5 }}>
                  امسح QR وابدأ لعبتك
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 8,
                    background: 'rgba(212,169,74,0.12)',
                    color: GOLD,
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {APP_CONFIG.appUrl}
                </div>
              </div>
            </div>

            {/* Cultural strip */}
            <div style={{ textAlign: 'center', fontSize: 13, letterSpacing: '0.55em', opacity: 0.22, color: '#fff' }}>
              🌴 🐪 ☕ 🦅 🌊
            </div>
          </div>

          <SaduStripe />
        </div>

        {/* ── Share controls ─────────────────────────────────────────── */}
        <div className="game-card p-4 w-full space-y-3">
          <p className="text-center text-xs font-bold text-jawwib-text-dim">
            📸 خذ سكرين شوت وشارك اللحظة
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-3 rounded-2xl font-black text-sm transition-all"
              style={{
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(176,125,26,0.12)',
                border: `1.5px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(176,125,26,0.3)'}`,
                color: copied ? '#22C55E' : GOLD,
              }}
            >
              {copied ? '✓ تم النسخ!' : '📋 انسخ كابشن'}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-2xl font-black text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg,#075E54,#128C7E)',
                color: '#fff',
              }}
            >
              💬 واتساب
            </button>
          </div>

          <button onClick={onClose} className="w-full text-xs text-jawwib-text-dim py-1.5 tap-target">
            إغلاق ✕
          </button>
        </div>
      </div>
    </div>
  );
}
