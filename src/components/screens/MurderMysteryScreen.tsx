/**
 * MurderMysteryScreen — self-contained mystery game flow.
 * Phases: briefing → board → question → (accuse) → verdict.
 * Does NOT touch gameStore; manages everything via mysteryStore.
 */
import { useState, useEffect, useRef } from 'react';
import { useMysteryStore, canAccuse, revealedCount, type MysteryTeam } from '@/store/mysteryStore';
import { SCENARIOS, drawSolution, generateClues, type DrawnSolution, type Scenario } from '@/lib/mysteries';
import { questions } from '@/lib/questions';
import type { Question } from '@/lib/types';
import type { TileState } from '@/store/mysteryStore';

// ── Design tokens (matches admin dark-graphite palette) ───────────────────────
const T = {
  bg: '#0D0E10', surface: '#16171A', surface2: '#1C1E22',
  border: 'rgba(255,255,255,.08)', border2: 'rgba(255,255,255,.14)',
  text: '#EDEEF0', text2: '#A6A9AE', text3: '#6E7176',
  gold: '#E9A23C', goldSoft: 'rgba(233,162,60,.14)',
  green: '#3FB27F', greenSoft: 'rgba(63,178,127,.14)',
  red: '#E1594B', redSoft: 'rgba(225,89,75,.14)',
  blue: '#4E8FE0', blueSoft: 'rgba(78,143,224,.14)',
  alpha: '#5FA98C', alphaLight: 'rgba(95,169,140,.18)',
  beta: '#C85A34', betaLight: 'rgba(200,90,52,.18)',
} as const;

const TEAM_COLOR: Record<MysteryTeam, string> = { alpha: T.alpha, beta: T.beta };
const TEAM_SOFT:  Record<MysteryTeam, string> = { alpha: T.alphaLight, beta: T.betaLight };

// ── Question picker — pull text questions by tier from existing pool ───────────
function pickQuestion(tier: 2 | 4 | 6, exclude: Set<string>): Question {
  const pool = questions.filter(
    (q) => q.tier === tier && (!q.type || q.type === 'text') && !exclude.has(q.id)
  );
  if (pool.length === 0) {
    // fallback: any tier
    const fb = questions.filter((q) => !q.type || q.type === 'text');
    return fb[Math.floor(Math.random() * fb.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildTiles(scenario: Scenario, solution: DrawnSolution): TileState[] {
  const clues = generateClues(scenario, solution);
  const usedIds = new Set<string>();
  return clues.map((clue) => {
    const tier = (clue.points / 100) as 2 | 4 | 6;
    const q = pickQuestion(tier, usedIds);
    usedIds.add(q.id);
    return { clue, question: q, revealedByTeam: null };
  });
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  onExit: () => void;
  alphaName?: string;
  betaName?: string;
}

const ROW_META = {
  witness:  { labelAr: 'شاهد عيان',  icon: '👁️',  color: T.blue },
  physical: { labelAr: 'دليل مادي',  icon: '🔍',  color: T.gold },
  document: { labelAr: 'وثيقة سرية', icon: '📄',  color: T.green },
} as const;

// ── Main component ────────────────────────────────────────────────────────────
export function MurderMysteryScreen({ onExit, alphaName = 'البحر', betaName = 'البر' }: Props) {
  const store = useMysteryStore();
  const [chosenScenario, setChosenScenario] = useState<Scenario | null>(null);

  // Boot: pick a random scenario and init store
  useEffect(() => {
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    const solution = drawSolution(scenario);
    const tiles = buildTiles(scenario, solution);
    setChosenScenario(scenario);
    store.initMystery(scenario, solution, tiles, { alpha: alphaName, beta: betaName });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!chosenScenario || store.phase === 'briefing') {
    return (
      <BriefingScreen
        scenario={chosenScenario}
        onStart={() => store.setPhase('board')}
        onExit={onExit}
      />
    );
  }
  if (store.phase === 'verdict') return <VerdictScreen onExit={onExit} onRematch={() => {
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    const solution = drawSolution(scenario);
    const tiles = buildTiles(scenario, solution);
    setChosenScenario(scenario);
    store.initMystery(scenario, solution, tiles, { alpha: alphaName, beta: betaName });
    store.setPhase('briefing');
  }} />;
  return <BoardScreen onExit={onExit} />;
}

// ── Briefing ──────────────────────────────────────────────────────────────────
function BriefingScreen({ scenario, onStart, onExit }: { scenario: Scenario | null; onStart: () => void; onExit: () => void }) {
  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, direction: 'rtl', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
        <button onClick={onExit} style={{ background: 'none', border: 'none', color: T.text2, fontSize: '14px', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' }}>
          ← رجوع
        </button>
        <span style={{ fontSize: '13px', fontWeight: 700, color: T.gold, letterSpacing: '0.05em' }}>مَن الفاعل؟</span>
        <span style={{ width: '60px' }} />
      </div>

      {/* Case banner */}
      <div style={{ margin: '24px 20px 0', padding: '20px', background: 'linear-gradient(135deg,rgba(225,89,75,.12),rgba(233,162,60,.08))', border: `1px solid ${T.border2}`, borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px' }}>🔍</span>
          <div>
            <p style={{ fontSize: '11px', color: T.text3, fontWeight: 600, marginBottom: '2px' }}>
              {scenario ? scenario.settingAr : '…'}
            </p>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: T.text, margin: 0 }}>
              {scenario?.titleAr ?? 'جاري التحضير…'}
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: T.text2, lineHeight: 1.7, margin: 0 }}>
          {scenario?.crimeAr}
        </p>
      </div>

      {/* How to play */}
      <div style={{ margin: '16px 20px 0', padding: '14px 16px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: T.gold, marginBottom: '8px' }}>كيف تلعب؟</p>
        {[
          '🎯 أجب صح → اكشف دليلاً من لوح الجريمة',
          '🔒 اكشف 6 أدلة → يصبح بإمكانك الاتهام',
          '⚖️ حدّد الفاعل + المكان + الأسلوب وافوز بـ 1000 نقطة',
          '❌ الاتهام الخاطئ يحرمك من الاتهام مجدداً',
        ].map((s) => (
          <p key={s} style={{ fontSize: '12px', color: T.text2, margin: '4px 0' }}>{s}</p>
        ))}
      </div>

      {/* Suspects */}
      {scenario && (
        <div style={{ margin: '20px 20px 0' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: T.text2, marginBottom: '10px' }}>المشتبه بهم ({scenario.suspects.length})</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {scenario.suspects.map((s) => (
              <div key={s.id} style={{ padding: '10px 12px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{s.emoji}</span>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: T.text, margin: 0 }}>{s.nameAr}</p>
                  <p style={{ fontSize: '10px', color: T.text3, margin: 0 }}>{s.roleAr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locations */}
      {scenario && (
        <div style={{ margin: '16px 20px 0' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: T.text2, marginBottom: '10px' }}>الأماكن ({scenario.locations.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {scenario.locations.map((l) => (
              <span key={l.id} style={{ padding: '5px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '20px', fontSize: '12px', color: T.text2 }}>
                {l.emoji} {l.nameAr}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Methods */}
      {scenario && (
        <div style={{ margin: '16px 20px 0' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: T.text2, marginBottom: '10px' }}>أساليب الجريمة ({scenario.methods.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {scenario.methods.map((m) => (
              <span key={m.id} style={{ padding: '5px 10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '20px', fontSize: '12px', color: T.text2 }}>
                {m.emoji} {m.nameAr}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Start */}
      <div style={{ padding: '28px 20px 40px' }}>
        <button
          onClick={scenario ? onStart : undefined}
          disabled={!scenario}
          style={{ width: '100%', padding: '16px', fontSize: '17px', fontWeight: 900, borderRadius: '14px', border: 'none', cursor: scenario ? 'pointer' : 'not-allowed', background: scenario ? `linear-gradient(135deg,${T.gold},#c8861a)` : T.surface2, color: scenario ? '#16100B' : T.text3, boxShadow: scenario ? `0 4px 20px rgba(233,162,60,.35)` : 'none' }}
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

  const { tiles, activeTeam, scores, teamNames, accusations, scenario } = store;
  const revealed = revealedCount(tiles);
  const myCanAccuse = canAccuse(tiles, activeTeam, accusations);

  const rows = (['witness', 'physical', 'document'] as const).map((row) => ({
    row,
    meta: ROW_META[row],
    tiles: tiles.filter((t) => t.clue.row === row).sort((a, b) => a.clue.points - b.clue.points),
  }));

  if (store.phase === 'question') {
    const tile = tiles.find((t) => t.clue.tileId === store.activeTileId);
    if (tile) return <QuestionScreen tile={tile} activeTeam={activeTeam} />;
  }

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <button onClick={onExit} style={{ background: 'none', border: 'none', color: T.text3, fontSize: '13px', cursor: 'pointer', padding: '4px 8px' }}>← خروج</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: T.text3 }}>الأدلة </span>
          <span style={{ fontSize: '14px', fontWeight: 900, color: T.gold }}>{revealed}/9</span>
        </div>
        <span style={{ fontSize: '11px', color: T.text3 }}>{scenario?.titleAr.slice(0, 14)}…</span>
      </div>

      {/* Score strip */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        {(['alpha', 'beta'] as const).map((team) => (
          <div
            key={team}
            style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              background: activeTeam === team ? TEAM_SOFT[team] : 'transparent',
              borderBottom: activeTeam === team ? `2px solid ${TEAM_COLOR[team]}` : '2px solid transparent',
              transition: 'all 0.25s',
            }}
          >
            <p style={{ fontSize: '11px', color: TEAM_COLOR[team], fontWeight: 700, margin: 0 }}>{teamNames[team]}</p>
            <p style={{ fontSize: '20px', fontWeight: 900, color: TEAM_COLOR[team], margin: 0 }}>{scores[team]}</p>
            {activeTeam === team && <p style={{ fontSize: '9px', color: TEAM_COLOR[team], margin: 0, opacity: 0.8 }}>دورك ◀</p>}
            {accusations[team] !== null && <p style={{ fontSize: '9px', color: T.text3, margin: 0 }}>❌ اتّهمت</p>}
          </div>
        ))}
      </div>

      {/* Crime board */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {rows.map(({ row, meta, tiles: rowTiles }) => (
          <div key={row} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px' }}>{meta.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: meta.color }}>{meta.labelAr}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
              {rowTiles.map((tile) => (
                <TileButton
                  key={tile.clue.tileId}
                  tile={tile}
                  rowColor={meta.color}
                  isMyTurn={activeTeam === tile.revealedByTeam || tile.revealedByTeam === null}
                  isActiveTeamTurn={activeTeam !== null}
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

      {/* Accuse button */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, background: T.surface, flexShrink: 0 }}>
        <button
          onClick={() => myCanAccuse && setShowAccuse(true)}
          disabled={!myCanAccuse}
          style={{
            width: '100%', padding: '14px', fontSize: '15px', fontWeight: 900,
            borderRadius: '12px', border: 'none', cursor: myCanAccuse ? 'pointer' : 'not-allowed',
            background: myCanAccuse ? `linear-gradient(135deg,${T.red},#b83025)` : T.surface2,
            color: myCanAccuse ? '#fff' : T.text3,
            boxShadow: myCanAccuse ? '0 3px 14px rgba(225,89,75,.4)' : 'none',
          }}
        >
          {myCanAccuse ? '⚖️ اتّهم!' : revealed < 6 ? `🔒 اكشف ${6 - revealed} أدلة أخرى للاتهام` : accusations[activeTeam] ? 'استُنفد اتهامك' : '⚖️ اتّهم!'}
        </button>
      </div>

      {showAccuse && (
        <AccuseModal
          onClose={() => setShowAccuse(false)}
          onSubmit={(acc) => { store.submitAccusation(acc); setShowAccuse(false); }}
        />
      )}
    </div>
  );
}

// ── Tile button ───────────────────────────────────────────────────────────────
function TileButton({ tile, rowColor, onClick }: {
  tile: TileState;
  rowColor: string;
  isMyTurn: boolean;
  isActiveTeamTurn: boolean;
  onClick: () => void;
}) {
  const revealed = tile.revealedByTeam !== null;
  const borderColor = revealed ? TEAM_COLOR[tile.revealedByTeam!] : rowColor;

  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 6px', borderRadius: '10px', border: `1.5px solid ${revealed ? borderColor : 'rgba(255,255,255,.1)'}`,
        background: revealed ? (tile.revealedByTeam === 'alpha' ? T.alphaLight : T.betaLight) : T.surface,
        cursor: revealed ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        transition: 'all 0.2s',
        minHeight: '72px', justifyContent: 'center',
      }}
    >
      {revealed ? (
        <>
          <span style={{ fontSize: '20px' }}>{tile.clue.clueEmoji}</span>
          <span style={{ fontSize: '9px', color: T.text2, textAlign: 'center', lineHeight: 1.3 }}>
            {tile.clue.clueText.slice(0, 28)}{tile.clue.clueText.length > 28 ? '…' : ''}
          </span>
          <span style={{ fontSize: '9px', color: TEAM_COLOR[tile.revealedByTeam!], fontWeight: 700 }}>{tile.clue.points}</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: '22px', opacity: 0.3 }}>🔒</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: rowColor }}>{tile.clue.points}</span>
        </>
      )}
    </button>
  );
}

// ── Question overlay ──────────────────────────────────────────────────────────
function QuestionScreen({ tile, activeTeam }: { tile: TileState; activeTeam: MysteryTeam }) {
  const store = useMysteryStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          store.answerTile(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (idx: number) => {
    if (locked) return;
    setSelected(idx);
    setLocked(true);
    clearInterval(intervalRef.current!);
    const correct = idx === tile.question.correctIndex;
    setTimeout(() => store.answerTile(correct), 900);
  };

  const teamColor = TEAM_COLOR[activeTeam];
  const pct = (timeLeft / 30) * 100;

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
      {/* Timer bar */}
      <div style={{ height: '4px', background: T.surface2, flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: timeLeft > 10 ? teamColor : T.red, transition: 'width 1s linear, background 0.3s' }} />
      </div>

      {/* Clue hint */}
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>
          {{ witness: '👁️', physical: '🔍', document: '📄' }[tile.clue.row]}
        </span>
        <span style={{ fontSize: '12px', color: T.text3 }}>
          {ROW_META[tile.clue.row].labelAr} • {tile.clue.points} نقطة
        </span>
        <span style={{ marginRight: 'auto', fontSize: '13px', fontWeight: 800, color: timeLeft > 10 ? T.text2 : T.red }}>
          {timeLeft}ث
        </span>
      </div>

      {/* Question */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
        <div style={{ padding: '20px', background: T.surface, border: `1px solid ${T.border2}`, borderRadius: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.7, margin: 0, textAlign: 'center' }}>
            {tile.question.text}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tile.question.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === tile.question.correctIndex;
            let bg: string = T.surface2;
            let border: string = T.border2;
            let color: string = T.text;
            if (locked && isCorrect) { bg = T.greenSoft; border = T.green; color = T.green; }
            else if (locked && isSelected && !isCorrect) { bg = T.redSoft; border = T.red; color = T.red; }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={locked}
                style={{
                  padding: '14px 16px', borderRadius: '12px', border: `1.5px solid ${border}`,
                  background: bg, color, fontSize: '14px', fontWeight: 600,
                  cursor: locked ? 'default' : 'pointer', textAlign: 'right',
                  transition: 'all 0.2s',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {locked && selected === tile.question.correctIndex && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: T.greenSoft, border: `1px solid ${T.green}`, borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: T.green }}>
              ✅ إجابة صحيحة! سيُكشف دليل جديد
            </p>
          </div>
        )}
        {locked && selected !== tile.question.correctIndex && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: T.redSoft, border: `1px solid ${T.red}`, borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: T.red }}>
              ❌ خطأ! ينتقل الدور للفريق الآخر
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Accuse modal ──────────────────────────────────────────────────────────────
function AccuseModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (acc: { suspectId: string; locationId: string; methodId: string }) => void;
}) {
  const { scenario } = useMysteryStore();
  const [suspectId,  setSuspectId]  = useState('');
  const [locationId, setLocationId] = useState('');
  const [methodId,   setMethodId]   = useState('');

  if (!scenario) return null;
  const ready = suspectId && locationId && methodId;

  const sel = (val: string, onChange: (v: string) => void, label: string, options: { id: string; nameAr: string; emoji: string }[]) => (
    <div style={{ marginBottom: '14px' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, color: T.text2, marginBottom: '6px' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(val === o.id ? '' : o.id)}
            style={{
              padding: '7px 10px', borderRadius: '20px', border: `1.5px solid ${val === o.id ? T.red : T.border}`,
              background: val === o.id ? T.redSoft : T.surface2, color: val === o.id ? T.red : T.text2,
              fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            <span>{o.emoji}</span><span>{o.nameAr}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}>
      <div style={{ width: '100%', background: T.surface, borderRadius: '20px 20px 0 0', padding: '20px', maxHeight: '88dvh', overflowY: 'auto', direction: 'rtl' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 900, margin: 0, color: T.red }}>⚖️ الاتهام</h2>
          <button onClick={onClose} style={{ background: T.surface2, border: 'none', color: T.text2, borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>✕</button>
        </div>
        <p style={{ fontSize: '12px', color: T.text2, marginBottom: '16px' }}>اختر الفاعل والمكان والأسلوب بدقة — لديك فرصة واحدة فقط!</p>

        {sel(suspectId, setSuspectId, '🕵️ مَن الفاعل؟', scenario.suspects)}
        {sel(locationId, setLocationId, '📍 أين ارتُكبت الجريمة؟', scenario.locations)}
        {sel(methodId, setMethodId, '🔧 ما الأسلوب؟', scenario.methods)}

        <button
          onClick={() => ready && onSubmit({ suspectId, locationId, methodId })}
          disabled={!ready}
          style={{
            width: '100%', padding: '15px', fontSize: '16px', fontWeight: 900,
            borderRadius: '12px', border: 'none', cursor: ready ? 'pointer' : 'not-allowed',
            background: ready ? `linear-gradient(135deg,${T.red},#b83025)` : T.surface2,
            color: ready ? '#fff' : T.text3,
            marginTop: '8px',
          }}
        >
          {ready ? '⚖️ أتّهم الآن!' : 'اختر الثلاثة أولاً'}
        </button>
      </div>
    </div>
  );
}

// ── Verdict ───────────────────────────────────────────────────────────────────
function VerdictScreen({ onExit, onRematch }: { onExit: () => void; onRematch: () => void }) {
  const { solution, solvedByTeam, teamNames, scores, tiles, accusations } = useMysteryStore();
  if (!solution) return null;

  const winner = solvedByTeam;
  const bothWrong = !winner && accusations.alpha !== null && accusations.beta !== null;

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, direction: 'rtl', overflowY: 'auto', padding: '24px 20px 60px' }}>
      {/* Result banner */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <p style={{ fontSize: '40px', marginBottom: '8px' }}>{winner ? '🎉' : '😔'}</p>
        <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0, color: winner ? T.gold : T.red }}>
          {winner ? 'القضية حُلّت!' : bothWrong ? 'لم تُحلّ القضية' : 'انتهت اللعبة'}
        </h1>
        {winner && (
          <p style={{ fontSize: '15px', color: TEAM_COLOR[winner], fontWeight: 700, margin: '6px 0 0' }}>
            فاز فريق {teamNames[winner]}!
          </p>
        )}
      </div>

      {/* Solution card */}
      <div style={{ padding: '20px', background: 'linear-gradient(135deg,rgba(233,162,60,.1),rgba(233,162,60,.05))', border: `1.5px solid ${T.gold}`, borderRadius: '16px', marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: T.gold, marginBottom: '14px' }}>الحل الصحيح</p>
        {[
          { label: 'الفاعل',   val: `${solution.suspect.emoji} ${solution.suspect.nameAr}`,   sub: solution.suspect.roleAr },
          { label: 'المكان',   val: `${solution.location.emoji} ${solution.location.nameAr}`,  sub: '' },
          { label: 'الأسلوب',  val: `${solution.method.emoji} ${solution.method.nameAr}`,     sub: '' },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '10px', background: T.surface2, borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: T.text3, minWidth: '44px' }}>{row.label}</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800, color: T.text, margin: 0 }}>{row.val}</p>
              {row.sub && <p style={{ fontSize: '11px', color: T.text3, margin: 0 }}>{row.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Revealed clues + red herrings */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: T.text2, marginBottom: '10px' }}>الأدلة المكشوفة ({revealedCount(tiles)}/9)</p>
        {tiles.filter((t) => t.revealedByTeam !== null).map((tile) => (
          <div key={tile.clue.tileId} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px' }}>{tile.clue.clueEmoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', color: T.text2, margin: 0 }}>{tile.clue.clueText}</p>
            </div>
            {tile.clue.isRedHerring && (
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', background: T.redSoft, color: T.red, fontWeight: 700, flexShrink: 0 }}>تمويه</span>
            )}
          </div>
        ))}
      </div>

      {/* Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        {(['alpha', 'beta'] as const).map((team) => (
          <div key={team} style={{ padding: '14px', background: TEAM_SOFT[team], border: `1px solid ${TEAM_COLOR[team]}40`, borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: TEAM_COLOR[team], fontWeight: 700, margin: 0 }}>{teamNames[team]}</p>
            <p style={{ fontSize: '26px', fontWeight: 900, color: TEAM_COLOR[team], margin: '4px 0' }}>{scores[team]}</p>
            <p style={{ fontSize: '10px', color: T.text3, margin: 0 }}>نقطة</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onRematch} style={{ flex: 1, padding: '14px', fontSize: '14px', fontWeight: 800, borderRadius: '12px', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${T.gold},#c8861a)`, color: '#16100B' }}>
          🔍 قضية جديدة
        </button>
        <button onClick={onExit} style={{ flex: 1, padding: '14px', fontSize: '14px', fontWeight: 700, borderRadius: '12px', border: `1.5px solid ${T.border2}`, cursor: 'pointer', background: T.surface, color: T.text2 }}>
          🏠 الرئيسية
        </button>
      </div>
    </div>
  );
}
