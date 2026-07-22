import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { adminLogin, verifyAdminToken } from '@/serverFunctions/adminAuth'
import { getVisits, getReviews } from '@/serverFunctions/analytics'
import type { VisitEntry } from '@/serverFunctions/analytics'
import type { SurveyPayload } from '@/serverFunctions/survey'
import { saveAdminCategory as saveAdminCategoryServer, deleteAdminCategory as deleteAdminCategoryServer } from '@/serverFunctions/adminData'
import { resetContentRegistry } from '@/lib/contentRegistry'
import { categories as ALL_CATS } from '@/lib/categories'
import type { CategoryId } from '@/lib/types'
import {
  loadCustomGames, createCustomGame, deleteCustomGame,
  addQuestionToGame, removeQuestionFromGame,
  loadAdminImages, saveAdminImage, deleteAdminImage,
  type CustomGame, type AdminImage,
} from '@/lib/customGames'

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [{ title: 'Jawib Admin Console' }],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap' },
    ],
  }),
  component: AdminPage,
})

// ── Design tokens (dark-graphite/gold — matches Jawib Admin Console.dc.html) ──
const T = {
  bg:        '#0D0E10',
  surface:   '#16171A',
  surface2:  '#1C1E22',
  border:    'rgba(255,255,255,.08)',
  border2:   'rgba(255,255,255,.14)',
  text:      '#EDEEF0',
  text2:     '#A6A9AE',
  text3:     '#6E7176',
  gold:      '#E9A23C',
  goldSoft:  'rgba(233,162,60,.14)',
  green:     '#3FB27F',
  greenSoft: 'rgba(63,178,127,.14)',
  red:       '#E1594B',
  redSoft:   'rgba(225,89,75,.14)',
  blue:      '#4E8FE0',
  blueSoft:  'rgba(78,143,224,.14)',
  font:      "'Inter', system-ui, sans-serif",
  mono:      "'IBM Plex Mono', monospace",
} as const

const _ls = (key: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null)

// ── Sidebar SVG icons ──────────────────────────────────────────────────────────
const IcoAnalysis = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M3 3v18h18M8 17V10M13 17V6M18 17v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoVisitors = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-2.13a4 4 0 100-8 4 4 0 000 8Zm7 0a4 4 0 100-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const IcoQuestions = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 4v16M4 8l8-4 8 4M4 8v9l8 4M4 8l8 4m8-4v9l-8 4m8-13l-8 4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)
const IcoCategories = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M3 9h18M8 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const IcoPhotos = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M3 16l5-4 4 3 3-2 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)
const IcoCustom = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="10" rx="5" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="8" cy="12" r="1.6" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.6" fill="currentColor"/>
  </svg>
)
const IcoPayment = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
)
const IcoSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M19.4 15a1.7 1.7 0 00.34 1.87M4.6 9a1.7 1.7 0 00-.34-1.87M12 3v3m0 12v3m9-9h-3M6 12H3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
)
const IcoExit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IcoSync = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Tab type + metadata ───────────────────────────────────────────────────────
type Tab = 'analysis' | 'visitors' | 'questions' | 'categories' | 'photos' | 'custom' | 'payment' | 'settings'

const TAB_META: Record<Tab, { section: string; title: string }> = {
  analysis:   { section: 'Overview',       title: 'Answer Analytics' },
  visitors:   { section: 'Overview',       title: 'Visitors' },
  questions:  { section: 'Content',        title: 'Question Bank' },
  categories: { section: 'Content',        title: 'Categories' },
  photos:     { section: 'Content',        title: 'Photos' },
  custom:     { section: 'Content',        title: 'Custom Games' },
  payment:    { section: 'Configuration',  title: 'Payment' },
  settings:   { section: 'Configuration',  title: 'Settings' },
}

// ── Shared primitives ─────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, valueColor }: { label: string; value: string | number; sub?: string; valueColor?: string }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '20px', transition: 'transform .15s,box-shadow .15s' }}>
      <div style={{ fontSize: '12.5px', color: T.text2, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '30px', fontWeight: 800, marginTop: '10px', color: valueColor ?? T.text }}>{value}</div>
      {sub && <div style={{ fontSize: '11.5px', color: T.text3, marginTop: '6px' }}>{sub}</div>}
    </div>
  )
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '15px', fontWeight: 700 }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

function Btn({ children, variant = 'gold', onClick, style: extra, disabled }: {
  children: React.ReactNode; variant?: 'gold' | 'green' | 'red' | 'ghost'; onClick?: () => void;
  style?: React.CSSProperties; disabled?: boolean;
}) {
  const bg = variant === 'gold' ? T.gold : variant === 'green' ? T.green : variant === 'red' ? T.redSoft : 'transparent'
  const color = variant === 'gold' ? '#20140A' : variant === 'green' ? '#0D2018' : variant === 'red' ? '#F0938A' : T.text2
  const border = (variant === 'ghost' || variant === 'red') ? `1px solid ${variant === 'red' ? 'rgba(225,89,75,.3)' : T.border2}` : 'none'
  return (
    <button disabled={disabled} onClick={onClick}
      style={{ background: bg, color, border, borderRadius: '9px', padding: '9px 16px', fontWeight: 700, fontSize: '13px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: T.font, display: 'inline-flex', alignItems: 'center', gap: '6px', ...extra }}>
      {children}
    </button>
  )
}

// ── Status strip (top of content area) ───────────────────────────────────────
function StatusStrip() {
  const [csvCount, setCsvCount]   = useState(0)
  const [imgCount, setImgCount]   = useState(0)
  const [secAgo,   setSecAgo]     = useState(0)
  const mountedAt = useRef(Date.now())

  useEffect(() => {
    const csv = _ls('jawib_csv_override')
    setCsvCount(csv ? Math.max(0, csv.split('\n').filter(Boolean).length - 1) : 0)
    setImgCount(loadAdminImages().length)
    const t = setInterval(() => setSecAgo(Math.floor((Date.now() - mountedAt.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  const chip = (value: string | number, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '9px', background: T.surface, border: `1px solid ${T.border}`, fontSize: '12.5px', color: T.text2 }}>
      <span style={{ fontFamily: T.mono, color: T.text }}>{value}</span> {label}
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: '10px', padding: '0 32px 20px', flexWrap: 'wrap' }}>
      {chip(csvCount, 'CSV sources')}
      {chip(imgCount, 'Images')}
      {chip(ALL_CATS.length, 'Categories')}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '9px', background: T.surface, border: `1px solid ${T.border}`, fontSize: '12.5px', color: T.text3, marginLeft: 'auto' }}>
        {secAgo < 5 ? 'Just updated' : `Last updated ${secAgo}s ago`}
      </div>
    </div>
  )
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ tab, onSync }: { tab: Tab; onSync: () => void }) {
  const { section, title } = TAB_META[tab]
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px 20px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      <div>
        <div style={{ fontSize: '12.5px', color: T.text3, display: 'flex', alignItems: 'center', gap: '6px' }}>
          Console <span style={{ color: '#3d4046' }}>/</span> <span style={{ color: T.text2 }}>{section}</span>
        </div>
        <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-.01em', marginTop: '2px' }}>{title}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 13px', borderRadius: '9px', background: T.surface, border: `1px solid ${T.border}`, fontSize: '12.5px', color: T.text2 }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: T.red, boxShadow: `0 0 0 3px ${T.redSoft}`, flexShrink: 0 }} />
          Realtime bridge: inactive
        </div>
        <Btn variant="gold" onClick={onSync}><IcoSync /> Sync game data</Btn>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, onTab, onLogout }: { tab: Tab; onTab: (t: Tab) => void; onLogout: () => void }) {
  const navItem = (id: Tab, label: string, Icon: React.FC) => {
    const active = tab === id
    return (
      <button key={id} onClick={() => onTab(id)}
        style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 12px', borderRadius: '8px', fontSize: '13.5px', fontWeight: active ? 600 : 500, background: active ? T.goldSoft : 'transparent', color: active ? T.gold : T.text2, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: T.font, transition: 'background .12s,color .12s' }}>
        <Icon />{label}
      </button>
    )
  }

  const groupLabel = (label: string) => (
    <div style={{ fontSize: '11px', fontWeight: 600, color: T.text3, letterSpacing: '.06em', textTransform: 'uppercase', padding: '14px 12px 8px' }}>{label}</div>
  )

  return (
    <div style={{ width: '248px', flexShrink: 0, background: T.surface, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', padding: '20px 14px' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px 20px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(150deg,#F6C765,#E08E2E)', position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: '9px', background: T.bg, borderRadius: '3px' }} />
          <div style={{ position: 'absolute', inset: '9px', background: T.bg, borderRadius: '3px', transform: 'rotate(45deg)' }} />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-.01em' }}>Jawib Admin</div>
          <div style={{ fontSize: '11px', color: T.text3 }}>Control Panel</div>
        </div>
      </div>

      {groupLabel('Overview')}
      {navItem('analysis',   'Analysis',     IcoAnalysis)}
      {navItem('visitors',   'Visitors',     IcoVisitors)}

      {groupLabel('Content')}
      {navItem('questions',  'Questions',    IcoQuestions)}
      {navItem('categories', 'Categories',   IcoCategories)}
      {navItem('photos',     'Photos',       IcoPhotos)}
      {navItem('custom',     'Custom Games', IcoCustom)}

      {groupLabel('Configuration')}
      {navItem('payment',    'Payment',      IcoPayment)}
      {navItem('settings',   'Settings',     IcoSettings)}

      <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${T.border2}`, color: T.text2, fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
          <IcoExit /> Exit to game
        </a>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 12px', borderRadius: '8px', background: 'none', border: 'none', color: T.text3, fontSize: '12px', cursor: 'pointer', fontFamily: T.font, width: '100%' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}

// ── Tab: Analysis ─────────────────────────────────────────────────────────────
function TabAnalysis({ onGoQuestions }: { onGoQuestions: () => void }) {
  const gamesPlayed  = Number(_ls('games_played') ?? 0)
  const totalQ       = Number(_ls('total_questions_answered') ?? 0)
  const correct      = Number(_ls('correct_answers') ?? 0)
  const accuracy     = totalQ ? Math.round((correct / totalQ) * 100) : 0
  const sessionCount = Number(_ls('session_count') ?? 0)

  const csvOverride = _ls('jawib_csv_override')
  const csvCount    = csvOverride ? Math.max(0, csvOverride.split('\n').filter(Boolean).length - 1) : 0

  const tierBars = [
    { label: '100 pts', count: 114, pct: 100 },
    { label: '200 pts', count: 114, pct: 100 },
    { label: '300 pts', count: 114, pct: 100 },
    { label: '600 pts', count: 114, pct: 72 },
  ]

  return (
    <div>
      {/* 5 KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '14px', marginBottom: '16px' }}>
        <KpiCard label="Sessions"           value={sessionCount} sub={sessionCount === 0 ? 'No sessions yet' : undefined} />
        <KpiCard label="Accuracy ratio"     value={`${accuracy}%`} sub="— of answers correct" />
        <KpiCard label="Correct answers"    value={correct}      valueColor={T.green} sub="All-time total" />
        <KpiCard label="Questions answered" value={totalQ}       sub="All-time total" />
        <KpiCard label="Completed matches"  value={gamesPlayed}  sub={gamesPlayed === 0 ? 'No matches finished' : undefined} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
        {/* Question Bank */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: T.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V4a2 2 0 00-2-2H6.5A2.5 2.5 0 004 4.5v15Z" stroke={T.gold} strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>Question Bank</span>
            </div>
            <button onClick={onGoQuestions} style={{ fontSize: '12.5px', color: T.text2, background: 'none', border: `1px solid ${T.border2}`, padding: '7px 13px', borderRadius: '8px', cursor: 'pointer', fontFamily: T.font, transition: 'background .12s' }}>Manage</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: '11px', padding: '16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>{ALL_CATS.length}</div>
              <div style={{ fontSize: '12px', color: T.text2, marginTop: '3px' }}>Active categories</div>
            </div>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: '11px', padding: '16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: T.text3 }}>{csvCount}</div>
              <div style={{ fontSize: '12px', color: T.text2, marginTop: '3px' }}>Additional CSV</div>
            </div>
            <div style={{ border: `1px solid ${T.border}`, borderRadius: '11px', padding: '16px', background: T.goldSoft }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: T.gold }}>456+</div>
              <div style={{ fontSize: '12px', color: T.text2, marginTop: '3px' }}>Integrated questions</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: T.text2 }}>Distribution by tier</span>
            <span style={{ fontSize: '11.5px', color: T.text3 }}>approximate · 456 total</span>
          </div>
          {tierBars.map((b) => (
            <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 70px', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontFamily: T.mono, fontSize: '12px', color: T.text2 }}>{b.count}</span>
              <div style={{ height: '8px', borderRadius: '5px', background: T.surface2, overflow: 'hidden' }}>
                <div style={{ width: `${b.pct}%`, height: '100%', borderRadius: '5px', background: T.gold, opacity: b.pct / 100 }} />
              </div>
              <span style={{ fontSize: '12px', color: T.text2 }}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Right column: realtime + sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: T.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.9L2.6 17a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0Z" stroke={T.red} strokeWidth="1.6" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Realtime bridge</span>
            </div>
            <div style={{ fontSize: '12.5px', color: T.text2, lineHeight: 1.6, marginBottom: '14px' }}>
              The live sync channel is not connected. Data reflects the last known snapshot.
            </div>
            <Btn variant="gold" style={{ width: '100%', justifyContent: 'center' }}>Reconnect bridge</Btn>
          </div>

          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '22px', flex: 1 }}>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>No sessions recorded</span>
            <div style={{ fontSize: '12.5px', color: T.text2, marginTop: '8px', lineHeight: 1.6, marginBottom: '18px' }}>
              Once players complete a match, session history and accuracy trends will appear here.
            </div>
            {[1, 0.7, 0.45].map((op, i) => (
              <div key={i} style={{ height: '34px', borderRadius: '8px', background: T.surface2, opacity: op, marginBottom: '8px' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Visitors ─────────────────────────────────────────────────────────────
function parseDevice(ua: string): string {
  if (/iPad/.test(ua))                return 'iPad'
  if (/iPhone/.test(ua))             return 'iPhone'
  if (/Android/.test(ua))            return 'Android'
  if (/Macintosh|Mac OS X/.test(ua)) return 'Mac'
  if (/Windows/.test(ua))            return 'Windows'
  if (/Linux/.test(ua))              return 'Linux'
  return 'Unknown'
}

function StarRow({ rating }: { rating: number }) {
  const n = Math.max(0, Math.min(5, rating))
  return <span style={{ color: T.gold }}>{'★'.repeat(n)}<span style={{ opacity: 0.25 }}>{'★'.repeat(5 - n)}</span></span>
}

function TabVisitors() {
  const [loading,     setLoading]     = useState(true)
  const [visits,      setVisits]      = useState<VisitEntry[]>([])
  const [reviews,     setReviews]     = useState<SurveyPayload[]>([])
  const [errMsg,      setErrMsg]      = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(Date.now())
  const [secAgo,      setSecAgo]      = useState(0)

  const fetchData = (token: string, clientId: string) => {
    setLoading(true)
    Promise.all([getVisits({ data: { token, clientId } }), getReviews({ data: { token, clientId } })])
      .then(([v, r]) => {
        if (v.ok) setVisits(v.visits.slice().reverse())
        if (r.ok) setReviews(r.reviews.slice().reverse())
        if (!v.ok && !r.ok) setErrMsg('Session expired — please log in again')
        setLastUpdated(Date.now()); setSecAgo(0)
      })
      .catch(() => setErrMsg('Connection error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const token    = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('jawib_admin_token') ?? '' : ''
    const clientId = typeof localStorage   !== 'undefined' ? localStorage.getItem('jawib_admin_cid')    ?? '' : ''
    if (!token || !clientId) { setErrMsg('No auth token — log in first'); setLoading(false); return }
    fetchData(token, clientId)
    const t = setInterval(() => fetchData(token, clientId), 30_000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setInterval(() => setSecAgo(Math.floor((Date.now() - lastUpdated) / 1000)), 1000)
    return () => clearInterval(t)
  }, [lastUpdated])

  if (loading && visits.length === 0) return <p style={{ color: T.text2, textAlign: 'center', padding: '40px' }}>Loading…</p>
  if (errMsg) return <p style={{ color: T.red, textAlign: 'center', padding: '40px' }}>{errMsg}</p>

  const uniquePlayers = new Set(visits.map((v) => v.playerName)).size
  const todayStart    = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayVisits   = visits.filter((v) => v.ts >= todayStart.getTime()).length

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '16px' }}>
        <KpiCard label="Reviews"       value={reviews.length} />
        <KpiCard label="Unique players" value={uniquePlayers} valueColor={T.green} />
        <KpiCard label="Today's visits" value={todayVisits}   valueColor={T.green} />
        <KpiCard label="Total visits"   value={visits.length} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <span style={{ fontSize: '11.5px', color: T.text3 }}>{loading ? 'Refreshing…' : `Last refreshed ${secAgo}s ago`}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <SectionCard title={`Last visits (${Math.min(visits.length, 20)})`}>
          {visits.length === 0
            ? <p style={{ fontSize: '12.5px', color: T.text2 }}>No visits recorded yet.</p>
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: T.surface2 }}>
                      {['Date', 'Player', 'Device', 'Country'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: T.text2, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visits.slice(0, 20).map((v, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                        <td style={{ padding: '10px 14px', color: T.text3, whiteSpace: 'nowrap' }}>{new Date(v.ts).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, direction: 'rtl' }}>{v.playerName}</td>
                        <td style={{ padding: '10px 14px', color: T.text2 }}>{parseDevice(v.userAgent)}</td>
                        <td style={{ padding: '10px 14px', color: T.text2 }}>{v.country || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </SectionCard>

        <SectionCard title={`Last ratings (${Math.min(reviews.length, 10)})`}>
          {reviews.length === 0
            ? <p style={{ fontSize: '12.5px', color: T.text2 }}>No reviews yet.</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reviews.slice(0, 10).map((r, i) => (
                  <div key={i} style={{ padding: '12px', borderRadius: '10px', border: `1px solid ${T.border}`, background: T.surface2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', direction: 'rtl' }}>{r.playerName ?? 'Unknown'}</span>
                      <span style={{ color: T.text3, fontSize: '11.5px' }}>{new Date(r.timestamp).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <StarRow rating={r.rating} />
                    {r.comment && <p style={{ fontSize: '12px', color: T.text2, marginTop: '6px', fontStyle: 'italic', direction: 'rtl' }}>"{r.comment}"</p>}
                  </div>
                ))}
              </div>
            )
          }
        </SectionCard>
      </div>
    </div>
  )
}

// ── Tab: Questions ────────────────────────────────────────────────────────────
function TabQuestions() {
  const [csvRows,    setCsvRows]    = useState<string[][]>([])
  const [csvError,   setCsvError]   = useState<string | null>(null)
  const [csvLoading, setCsvLoading] = useState(true)
  const [uploadMsg,  setUploadMsg]  = useState<string | null>(null)
  const [dragging,   setDragging]   = useState(false)
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

  const processFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text  = ev.target?.result as string
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
      const rows  = lines.map((l) => l.split(',').map((c) => c.replace(/^"|"$/g, '').trim()))
      localStorage.setItem('jawib_csv_override', text)
      setCsvRows(rows)
      setUploadMsg(`✓ Uploaded ${rows.length - 1} questions — applied on next game load.`)
    }
    reader.readAsText(file, 'UTF-8')
  }

  const header   = csvRows[0] ?? []
  const dataRows = csvRows.slice(1)
  const preview  = dataRows.slice(0, 5)

  return (
    <div>
      <SectionCard
        title="Current question file"
        action={<span style={{ fontFamily: T.mono, fontSize: '12.5px', color: T.text2 }}>{dataRows.length} total</span>}
      >
        {csvLoading && <p style={{ color: T.text2 }}>Loading…</p>}
        {csvError   && <p style={{ color: T.red }}>Error: {csvError}</p>}
        {!csvLoading && !csvError && (
          <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: T.surface2 }}>
                  {header.map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '10px 14px', color: T.text2, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, ri) => (
                  <tr key={ri} style={{ borderTop: `1px solid ${T.border}` }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: '10px 14px', color: T.text2, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: ci === 0 ? T.mono : undefined }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {dataRows.length > 5 && (
              <div style={{ padding: '10px 14px', fontSize: '11.5px', color: T.text3 }}>and {dataRows.length - 5} more rows</div>
            )}
          </div>
        )}
      </SectionCard>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '24px', marginTop: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Upload a new CSV file</div>
        <div style={{ fontSize: '12.5px', color: T.text2, marginBottom: '16px', lineHeight: 1.6 }}>
          Required columns: <span style={{ fontFamily: T.mono }}>id, category, tier, points, text, option1, option2, option3, option4, correctIndex</span>
        </div>
        <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }}
          onClick={() => fileRef.current?.click()}
          style={{ border: `1.5px dashed ${dragging ? T.gold : T.border2}`, borderRadius: '10px', padding: '26px', textAlign: 'center', fontSize: '12.5px', color: T.text2, cursor: 'pointer', background: dragging ? T.goldSoft : 'transparent', transition: 'border-color .15s,background .15s' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 8px', display: 'block' }}>
            <path d="M12 3v12m0-12l4 4m-4-4L8 7M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={T.gold} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Drop a CSV file here, or <span style={{ color: T.gold, fontWeight: 600 }}>browse</span>
        </div>
        {uploadMsg && <p style={{ color: T.green, marginTop: '10px', fontSize: '12.5px' }}>{uploadMsg}</p>}
      </div>
    </div>
  )
}

// ── Tab: Categories ───────────────────────────────────────────────────────────
function TabCategories() {
  const [customCats, setCustomCats] = useState<Array<{ id: string; name: string; icon: string; color: string }>>(() => {
    try { return JSON.parse(_ls('jawib_custom_cats') ?? '[]') } catch { return [] }
  })
  const [form,    setForm]    = useState({ name: '', icon: '🎯', color: '#E9A23C' })
  const [adding,  setAdding]  = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  const getAuth = () => ({
    token:    typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('jawib_admin_token') ?? '' : '',
    clientId: typeof localStorage   !== 'undefined' ? localStorage.getItem('jawib_admin_cid')    ?? '' : '',
  })

  const save = (cats: typeof customCats) => {
    setCustomCats(cats)
    if (typeof localStorage !== 'undefined') localStorage.setItem('jawib_custom_cats', JSON.stringify(cats))
  }

  const add = async () => {
    if (!form.name.trim()) return
    const cat = { id: `custom-${Date.now()}`, name: form.name.trim(), icon: form.icon, color: form.color }
    save([...customCats, cat])
    setForm({ name: '', icon: '🎯', color: '#E9A23C' })
    setAdding(false)
    const { token, clientId } = getAuth()
    if (token && clientId) {
      try { await saveAdminCategoryServer({ data: { token, clientId, category: cat } }); setSyncMsg('Synced to server') }
      catch { setSyncMsg('Saved locally only') }
    } else {
      setSyncMsg('Saved locally')
    }
    setTimeout(() => setSyncMsg(null), 3000)
  }

  const remove = async (id: string) => {
    save(customCats.filter((c) => c.id !== id))
    const { token, clientId } = getAuth()
    if (token && clientId) {
      try { await deleteAdminCategoryServer({ data: { token, clientId, id } }) } catch { /* noop */ }
    }
  }

  const EMOJI_OPTIONS = ['🎯','🎲','🎭','💡','🧩','🌟','🔥','⚡','🏅','🎪','🎨','🎬','📡','🔬','🧬']

  return (
    <div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700 }}>Combined categories</span>
          <span style={{ fontFamily: T.mono, fontSize: '12.5px', color: T.text2 }}>{ALL_CATS.length} total</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {ALL_CATS.map((c) => (
            <span key={c.id} style={{ padding: '7px 13px', borderRadius: '8px', border: `1px solid ${T.border2}`, fontSize: '12.5px', cursor: 'default', direction: 'rtl' }}>
              {c.icon} {c.name}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Btn variant="gold" onClick={() => setAdding((v) => !v)}>{adding ? '✕ Cancel' : '+ New category'}</Btn>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '14px 18px', fontSize: '12.5px', color: T.text2 }}>
          {customCats.length} custom {customCats.length === 1 ? 'category' : 'categories'}
        </div>
      </div>

      {adding && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.text2, marginBottom: '6px' }}>Category name</label>
              <input style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: '8px', padding: '9px 12px', color: T.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', direction: 'rtl', fontFamily: T.font }}
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. سيارات الكويت" maxLength={30} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.text2, marginBottom: '6px' }}>Color</label>
              <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                style={{ width: '100%', height: '38px', background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: '8px', padding: '3px', cursor: 'pointer', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.text2, marginBottom: '6px' }}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} onClick={() => setForm((f) => ({ ...f, icon: e }))}
                  style={{ fontSize: '1.2rem', background: form.icon === e ? T.goldSoft : 'transparent', border: `1.5px solid ${form.icon === e ? T.gold : T.border2}`, borderRadius: '7px', width: '36px', height: '36px', cursor: 'pointer' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Btn variant="gold" onClick={add}>Save category</Btn>
            {syncMsg && <span style={{ fontSize: '12px', color: T.green }}>{syncMsg}</span>}
          </div>
        </div>
      )}

      {customCats.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {customCats.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px 16px' }}>
              <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
              <span style={{ flex: 1, fontWeight: 600, direction: 'rtl' }}>{c.name}</span>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <Btn variant="red" onClick={() => remove(c.id)} style={{ padding: '6px 12px', fontSize: '12px' }}>Remove</Btn>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tab: Photos ───────────────────────────────────────────────────────────────
function TabPhotos() {
  const [images,      setImages]      = useState<AdminImage[]>(loadAdminImages)
  const [selectedCat, setSelectedCat] = useState<CategoryId>(ALL_CATS[0]?.id ?? 'culture' as CategoryId)
  const [uploadMsg,   setUploadMsg]   = useState<string | null>(null)

  const reload = () => setImages(loadAdminImages())

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string, label: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500_000) { setUploadMsg('Image exceeds 500 KB — choose a smaller file.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      saveAdminImage({ key, dataUrl: ev.target?.result as string, label, uploadedAt: Date.now() })
      setUploadMsg(`Saved image for "${label}"`)
      reload()
    }
    reader.readAsDataURL(file)
  }

  const remove = (key: string) => { deleteAdminImage(key); reload() }

  return (
    <div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Category images</div>
        <div style={{ fontSize: '12.5px', color: T.text2, marginBottom: '16px' }}>Replace default images with custom art (PNG/JPG, max 500 KB).</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value as CategoryId)}
            style={{ flex: 1, minWidth: '150px', padding: '9px 12px', borderRadius: '9px', background: T.surface2, border: `1px solid ${T.border2}`, color: T.text, fontSize: '13px', direction: 'rtl', fontFamily: T.font }}>
            {ALL_CATS.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <label style={{ padding: '9px 16px', borderRadius: '9px', background: T.green, color: '#0D2018', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Upload image
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => handleUpload(e, `cat:${selectedCat}`, ALL_CATS.find((c) => c.id === selectedCat)?.name ?? selectedCat)} />
          </label>
        </div>
        {uploadMsg && <p style={{ color: T.green, fontSize: '12.5px', marginTop: '10px' }}>{uploadMsg}</p>}
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '24px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Uploaded image library ({images.length})</div>
        {images.length === 0
          ? <p style={{ fontSize: '12.5px', color: T.text2 }}>No images have been uploaded yet.</p>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '12px' }}>
              {images.map((img) => (
                <div key={img.key} style={{ background: T.surface2, borderRadius: '10px', overflow: 'hidden', border: `1px solid ${T.border}` }}>
                  <img src={img.dataUrl} alt={img.label} style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '8px 10px' }}>
                    <p style={{ color: T.text2, fontSize: '11.5px', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'rtl' }}>{img.label}</p>
                    <button onClick={() => remove(img.key)} style={{ fontSize: '11px', padding: '4px 8px', background: T.redSoft, border: 'none', borderRadius: '6px', color: '#F0938A', cursor: 'pointer', fontFamily: T.font }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

// ── Tab: Custom Games ─────────────────────────────────────────────────────────
function TabCustomGames() {
  const [games,         setGames]         = useState<CustomGame[]>(loadCustomGames)
  const [selected,      setSelected]      = useState<CustomGame | null>(null)
  const [adding,        setAdding]        = useState(false)
  const [newGameForm,   setNewGameForm]   = useState({ name: '', emoji: '🎮', color: T.gold as string, description: '' })
  const [questionForm,  setQuestionForm]  = useState({ text: '', option0: '', option1: '', option2: '', option3: '', correctIndex: 0, points: 200, imageUrl: '' })
  const [qMsg,          setQMsg]          = useState<string | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  const reload = () => {
    const all = loadCustomGames(); setGames(all)
    if (selected) setSelected(all.find((g) => g.id === selected.id) ?? null)
  }

  const addGame = () => {
    if (!newGameForm.name.trim()) return
    createCustomGame(newGameForm.name.trim(), newGameForm.emoji, newGameForm.color, newGameForm.description)
    setNewGameForm({ name: '', emoji: '🎮', color: T.gold, description: '' }); setAdding(false); reload()
  }

  const addQ = () => {
    if (!selected || !questionForm.text.trim() || !questionForm.option0.trim()) return
    addQuestionToGame(selected.id, { text: questionForm.text.trim(), options: [questionForm.option0, questionForm.option1, questionForm.option2, questionForm.option3] as [string,string,string,string], correctIndex: questionForm.correctIndex as 0|1|2|3, points: questionForm.points as 100|200|300|400|500|600, imageUrl: questionForm.imageUrl || undefined })
    setQuestionForm({ text: '', option0: '', option1: '', option2: '', option3: '', correctIndex: 0, points: 200, imageUrl: '' })
    setQMsg('Question added'); setTimeout(() => setQMsg(null), 2000); reload()
  }

  const EMOJI_OPTS = ['🎮','🎭','🏅','🎯','🧩','🌟','🔥','🎲','💡','🌴','🐪','🏺','🎪','📚','⚡']
  const input = (style?: React.CSSProperties) => ({ width: '100%', background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: '8px', padding: '9px 12px', color: T.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const, fontFamily: T.font, ...style })

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ background: 'none', border: `1px solid ${T.border2}`, borderRadius: '8px', padding: '7px 14px', color: T.text2, cursor: 'pointer', marginBottom: '16px', fontFamily: T.font, fontSize: '13px' }}>← Back</button>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>{selected.emoji}</span>
          <div style={{ direction: 'rtl' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '18px' }}>{selected.name}</p>
            {selected.description && <p style={{ margin: '2px 0 0', color: T.text2, fontSize: '13px' }}>{selected.description}</p>}
          </div>
          <span style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: '999px', background: T.goldSoft, color: T.gold, fontSize: '12px', fontWeight: 700 }}>{selected.questions.length} questions</span>
        </div>
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '24px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Questions</div>
        {selected.questions.map((q, i) => (
          <div key={q.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${T.border}` }}>
            <span style={{ color: T.text3, fontSize: '12px', minWidth: '20px', marginTop: '3px' }}>{i + 1}</span>
            <div style={{ flex: 1, direction: 'rtl' }}>
              <p style={{ margin: 0, fontSize: '13.5px' }}>{q.text}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: T.green }}>✓ {q.options[q.correctIndex]} — <span style={{ color: T.gold }}>{q.points} pts</span></p>
            </div>
            <button onClick={() => { removeQuestionFromGame(selected.id, q.id); reload() }}
              style={{ background: T.redSoft, border: 'none', borderRadius: '6px', padding: '4px 8px', color: '#F0938A', cursor: 'pointer', fontSize: '12px', flexShrink: 0, fontFamily: T.font }}>✕</button>
          </div>
        ))}

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Add question</div>
          <div style={{ marginBottom: '10px' }}>
            <textarea style={{ ...input({ resize: 'vertical', minHeight: '60px', direction: 'rtl' }) }}
              value={questionForm.text} onChange={(e) => setQuestionForm((f) => ({ ...f, text: e.target.value }))} placeholder="Question text (Arabic)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            {([0,1,2,3] as const).map((i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input style={{ ...input({ flex: 1, direction: 'rtl', border: `1px solid ${questionForm.correctIndex === i ? T.green : T.border2}` }) }}
                  value={questionForm[`option${i}` as 'option0'|'option1'|'option2'|'option3']}
                  onChange={(e) => setQuestionForm((f) => ({ ...f, [`option${i}`]: e.target.value }))}
                  placeholder={`Option ${i + 1}`} />
                <button onClick={() => setQuestionForm((f) => ({ ...f, correctIndex: i }))}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${questionForm.correctIndex === i ? T.green : T.border2}`, background: questionForm.correctIndex === i ? T.green : 'transparent', cursor: 'pointer', flexShrink: 0 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select style={{ ...input({ width: 'auto' }) }} value={questionForm.points} onChange={(e) => setQuestionForm((f) => ({ ...f, points: Number(e.target.value) }))}>
              {[100,200,300,400,500,600].map((p) => <option key={p} value={p}>{p} pts</option>)}
            </select>
            <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 300_000) { setQMsg('Image exceeds 300 KB'); return } const r = new FileReader(); r.onload = (ev) => setQuestionForm((ff) => ({ ...ff, imageUrl: ev.target?.result as string })); r.readAsDataURL(f) }} />
            <button onClick={() => imgRef.current?.click()} style={{ background: 'none', border: `1px solid ${T.border2}`, borderRadius: '8px', padding: '8px 14px', color: questionForm.imageUrl ? T.green : T.text2, cursor: 'pointer', fontSize: '12.5px', fontFamily: T.font }}>
              {questionForm.imageUrl ? '✓ Image attached' : 'Attach image'}
            </button>
            <Btn variant="gold" onClick={addQ}>Add</Btn>
            {qMsg && <span style={{ fontSize: '12px', color: T.green }}>{qMsg}</span>}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Btn variant="gold" onClick={() => setAdding((v) => !v)}>{adding ? '✕ Cancel' : '+ New game'}</Btn>
        <span style={{ fontFamily: T.mono, fontSize: '12.5px', color: T.text2 }}>{games.length} custom games</span>
      </div>

      {adding && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.text2, marginBottom: '6px' }}>Game name</label>
              <input style={input({ direction: 'rtl' })} value={newGameForm.name} onChange={(e) => setNewGameForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. لعبة العائلة" maxLength={40} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.text2, marginBottom: '6px' }}>Color</label>
              <input type="color" value={newGameForm.color} onChange={(e) => setNewGameForm((f) => ({ ...f, color: e.target.value }))} style={{ ...input(), height: '38px', padding: '3px', cursor: 'pointer' }} />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.text2, marginBottom: '6px' }}>Description (optional)</label>
            <input style={input({ direction: 'rtl' })} value={newGameForm.description} onChange={(e) => setNewGameForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description…" maxLength={80} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.text2, marginBottom: '6px' }}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EMOJI_OPTS.map((e) => (
                <button key={e} onClick={() => setNewGameForm((f) => ({ ...f, emoji: e }))} style={{ fontSize: '1.2rem', background: newGameForm.emoji === e ? T.goldSoft : 'transparent', border: `1.5px solid ${newGameForm.emoji === e ? T.gold : T.border2}`, borderRadius: '7px', width: '36px', height: '36px', cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
          <Btn variant="gold" onClick={addGame}>Create</Btn>
        </div>
      )}

      {games.length === 0 && !adding && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '34px', marginBottom: '10px' }}>🎮</div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>No custom games yet</div>
          <div style={{ fontSize: '12.5px', color: T.text2 }}>Create your first game with team-specific questions.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {games.map((g) => (
          <div key={g.id} onClick={() => setSelected(g)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '14px 18px', cursor: 'pointer', transition: 'border-color .12s' }}>
            <span style={{ fontSize: '1.8rem' }}>{g.emoji}</span>
            <div style={{ flex: 1, direction: 'rtl' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{g.name}</p>
              {g.description && <p style={{ margin: '2px 0 0', fontSize: '12px', color: T.text2 }}>{g.description}</p>}
            </div>
            <span style={{ padding: '4px 12px', borderRadius: '999px', background: T.goldSoft, color: T.gold, fontSize: '12px', fontWeight: 700 }}>{g.questions.length} Qs</span>
            <button onClick={(e) => { e.stopPropagation(); deleteCustomGame(g.id); reload() }}
              style={{ background: T.redSoft, border: 'none', borderRadius: '7px', padding: '6px 10px', color: '#F0938A', cursor: 'pointer', fontSize: '12px', fontFamily: T.font }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Payment ──────────────────────────────────────────────────────────────
function TabPayment() {
  const FEATURES = [
    { id: 'full_game',      label: 'The full game (unlimited)', desc: 'Removes the free-tier question limit',   price: 'KD 0.99', highlight: false },
    { id: 'custom_game',    label: 'Custom game builder',       desc: 'Create team-specific questions',         price: 'KD 1.99', highlight: false },
    { id: 'murder_mystery', label: 'Murder Mystery pack',       desc: 'Investigation & Investigator category',  price: 'KD 1.49', highlight: false },
    { id: 'premium_pack',   label: 'Premium package (all)',     desc: 'All content + future updates',           price: 'KD 3.99', highlight: true  },
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
      <SectionCard title="Paid features">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FEATURES.map((f) => {
            const cfg = config[f.id] ?? { enabled: true, price: f.price }
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', border: `1px solid ${f.highlight ? T.gold : T.border}`, borderRadius: '11px', background: f.highlight ? T.goldSoft : 'transparent' }}>
                <div
                  onClick={() => save({ ...config, [f.id]: { ...cfg, enabled: !cfg.enabled } })}
                  style={{ width: '38px', height: '22px', borderRadius: '999px', background: cfg.enabled ? T.green : T.surface2, position: 'relative', flexShrink: 0, cursor: 'pointer', transition: 'background .2s' }}>
                  <span style={{ position: 'absolute', top: '2px', [cfg.enabled ? 'right' : 'left']: '2px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left .2s,right .2s' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: f.highlight ? 700 : 600 }}>{f.label}</div>
                  <div style={{ fontSize: '12px', color: T.text2, marginTop: '2px' }}>{f.desc}</div>
                </div>
                <input style={{ width: '80px', background: T.surface2, border: `1px solid ${T.border2}`, borderRadius: '7px', padding: '7px 10px', color: f.highlight ? T.gold : T.text, fontSize: '13px', fontFamily: T.mono, textAlign: 'center', outline: 'none', fontWeight: f.highlight ? 700 : 400 }}
                  value={cfg.price} onChange={(e) => save({ ...config, [f.id]: { ...cfg, price: e.target.value } })} />
              </div>
            )
          })}
        </div>
      </SectionCard>

      <div style={{ marginTop: '16px' }}>
        <SectionCard title={`Purchase record (${purchases.length})`}>
          {purchases.length === 0
            ? <p style={{ fontSize: '12.5px', color: T.text2 }}>No purchases have been recorded yet.</p>
            : (
              <div>
                {purchases.slice(-20).reverse().map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${T.border}`, fontSize: '12.5px' }}>
                    <span style={{ color: T.text2, direction: 'rtl' }}>{p.feature}</span>
                    <span style={{ color: T.text3 }}>{new Date(p.ts).toLocaleDateString('en-GB')}</span>
                  </div>
                ))}
              </div>
            )
          }
        </SectionCard>
      </div>
    </div>
  )
}

// ── Tab: Settings ─────────────────────────────────────────────────────────────
function TabSettings() {
  const [cleared, setCleared] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const clear = () => { localStorage.clear(); setCleared(true); setConfirm(false) }

  return (
    <div style={{ maxWidth: '640px' }}>
      <SectionCard title="Session">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => window.location.replace('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', borderRadius: '10px', background: T.surface2, border: `1px solid ${T.border2}`, color: T.text, fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: T.font }}>
            <span style={{ color: T.green }}>↩</span> Go to the game
          </button>
          <button onClick={() => window.location.reload()}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', borderRadius: '10px', background: T.surface2, border: `1px solid ${T.border2}`, color: T.text, fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: T.font }}>
            <span style={{ color: T.blue }}>↻</span> Reload control panel
          </button>
          {!confirm
            ? (
              <button onClick={() => setConfirm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', borderRadius: '10px', background: T.redSoft, border: 'rgba(225,89,75,.3) 1px solid', color: '#F0938A', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: T.font }}>
                🗑 Clear all local data
              </button>
            )
            : (
              <div style={{ background: T.redSoft, border: 'rgba(225,89,75,.3) 1px solid', borderRadius: '10px', padding: '14px 16px' }}>
                <p style={{ color: T.text, fontSize: '13px', marginBottom: '10px', margin: '0 0 10px' }}>Are you sure? Everything will be deleted.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Btn variant="red" onClick={clear}>Confirm delete</Btn>
                  <Btn variant="ghost" onClick={() => setConfirm(false)}>Cancel</Btn>
                </div>
              </div>
            )
          }
        </div>
        {cleared && <p style={{ color: T.green, marginTop: '12px', fontSize: '12.5px' }}>✓ All local data cleared.</p>}
      </SectionCard>

      <div style={{ marginTop: '16px' }}>
        <SectionCard title="App information">
          <div style={{ fontSize: '12.5px', color: T.text2, lineHeight: 1.9 }}>
            Jawib — Arabic general-knowledge trivia game<br/>
            Categories: <span style={{ fontFamily: T.mono, color: T.text }}>{ALL_CATS.length}</span> &nbsp;·&nbsp; Questions: <span style={{ fontFamily: T.mono, color: T.text }}>456+</span><br/>
            Environment: Netlify + TanStack Start
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('analysis')

  const handleSync = () => {
    resetContentRegistry()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, direction: 'ltr' }}>
      <Sidebar tab={tab} onTab={setTab} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Topbar tab={tab} onSync={handleSync} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '28px 32px 20px' }}>
            <StatusStrip />
          </div>
          <div style={{ padding: '0 32px 60px' }}>
            {tab === 'analysis'   && <TabAnalysis onGoQuestions={() => setTab('questions')} />}
            {tab === 'visitors'   && <TabVisitors />}
            {tab === 'questions'  && <TabQuestions />}
            {tab === 'categories' && <TabCategories />}
            {tab === 'photos'     && <TabPhotos />}
            {tab === 'custom'     && <TabCustomGames />}
            {tab === 'payment'    && <TabPayment />}
            {tab === 'settings'   && <TabSettings />}
          </div>
        </div>
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
  const [username,   setUsername]   = useState('')
  const [password,   setPassword]   = useState('')
  const [error,      setError]      = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [locked,     setLocked]     = useState(false)
  const [lockMin,    setLockMin]    = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password || submitting || locked) return
    setSubmitting(true); setError(null)
    try {
      const clientId = getOrCreateClientId()
      const result   = await adminLogin({ data: { username: username.trim(), password, clientId } })
      if (result.ok) {
        sessionStorage.setItem('jawib_admin_token', result.token)
        onAuthed(result.token, clientId)
      } else if (result.error === 'not_configured') {
        setError('Add ADMIN_PASSWORD in Netlify environment variables first')
      } else if (result.error === 'locked') {
        setLocked(true); setLockMin(result.retryAfterMin ?? 15)
        setError(`Too many attempts — try again in ${result.retryAfterMin ?? 15} minutes`)
      } else {
        const left = ('attemptsLeft' in result ? result.attemptsLeft : undefined) ?? 0
        setError(left > 0 ? `Incorrect credentials — ${left} attempt${left === 1 ? '' : 's'} remaining` : 'Incorrect username or password')
      }
    } catch {
      setError('Connection error — try again')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: T.surface2, border: `1px solid ${error ? T.red : T.border2}`,
    borderRadius: '9px', padding: '11px 14px', color: T.text, fontSize: '14px',
    outline: 'none', boxSizing: 'border-box', fontFamily: T.font, direction: 'ltr',
  }

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at 60% 0%,${T.goldSoft} 0%,transparent 60%),${T.bg}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: '1rem', direction: 'ltr' }}>
      {/* Brand mark */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(150deg,#F6C765,#E08E2E)', position: 'relative', margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', inset: '14px', background: T.bg, borderRadius: '4px' }} />
          <div style={{ position: 'absolute', inset: '14px', background: T.bg, borderRadius: '4px', transform: 'rotate(45deg)' }} />
        </div>
        <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-.02em' }}>Jawib Admin</div>
        <div style={{ fontSize: '13px', color: T.text3, marginTop: '4px' }}>Control Panel</div>
      </div>

      {/* Card */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '28px 24px', width: '100%', maxWidth: '360px', boxShadow: '0 24px 48px rgba(0,0,0,.5)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.text2, marginBottom: '7px' }}>Username</label>
            <input type="text" value={username} disabled={locked}
              onChange={(e) => { setError(null); setUsername(e.target.value) }}
              placeholder="admin" style={inputStyle} autoComplete="username" autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: T.text2, marginBottom: '7px' }}>Password</label>
            <input type="password" value={password} disabled={locked}
              onChange={(e) => { setError(null); setPassword(e.target.value) }}
              placeholder="••••••••" style={{ ...inputStyle, border: `1px solid ${error ? T.red : T.border2}` }}
              autoComplete="current-password" />
          </div>
          {error && <p style={{ color: T.red, fontSize: '12.5px', margin: 0, textAlign: 'center' }}>{error}</p>}
          <button type="submit" disabled={submitting || locked || !username || !password}
            style={{ marginTop: '4px', background: (!submitting && !locked && username && password) ? T.gold : T.goldSoft, color: (!submitting && !locked && username && password) ? '#20140A' : T.text3, border: 'none', borderRadius: '10px', padding: '13px', fontWeight: 800, fontSize: '15px', cursor: (submitting || locked || !username || !password) ? 'not-allowed' : 'pointer', transition: 'all .18s', fontFamily: T.font }}>
            {submitting ? '…' : locked ? `Locked · ${lockMin}m` : 'Sign in →'}
          </button>
        </form>
      </div>

      <p style={{ color: T.text3, fontSize: '11.5px', marginTop: '20px', textAlign: 'center', lineHeight: 1.6, opacity: 0.6 }}>
        Set credentials in Netlify environment variables<br/>
        <span style={{ fontFamily: T.mono }}>ADMIN_USERNAME · ADMIN_PASSWORD</span>
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
    setClientId(cid); setToken(tok)
    if (!tok) { setChecking(false); return }
    verifyAdminToken({ data: { token: tok, clientId: cid } })
      .then((r) => { if (r.ok) setAuthed(true) })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  const handleAuthed = (tok: string, cid: string) => { setToken(tok); setClientId(cid); setAuthed(true) }
  const handleLogout = () => { sessionStorage.removeItem('jawib_admin_token'); setAuthed(false); setToken('') }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(150deg,#F6C765,#E08E2E)' }} />
      </div>
    )
  }

  void token; void clientId
  if (!authed) return <LoginPortal onAuthed={handleAuthed} />
  return <AdminDashboard onLogout={handleLogout} />
}
