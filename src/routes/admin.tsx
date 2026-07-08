import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { adminLogin, verifyAdminToken } from '@/serverFunctions/adminAuth'
import { getVisits, getReviews } from '@/serverFunctions/analytics'
import type { VisitEntry } from '@/serverFunctions/analytics'
import type { SurveyPayload } from '@/serverFunctions/survey'
import { categories as ALL_CATS } from '@/lib/categories'
import type { CategoryId } from '@/lib/types'
import {
  loadCustomGames,
  createCustomGame,
  deleteCustomGame,
  addQuestionToGame,
  removeQuestionFromGame,
  loadAdminImages,
  saveAdminImage,
  deleteAdminImage,
  type CustomGame,
  type AdminImage,
} from '@/lib/customGames'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'لوحة التحكم — جاوب' }] }),
  component: AdminPage,
})

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  bg:        '#16100B',
  surface:   '#1C150E',
  card:      '#241A12',
  border:    'rgba(233,162,60,0.18)',
  gold:      '#E9A23C',
  oasis:     '#5FA98C',
  terra:     '#C85A34',
  text:      '#F2E7D3',
  dim:       '#CDBFA5',
  muted:     '#B08968',
  font:      "'IBM Plex Sans Arabic', 'Reem Kufi', sans-serif",
}

const css = {
  page: {
    minHeight: '100vh', background: T.bg, color: T.text,
    fontFamily: T.font, direction: 'rtl' as const, padding: '0 0 4rem',
  },
  card: {
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: '0.85rem', padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
  },
  label: {
    color: T.gold, fontWeight: 700, fontSize: '0.78rem',
    marginBottom: '0.35rem', display: 'block' as const,
  },
  input: {
    width: '100%', background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: '0.5rem', padding: '0.65rem 0.9rem', color: T.text,
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const,
  },
  btn: (variant: 'gold' | 'oasis' | 'terra' | 'ghost' = 'gold') => ({
    background: variant === 'gold'  ? T.gold
               : variant === 'oasis' ? T.oasis
               : variant === 'terra' ? 'rgba(200,90,52,0.18)'
               : 'transparent',
    color: variant === 'gold'  ? T.bg
          : variant === 'oasis' ? T.bg
          : variant === 'terra' ? T.terra
          : T.dim,
    border: variant === 'ghost' ? `1px solid ${T.border}` : 'none',
    borderRadius: '0.5rem', padding: '0.55rem 1.1rem', fontWeight: 700,
    fontSize: '0.88rem', cursor: 'pointer', transition: 'opacity 0.15s',
  }),
  sectionTitle: {
    color: T.gold, fontWeight: 700, fontSize: '0.95rem',
    borderBottom: `1px solid ${T.border}`, paddingBottom: '0.4rem', marginBottom: '1rem',
  },
} as const

// ── Mini helpers ───────────────────────────────────────────────────────────────
function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      background: `${color}22`, color, border: `1px solid ${color}55`,
      borderRadius: '999px', padding: '0.15rem 0.55rem', fontSize: '0.75rem', fontWeight: 700,
    }}>{label}</span>
  )
}

function BarChart({ data }: { data: Array<{ label: string; value: number; color?: string }> }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '7rem', fontSize: '0.78rem', color: T.dim, flexShrink: 0, textAlign: 'right' }}>
            {d.label}
          </span>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${(d.value / max) * 100}%`, height: '100%',
              background: d.color ?? T.gold, borderRadius: '4px',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <span style={{ width: '2rem', fontSize: '0.78rem', color: T.muted, flexShrink: 0 }}>{d.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Tab: Analytics ─────────────────────────────────────────────────────────────
const _ls = (key: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null)

function TabAnalytics() {
  const gamesPlayed    = Number(_ls('games_played') ?? 0)
  const totalQ         = Number(_ls('total_questions_answered') ?? 0)
  const correct        = Number(_ls('correct_answers') ?? 0)
  const accuracy       = totalQ ? Math.round((correct / totalQ) * 100) : 0
  const sessionCount   = Number(_ls('session_count') ?? 0)

  // Category play counts (stored by game engine if wired)
  const catCounts: Record<string, number> = (() => {
    try { return JSON.parse(_ls('cat_plays') ?? '{}') } catch { return {} }
  })()
  const catData = ALL_CATS
    .filter((c) => catCounts[c.id])
    .sort((a, b) => (catCounts[b.id] ?? 0) - (catCounts[a.id] ?? 0))
    .slice(0, 8)
    .map((c) => ({ label: c.name, value: catCounts[c.id] ?? 0, color: c.color }))

  const stats = [
    { label: 'مباريات مكتملة', value: gamesPlayed, color: T.gold },
    { label: 'أسئلة أُجيبت', value: totalQ, color: T.oasis },
    { label: 'إجابات صحيحة', value: correct, color: T.oasis },
    { label: 'نسبة الدقة', value: `${accuracy}%`, color: accuracy > 60 ? T.oasis : T.terra },
    { label: 'الجلسات', value: sessionCount, color: T.muted },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...css.card, marginBottom: 0, textAlign: 'center' }}>
            <p style={{ color: s.color, fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>{s.value}</p>
            <p style={{ color: T.dim, fontSize: '0.78rem', margin: '0.2rem 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {catData.length > 0 && (
        <div style={css.card}>
          <p style={css.sectionTitle}>🔥 الفئات الأكثر لعباً</p>
          <BarChart data={catData} />
        </div>
      )}

      {catData.length === 0 && (
        <div style={{ ...css.card, textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: T.muted, fontSize: '0.9rem' }}>لا توجد بيانات كافية بعد — العب أولاً!</p>
        </div>
      )}
    </div>
  )
}

// ── Tab: Categories ────────────────────────────────────────────────────────────
function TabCategories() {
  const [customCats, setCustomCats] = useState<Array<{ id: string; name: string; icon: string; color: string }>>(() => {
    try { return JSON.parse(_ls('jawib_custom_cats') ?? '[]') } catch { return [] }
  })
  const [form, setForm] = useState({ name: '', icon: '🎯', color: '#E9A23C' })
  const [adding, setAdding] = useState(false)

  const save = (cats: typeof customCats) => {
    setCustomCats(cats)
    if (typeof localStorage !== 'undefined') localStorage.setItem('jawib_custom_cats', JSON.stringify(cats))
  }

  const add = () => {
    if (!form.name.trim()) return
    const cat = { id: `custom-${Date.now()}`, name: form.name.trim(), icon: form.icon, color: form.color }
    save([...customCats, cat])
    setForm({ name: '', icon: '🎯', color: '#E9A23C' })
    setAdding(false)
  }

  const remove = (id: string) => save(customCats.filter((c) => c.id !== id))

  const EMOJI_OPTIONS = ['🎯','🎲','🎭','💡','🧩','🌟','🔥','⚡','🏅','🎪','🎨','🎬','📡','🔬','🧬']

  return (
    <div>
      {/* Built-in categories */}
      <div style={css.card}>
        <p style={css.sectionTitle}>الفئات المدمجة ({ALL_CATS.length})</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {ALL_CATS.map((c) => (
            <span key={c.id} style={{
              background: `${c.color}18`, border: `1px solid ${c.color}44`,
              borderRadius: '0.4rem', padding: '0.25rem 0.6rem',
              fontSize: '0.8rem', color: T.dim,
            }}>
              {c.icon} {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* Custom categories */}
      <div style={css.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={{ ...css.sectionTitle, marginBottom: 0 }}>فئاتك المخصصة ({customCats.length})</p>
          <button style={css.btn('oasis')} onClick={() => setAdding((v) => !v)}>
            {adding ? '✕ إلغاء' : '+ فئة جديدة'}
          </button>
        </div>

        {adding && (
          <div style={{ background: T.surface, borderRadius: '0.6rem', padding: '1rem', marginBottom: '1rem', border: `1px solid ${T.border}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={css.label}>اسم الفئة</label>
                <input style={css.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثال: سيارات الكويت" maxLength={30} />
              </div>
              <div>
                <label style={css.label}>اللون</label>
                <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  style={{ ...css.input, height: '2.5rem', padding: '0.2rem', cursor: 'pointer' }} />
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={css.label}>الأيقونة</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {EMOJI_OPTIONS.map((e) => (
                  <button key={e} onClick={() => setForm((f) => ({ ...f, icon: e }))}
                    style={{ fontSize: '1.2rem', background: form.icon === e ? `${T.gold}22` : 'transparent',
                      border: `1.5px solid ${form.icon === e ? T.gold : T.border}`, borderRadius: '0.35rem',
                      width: '2.2rem', height: '2.2rem', cursor: 'pointer' }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button style={css.btn('gold')} onClick={add}>حفظ الفئة</button>
          </div>
        )}

        {customCats.length === 0 && !adding && (
          <p style={{ color: T.muted, fontSize: '0.88rem' }}>لا توجد فئات مخصصة بعد.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {customCats.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: T.surface, borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
              <span style={{ flex: 1, color: T.text, fontWeight: 600 }}>{c.name}</span>
              <span style={{ width: '1.1rem', height: '1.1rem', borderRadius: '50%', background: c.color, border: `2px solid ${T.border}`, flexShrink: 0 }} />
              <button style={{ ...css.btn('terra'), padding: '0.3rem 0.65rem', fontSize: '0.78rem' }} onClick={() => remove(c.id)}>حذف</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Questions / CSV ───────────────────────────────────────────────────────
function TabQuestions() {
  const [csvRows, setCsvRows] = useState<string[][]>([])
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvLoading, setCsvLoading] = useState(true)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/questions.csv')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text() })
      .then((t) => {
        const lines = t.split('\n').map((l) => l.trim()).filter(Boolean)
        setCsvRows(lines.map((l) => l.split(',').map((c) => c.replace(/^"|"$/g, '').trim())))
      })
      .catch((e: unknown) => setCsvError(String(e)))
      .finally(() => setCsvLoading(false))
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
      const rows = lines.map((l) => l.split(',').map((c) => c.replace(/^"|"$/g, '').trim()))
      localStorage.setItem('jawib_csv_override', text)
      setCsvRows(rows)
      setUploadMsg(`✅ تم رفع ${rows.length - 1} سؤال. سيتم تطبيقه عند إعادة تحميل اللعبة.`)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const header = csvRows[0] ?? []
  const dataRows = csvRows.slice(1)
  const preview = dataRows.slice(0, 5)

  return (
    <div>
      <div style={css.card}>
        <p style={css.sectionTitle}>📄 ملف الأسئلة الحالي</p>
        {csvLoading && <p style={{ color: T.muted }}>جاري التحميل...</p>}
        {csvError && <p style={{ color: T.terra }}>خطأ: {csvError}</p>}
        {!csvLoading && !csvError && (
          <>
            <p style={{ color: T.dim, marginBottom: '0.75rem' }}>
              إجمالي: <strong style={{ color: T.gold }}>{dataRows.length}</strong> سؤال
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', minWidth: '100%', fontSize: '0.78rem' }}>
                <thead>
                  <tr>{header.map((h, i) => (
                    <th key={i} style={{ padding: '0.4rem 0.75rem', border: `1px solid ${T.border}`, color: T.gold, background: 'rgba(233,162,60,0.07)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {preview.map((row, ri) => (
                    <tr key={ri}>{row.map((cell, ci) => (
                      <td key={ci} style={{ padding: '0.35rem 0.75rem', border: `1px solid ${T.border}`, color: T.dim, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cell}</td>
                    ))}</tr>
                  ))}
                </tbody>
              </table>
              {dataRows.length > 5 && <p style={{ color: T.muted, fontSize: '0.75rem', marginTop: '0.4rem' }}>...و {dataRows.length - 5} صف آخر</p>}
            </div>
          </>
        )}
      </div>

      <div style={css.card}>
        <p style={css.sectionTitle}>⬆️ رفع CSV جديد</p>
        <p style={{ color: T.dim, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          يجب أن يحتوي الملف على الأعمدة: id, category, tier, points, text, option1, option2, option3, option4, correctIndex
        </p>
        <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFileUpload} />
        <button style={css.btn('oasis')} onClick={() => fileRef.current?.click()}>
          اختر ملف CSV
        </button>
        {uploadMsg && <p style={{ color: T.oasis, marginTop: '0.75rem', fontSize: '0.85rem' }}>{uploadMsg}</p>}
      </div>
    </div>
  )
}

// ── Tab: Images ────────────────────────────────────────────────────────────────
function TabImages() {
  const [images, setImages] = useState<AdminImage[]>(loadAdminImages)
  const [selectedCat, setSelectedCat] = useState<CategoryId>(ALL_CATS[0]?.id ?? 'culture' as CategoryId)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)

  const reload = () => setImages(loadAdminImages())

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string, label: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500_000) { setUploadMsg('❌ الصورة أكبر من 500KB — اختر صورة أصغر.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      saveAdminImage({ key, dataUrl, label, uploadedAt: Date.now() })
      setUploadMsg(`✅ تم حفظ صورة "${label}"`)
      reload()
    }
    reader.readAsDataURL(file)
  }

  const remove = (key: string) => { deleteAdminImage(key); reload() }

  return (
    <div>
      {/* Upload category image */}
      <div style={css.card}>
        <p style={css.sectionTitle}>🖼️ صور الفئات</p>
        <p style={{ color: T.dim, fontSize: '0.82rem', marginBottom: '0.75rem' }}>استبدل الصور الافتراضية بصور مخصصة (PNG/JPG، بحد أقصى 500KB)</p>
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value as CategoryId)}
            style={{ ...css.input, width: 'auto', flex: 1, minWidth: '150px' }}>
            {ALL_CATS.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          <label style={{ ...css.btn('oasis'), cursor: 'pointer', display: 'inline-block' }}>
            رفع صورة
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => handleUpload(e, `cat:${selectedCat}`, ALL_CATS.find((c) => c.id === selectedCat)?.name ?? selectedCat)} />
          </label>
        </div>
        {uploadMsg && <p style={{ color: T.oasis, fontSize: '0.85rem', marginBottom: '0.5rem' }}>{uploadMsg}</p>}
      </div>

      {/* Uploaded images library */}
      <div style={css.card}>
        <p style={css.sectionTitle}>📚 مكتبة الصور المرفوعة ({images.length})</p>
        {images.length === 0 && <p style={{ color: T.muted, fontSize: '0.88rem' }}>لا توجد صور مرفوعة بعد.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {images.map((img) => (
            <div key={img.key} style={{ background: T.surface, borderRadius: '0.5rem', overflow: 'hidden', border: `1px solid ${T.border}` }}>
              <img src={img.dataUrl} alt={img.label} style={{ width: '100%', height: '90px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem' }}>
                <p style={{ color: T.dim, fontSize: '0.72rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.label}</p>
                <button style={{ ...css.btn('terra'), fontSize: '0.7rem', padding: '0.2rem 0.5rem', marginTop: '0.3rem' }} onClick={() => remove(img.key)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Payments ──────────────────────────────────────────────────────────────
function TabPayments() {
  const FEATURES = [
    { id: 'full_game',     label: 'اللعبة الكاملة (غير محدودة)',    price: 'KD 0.99', desc: 'رفع حد الأسئلة التجريبية' },
    { id: 'custom_game',   label: 'لعبة مخصصة',                    price: 'KD 1.99', desc: 'إنشاء أسئلة خاصة بالفريق' },
    { id: 'murder_mystery',label: 'Murder Mystery',                 price: 'KD 1.49', desc: 'فئة التحقيق والمحقق' },
    { id: 'premium_pack',  label: 'الباقة المميزة (الكل)',          price: 'KD 3.99', desc: 'جميع المحتوى + التحديثات' },
  ]
  const [config, setConfig] = useState<Record<string, { enabled: boolean; price: string }>>(() => {
    try { return JSON.parse(_ls('jawib_payment_config') ?? '{}') } catch { return {} }
  })
  const save = (next: typeof config) => {
    setConfig(next)
    if (typeof localStorage !== 'undefined') localStorage.setItem('jawib_payment_config', JSON.stringify(next))
  }

  const purchases: Array<{ id: string; feature: string; ts: number }> = (() => {
    try { return JSON.parse(_ls('jawib_purchases') ?? '[]') } catch { return [] }
  })()

  return (
    <div>
      <div style={css.card}>
        <p style={css.sectionTitle}>💳 تكوين المميزات المدفوعة</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FEATURES.map((f) => {
            const cfg = config[f.id] ?? { enabled: true, price: f.price }
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: T.surface, borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: T.text, fontWeight: 600, fontSize: '0.9rem' }}>{f.label}</p>
                  <p style={{ margin: '0.15rem 0 0', color: T.muted, fontSize: '0.78rem' }}>{f.desc}</p>
                </div>
                <input
                  style={{ ...css.input, width: '90px', textAlign: 'center' }}
                  value={cfg.price}
                  onChange={(e) => save({ ...config, [f.id]: { ...cfg, price: e.target.value } })}
                />
                <button
                  onClick={() => save({ ...config, [f.id]: { ...cfg, enabled: !cfg.enabled } })}
                  style={{
                    width: '2.8rem', height: '1.5rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                    background: cfg.enabled ? T.oasis : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.2s',
                  }}
                  title={cfg.enabled ? 'مفعّل' : 'معطّل'}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div style={css.card}>
        <p style={css.sectionTitle}>🧾 سجل المشتريات ({purchases.length})</p>
        {purchases.length === 0
          ? <p style={{ color: T.muted, fontSize: '0.88rem' }}>لا توجد مشتريات مسجلة بعد.</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {purchases.slice(-20).reverse().map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${T.border}`, fontSize: '0.82rem' }}>
                  <span style={{ color: T.dim }}>{p.feature}</span>
                  <span style={{ color: T.muted }}>{new Date(p.ts).toLocaleDateString('ar-KW')}</span>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

// ── Tab: Custom Games ──────────────────────────────────────────────────────────
function TabCustomGames() {
  const [games, setGames] = useState<CustomGame[]>(loadCustomGames)
  const [selected, setSelected] = useState<CustomGame | null>(null)
  const [newGameForm, setNewGameForm] = useState({ name: '', emoji: '🎮', color: '#E9A23C', description: '' })
  const [adding, setAdding] = useState(false)
  const [questionForm, setQuestionForm] = useState({
    text: '', option0: '', option1: '', option2: '', option3: '',
    correctIndex: 0, points: 200, imageUrl: '',
  })
  const [qMsg, setQMsg] = useState<string | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  const reload = () => {
    const all = loadCustomGames()
    setGames(all)
    if (selected) setSelected(all.find((g) => g.id === selected.id) ?? null)
  }

  const addGame = () => {
    if (!newGameForm.name.trim()) return
    createCustomGame(newGameForm.name.trim(), newGameForm.emoji, newGameForm.color, newGameForm.description)
    setNewGameForm({ name: '', emoji: '🎮', color: '#E9A23C', description: '' })
    setAdding(false)
    reload()
  }

  const addQ = () => {
    if (!selected || !questionForm.text.trim() || !questionForm.option0.trim()) return
    const options: [string, string, string, string] = [
      questionForm.option0, questionForm.option1, questionForm.option2, questionForm.option3,
    ]
    addQuestionToGame(selected.id, {
      text: questionForm.text.trim(),
      options,
      correctIndex: questionForm.correctIndex as 0 | 1 | 2 | 3,
      points: questionForm.points as 100 | 200 | 300 | 400 | 500 | 600,
      imageUrl: questionForm.imageUrl || undefined,
    })
    setQuestionForm({ text: '', option0: '', option1: '', option2: '', option3: '', correctIndex: 0, points: 200, imageUrl: '' })
    setQMsg('✅ تم إضافة السؤال')
    setTimeout(() => setQMsg(null), 2000)
    reload()
  }

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 300_000) { setQMsg('❌ الصورة أكبر من 300KB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setQuestionForm((f) => ({ ...f, imageUrl: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const EMOJI_OPTS = ['🎮','🎭','🏅','🎯','🧩','🌟','🔥','🎲','💡','🌴','🐪','🏺','🎪','📚','⚡']

  if (selected) {
    return (
      <div>
        <button style={{ ...css.btn('ghost'), marginBottom: '1rem' }} onClick={() => setSelected(null)}>← رجوع</button>

        <div style={css.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>{selected.emoji}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: T.text }}>{selected.name}</p>
              {selected.description && <p style={{ margin: '0.15rem 0 0', color: T.muted, fontSize: '0.82rem' }}>{selected.description}</p>}
            </div>
            <Chip label={`${selected.questions.length} سؤال`} color={T.gold} />
          </div>
        </div>

        {/* Questions list */}
        <div style={css.card}>
          <p style={css.sectionTitle}>الأسئلة</p>
          {selected.questions.length === 0 && <p style={{ color: T.muted, fontSize: '0.88rem', marginBottom: '1rem' }}>لا توجد أسئلة بعد — أضف أول سؤال!</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {selected.questions.map((q, i) => (
              <div key={q.id} style={{ background: T.surface, borderRadius: '0.5rem', padding: '0.65rem 0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ color: T.muted, fontSize: '0.78rem', minWidth: '1.5rem', marginTop: '0.15rem' }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: T.text }}>{q.text}</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: T.oasis }}>
                    ✓ {q.options[q.correctIndex]} — <span style={{ color: T.gold }}>{q.points} نقطة</span>
                  </p>
                </div>
                <button style={{ ...css.btn('terra'), padding: '0.2rem 0.55rem', fontSize: '0.75rem', flexShrink: 0 }}
                  onClick={() => { removeQuestionFromGame(selected.id, q.id); reload() }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add question form */}
          <div style={{ background: T.bg, borderRadius: '0.6rem', padding: '1rem', border: `1px solid ${T.border}` }}>
            <p style={{ ...css.sectionTitle, fontSize: '0.85rem' }}>+ سؤال جديد</p>
            <div style={{ marginBottom: '0.6rem' }}>
              <label style={css.label}>نص السؤال</label>
              <textarea style={{ ...css.input, resize: 'vertical', minHeight: '60px' }}
                value={questionForm.text} onChange={(e) => setQuestionForm((f) => ({ ...f, text: e.target.value }))}
                placeholder="اكتب سؤالك هنا..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
              {([0, 1, 2, 3] as const).map((i) => (
                <div key={i}>
                  <label style={{ ...css.label, color: questionForm.correctIndex === i ? T.oasis : T.muted }}>
                    خيار {i + 1} {questionForm.correctIndex === i ? '✓ صحيح' : ''}
                  </label>
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <input style={{ ...css.input, flex: 1 }}
                      value={questionForm[`option${i}` as 'option0' | 'option1' | 'option2' | 'option3']}
                      onChange={(e) => setQuestionForm((f) => ({ ...f, [`option${i}`]: e.target.value }))}
                      placeholder={`الخيار ${i + 1}`} />
                    <button onClick={() => setQuestionForm((f) => ({ ...f, correctIndex: i }))}
                      style={{ width: '1.8rem', height: '1.8rem', borderRadius: '50%', border: `2px solid ${questionForm.correctIndex === i ? T.oasis : T.border}`, background: questionForm.correctIndex === i ? T.oasis : 'transparent', cursor: 'pointer', flexShrink: 0 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div>
                <label style={css.label}>النقاط</label>
                <select style={css.input} value={questionForm.points}
                  onChange={(e) => setQuestionForm((f) => ({ ...f, points: Number(e.target.value) }))}>
                  {[100, 200, 300, 400, 500, 600].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={css.label}>صورة (اختياري)</label>
                <label style={{ ...css.btn('ghost'), cursor: 'pointer', display: 'block', textAlign: 'center' as const }}>
                  {questionForm.imageUrl ? '✅ صورة مرفوعة' : '+ رفع صورة'}
                  <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgUpload} />
                </label>
              </div>
            </div>
            {qMsg && <p style={{ color: qMsg.startsWith('✅') ? T.oasis : T.terra, fontSize: '0.82rem', marginBottom: '0.5rem' }}>{qMsg}</p>}
            <button style={css.btn('gold')} onClick={addQ}>إضافة السؤال</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: T.text }}>الألعاب المخصصة ({games.length})</h3>
        <button style={css.btn('gold')} onClick={() => setAdding((v) => !v)}>
          {adding ? '✕ إلغاء' : '+ لعبة جديدة'}
        </button>
      </div>

      {adding && (
        <div style={{ ...css.card, border: `1px solid ${T.gold}44` }}>
          <p style={css.sectionTitle}>إنشاء لعبة جديدة</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <div>
              <label style={css.label}>اسم اللعبة</label>
              <input style={css.input} value={newGameForm.name} onChange={(e) => setNewGameForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثال: لعبة العائلة" maxLength={40} />
            </div>
            <div>
              <label style={css.label}>اللون</label>
              <input type="color" value={newGameForm.color} onChange={(e) => setNewGameForm((f) => ({ ...f, color: e.target.value }))}
                style={{ ...css.input, height: '2.5rem', padding: '0.2rem', cursor: 'pointer' }} />
            </div>
          </div>
          <div style={{ marginBottom: '0.6rem' }}>
            <label style={css.label}>وصف اختياري</label>
            <input style={css.input} value={newGameForm.description} onChange={(e) => setNewGameForm((f) => ({ ...f, description: e.target.value }))} placeholder="وصف قصير..." maxLength={80} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={css.label}>الأيقونة</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {EMOJI_OPTS.map((e) => (
                <button key={e} onClick={() => setNewGameForm((f) => ({ ...f, emoji: e }))}
                  style={{ fontSize: '1.2rem', background: newGameForm.emoji === e ? `${T.gold}22` : 'transparent',
                    border: `1.5px solid ${newGameForm.emoji === e ? T.gold : T.border}`, borderRadius: '0.35rem',
                    width: '2.2rem', height: '2.2rem', cursor: 'pointer' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <button style={css.btn('gold')} onClick={addGame}>إنشاء</button>
        </div>
      )}

      {games.length === 0 && !adding && (
        <div style={{ ...css.card, textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>🎮</p>
          <p style={{ color: T.muted, fontSize: '0.9rem' }}>لا توجد ألعاب مخصصة بعد. أنشئ أول لعبة!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {games.map((g) => (
          <div key={g.id} style={{ ...css.card, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            onClick={() => setSelected(g)}>
            <span style={{ fontSize: '1.8rem' }}>{g.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, color: T.text }}>{g.name}</p>
              {g.description && <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: T.muted }}>{g.description}</p>}
            </div>
            <Chip label={`${g.questions.length} سؤال`} color={g.color} />
            <button style={{ ...css.btn('terra'), padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
              onClick={(e) => { e.stopPropagation(); deleteCustomGame(g.id); reload() }}>
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Session / Settings ────────────────────────────────────────────────────
function TabSettings() {
  const [cleared, setCleared] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const clear = () => {
    localStorage.clear()
    setCleared(true)
    setConfirm(false)
  }

  return (
    <div>
      <div style={css.card}>
        <p style={css.sectionTitle}>⚙️ إعدادات الجلسة</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button style={css.btn('oasis')} onClick={() => window.location.replace('/')}>
            🏠 الذهاب للعبة
          </button>
          <button style={css.btn('oasis')} onClick={() => window.location.reload()}>
            🔄 إعادة تحميل لوحة التحكم
          </button>
          {!confirm
            ? <button style={css.btn('terra')} onClick={() => setConfirm(true)}>🗑️ مسح جميع البيانات المحلية</button>
            : (
              <div style={{ background: T.surface, borderRadius: '0.5rem', padding: '0.75rem', border: `1px solid ${T.terra}44` }}>
                <p style={{ color: T.text, fontSize: '0.88rem', marginBottom: '0.5rem' }}>هل أنت متأكد؟ سيتم حذف كل شيء.</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={css.btn('terra')} onClick={clear}>تأكيد الحذف</button>
                  <button style={css.btn('ghost')} onClick={() => setConfirm(false)}>إلغاء</button>
                </div>
              </div>
            )
          }
        </div>
        {cleared && <p style={{ color: T.oasis, marginTop: '0.75rem', fontSize: '0.85rem' }}>✅ تم مسح البيانات.</p>}
      </div>

      <div style={css.card}>
        <p style={css.sectionTitle}>ℹ️ معلومات التطبيق</p>
        <div style={{ fontSize: '0.82rem', color: T.dim, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span>جاوب — لعبة الثقافة العامة العربية</span>
          <span>الفئات: 52 | الأسئلة: 456+</span>
          <span>البيئة: Netlify + TanStack Start</span>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Visitors ─────────────────────────────────────────────────────────────
function parseDevice(ua: string): string {
  if (/iPad/.test(ua))                          return 'iPad';
  if (/iPhone/.test(ua))                        return 'iPhone';
  if (/Android/.test(ua))                       return 'Android';
  if (/Macintosh|Mac OS X/.test(ua))            return 'Mac';
  if (/Windows/.test(ua))                       return 'Windows';
  if (/Linux/.test(ua))                         return 'Linux';
  return 'غير معروف';
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span style={{ color: T.gold, letterSpacing: '0.05em' }}>
      {'★'.repeat(Math.max(0, Math.min(5, rating)))}
      <span style={{ opacity: 0.3 }}>{'★'.repeat(5 - Math.max(0, Math.min(5, rating)))}</span>
    </span>
  );
}

function TabVisitors() {
  const [loading, setLoading]   = useState(true);
  const [visits,  setVisits]    = useState<VisitEntry[]>([]);
  const [reviews, setReviews]   = useState<SurveyPayload[]>([]);
  const [errMsg,  setErrMsg]    = useState<string | null>(null);

  useEffect(() => {
    const token    = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('jawib_admin_token') ?? '' : '';
    const clientId = typeof localStorage   !== 'undefined' ? localStorage.getItem('jawib_admin_cid')    ?? '' : '';
    if (!token || !clientId) { setErrMsg('لا يوجد رمز مصادقة — سجّل دخولك أولاً'); setLoading(false); return; }
    Promise.all([
      getVisits ({ data: { token, clientId } }),
      getReviews({ data: { token, clientId } }),
    ])
      .then(([v, r]) => {
        if (v.ok) setVisits(v.visits.slice().reverse());
        if (r.ok) setReviews(r.reviews.slice().reverse());
        if (!v.ok && !r.ok) setErrMsg('انتهت الجلسة — سجّل دخولك مجدداً');
      })
      .catch(() => setErrMsg('خطأ في الاتصال بالخادم'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: T.muted, padding: '2rem', textAlign: 'center' }}>جاري التحميل...</p>;
  if (errMsg)  return <p style={{ color: T.terra, padding: '2rem', textAlign: 'center' }}>{errMsg}</p>;

  // Stats
  const uniquePlayers = new Set(visits.map((v) => v.playerName)).size;
  const todayStart    = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayVisits   = visits.filter((v) => v.ts >= todayStart.getTime()).length;

  const recentVisits  = visits.slice(0, 20);
  const recentReviews = reviews.slice(0, 10);

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'إجمالي الزيارات', value: visits.length,  color: T.gold  },
          { label: 'زيارات اليوم',    value: todayVisits,    color: T.oasis },
          { label: 'لاعبون فريدون',   value: uniquePlayers,  color: T.oasis },
          { label: 'تقييمات',         value: reviews.length, color: T.muted },
        ].map((s) => (
          <div key={s.label} style={{ ...css.card, marginBottom: 0, textAlign: 'center' }}>
            <p style={{ color: s.color, fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>{s.value}</p>
            <p style={{ color: T.dim, fontSize: '0.78rem', margin: '0.2rem 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent visits table */}
      <div style={css.card}>
        <p style={css.sectionTitle}>👥 آخر الزيارات ({recentVisits.length})</p>
        {recentVisits.length === 0
          ? <p style={{ color: T.muted, fontSize: '0.88rem' }}>لا توجد زيارات مسجلة بعد.</p>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', minWidth: '100%', fontSize: '0.78rem' }}>
                <thead>
                  <tr>
                    {['التاريخ', 'اللاعب', 'الجهاز', 'الدولة'].map((h) => (
                      <th key={h} style={{ padding: '0.4rem 0.75rem', border: `1px solid ${T.border}`, color: T.gold, background: 'rgba(233,162,60,0.07)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentVisits.map((v, i) => (
                    <tr key={i}>
                      <td style={{ padding: '0.35rem 0.75rem', border: `1px solid ${T.border}`, color: T.muted, whiteSpace: 'nowrap' }}>
                        {new Date(v.ts).toLocaleDateString('ar-KW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.35rem 0.75rem', border: `1px solid ${T.border}`, color: T.text, fontWeight: 600 }}>
                        {v.playerName}
                      </td>
                      <td style={{ padding: '0.35rem 0.75rem', border: `1px solid ${T.border}`, color: T.dim }}>
                        {parseDevice(v.userAgent)}
                      </td>
                      <td style={{ padding: '0.35rem 0.75rem', border: `1px solid ${T.border}`, color: T.dim }}>
                        {v.country || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {/* Recent reviews */}
      <div style={css.card}>
        <p style={css.sectionTitle}>⭐ آخر التقييمات ({recentReviews.length})</p>
        {recentReviews.length === 0
          ? <p style={{ color: T.muted, fontSize: '0.88rem' }}>لا توجد تقييمات بعد.</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentReviews.map((r, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', padding: '0.75rem 1rem', border: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                    <span style={{ color: T.text, fontWeight: 600, fontSize: '0.88rem' }}>{r.playerName ?? 'مجهول'}</span>
                    <span style={{ color: T.muted, fontSize: '0.73rem' }}>
                      {new Date(r.timestamp).toLocaleDateString('ar-KW', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <StarRow rating={r.rating} />
                    <Chip label={r.difficulty === 'easy' ? 'سهل' : r.difficulty === 'hard' ? 'صعب' : 'متوسط'} color={T.oasis} />
                    {r.playAgain && <Chip label="سيعود" color={T.gold} />}
                  </div>
                  {r.comment && (
                    <p style={{ color: T.dim, fontSize: '0.82rem', margin: '0.3rem 0 0', fontStyle: 'italic' }}>
                      "{r.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

// ── Admin Dashboard ────────────────────────────────────────────────────────────
type Tab = 'analytics' | 'visitors' | 'categories' | 'questions' | 'images' | 'payments' | 'custom' | 'settings'

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('analytics')

  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'analytics',  label: 'تحليلات',   icon: '📊' },
    { id: 'visitors',   label: 'الزوار',    icon: '👥' },
    { id: 'categories', label: 'الفئات',    icon: '📂' },
    { id: 'questions',  label: 'الأسئلة',   icon: '❓' },
    { id: 'images',     label: 'الصور',     icon: '🖼️' },
    { id: 'payments',   label: 'الدفع',     icon: '💳' },
    { id: 'custom',     label: 'مخصص',      icon: '🎮' },
    { id: 'settings',   label: 'إعدادات',  icon: '⚙️' },
  ]

  const today = new Date().toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={css.page}>
      {/* Header */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: '1rem 1.25rem' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: "'Reem Kufi', sans-serif", fontSize: '1.5rem', color: T.gold, margin: 0 }}>
              جاوب — لوحة التحكم
            </h1>
            <p style={{ color: T.muted, margin: '0.15rem 0 0', fontSize: '0.78rem' }}>{today}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <a href="/" style={{ color: T.dim, fontSize: '0.82rem', textDecoration: 'none' }}>← اللعبة</a>
            <button onClick={onLogout} style={{ ...css.btn('ghost'), fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
              خروج
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, overflowX: 'auto' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.75rem 1rem', fontSize: '0.82rem', fontWeight: tab === t.id ? 700 : 400,
                color: tab === t.id ? T.gold : T.dim, whiteSpace: 'nowrap',
                borderBottom: `2.5px solid ${tab === t.id ? T.gold : 'transparent'}`,
                transition: 'color 0.15s, border-color 0.15s',
                fontFamily: T.font,
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {tab === 'analytics'  && <TabAnalytics />}
        {tab === 'visitors'   && <TabVisitors />}
        {tab === 'categories' && <TabCategories />}
        {tab === 'questions'  && <TabQuestions />}
        {tab === 'images'     && <TabImages />}
        {tab === 'payments'   && <TabPayments />}
        {tab === 'custom'     && <TabCustomGames />}
        {tab === 'settings'   && <TabSettings />}
      </div>
    </div>
  )
}

// ── Client ID helper ──────────────────────────────────────────────────────────
function getOrCreateClientId(): string {
  const KEY = 'jawib_admin_cid'
  let id = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
  if (!id) {
    id = `cid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, id)
  }
  return id
}

// ── Login Portal ──────────────────────────────────────────────────────────────
function LoginPortal({ onAuthed }: { onAuthed: (token: string, clientId: string) => void }) {
  const [username,   setUsername]  = useState('')
  const [password,   setPassword]  = useState('')
  const [error,      setError]     = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [locked,     setLocked]    = useState(false)
  const [lockMin,    setLockMin]   = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password || submitting || locked) return
    setSubmitting(true)
    setError(null)
    try {
      const clientId = getOrCreateClientId()
      const result   = await adminLogin({ data: { username: username.trim(), password, clientId } })
      if (result.ok) {
        sessionStorage.setItem('jawib_admin_token', result.token)
        onAuthed(result.token, clientId)
      } else if (result.error === 'not_configured') {
        setError('أضف ADMIN_PASSWORD في إعدادات Netlify أولاً')
      } else if (result.error === 'locked') {
        setLocked(true)
        setLockMin(result.retryAfterMin ?? 15)
        setError(`محاولات كثيرة — حاول بعد ${result.retryAfterMin ?? 15} دقيقة`)
      } else {
        const left = ('attemptsLeft' in result ? result.attemptsLeft : undefined) ?? 0
        setError(left > 0 ? `اسم المستخدم أو كلمة المرور غير صحيحة — ${left} محاولة متبقية` : 'اسم المستخدم أو كلمة المرور غير صحيحة')
      }
    } catch {
      setError('خطأ في الاتصال — حاول مجدداً')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 60% 0%, rgba(233,162,60,0.07) 0%, transparent 60%), ${T.bg}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: T.font, direction: 'rtl', padding: '1rem',
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ fontFamily: "'Reem Kufi', sans-serif", fontSize: 'clamp(3rem, 12vw, 5rem)', color: T.gold, margin: 0, lineHeight: 1, textShadow: '0 0 40px rgba(233,162,60,0.3)' }}>
          جاوب
        </p>
        <p style={{ color: T.muted, fontSize: '0.85rem', margin: '0.35rem 0 0', letterSpacing: '0.12em' }}>
          بوابة الإدارة
        </p>
      </div>

      {/* Card */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '1.25rem', padding: '2rem 1.75rem', width: '100%', maxWidth: '360px', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={css.label}>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              disabled={locked}
              onChange={(e) => { setError(null); setUsername(e.target.value) }}
              placeholder="admin"
              style={{ ...css.input, direction: 'ltr', textAlign: 'right' }}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label style={css.label}>كلمة المرور</label>
            <input
              type="password"
              value={password}
              disabled={locked}
              onChange={(e) => { setError(null); setPassword(e.target.value) }}
              placeholder="••••••••"
              style={{ ...css.input, direction: 'ltr', textAlign: 'right', border: `1px solid ${error ? T.terra : T.border}` }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p style={{ color: T.terra, fontSize: '0.82rem', margin: 0, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || locked || !username || !password}
            style={{
              marginTop: '0.15rem',
              background: (!submitting && !locked && username && password) ? T.gold : 'rgba(233,162,60,0.2)',
              color: (!submitting && !locked && username && password) ? T.bg : T.muted,
              border: 'none', borderRadius: '0.65rem', padding: '0.9rem',
              fontWeight: 800, fontSize: '1rem',
              cursor: (submitting || locked || !username || !password) ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s', fontFamily: T.font,
            }}>
            {submitting ? '...' : locked ? `مقفل ${lockMin} دق` : 'دخول ←'}
          </button>
        </form>
      </div>

      <p style={{ color: T.muted, fontSize: '0.72rem', marginTop: '1.5rem', opacity: 0.45, textAlign: 'center', lineHeight: 1.5 }}>
        عيّن اسم المستخدم وكلمة المرور في Netlify<br />
        ADMIN_USERNAME · ADMIN_PASSWORD
      </p>
    </div>
  )
}

// ── Admin Page ─────────────────────────────────────────────────────────────────
function AdminPage() {
  const [checking, setChecking] = useState(true)
  const [authed,   setAuthed]   = useState(false)
  const [token,    setToken]    = useState('')
  const [clientId, setClientId] = useState('')

  useEffect(() => {
    const cid = getOrCreateClientId()
    const tok  = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('jawib_admin_token') ?? '' : ''
    setClientId(cid)
    setToken(tok)
    if (!tok) { setChecking(false); return }
    verifyAdminToken({ data: { token: tok, clientId: cid } })
      .then((r) => { if (r.ok) setAuthed(true) })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  const handleAuthed = (tok: string, cid: string) => {
    setToken(tok); setClientId(cid); setAuthed(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('jawib_admin_token')
    setAuthed(false); setToken('')
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: T.muted, fontFamily: T.font, fontSize: '1.5rem' }}>...</p>
      </div>
    )
  }

  if (!authed) return <LoginPortal onAuthed={handleAuthed} />
  void token; void clientId
  return <AdminDashboard onLogout={handleLogout} />
}
