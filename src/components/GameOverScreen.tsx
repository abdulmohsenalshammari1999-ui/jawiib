import { useEffect, useState, useCallback } from 'react';
import type { Player } from '@/lib/types';
import { APP_CONFIG } from '@/lib/appConfig';
import { ShareCard } from './ShareCard';

interface TeamResult {
  name: string;
  score: number;
  color: string;
  emoji: string;
  playerIds: string[];
}

interface GameOverScreenProps {
  players: Player[];
  hostMessage: string;
  onPlayAgain: () => void;
  onNewGame?: () => void;
  onRateMatch?: () => void;
  teams?: { alpha: TeamResult; beta: TeamResult } | null;
  mode?: 'ffa' | 'teams';
}

interface Confetto {
  id: number;
  left: number;
  color: string;
  duration: number;
  delay: number;
  size: number;
}

const CONFETTI_COLORS = ['#B07D1A', '#D4A94A', '#F5F0E8', '#1A5FA8', '#1A7A42', '#B82118', '#C9A87A'];
const APP_URL = APP_CONFIG.appUrl;

function useConfetti(count = 28) {
  const [pieces] = useState<Confetto[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      duration: 2.5 + Math.random() * 2,
      delay: Math.random() * 1.5,
      size: 6 + Math.random() * 6,
    }))
  );
  return pieces;
}

function fmt(n: number) {
  return n.toLocaleString('ar-KW');
}

// ── Platform share-text builders ─────────────────────────────────────────────

function buildWhatsappText(
  winnerTeam: TeamResult | null,
  loserTeam: TeamResult | null,
  winner: Player | null,
  sorted: Player[],
  gapScore: number,
  mode: 'ffa' | 'teams',
): string {
  const divider = '━━━━━━━━━━';

  if (winnerTeam && loserTeam) {
    const mvp = sorted[0];
    const lines = [
      `🏆 *جاوب* — النتيجة النهائية!`,
      ``,
      `${winnerTeam.emoji} *${winnerTeam.name}*: ${fmt(winnerTeam.score)} نقطة`,
      `${loserTeam.emoji} *${loserTeam.name}*: ${fmt(loserTeam.score)} نقطة`,
      divider,
      `🥇 فاز *${winnerTeam.name}* بفارق ${fmt(gapScore)} نقطة!`,
      mvp ? `⭐ MVP: ${mvp.avatar} ${mvp.name} — ${fmt(mvp.score)} نقطة` : '',
      ``,
      `هل فريقك أقوى؟ 👇`,
      `🎮 *${APP_URL}*`,
      ``,
      `#جاوب #ثقافة_عامة`,
    ];
    return lines.filter((l) => l !== null).join('\n');
  }

  if (mode === 'teams' && !winnerTeam) {
    return [
      `🤝 *جاوب* — تعادل مثير!`,
      ``,
      `كلا الفريقين على نفس النقاط 😮`,
      `من يكسر التعادل في الجولة القادمة؟`,
      ``,
      `🎮 *${APP_URL}*`,
      `#جاوب`,
    ].join('\n');
  }

  if (winner) {
    const runner = sorted[1];
    return [
      `🏆 *جاوب* — النتيجة النهائية!`,
      ``,
      `🥇 ${winner.avatar} *${winner.name}*: ${fmt(winner.score)} نقطة`,
      runner ? `🥈 ${runner.avatar} ${runner.name}: ${fmt(runner.score)} نقطة` : '',
      ``,
      `جرّب تتحداه! 😤`,
      `🎮 *${APP_URL}*`,
      ``,
      `#جاوب #ثقافة_عامة`,
    ].filter(Boolean).join('\n');
  }

  return `🎮 جرّب جاوب — لعبة الثقافة العامة!\n${APP_URL}\n#جاوب`;
}

function buildSnapText(
  winnerTeam: TeamResult | null,
  loserTeam: TeamResult | null,
  winner: Player | null,
  gapScore: number,
  mode: 'ffa' | 'teams',
): string {
  if (winnerTeam && loserTeam) {
    return [
      `🏆 ريحنا ${loserTeam.name} في جاوب 😤`,
      ``,
      `${winnerTeam.emoji} ${winnerTeam.name}: ${fmt(winnerTeam.score)}`,
      `${loserTeam.emoji} ${loserTeam.name}: ${fmt(loserTeam.score)}`,
      `فارق: ${fmt(gapScore)} نقطة 💀`,
      ``,
      `جرّب تتحدانا 😏`,
      `👉 ${APP_URL}`,
    ].join('\n');
  }

  if (mode === 'teams') {
    return `🤝 تعادل في جاوب! من يكسره؟\n👉 ${APP_URL}`;
  }

  return winner
    ? `🏆 ${winner.avatar} ${winner.name} حطّم الكل في جاوب بـ${fmt(winner.score)} نقطة 🔥\n👉 ${APP_URL}`
    : `🎮 جرّب جاوب!\n👉 ${APP_URL}`;
}

function buildInstagramText(
  winnerTeam: TeamResult | null,
  loserTeam: TeamResult | null,
  winner: Player | null,
  sorted: Player[],
  gapScore: number,
  mode: 'ffa' | 'teams',
): string {
  const tags = [
    '#جاوب', '#ثقافة_عامة', '#تحدي',
    '#entertainment', '#arabic_game', '#لعبة',
  ].join(' ');

  if (winnerTeam && loserTeam) {
    const mvp = sorted[0];
    return [
      `جاوب 🏆 النتيجة النهائية`,
      ``,
      `${winnerTeam.emoji} ${winnerTeam.name} ${'━'.repeat(4)} ${fmt(winnerTeam.score)} نقطة`,
      `${loserTeam.emoji} ${loserTeam.name} ${'━'.repeat(4)} ${fmt(loserTeam.score)} نقطة`,
      ``,
      `🥇 الفائز: ${winnerTeam.name}`,
      `📊 فارق: ${fmt(gapScore)} نقطة`,
      mvp ? `⭐ MVP: ${mvp.avatar} ${mvp.name}` : '',
      ``,
      `تحدّانا — إذا كنت تجرؤ 😏`,
      `لعبة الثقافة العامة العربية 🎮`,
      ``,
      `🔗 ${APP_URL}`,
      ``,
      tags,
    ].filter(Boolean).join('\n');
  }

  if (mode === 'teams') {
    return [
      `جاوب 🤝 تعادل مذهل!`,
      `كلا الفريقين على نفس النقاط 😮`,
      ``,
      `🔗 ${APP_URL}`,
      ``,
      tags,
    ].join('\n');
  }

  if (winner) {
    return [
      `جاوب 🏆 نتيجة المباراة`,
      ``,
      `🥇 ${winner.avatar} ${winner.name} — ${fmt(winner.score)} نقطة`,
      sorted[1] ? `🥈 ${sorted[1].avatar} ${sorted[1].name} — ${fmt(sorted[1].score)} نقطة` : '',
      ``,
      `هل تجرؤ على التحدي؟ 😤`,
      `🔗 ${APP_URL}`,
      ``,
      tags,
    ].filter(Boolean).join('\n');
  }

  return [`جاوب — لعبة الثقافة العامة! 🎮`, `🔗 ${APP_URL}`, ``, tags].join('\n');
}

// ── Share button ──────────────────────────────────────────────────────────────

type Platform = 'whatsapp' | 'snapchat' | 'instagram';

interface ShareButtonProps {
  platform: Platform;
  text: string;
  href?: string;
  copied: boolean;
  onCopy: (platform: Platform) => void;
}

function ShareButton({ platform, text, href, copied, onCopy }: ShareButtonProps) {
  const meta: Record<Platform, { label: string; icon: string; style: React.CSSProperties; textClass: string }> = {
    whatsapp: {
      label: 'واتساب',
      icon: '💬',
      style: { background: '#25D366' },
      textClass: 'text-white',
    },
    snapchat: {
      label: 'سناب شات',
      icon: '👻',
      style: { background: '#FFFC00' },
      textClass: 'text-black',
    },
    instagram: {
      label: 'انستغرام',
      icon: '📸',
      style: { background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
      textClass: 'text-white',
    },
  };

  const { label, icon, style, textClass } = meta[platform];

  const handleClick = useCallback(async () => {
    if (platform === 'whatsapp' && href) return; // handled by <a>

    // Try native share sheet (shows Snapchat / Instagram in the picker)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'جاوب', text, url: `https://${APP_URL}` });
        return;
      } catch {
        // User cancelled or not supported — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    onCopy(platform);
  }, [platform, href, text, onCopy]);

  const inner = (
    <span className={`flex items-center justify-center gap-2 font-black text-sm ${textClass}`}>
      {copied ? (
        <>✓ <span>تم النسخ!</span></>
      ) : (
        <><span>{icon}</span><span>شارك على {label}</span></>
      )}
    </span>
  );

  if (platform === 'whatsapp' && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-3.5 rounded-2xl text-center block tap-target transition-opacity active:opacity-80"
        style={style}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex-1 py-3.5 rounded-2xl tap-target transition-opacity active:opacity-80"
      style={style}
    >
      {inner}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function GameOverScreen({
  players,
  hostMessage,
  onPlayAgain,
  onNewGame,
  onRateMatch,
  teams,
  mode = 'ffa',
}: GameOverScreenProps) {
  const confetti = useConfetti();
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Clear "copied" confirmation after 2s
  useEffect(() => {
    if (!copiedPlatform) return;
    const t = setTimeout(() => setCopiedPlatform(null), 2000);
    return () => clearTimeout(t);
  }, [copiedPlatform]);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  const isTie = mode === 'teams' && teams !== null && teams !== undefined
    && teams.alpha.score === teams.beta.score;

  const winnerTeam =
    mode === 'teams' && teams && !isTie
      ? teams.alpha.score > teams.beta.score ? teams.alpha : teams.beta
      : null;

  const loserTeam =
    mode === 'teams' && teams && !isTie
      ? teams.alpha.score > teams.beta.score ? teams.beta : teams.alpha
      : null;

  const gapScore = mode === 'teams' && teams
    ? Math.abs(teams.alpha.score - teams.beta.score)
    : 0;

  const waText       = buildWhatsappText(winnerTeam, loserTeam, winner, sorted, gapScore, mode);
  const snapText     = buildSnapText(winnerTeam, loserTeam, winner, gapScore, mode);
  const instagramText = buildInstagramText(winnerTeam, loserTeam, winner, sorted, gapScore, mode);

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(waText)}`;

  const handleCopy = useCallback((platform: Platform) => {
    setCopiedPlatform(platform);
  }, []);

  return (
    <div className="animate-fade-in min-h-screen flex items-center justify-center p-4">
      {showShareCard && (
        <ShareCard
          winnerName={winnerTeam?.name ?? winner?.name ?? ''}
          winnerEmoji={winnerTeam?.emoji ?? winner?.avatar ?? '🏆'}
          winnerScore={winnerTeam?.score ?? winner?.score ?? 0}
          loserName={loserTeam?.name}
          loserEmoji={loserTeam?.emoji}
          loserScore={loserTeam?.score}
          mvpName={sorted[0]?.name}
          mvpAvatar={sorted[0]?.avatar}
          isTeams={mode === 'teams'}
          isTie={isTie}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {/* Confetti */}
      {showConfetti &&
        confetti.map((c) => (
          <div
            key={c.id}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              width: `${c.size}px`,
              height: `${c.size * 0.6}px`,
              background: c.color,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}

      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: winnerTeam?.color
            ? `radial-gradient(ellipse at center, ${winnerTeam.color}18 0%, transparent 65%)`
            : 'radial-gradient(ellipse at center, #C8880A18 0%, transparent 65%)',
        }}
      />

      <div className="max-w-lg w-full text-center relative z-10">
        <div className="text-6xl mb-2 animate-bounce-in">🏆</div>
        <h1 className="text-3xl font-black text-gold-gradient mb-1">انتهت اللعبة!</h1>
        <div className="sea-wave-accent mx-auto mb-5" style={{ width: 120 }} />

        {/* Tie */}
        {isTie && teams && (
          <div className="game-card p-6 mb-4 animate-score-reveal border-2 border-jawwib-gold/40 text-center">
            <div className="text-5xl mb-2">🤝</div>
            <h2 className="text-2xl font-black text-gold-gradient mb-3">تعادل!</h2>
            <div className="grid grid-cols-2 gap-3">
              {([teams.alpha, teams.beta] as const).map((t) => (
                <div key={t.name} className="bg-jawwib-surface rounded-xl p-3">
                  <p className="text-2xl mb-1">{t.emoji}</p>
                  <p className="font-black text-sm mb-1" style={{ color: t.color }}>{t.name}</p>
                  <p className="text-xl font-black text-jawwib-gold tabular-nums">{fmt(t.score)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team winner */}
        {winnerTeam && loserTeam && (
          <>
            <div
              className="game-card p-6 mb-3 animate-score-reveal"
              style={{ borderColor: `${winnerTeam.color}50`, borderWidth: '2px' }}
            >
              <p className="text-jawwib-text-dim text-xs mb-2">الفريق الفائز 🎉</p>
              <div className="text-5xl mb-2">{winnerTeam.emoji}</div>
              <h2 className="text-2xl font-black mb-1" style={{ color: winnerTeam.color }}>
                {winnerTeam.name}
              </h2>
              <p className="text-3xl font-black text-jawwib-gold tabular-nums">{fmt(winnerTeam.score)}</p>
              <p className="text-jawwib-text-dim text-xs mt-1">نقطة</p>
              {gapScore > 0 && (
                <p className="text-xs text-jawwib-text-dim mt-2">
                  تقدّم بـ {fmt(gapScore)} نقطة على {loserTeam.name}
                </p>
              )}
              {(() => {
                const mvp = players
                  .filter((p) => winnerTeam.playerIds.includes(p.id))
                  .sort((a, b) => b.score - a.score)[0];
                return mvp ? (
                  <div className="mt-3 inline-flex items-center gap-2 bg-jawwib-gold/10 px-4 py-1.5 rounded-full">
                    <span>{mvp.avatar}</span>
                    <span className="text-sm font-bold text-jawwib-gold">{mvp.name}</span>
                    <span className="text-xs text-jawwib-text-dim">MVP ⭐</span>
                  </div>
                ) : null;
              })()}
            </div>

            <div className="flex items-center gap-3 bg-jawwib-surface rounded-xl px-4 py-2.5 mb-4 border border-jawwib-border">
              <span className="text-base" style={{ color: loserTeam.color }}>{loserTeam.emoji}</span>
              <span className="font-bold text-sm" style={{ color: loserTeam.color }}>{loserTeam.name}</span>
              <span className="font-black tabular-nums mr-auto" style={{ color: loserTeam.color }}>
                {fmt(loserTeam.score)}
              </span>
            </div>
          </>
        )}

        {/* FFA winner */}
        {!winnerTeam && winner && (
          <div className="game-card p-6 mb-5 animate-score-reveal border-2 border-jawwib-gold/40">
            <p className="text-jawwib-text-dim text-sm mb-2">الفائز 🥇</p>
            <div className="text-4xl mb-2">{winner.avatar}</div>
            <h2 className="text-2xl font-black text-jawwib-gold mb-1">{winner.name}</h2>
            <p className="text-3xl font-black text-jawwib-gold tabular-nums">{fmt(winner.score)} نقطة</p>
          </div>
        )}

        {/* Host message */}
        <div className="flex items-start gap-3 bg-jawwib-surface rounded-xl p-4 mb-4 text-right border border-jawwib-border">
          <span className="text-xl shrink-0">🎙️</span>
          <p className="text-sm leading-relaxed">{hostMessage}</p>
        </div>

        {/* Leaderboard */}
        <div className="game-card p-4 mb-5">
          <h3 className="text-jawwib-gold font-bold text-sm mb-3 text-right">الترتيب النهائي</h3>
          <div className="space-y-1.5">
            {sorted.map((player, idx) => {
              const tColor =
                mode === 'teams' && teams
                  ? teams.alpha.playerIds.includes(player.id) ? '#1D4ED8' : '#B91C1C'
                  : null;
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-jawwib-surface"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm w-6 text-jawwib-text-dim">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </span>
                    <span className="text-lg">{player.avatar}</span>
                    <span className="font-bold text-sm" style={tColor ? { color: tColor } : undefined}>
                      {player.name}
                    </span>
                  </div>
                  <span className="text-jawwib-gold font-black tabular-nums">{fmt(player.score)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cultural footer motif */}
        <div className="cultural-strip mb-4">🌴 🐪 ☕ 🌊 🌴</div>

        {/* ── Action buttons ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5">
          <button onClick={onPlayAgain} className="btn-gold w-full text-lg py-4">
            🔄 العب مرة ثانية
          </button>

          {/* Share section */}
          <div className="game-card p-4">
            <p className="text-xs font-bold text-jawwib-text-dim mb-3 text-center">
              📣 شارك النتيجة مع أصحابك
            </p>
            {/* Postable card button */}
            <button
              onClick={() => setShowShareCard(true)}
              className="w-full py-3.5 rounded-2xl font-black text-sm mb-3 tap-target transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #B07D1A22, #D4A94A18)',
                border: '1.5px solid rgba(176,125,26,0.45)',
                color: '#D4A94A',
              }}
            >
              📸 كارد للنشر على سناب وانستغرام
            </button>
            <div className="flex gap-2">
              <ShareButton
                platform="whatsapp"
                text={waText}
                href={whatsappHref}
                copied={copiedPlatform === 'whatsapp'}
                onCopy={handleCopy}
              />
              <ShareButton
                platform="snapchat"
                text={snapText}
                copied={copiedPlatform === 'snapchat'}
                onCopy={handleCopy}
              />
              <ShareButton
                platform="instagram"
                text={instagramText}
                copied={copiedPlatform === 'instagram'}
                onCopy={handleCopy}
              />
            </div>
            <p className="text-[10px] text-jawwib-text-dim mt-2 text-center opacity-60">
              سناب وانستغرام: يفتح خيارات المشاركة، أو يُنسخ النص تلقائياً
            </p>
          </div>

          {onRateMatch && (
            <button
              onClick={onRateMatch}
              className="w-full text-sm py-3 rounded-xl border-2 border-jawwib-gold/40 text-jawwib-gold hover:bg-jawwib-gold/10 transition-all"
            >
              ⭐ قيّم المباراة
            </button>
          )}
          {onNewGame && (
            <button
              onClick={onNewGame}
              className="w-full text-sm py-3 rounded-xl border-2 border-jawwib-border text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
            >
              🏠 لعبة جديدة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
