import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/q/reveal')({
  component: RevealPage,
})

interface RevealData {
  w: string        // word / prompt to act out
  img?: string     // optional image URL
  pts?: number     // points value
  exp: number      // expiry timestamp (ms)
}

function decode(hash: string): RevealData | null {
  try {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash
    return JSON.parse(decodeURIComponent(escape(atob(raw)))) as RevealData
  } catch {
    return null
  }
}

function RevealPage() {
  const [data, setData]       = useState<RevealData | null>(null)
  const [seen, setSeen]       = useState(false)
  const [expired, setExpired] = useState(false)
  const [error, setError]     = useState(false)

  useEffect(() => {
    const parsed = decode(window.location.hash)
    if (!parsed) { setError(true); return }
    if (Date.now() > parsed.exp) { setExpired(true); return }
    setData(parsed)

    // auto-expire when window closes
    const remaining = parsed.exp - Date.now()
    const t = setTimeout(() => setExpired(true), remaining)
    return () => clearTimeout(t)
  }, [])

  // ── Error / expired states ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="fixed inset-0 bg-jawwib-bg flex items-center justify-center p-6 text-center" dir="rtl">
        <div>
          <p className="text-5xl mb-4">❌</p>
          <p className="font-black text-xl text-jawwib-text">رابط غير صالح</p>
          <p className="text-jawwib-text-dim mt-2 text-sm">اطلب من المضيف يولّد كود جديد</p>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="fixed inset-0 bg-jawwib-bg flex items-center justify-center p-6 text-center" dir="rtl">
        <div>
          <p className="text-5xl mb-4">⏰</p>
          <p className="font-black text-xl text-jawwib-text">انتهى وقت الكود</p>
          <p className="text-jawwib-text-dim mt-2 text-sm">الجولة بدأت — حظاً موفقاً!</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  // ── Seen confirmation ─────────────────────────────────────────────────────
  if (seen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center p-6 text-center"
        style={{ background: 'linear-gradient(160deg, #1C3A2A, #16100B)' }}
        dir="rtl"
      >
        <div className="animate-bounce-in">
          <p className="text-7xl mb-5">🎭</p>
          <p className="font-black text-3xl text-jawwib-oasis mb-2">انطلق!</p>
          <p className="text-jawwib-text-dim">الجميع ينتظر تمثيلك</p>
        </div>
      </div>
    )
  }

  // ── Main reveal ───────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center select-none"
      style={{ background: 'linear-gradient(160deg, #241A12, #16100B)' }}
      dir="rtl"
    >
      {/* Header */}
      <p className="text-sm font-bold text-jawwib-text-muted tracking-widest mb-6">
        🤫 أنت وحدك اللي تشوف هذا
      </p>

      {/* Points badge */}
      {data.pts != null && (
        <div
          className="inline-block px-4 py-1.5 rounded-full text-sm font-black mb-6"
          style={{ background: 'rgba(233,162,60,0.15)', color: '#E9A23C', border: '1px solid rgba(233,162,60,0.30)' }}
        >
          {data.pts} نقطة
        </div>
      )}

      {/* Image (if any) */}
      {data.img && (
        <div className="mb-6 w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={data.img}
            alt="مرئي السؤال"
            className="w-full object-cover max-h-52"
            draggable={false}
          />
        </div>
      )}

      {/* The word */}
      <div
        className="mb-8 px-6 py-5 rounded-3xl"
        style={{ background: 'rgba(233,162,60,0.10)', border: '2px solid rgba(233,162,60,0.25)' }}
      >
        <p
          className="font-black leading-tight text-jawwib-text"
          style={{ fontSize: 'clamp(2.5rem, 10vw, 4.5rem)' }}
        >
          {data.w}
        </p>
        {data.img && (
          <p className="text-jawwib-text-dim text-sm mt-2">مثّل الصورة بدون كلام</p>
        )}
      </div>

      {/* Ready button */}
      <button
        onClick={() => setSeen(true)}
        className="w-full max-w-xs py-4 rounded-2xl font-black text-xl tap-target transition-transform active:scale-95"
        style={{
          background: 'linear-gradient(150deg, #F6C765, #E08E2E)',
          color: '#16100B',
          boxShadow: '0 12px 32px -10px rgba(233,162,60,0.55)',
        }}
      >
        جاهز للتمثيل 🎭
      </button>

      <p className="text-jawwib-text-muted text-xs mt-4">
        اضغط بعد ما تشوف الكلمة ← الشاشة تتغير
      </p>
    </div>
  )
}
