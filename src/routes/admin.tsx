import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getDailyPin } from '@/lib/adminAuth'

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { title: 'لوحة التحكم — جاوب' },
    ],
  }),
  component: AdminPage,
})

// ── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmClearModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      dir="rtl"
    >
      <div
        style={{
          background: '#241A12',
          border: '1px solid rgba(233,162,60,0.22)',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '360px',
          width: '90%',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#F2E7D3', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          مسح البيانات المحلية؟
        </p>
        <p style={{ color: '#CDBFA5', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          سيتم حذف جميع البيانات المحفوظة في المتصفح بشكل نهائي.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={onConfirm}
            style={{
              background: '#C85A34',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.6rem 1.4rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            مسح
          </button>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: '#CDBFA5',
              border: '1px solid rgba(233,162,60,0.3)',
              borderRadius: '0.5rem',
              padding: '0.6rem 1.4rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CSV Status ─────────────────────────────────────────────────────────────────
function CsvStatus() {
  const [rows, setRows] = useState<string[][]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/questions.csv')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      })
      .then((text) => {
        const lines = text
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
        const parsed = lines.map((l) =>
          l.split(',').map((c) => c.replace(/^"|"$/g, '').trim()),
        )
        setRows(parsed)
      })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  const cellStyle: React.CSSProperties = {
    padding: '0.4rem 0.75rem',
    border: '1px solid rgba(233,162,60,0.15)',
    color: '#CDBFA5',
    fontSize: '0.78rem',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  if (loading) return <p style={{ color: '#B08968' }}>جاري التحميل...</p>
  if (error) return <p style={{ color: '#C85A34' }}>خطأ: {error}</p>

  const dataRows = rows.slice(1) // skip header
  const preview = dataRows.slice(0, 3)
  const header = rows[0] ?? []

  return (
    <div>
      <p style={{ color: '#B7A488', marginBottom: '0.75rem' }}>
        إجمالي الصفوف: <strong style={{ color: '#E9A23C' }}>{dataRows.length}</strong>
      </p>
      {preview.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
            <thead>
              <tr>
                {header.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      ...cellStyle,
                      color: '#E9A23C',
                      fontWeight: 700,
                      background: 'rgba(233,162,60,0.06)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={cellStyle}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)

  const today = new Date().toLocaleDateString('ar-KW', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const gamesPlayed        = Number(localStorage.getItem('games_played')        ?? 0)
  const totalQuestions     = Number(localStorage.getItem('total_questions_answered') ?? 0)
  const correctAnswers     = Number(localStorage.getItem('correct_answers')     ?? 0)

  const handleClear = () => {
    localStorage.clear()
    setCleared(true)
    setShowClearConfirm(false)
  }

  const sectionTitle: React.CSSProperties = {
    color: '#E9A23C',
    fontWeight: 700,
    fontSize: '1rem',
    marginBottom: '0.75rem',
    borderBottom: '1px solid rgba(233,162,60,0.2)',
    paddingBottom: '0.4rem',
  }

  const card: React.CSSProperties = {
    background: '#241A12',
    border: '1px solid rgba(233,162,60,0.18)',
    borderRadius: '0.75rem',
    padding: '1.25rem 1.5rem',
    marginBottom: '1.25rem',
  }

  const statRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: '#CDBFA5',
    fontSize: '0.95rem',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#16100B',
        color: '#F2E7D3',
        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
        direction: 'rtl',
        padding: '1.5rem 1rem',
      }}
    >
      {showClearConfirm && (
        <ConfirmClearModal
          onConfirm={handleClear}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1
          style={{
            fontFamily: "'Reem Kufi', sans-serif",
            fontSize: '1.9rem',
            color: '#E9A23C',
            margin: 0,
          }}
        >
          لوحة التحكم — جاوب
        </h1>
        <p style={{ color: '#B08968', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>{today}</p>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Statistics */}
        <div style={card}>
          <p style={sectionTitle}>الإحصائيات</p>
          <div>
            <div style={statRow}>
              <span>المباريات المُلعبة</span>
              <strong style={{ color: '#E9A23C' }}>{gamesPlayed}</strong>
            </div>
            <div style={statRow}>
              <span>إجمالي الأسئلة المُجابة</span>
              <strong style={{ color: '#E9A23C' }}>{totalQuestions}</strong>
            </div>
            <div style={{ ...statRow, borderBottom: 'none' }}>
              <span>الإجابات الصحيحة</span>
              <strong style={{ color: '#5FA98C' }}>{correctAnswers}</strong>
            </div>
          </div>
          {cleared && (
            <p style={{ color: '#5FA98C', marginTop: '0.75rem', fontSize: '0.85rem' }}>
              تم مسح البيانات بنجاح.
            </p>
          )}
        </div>

        {/* Questions CSV */}
        <div style={card}>
          <p style={sectionTitle}>ملف الأسئلة (questions.csv)</p>
          <CsvStatus />
        </div>

        {/* Session controls */}
        <div style={card}>
          <p style={sectionTitle}>التحكم بالجلسة</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                background: 'rgba(200,90,52,0.15)',
                color: '#C85A34',
                border: '1px solid rgba(200,90,52,0.4)',
                borderRadius: '0.5rem',
                padding: '0.6rem 1.25rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              مسح البيانات المحلية
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(233,162,60,0.1)',
                color: '#E9A23C',
                border: '1px solid rgba(233,162,60,0.35)',
                borderRadius: '0.5rem',
                padding: '0.6rem 1.25rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              إعادة التشغيل
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── PIN Gate ───────────────────────────────────────────────────────────────────
function AdminPage() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState(false)
  const [dailyPin, setDailyPin] = useState<string | null>(null)

  useEffect(() => {
    getDailyPin().then((p) => {
      setDailyPin(p)
      // Log PIN to console so the owner can always find it in devtools
      console.info('[Jawib Admin] Daily PIN:', p)
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dailyPin) return
    if (pin === dailyPin) {
      setAuthed(true)
      setError(false)
    } else {
      setError(true)
      setPin('')
    }
  }

  if (authed) return <AdminDashboard />

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#16100B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
        direction: 'rtl',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#241A12',
          border: '1px solid rgba(233,162,60,0.22)',
          borderRadius: '1rem',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: '340px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Reem Kufi', sans-serif",
            fontSize: '1.6rem',
            color: '#E9A23C',
            margin: '0 0 0.3rem',
          }}
        >
          جاوب
        </h1>
        <p style={{ color: '#B08968', fontSize: '0.85rem', marginBottom: '2rem' }}>
          لوحة التحكم
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setError(false)
              setPin(e.target.value.replace(/\D/g, ''))
            }}
            placeholder="الرمز اليومي"
            style={{
              width: '100%',
              background: '#1C150E',
              border: `1px solid ${error ? '#C85A34' : 'rgba(233,162,60,0.3)'}`,
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              color: '#F2E7D3',
              fontSize: '1.4rem',
              letterSpacing: '0.3em',
              textAlign: 'center',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            autoFocus
          />
          {error && (
            <p style={{ color: '#C85A34', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              الرمز غير صحيح، حاول مرة أخرى.
            </p>
          )}
          <button
            type="submit"
            disabled={pin.length !== 6 || !dailyPin}
            style={{
              marginTop: '1rem',
              width: '100%',
              background: pin.length === 6 && dailyPin ? '#E9A23C' : 'rgba(233,162,60,0.2)',
              color: pin.length === 6 && dailyPin ? '#16100B' : '#B08968',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: pin.length === 6 && dailyPin ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  )
}
