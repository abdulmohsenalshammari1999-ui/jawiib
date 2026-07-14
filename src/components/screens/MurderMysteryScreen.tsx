/**
 * MurderMysteryScreen — immersive collaborative mystery mode.
 *
 * Features:
 * - 4-character Arabic voice narration (narrator / detective / witness / court)
 * - Shared Evidence Board with team deduction marks (suspected / cleared)
 * - Clue flash overlay on reveal — both teams see the clue before play resumes
 * - Accusation modal surfaces all revealed clues alongside the selectors
 * - Minimum 6/9 tiles gate + one attempt per team (bulletproof rules)
 */
import { useState, useEffect, useRef } from 'react';
import {
  useMysteryStore, canAccuse, revealedCount,
  type MysteryTeam, type TileState, type DeductionMark,
} from '@/store/mysteryStore';
import {
  SCENARIOS, drawSolution, generateClues,
  type DrawnSolution, type Scenario,
} from '@/lib/mysteries';
import { narrateAr, stopNarration, LINES } from '@/lib/mysteryVoice';
import { questions } from '@/lib/questions';
import type { Question } from '@/lib/types';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: '#0A0B0D', surface: '#13141A', surface2: '#1A1C24',
  border: 'rgba(255,255,255,.07)', border2: 'rgba(255,255,255,.13)',
  text: '#EDEEF0', text2: '#A6A9AE', text3: '#6E7176',
  gold: '#E9A23C', goldSoft: 'rgba(233,162,60,.13)',
  green: '#3FB27F', greenSoft: 'rgba(63,178,127,.13)',
  red: '#C0392B', redSoft: 'rgba(192,57,43,.14)',
  redBright: '#E1594B',
  blue: '#4E8FE0', blueSoft: 'rgba(78,143,224,.13)',
  alpha: '#5FA98C', alphaLight: 'rgba(95,169,140,.17)',
  beta: '#C85A34', betaLight: 'rgba(200,90,52,.17)',
  crimson: '#8B0000', crimsonSoft: 'rgba(139,0,0,.18)',
} as const;

const TEAM_COLOR: Record<MysteryTeam, string> = { alpha: T.alpha, beta: T.beta };
const TEAM_SOFT:  Record<MysteryTeam, string> = { alpha: T.alphaLight, beta: T.betaLight };

const ROW_META = {
  witness:  { labelAr: 'شاهد عيان',  icon: '👁️', color: T.blue },
  physical: { labelAr: 'دليل مادي',  icon: '🔍', color: T.gold },
  document: { labelAr: 'وثيقة سرية', icon: '📄', color: T.green },
} as const;

// ── Question picker ───────────────────────────────────────────────────────────
function pickQuestion(tier: 2 | 4 | 6, exclude: Set<string>): Question {
  const pool = questions.filter(
    (q) => q.tier === tier && (!q.type || q.type === 'text') && !exclude.has(q.id)
  );
  if (!pool.length) {
    const fb = questions.filter((q) => !q.type || q.type === 'text');
    return fb[Math.floor(Math.random() * fb.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildTiles(scenario: Scenario, solution: DrawnSolution): TileState[] {
  const clues = generateClues(scenario, solution);
  const used = new Set<string>();
  return clues.map((clue) => {
    const tier = (clue.points / 100) as 2 | 4 | 6;
    const q = pickQuestion(tier, used);
    used.add(q.id);
    return { clue, question: q, revealedByTeam: null };
  });
}

// ── Root component ────────────────────────────────────────────────────────────
interface Props { onExit: () => void; alphaName?: string; betaName?: string }

export function MurderMysteryScreen({ onExit, alphaName = 'البحر', betaName = 'البر' }: Props) {
  const store = useMysteryStore();
  const [scenario, setScenario] = useState<Scenario | null>(null);

  function launch(sc: Scenario) {
    const solution = drawSolution(sc);
    const tiles = buildTiles(sc, solution);
    setScenario(sc);
    store.initMystery(sc, solution, tiles, { alpha: alphaName, beta: betaName });
  }

  useEffect(() => {
    launch(SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]);
    return () => stopNarration();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRematch = () => {
    stopNarration();
    const sc = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    launch(sc);
    store.setPhase('briefing');
  };

  if (!scenario || store.phase === 'briefing') {
    return <BriefingScreen scenario={scenario} onStart={() => store.setPhase('board')} onExit={onExit} />;
  }
  if (store.phase === 'verdict') {
    return <VerdictScreen onExit={onExit} onRematch={handleRematch} />;
  }
  return <BoardScreen onExit={onExit} />;
}

// ── Briefing ──────────────────────────────────────────────────────────────────
function BriefingScreen({ scenario, onStart, onExit }: { scenario: Scenario | null; onStart: () => void; onExit: () => void }) {
  useEffect(() => {
    if (scenario) {
      const t = setTimeout(() => narrateAr(LINES.intro(scenario.crimeAr), 'narrator'), 600);
      return () => clearTimeout(t);
    }
  }, [scenario?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, direction: 'rtl', overflowY: 'auto' }}>
      {/* Crime-tape header */}
      <div style={{ background: `repeating-linear-gradient(45deg,${T.crimson} 0,${T.crimson} 12px,#0A0B0D 12px,#0A0B0D 24px)`, height: '6px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${T.border}` }}>
        <button onClick={() => { stopNarration(); onExit(); }} style={{ background: 'none', border: 'none', color: T.text2, fontSize: '13px', cursor: 'pointer' }}>← رجوع</button>
        <span style={{ fontSize: '12px', fontWeight: 800, color: T.redBright, letterSpacing: '0.06em' }}>🔍 مَن الفاعل؟</span>
        <span style={{ width: 56 }} />
      </div>

      {/* Case dossier */}
      <div style={{ margin: '20px 18px 0', padding: '18px', background: 'linear-gradient(135deg,rgba(139,0,0,.18),rgba(233,162,60,.07))', border: `1px solid rgba(192,57,43,.3)`, borderRadius: '14px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: T.text3, letterSpacing: '0.1em', marginBottom: '4px' }}>{scenario?.settingAr}</p>
        <h1 style={{ fontSize: '19px', fontWeight: 900, color: T.text, margin: '0 0 10px' }}>{scenario?.titleAr ?? '…'}</h1>
        <p style={{ fontSize: '12.5px', color: T.text2, lineHeight: 1.75, margin: 0 }}>{scenario?.crimeAr}</p>
      </div>

      {/* How to play */}
      <div style={{ margin: '14px 18px 0', padding: '13px 15px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: T.gold, marginBottom: '8px' }}>كيف تلعبون معاً؟</p>
        {[
          ['🎯', 'أجب صح → اكشف دليلاً على لوح الجريمة'],
          ['📋', 'استخدم دفتر الأدلة لتصنيف المشتبه بهم'],
          ['🔒', 'اكشف 6 أدلة → يُفتح باب الاتهام'],
          ['⚖️', 'حدّد الفاعل + المكان + الأسلوب — فرصة واحدة لكل فريق'],
          ['🎙️', 'استمع للراوي — يكشف تفاصيل لا تظهر على الشاشة'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
            <span style={{ fontSize: '13px', flexShrink: 0 }}>{icon}</span>
            <p style={{ fontSize: '11.5px', color: T.text2, margin: 0 }}>{text}</p>
          </div>
        ))}
      </div>

      {/* Suspects */}
      {scenario && (
        <div style={{ margin: '16px 18px 0' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: T.text2, marginBottom: '8px' }}>المشتبه بهم</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
            {scenario.suspects.map((s) => (
              <div key={s.id} style={{ padding: '9px 12px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{s.emoji}</span>
                <div>
                  <p style={{ fontSize: '11.5px', fontWeight: 700, color: T.text, margin: 0 }}>{s.nameAr}</p>
                  <p style={{ fontSize: '9.5px', color: T.text3, margin: 0, lineHeight: 1.3 }}>{s.roleAr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locations + Methods */}
      {scenario && (
        <div style={{ margin: '14px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: T.text2, marginBottom: '7px' }}>الأماكن</p>
            {scenario.locations.map((l) => (
              <p key={l.id} style={{ fontSize: '11px', color: T.text2, margin: '4px 0' }}>{l.emoji} {l.nameAr}</p>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: T.text2, marginBottom: '7px' }}>الأساليب</p>
            {scenario.methods.map((m) => (
              <p key={m.id} style={{ fontSize: '11px', color: T.text2, margin: '4px 0' }}>{m.emoji} {m.nameAr}</p>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '26px 18px 48px' }}>
        <button
          onClick={() => { if (scenario) { stopNarration(); onStart(); } }}
          disabled={!scenario}
          style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 900, borderRadius: '13px', border: 'none', cursor: scenario ? 'pointer' : 'not-allowed', background: scenario ? `linear-gradient(135deg,${T.red},#8B0000)` : T.surface2, color: '#fff', boxShadow: scenario ? '0 4px 22px rgba(192,57,43,.5)' : 'none' }}
        >
          {scenario ? '🔍 ابدأ التحقيق' : '⏳ جاري التحضير…'}
        </button>
      </div>
    </div>
  );
}

// ── Board ─────────────────────────────────────────────────────────────────────
function BoardScreen({ onExit }: { onExit: () => void }) {
  const store = useMysteryStore();
  const [showAccuse, setShowAccuse] = useState(false);
  const prevTeam = useRef<MysteryTeam>(store.activeTeam);

  const { tiles, activeTeam, scores, teamNames, accusations, showEvidenceBoard, lastRevealedClue } = store;
  const revealed = revealedCount(tiles);
  const myCanAccuse = canAccuse(tiles, activeTeam, accusations);

  // Narrate turn change
  useEffect(() => {
    if (prevTeam.current !== activeTeam) {
      prevTeam.current = activeTeam;
      narrateAr(LINES.boardStart(teamNames[activeTeam]), 'detective');
    }
  }, [activeTeam, teamNames]);

  // Narrate can-accuse threshold
  const prevRevealed = useRef(revealed);
  useEffect(() => {
    if (prevRevealed.current < 6 && revealed >= 6) narrateAr(LINES.canAccuse(), 'court');
    prevRevealed.current = revealed;
  }, [revealed]);

  const rows = (['witness', 'physical', 'document'] as const).map((row) => ({
    row, meta: ROW_META[row],
    tiles: tiles.filter((t) => t.clue.row === row).sort((a, b) => a.clue.points - b.clue.points),
  }));

  if (store.phase === 'question') {
    const tile = tiles.find((t) => t.clue.tileId === store.activeTileId);
    if (tile) return <QuestionScreen tile={tile} activeTeam={activeTeam} />;
  }

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
      {/* Crime tape */}
      <div style={{ background: `repeating-linear-gradient(45deg,${T.crimson} 0,${T.crimson} 8px,transparent 8px,transparent 16px)`, height: '4px', flexShrink: 0 }} />

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <button onClick={() => { stopNarration(); onExit(); }} style={{ background: 'none', border: 'none', color: T.text3, fontSize: '12px', cursor: 'pointer', padding: '4px 6px' }}>← خروج</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: T.text3 }}>الأدلة </span>
          <span style={{ fontSize: '15px', fontWeight: 900, color: revealed >= 6 ? T.gold : T.text }}>{revealed}</span>
          <span style={{ fontSize: '11px', color: T.text3 }}>/9</span>
          {revealed >= 6 && <span style={{ fontSize: '10px', color: T.gold, marginRight: '4px' }}> • الاتهام مفتوح</span>}
        </div>
        <button
          onClick={store.toggleEvidenceBoard}
          style={{ padding: '5px 9px', borderRadius: '8px', border: `1px solid ${showEvidenceBoard ? T.gold : T.border}`, background: showEvidenceBoard ? T.goldSoft : T.surface2, color: showEvidenceBoard ? T.gold : T.text2, fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
        >
          📋 الأدلة
        </button>
      </div>

      {/* Score strip */}
      <div style={{ display: 'flex', flexShrink: 0 }}>
        {(['alpha', 'beta'] as const).map((team) => (
          <div key={team} style={{ flex: 1, padding: '8px 0', textAlign: 'center', background: activeTeam === team ? TEAM_SOFT[team] : 'transparent', borderBottom: `2px solid ${activeTeam === team ? TEAM_COLOR[team] : 'transparent'}`, transition: 'all .25s' }}>
            <p style={{ fontSize: '10px', color: TEAM_COLOR[team], fontWeight: 700, margin: 0 }}>{teamNames[team]}</p>
            <p style={{ fontSize: '19px', fontWeight: 900, color: TEAM_COLOR[team], margin: 0 }}>{scores[team]}</p>
            {activeTeam === team && <p style={{ fontSize: '9px', color: TEAM_COLOR[team], margin: 0, opacity: .8 }}>دورك ▶</p>}
            {accusations[team] !== null && <p style={{ fontSize: '9px', color: T.text3, margin: 0 }}>❌ اتّهمت</p>}
          </div>
        ))}
      </div>

      {/* Crime board */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {rows.map(({ row, meta, tiles: rt }) => (
          <div key={row} style={{ marginBottom: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
              <span style={{ fontSize: '12px' }}>{meta.icon}</span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: meta.color, letterSpacing: '.03em' }}>{meta.labelAr}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '7px' }}>
              {rt.map((tile) => (
                <TileBtn key={tile.clue.tileId} tile={tile} rowColor={meta.color}
                  onClick={() => {
                    if (tile.revealedByTeam !== null) return;
                    store.pickTile(tile.clue.tileId);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Accuse bar */}
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.border}`, background: T.surface, flexShrink: 0 }}>
        <button
          onClick={() => { if (myCanAccuse) { narrateAr(LINES.accusing(teamNames[activeTeam]), 'court'); setShowAccuse(true); } }}
          disabled={!myCanAccuse}
          style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: 900, borderRadius: '11px', border: 'none', cursor: myCanAccuse ? 'pointer' : 'not-allowed', background: myCanAccuse ? `linear-gradient(135deg,${T.red},#8B0000)` : T.surface2, color: myCanAccuse ? '#fff' : T.text3, boxShadow: myCanAccuse ? '0 3px 16px rgba(192,57,43,.45)' : 'none', transition: 'all .3s' }}
        >
          {myCanAccuse ? '⚖️ اتّهم الآن!' : revealed < 6 ? `🔒 ${6 - revealed} أدلة متبقية للاتهام` : '⚖️ اتّهمت بالفعل'}
        </button>
      </div>

      {/* Evidence board panel */}
      {showEvidenceBoard && <EvidenceBoard />}

      {/* Clue flash */}
      {lastRevealedClue && <ClueFlash clue={lastRevealedClue} onDismiss={store.dismissClueFlash} />}

      {/* Accuse modal */}
      {showAccuse && (
        <AccuseModal
          onClose={() => setShowAccuse(false)}
          onSubmit={(acc) => {
            const correct = store.submitAccusation(acc);
            if (!correct) narrateAr(LINES.wrongAccuse(teamNames[activeTeam]), 'court');
            setShowAccuse(false);
          }}
        />
      )}
    </div>
  );
}

// ── Tile button ───────────────────────────────────────────────────────────────
function TileBtn({ tile, rowColor, onClick }: { tile: TileState; rowColor: string; onClick: () => void }) {
  const done = tile.revealedByTeam !== null;
  return (
    <button
      onClick={onClick}
      style={{
        padding: '11px 5px', borderRadius: '10px', border: `1.5px solid ${done ? TEAM_COLOR[tile.revealedByTeam!] : 'rgba(255,255,255,.09)'}`,
        background: done ? TEAM_SOFT[tile.revealedByTeam!] : T.surface,
        cursor: done ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
        minHeight: '70px', justifyContent: 'center', transition: 'all .2s',
      }}
    >
      {done ? (
        <>
          <span style={{ fontSize: '18px' }}>{tile.clue.clueEmoji}</span>
          <span style={{ fontSize: '8.5px', color: T.text2, textAlign: 'center', lineHeight: 1.3, padding: '0 3px' }}>
            {tile.clue.clueText.slice(0, 30)}{tile.clue.clueText.length > 30 ? '…' : ''}
          </span>
          <span style={{ fontSize: '8.5px', color: TEAM_COLOR[tile.revealedByTeam!], fontWeight: 700 }}>{tile.clue.points} نقطة</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: '20px', opacity: .25 }}>🔒</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: rowColor }}>{tile.clue.points}</span>
        </>
      )}
    </button>
  );
}

// ── Clue flash overlay — shown right after a correct answer ───────────────────
function ClueFlash({ clue, onDismiss }: { clue: { clueText: string; clueEmoji: string; row: string; points: number }; onDismiss: () => void }) {
  useEffect(() => {
    narrateAr(LINES.clueRevealed(clue.clueText), clue.row === 'witness' ? 'witness' : 'detective');
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rowLabel = clue.row === 'witness' ? 'شاهد عيان' : clue.row === 'physical' ? 'دليل مادي' : 'وثيقة';

  return (
    <div
      onClick={onDismiss}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '24px' }}
    >
      <div style={{ background: T.surface, border: `2px solid ${T.gold}`, borderRadius: '18px', padding: '28px 24px', maxWidth: '340px', width: '100%', textAlign: 'center', direction: 'rtl' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: T.gold, letterSpacing: '.08em', marginBottom: '12px' }}>✨ دليل جديد مكشوف — {rowLabel}</p>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '14px' }}>{clue.clueEmoji}</span>
        <p style={{ fontSize: '15px', fontWeight: 700, color: T.text, lineHeight: 1.7, margin: '0 0 16px' }}>{clue.clueText}</p>
        <p style={{ fontSize: '11px', color: T.text3 }}>اضغط في أي مكان للمتابعة</p>
      </div>
    </div>
  );
}

// ── Evidence board panel (slide-up) ───────────────────────────────────────────
function EvidenceBoard() {
  const { tiles, scenario, deductions, markDeduction } = useMysteryStore();
  if (!scenario) return null;

  const mark = (type: Parameters<typeof markDeduction>[0], id: string, cur: DeductionMark) => {
    const next: DeductionMark = cur === null ? 'suspected' : cur === 'suspected' ? 'cleared' : null;
    markDeduction(type, id, next);
  };

  const MarkBadge = ({ val }: { val: DeductionMark }) =>
    val === 'suspected' ? <span style={{ fontSize: '10px', color: T.redBright }}>🔴 مشتبه</span>
    : val === 'cleared'  ? <span style={{ fontSize: '10px', color: T.green }}>✅ بريء</span>
    : <span style={{ fontSize: '10px', color: T.text3 }}>— </span>;

  const revealedByRow = (row: 'witness' | 'physical' | 'document') =>
    tiles.filter((t) => t.clue.row === row && t.revealedByTeam !== null);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 40, display: 'flex', alignItems: 'flex-end' }} onClick={() => useMysteryStore.getState().toggleEvidenceBoard()}>
      <div
        style={{ width: '100%', background: T.surface, borderRadius: '18px 18px 0 0', padding: '18px 18px 40px', maxHeight: '85dvh', overflowY: 'auto', direction: 'rtl' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 900, margin: 0, color: T.gold }}>📋 دفتر الأدلة المشترك</h2>
          <button onClick={useMysteryStore.getState().toggleEvidenceBoard} style={{ background: T.surface2, border: 'none', color: T.text2, borderRadius: '7px', padding: '5px 9px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
        </div>
        <p style={{ fontSize: '11px', color: T.text3, marginBottom: '16px' }}>اضغط على الاسم لتصنيفه — مشتبه / بريء / بدون تصنيف</p>

        {/* Revealed clues */}
        {(['witness', 'physical', 'document'] as const).map((row) => {
          const rc = revealedByRow(row);
          if (!rc.length) return null;
          const meta = ROW_META[row];
          return (
            <div key={row} style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: meta.color, marginBottom: '6px' }}>{meta.icon} {meta.labelAr}</p>
              {rc.map((t) => (
                <div key={t.clue.tileId} style={{ padding: '8px 10px', background: T.surface2, borderRadius: '8px', marginBottom: '5px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{t.clue.clueEmoji}</span>
                  <p style={{ fontSize: '11.5px', color: T.text2, margin: 0, lineHeight: 1.6 }}>{t.clue.clueText}</p>
                </div>
              ))}
            </div>
          );
        })}

        <div style={{ height: '1px', background: T.border, margin: '16px 0' }} />

        {/* Deduction marks */}
        {[
          { label: 'المشتبه بهم', type: 'suspects' as const, items: scenario.suspects.map((s) => ({ id: s.id, name: s.nameAr, emoji: s.emoji })) },
          { label: 'الأماكن',    type: 'locations' as const, items: scenario.locations.map((l) => ({ id: l.id, name: l.nameAr, emoji: l.emoji })) },
          { label: 'الأساليب',   type: 'methods' as const,   items: scenario.methods.map((m) => ({ id: m.id, name: m.nameAr, emoji: m.emoji })) },
        ].map(({ label, type, items }) => (
          <div key={type} style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: T.text2, marginBottom: '7px' }}>{label}</p>
            {items.map((item) => {
              const cur = deductions[type][item.id] ?? null;
              return (
                <button
                  key={item.id}
                  onClick={() => mark(type, item.id, cur)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '8px 10px', borderRadius: '9px', border: `1px solid ${cur === 'suspected' ? T.redBright + '55' : cur === 'cleared' ? T.green + '44' : T.border}`,
                    background: cur === 'suspected' ? T.redSoft : cur === 'cleared' ? T.greenSoft : T.surface2,
                    marginBottom: '5px', cursor: 'pointer', textAlign: 'right',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.emoji}</span>
                  <span style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: T.text }}>{item.name}</span>
                  <MarkBadge val={cur} />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Question screen ───────────────────────────────────────────────────────────
function QuestionScreen({ tile, activeTeam }: { tile: TileState; activeTeam: MysteryTeam }) {
  const store = useMysteryStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    narrateAr(tile.question.text, 'detective');
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); store.answerTile(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (idx: number) => {
    if (locked) return;
    setSelected(idx);
    setLocked(true);
    clearInterval(timerRef.current!);
    const correct = idx === tile.question.correctIndex;
    stopNarration();
    narrateAr(correct ? LINES.rightAnswer() : LINES.wrongAnswer(), correct ? 'detective' : 'narrator');
    setTimeout(() => store.answerTile(correct), 1100);
  };

  const pct = (timeLeft / 30) * 100;
  const teamColor = TEAM_COLOR[activeTeam];

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '4px', background: T.surface2, flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: timeLeft > 10 ? teamColor : T.redBright, transition: 'width 1s linear, background .3s' }} />
      </div>

      <div style={{ padding: '13px 18px 0', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '15px' }}>{ ROW_META[tile.clue.row].icon }</span>
        <span style={{ fontSize: '11.5px', color: T.text3 }}>{ROW_META[tile.clue.row].labelAr} • {tile.clue.points} نقطة</span>
        <span style={{ marginRight: 'auto', fontSize: '14px', fontWeight: 900, color: timeLeft > 10 ? T.text2 : T.redBright }}>{timeLeft}ث</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '18px' }}>
        <div style={{ padding: '18px', background: T.surface, border: `1px solid ${T.border2}`, borderRadius: '14px', marginBottom: '18px' }}>
          <p style={{ fontSize: '16.5px', fontWeight: 700, lineHeight: 1.75, margin: 0, textAlign: 'center' }}>{tile.question.text}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {tile.question.options.map((opt, i) => {
            const isSel = selected === i;
            const isCorr = i === tile.question.correctIndex;
            let bg: string = T.surface2;
            let border: string = T.border2;
            let color: string = T.text;
            if (locked && isCorr)              { bg = T.greenSoft; border = T.green; color = T.green; }
            else if (locked && isSel && !isCorr) { bg = T.redSoft;   border = T.redBright; color = T.redBright; }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={locked}
                style={{ padding: '13px 15px', borderRadius: '11px', border: `1.5px solid ${border}`, background: bg, color, fontSize: '13.5px', fontWeight: 600, cursor: locked ? 'default' : 'pointer', textAlign: 'right', transition: 'all .2s' }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Accuse modal (surfaces all clues alongside selectors) ─────────────────────
function AccuseModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (a: { suspectId: string; locationId: string; methodId: string }) => void }) {
  const { scenario, tiles } = useMysteryStore();
  const [suspectId,  setSuspectId]  = useState('');
  const [locationId, setLocationId] = useState('');
  const [methodId,   setMethodId]   = useState('');
  if (!scenario) return null;

  const revealed = tiles.filter((t) => t.revealedByTeam !== null);
  const ready = suspectId && locationId && methodId;

  const Chips = ({ val, onChange, opts }: { val: string; onChange: (v: string) => void; opts: { id: string; nameAr: string; emoji: string }[] }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {opts.map((o) => (
        <button key={o.id} onClick={() => onChange(val === o.id ? '' : o.id)}
          style={{ padding: '6px 10px', borderRadius: '18px', border: `1.5px solid ${val === o.id ? T.redBright : T.border}`, background: val === o.id ? T.redSoft : T.surface2, color: val === o.id ? T.redBright : T.text2, fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {o.emoji} {o.nameAr}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}>
      <div style={{ width: '100%', background: T.surface, borderRadius: '18px 18px 0 0', padding: '18px 18px 36px', maxHeight: '90dvh', overflowY: 'auto', direction: 'rtl' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 900, margin: 0, color: T.redBright }}>⚖️ ورقة الاتهام</h2>
          <button onClick={onClose} style={{ background: T.surface2, border: 'none', color: T.text2, borderRadius: '7px', padding: '5px 9px', cursor: 'pointer' }}>✕</button>
        </div>
        <p style={{ fontSize: '11px', color: T.text3, marginBottom: '14px' }}>فرصة واحدة فقط — راجع الأدلة جيداً قبل الاتهام</p>

        {/* Revealed clues summary */}
        {revealed.length > 0 && (
          <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '11px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: T.gold, marginBottom: '8px' }}>الأدلة المكشوفة ({revealed.length}/9)</p>
            {revealed.map((t) => (
              <div key={t.clue.tileId} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{t.clue.clueEmoji}</span>
                <p style={{ fontSize: '11px', color: T.text2, margin: 0, lineHeight: 1.6 }}>{t.clue.clueText}</p>
              </div>
            ))}
          </div>
        )}

        {[
          { label: '🕵️ مَن الفاعل؟', val: suspectId, set: setSuspectId, opts: scenario.suspects },
          { label: '📍 أين ارتُكبت الجريمة؟', val: locationId, set: setLocationId, opts: scenario.locations },
          { label: '🔧 ما الأسلوب المستخدم؟', val: methodId, set: setMethodId, opts: scenario.methods },
        ].map(({ label, val, set, opts }) => (
          <div key={label} style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: T.text2, marginBottom: '6px' }}>{label}</p>
            <Chips val={val} onChange={set} opts={opts} />
          </div>
        ))}

        <button
          onClick={() => ready && onSubmit({ suspectId, locationId, methodId })}
          disabled={!ready}
          style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 900, borderRadius: '12px', border: 'none', cursor: ready ? 'pointer' : 'not-allowed', background: ready ? `linear-gradient(135deg,${T.red},#8B0000)` : T.surface2, color: ready ? '#fff' : T.text3, marginTop: '6px', boxShadow: ready ? '0 4px 18px rgba(192,57,43,.5)' : 'none' }}
        >
          {ready ? '⚖️ أتّهم الآن — لا رجعة!' : 'اختر الثلاثة أولاً'}
        </button>
      </div>
    </div>
  );
}

// ── Verdict ───────────────────────────────────────────────────────────────────
function VerdictScreen({ onExit, onRematch }: { onExit: () => void; onRematch: () => void }) {
  const { solution, solvedByTeam, teamNames, scores, tiles } = useMysteryStore();
  if (!solution) return null;
  const winner = solvedByTeam;

  useEffect(() => {
    const t = setTimeout(() => {
      if (winner) {
        narrateAr(LINES.verdict(solution.suspect.nameAr, solution.location.nameAr, solution.method.nameAr), 'court');
      } else {
        narrateAr(LINES.noSolve(), 'court');
      }
    }, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, direction: 'rtl', overflowY: 'auto' }}>
      <div style={{ background: `repeating-linear-gradient(45deg,${winner ? T.gold : T.crimson} 0,${winner ? T.gold : T.crimson} 8px,transparent 8px,transparent 16px)`, height: '5px' }} />

      <div style={{ padding: '28px 18px 0', textAlign: 'center' }}>
        <p style={{ fontSize: '44px', marginBottom: '8px' }}>{winner ? '🎉' : '😔'}</p>
        <h1 style={{ fontSize: '21px', fontWeight: 900, margin: 0, color: winner ? T.gold : T.redBright }}>
          {winner ? 'القضية حُلّت!' : 'لم تُحلّ القضية'}
        </h1>
        {winner && <p style={{ fontSize: '14px', color: TEAM_COLOR[winner], fontWeight: 700, margin: '6px 0 0' }}>فاز فريق {teamNames[winner]}!</p>}
      </div>

      {/* Solution */}
      <div style={{ margin: '22px 18px 0', padding: '18px', background: 'linear-gradient(135deg,rgba(233,162,60,.1),rgba(233,162,60,.05))', border: `1.5px solid ${T.gold}40`, borderRadius: '15px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: T.gold, marginBottom: '12px' }}>الحل الصحيح</p>
        {[
          { label: 'الفاعل',  val: `${solution.suspect.emoji}  ${solution.suspect.nameAr}`,  sub: solution.suspect.roleAr },
          { label: 'المكان',  val: `${solution.location.emoji}  ${solution.location.nameAr}`, sub: '' },
          { label: 'الأسلوب', val: `${solution.method.emoji}  ${solution.method.nameAr}`,    sub: '' },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '9px', padding: '10px', background: T.surface2, borderRadius: '9px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: T.text3, minWidth: '42px' }}>{row.label}</span>
            <div>
              <p style={{ fontSize: '13.5px', fontWeight: 800, color: T.text, margin: 0 }}>{row.val}</p>
              {row.sub && <p style={{ fontSize: '10px', color: T.text3, margin: 0 }}>{row.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Clues + red herring reveal */}
      <div style={{ margin: '16px 18px 0' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: T.text2, marginBottom: '8px' }}>الأدلة المكشوفة ({revealedCount(tiles)}/9)</p>
        {tiles.filter((t) => t.revealedByTeam !== null).map((t) => (
          <div key={t.clue.tileId} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '9px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '9px', marginBottom: '5px' }}>
            <span style={{ fontSize: '16px' }}>{t.clue.clueEmoji}</span>
            <p style={{ flex: 1, fontSize: '11.5px', color: T.text2, margin: 0, lineHeight: 1.6 }}>{t.clue.clueText}</p>
            {t.clue.isRedHerring && (
              <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '5px', background: T.redSoft, color: T.redBright, fontWeight: 700, flexShrink: 0 }}>تمويه</span>
            )}
          </div>
        ))}
      </div>

      {/* Scores */}
      <div style={{ margin: '16px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
        {(['alpha', 'beta'] as const).map((team) => (
          <div key={team} style={{ padding: '13px', background: TEAM_SOFT[team], border: `1px solid ${TEAM_COLOR[team]}40`, borderRadius: '11px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: TEAM_COLOR[team], fontWeight: 700, margin: 0 }}>{teamNames[team]}</p>
            <p style={{ fontSize: '24px', fontWeight: 900, color: TEAM_COLOR[team], margin: '3px 0' }}>{scores[team]}</p>
            <p style={{ fontSize: '9px', color: T.text3, margin: 0 }}>نقطة</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '9px', padding: '22px 18px 48px' }}>
        <button onClick={onRematch} style={{ flex: 1, padding: '13px', fontSize: '13.5px', fontWeight: 800, borderRadius: '11px', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${T.red},#8B0000)`, color: '#fff' }}>
          🔍 قضية جديدة
        </button>
        <button onClick={() => { stopNarration(); onExit(); }} style={{ flex: 1, padding: '13px', fontSize: '13.5px', fontWeight: 700, borderRadius: '11px', border: `1.5px solid ${T.border2}`, cursor: 'pointer', background: T.surface, color: T.text2 }}>
          🏠 الرئيسية
        </button>
      </div>
    </div>
  );
}
