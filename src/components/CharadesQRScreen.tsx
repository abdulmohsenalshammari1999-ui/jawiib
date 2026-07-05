import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Question } from '@/lib/types'

interface CharadesQRScreenProps {
  question: Question
  timer: number
  maxTimer?: number
  actingTeamName: string
  actingTeamEmoji?: string
  actingTeamColor?: string
  onCorrect: () => void
  onWrong: () => void
  disabled?: boolean
}

// Encode reveal data into a hash-safe base64 string
function buildRevealUrl(question: Question, expMs: number): string {
  const data = {
    w: question.text,
    img: question.mediaUrl ?? undefined,
    pts: question.points,
    exp: expMs,
  }
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
  return `${window.location.origin}/q/reveal#${encoded}`
}

// ── Sub: compact countdown ring ───────────────────────────────────────────────
function CountdownRing({ seconds, maxSeconds }: { seconds: number; maxSeconds: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, seconds / maxSeconds)
  const isLow = seconds <= 8

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={32} cy={32} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
        <circle
          cx={32} cy={32} r={r}
          fill="none"
          stroke={isLow ? '#C85A34' : '#E9A23C'}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className="absolute font-black text-lg tabular-nums"
        style={{ color: isLow ? '#C85A34' : '#E9A23C' }}
      >
        {seconds}
      </span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function CharadesQRScreen({
  question,
  timer,
  maxTimer = 45,
  actingTeamName,
  actingTeamEmoji = '🎭',
  actingTeamColor,
  onCorrect,
  onWrong,
  disabled = false,
}: CharadesQRScreenProps) {
  // QR URL is stable for the lifetime of this question instance
  const revealUrl = useRef(buildRevealUrl(question, Date.now() + 90_000))
  const [phase, setPhase] = useState<'scan' | 'acting'>('scan')

  // Auto-advance to acting after 30s (in case actor can't scan)
  useEffect(() => {
    if (phase !== 'scan') return
    const t = setTimeout(() => setPhase('acting'), 30_000)
    return () => clearTimeout(t)
  }, [phase])

  const teamStyle = actingTeamColor
    ? { borderColor: `${actingTeamColor}60`, background: `${actingTeamColor}0D` }
    : { borderColor: 'rgba(233,162,60,0.40)', background: 'rgba(233,162,60,0.06)' }

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in" dir="rtl">

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-black"
          style={teamStyle}
        >
          <span>{actingTeamEmoji}</span>
          <span style={{ color: actingTeamColor ?? '#E9A23C' }}>{actingTeamName}</span>
          <span className="text-jawwib-text-dim font-normal">يمثّل</span>
        </div>
        <CountdownRing seconds={timer} maxSeconds={maxTimer} />
      </div>

      {/* Main card */}
      <div
        className="game-card p-5 rounded-2xl text-center"
        style={{ border: `2px solid ${actingTeamColor ?? '#E9A23C'}30` }}
      >

        {phase === 'scan' ? (
          <>
            {/* Instruction */}
            <p className="text-jawwib-text-dim text-sm font-bold mb-1">
              المُمثّل — امسح الكود بكاميرتك
            </p>
            <p className="text-jawwib-text-muted text-xs mb-5">
              أنت وحدك اللي تشوف الكلمة • لا تريها للثاني
            </p>

            {/* QR code */}
            <div
              className="inline-block p-3 rounded-2xl mb-5"
              style={{ background: '#F2E7D3' }}
            >
              <QRCodeSVG
                value={revealUrl.current}
                size={200}
                bgColor="#F2E7D3"
                fgColor="#16100B"
                level="M"
                marginSize={1}
              />
            </div>

            {/* Points badge */}
            <div className="mb-4">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-black"
                style={{ background: 'rgba(233,162,60,0.15)', color: '#E9A23C', border: '1px solid rgba(233,162,60,0.30)' }}
              >
                {question.points} نقطة
              </span>
            </div>

            {/* Skip scan button (if QR doesn't work) */}
            <button
              onClick={() => setPhase('acting')}
              className="text-xs text-jawwib-text-muted underline underline-offset-2 tap-target"
            >
              ما عندي كاميرا ← ابدأ بدون كود
            </button>
          </>
        ) : (
          <>
            {/* Acting phase */}
            <div className="mb-4">
              <p className="text-5xl mb-2">🎭</p>
              <p className="font-black text-2xl text-jawwib-text mb-1">الجميع يخمّن!</p>
              <p className="text-jawwib-text-dim text-sm">
                {actingTeamEmoji} {actingTeamName} يمثّل الآن — لا كلام ولا إشارة لحروف
              </p>
            </div>

            {/* Timer reminder */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-bold"
              style={{ background: 'rgba(233,162,60,0.10)', color: '#E9A23C' }}
            >
              ⏱️ الوقت المتبقي: {timer}ث
            </div>

            {/* Judge buttons */}
            {!disabled && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onCorrect}
                  className="py-4 rounded-2xl font-black text-lg tap-target transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(150deg, #3D8C72, #2E6B57)',
                    color: '#F2E7D3',
                    boxShadow: '0 8px 20px -8px rgba(95,169,140,0.55)',
                  }}
                >
                  ✅ صح
                </button>
                <button
                  onClick={onWrong}
                  className="py-4 rounded-2xl font-black text-lg tap-target transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(150deg, #9A3A1A, #7A2810)',
                    color: '#F5D5C0',
                    boxShadow: '0 8px 20px -8px rgba(200,90,52,0.55)',
                  }}
                >
                  ❌ غلط
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Audience note */}
      <p className="text-center text-jawwib-text-muted text-xs mt-3">
        👁️ باقي اللاعبين ينتظرون — لا ينظرون بالجهاز الأساسي
      </p>
    </div>
  )
}
