import { QRCodeSVG } from 'qrcode.react';
import { APP_CONFIG } from '@/lib/appConfig';

interface TeamInfo {
  name: string;
  emoji: string;
  color: string;
}

interface InviteCardProps {
  roomCode: string;
  hostName: string;
  alphaTeam?: TeamInfo;
  betaTeam?: TeamInfo;
  mode?: 'ffa' | 'teams';
  onClose: () => void;
}

const GOLD = '#D4A94A';
const DARK = '#040C1E';
const GOLD_DIM = '#B07D1A';

const SADU_COLORS = ['#B07D1A', '#5FA98C', '#C85A34', '#16100B', '#D4A94A'];

function SaduStripe({ height = 8 }: { height?: number }) {
  const count = 28;
  return (
    <div style={{ display: 'flex', height, overflow: 'hidden', flexShrink: 0 }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            backgroundColor: SADU_COLORS[i % SADU_COLORS.length],
          }}
        />
      ))}
    </div>
  );
}

function DiamondRow() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '10px 0', opacity: 0.35 }}>
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          style={{
            width: 7, height: 7,
            backgroundColor: GOLD,
            transform: 'rotate(45deg)',
          }}
        />
      ))}
    </div>
  );
}

export function InviteCard({ roomCode, hostName, alphaTeam, betaTeam, mode = 'ffa', onClose }: InviteCardProps) {
  const joinUrl = `https://${APP_CONFIG.appUrl}/join/${roomCode}`;
  const codeChars = roomCode.split('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full flex flex-col items-center gap-3"
        style={{ maxWidth: 400 }}
      >
        {/* ── The card ─────────────────────────────────────────────────────── */}
        <div
          id="jawib-invite-card"
          style={{
            width: '100%',
            background: DARK,
            borderRadius: 24,
            overflow: 'hidden',
            border: `1.5px solid rgba(212,169,74,0.4)`,
            boxShadow: '0 0 80px rgba(176,125,26,0.25), 0 0 0 1px rgba(176,125,26,0.1)',
            fontFamily: 'inherit',
          }}
        >
          <SaduStripe />

          <div style={{ padding: '28px 28px 20px' }}>

            {/* App name */}
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  lineHeight: 1,
                  background: `linear-gradient(135deg, ${GOLD_DIM}, ${GOLD}, #F5E6C8, ${GOLD})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px',
                }}
              >
                جاوب
              </div>
              <div
                style={{
                  height: 2,
                  width: 56,
                  margin: '6px auto 0',
                  background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                }}
              />
            </div>

            <DiamondRow />

            {/* Challenge header */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '5px 16px',
                  borderRadius: 100,
                  background: 'rgba(176,125,26,0.14)',
                  border: `1px solid rgba(176,125,26,0.3)`,
                  color: GOLD,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                }}
              >
                {hostName} يتحداك! 🏆
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600 }}>
                لعبة الثقافة العامة العربية
              </div>
            </div>

            {/* Team matchup (teams mode) */}
            {mode === 'teams' && alphaTeam && betaTeam && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  marginBottom: 20,
                }}
              >
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 24 }}>{alphaTeam.emoji}</div>
                  <div style={{ color: alphaTeam.color, fontWeight: 800, fontSize: 13 }}>{alphaTeam.name}</div>
                </div>
                <div style={{ color: GOLD, fontWeight: 900, fontSize: 18 }}>VS</div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 24 }}>{betaTeam.emoji}</div>
                  <div style={{ color: betaTeam.color, fontWeight: 800, fontSize: 13 }}>{betaTeam.name}</div>
                </div>
              </div>
            )}

            {/* QR + room code */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                padding: '18px 20px',
                borderRadius: 20,
                background: 'rgba(212,169,74,0.07)',
                border: `1.5px solid rgba(212,169,74,0.25)`,
                marginBottom: 20,
              }}
            >
              {/* QR code */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  padding: 8,
                  flexShrink: 0,
                }}
              >
                <QRCodeSVG
                  value={joinUrl}
                  size={100}
                  fgColor={DARK}
                  bgColor="#ffffff"
                  level="M"
                />
              </div>

              {/* Code display */}
              <div style={{ flex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, marginBottom: 6, letterSpacing: '0.15em' }}>
                  كود الغرفة
                </div>
                <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                  {codeChars.map((ch, i) => (
                    <div
                      key={i}
                      style={{
                        width: 32, height: 36,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(212,169,74,0.12)',
                        border: `1px solid rgba(212,169,74,0.3)`,
                        borderRadius: 8,
                        color: GOLD,
                        fontWeight: 900,
                        fontSize: 18,
                        fontFamily: 'monospace',
                        letterSpacing: 0,
                      }}
                    >
                      {ch}
                    </div>
                  ))}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>
                  امسح QR أو ادخل الكود على
                </div>
                <div style={{ color: GOLD, fontWeight: 800, fontSize: 12, marginTop: 2 }}>
                  {APP_CONFIG.appUrl}
                </div>
              </div>
            </div>

            {/* Cultural strip */}
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14, letterSpacing: '0.5em', marginBottom: 4 }}>
              🌴 🐪 ☕ 🦅 🌊
            </div>
          </div>

          <SaduStripe />
        </div>

        {/* Controls */}
        <div className="game-card p-3 w-full text-center space-y-2">
          <p className="text-jawwib-text-dim text-xs font-bold">📱 خذ سكرين شوت وشارك الكارد</p>
          <p className="text-jawwib-text-dim text-[10px] opacity-70">
            أو أرسل الرابط: {joinUrl}
          </p>
          <button
            onClick={async () => {
              try { await navigator.clipboard.writeText(joinUrl); } catch { void 0; }
            }}
            className="w-full py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(176,125,26,0.12)', border: '1.5px solid rgba(176,125,26,0.3)', color: GOLD }}
          >
            📋 انسخ رابط الانضمام
          </button>
          <button onClick={onClose} className="w-full text-xs text-jawwib-text-dim py-1 tap-target">
            إغلاق ✕
          </button>
        </div>
      </div>
    </div>
  );
}
