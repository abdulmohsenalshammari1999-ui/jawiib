import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRoomStore } from '@/store/roomStore';
import { useSabotageStore } from '@/store/sabotageStore';
import { useHostMessage } from '@/hooks/useHostMessage';
import { useCategoryDraft } from '@/hooks/useCategoryDraft';
import { useQuestionFlow } from '@/hooks/useQuestionFlow';
import type { CategoryId } from '@/lib/types';
import { categories as ALL_CATS } from '@/lib/categories';
import { HomeScreen } from './HomeScreen';
import { Lobby } from './Lobby';
import { GameBoard } from './GameBoard';
import { QuestionCard } from './QuestionCard';
import { ResultOverlay } from './ResultOverlay';
import { GameOverScreen } from './GameOverScreen';
import { PaymentModal } from './PaymentModal';
import { HostBubble } from './HostBubble';
import { TeamScoreboard } from './game/TeamScoreboard';
import { SabotageControls } from './game/SabotageControls';
import { EffectToast } from './game/EffectToast';
import { ScorePopup } from './game/ScorePopup';
import { CategoryDraftScreen } from './screens/CategoryDraftScreen';

type SubView = 'lobby' | 'teams' | 'draft';

export function GameApp() {
  // ── Store slices ─────────────────────────────────────────────────────────────
  const game            = useGameStore((s) => s.game);
  const localPlayerId   = useGameStore((s) => s.localPlayerId);
  const answeredCount   = useGameStore((s) => s.answeredCount);
  const createRoom      = useGameStore((s) => s.createRoom);
  const addPlayer       = useGameStore((s) => s.addPlayer);
  const startGame       = useGameStore((s) => s.startGame);
  const selectQuestion  = useGameStore((s) => s.selectQuestion);
  const returnToBoard   = useGameStore((s) => s.returnToBoard);
  const resetGame       = useGameStore((s) => s.resetGame);
  const updateCategories = useGameStore((s) => s.updateCategories);
  const rematch         = useGameStore((s) => s.rematch);

  const mode       = useRoomStore((s) => s.mode);
  const teams      = useRoomStore((s) => s.teams);
  const setMode    = useRoomStore((s) => s.setMode);
  const initTeams  = useRoomStore((s) => s.initTeams);
  const assignTeam = useRoomStore((s) => s.assignTeam);
  const autoAssign = useRoomStore((s) => s.autoAssign);

  // Sabotage effects for question screen
  const activeEffects = useSabotageStore((s) => s.activeEffects);
  const lastResult    = useSabotageStore((s) => s.lastResult);
  const scrambles     = useSabotageStore((s) => s.scrambles);

  const hasBomb   = localPlayerId ? activeEffects.some((e) => e.type === 'bomb'   && e.targetPlayerId === localPlayerId) : false;
  const hasDouble = localPlayerId ? activeEffects.some((e) => e.type === 'double' && e.fromPlayerId   === localPlayerId) : false;
  const scrambled = localPlayerId ? scrambles[localPlayerId] : null;
  const scrambledOptions = scrambled && game?.currentQuestion
    ? Object.values(scrambled).map((idx) => game.currentQuestion!.options[idx as number])
    : null;

  // ── Hooks ────────────────────────────────────────────────────────────────────
  useHostMessage();
  const qflow = useQuestionFlow();
  const draft  = useCategoryDraft();

  // ── Local state ───────────────────────────────────────────────────────────────
  const [subView, setSubView]         = useState<SubView>('lobby');
  const [showPayment, setShowPayment] = useState(false);
  // Score popup state
  const [scorePopup, setScorePopup]   = useState<{ points: number; color?: string } | null>(null);
  const prevLastAnswer = useRef(game?.lastAnswer);

  // Reset sub-view when game starts
  useEffect(() => {
    if (game?.phase === 'board') setSubView('lobby');
  }, [game?.phase]);

  // Show score popup on answer result
  useEffect(() => {
    if (game?.lastAnswer && game.lastAnswer !== prevLastAnswer.current) {
      prevLastAnswer.current = game.lastAnswer;
      const pts = game.lastAnswer.points;
      if (pts !== 0) {
        const color = pts > 0 ? '#22C55E' : '#EF4444';
        setScorePopup({ points: pts, color });
        setTimeout(() => setScorePopup(null), 1800);
      }
    }
  }, [game?.lastAnswer]);

  // ── Callbacks ─────────────────────────────────────────────────────────────────
  const handleCreateRoom = useCallback(
    (name: string, isTrial: boolean, cats?: CategoryId[], gameMode?: 'ffa' | 'teams') => {
      const m = gameMode ?? 'ffa';
      setMode(m);
      const result = createRoom(name, isTrial, cats);
      if (m === 'teams') {
        initTeams();
        assignTeam(result.playerId, 'alpha');
      }
      return result;
    },
    [createRoom, setMode, initTeams, assignTeam]
  );

  const handleJoinRoom = useCallback(
    (name: string) => {
      const id = addPlayer(name);
      if (mode === 'teams') {
        const ct = { alpha: teams.alpha.playerIds.length, beta: teams.beta.playerIds.length };
        assignTeam(id, ct.alpha <= ct.beta ? 'alpha' : 'beta');
      }
    },
    [addPlayer, mode, teams, assignTeam]
  );

  const handlePurchase = useCallback(() => {
    setShowPayment(false);
    if (game && localPlayerId) {
      const host = game.room.players.find((p) => p.id === localPlayerId);
      if (host) { resetGame(); createRoom(host.name, false); }
    }
  }, [game, localPlayerId, resetGame, createRoom]);

  // Draft → update categories → back to lobby
  const handleDraftComplete = useCallback(() => {
    const cats = draft.selectedCategories as CategoryId[];
    if (cats.length >= 2) updateCategories(cats);
    setSubView('lobby');
  }, [draft.selectedCategories, updateCategories]);

  // ── Derived ───────────────────────────────────────────────────────────────────
  const teamData = mode === 'teams' ? {
    alpha: { ...teams.alpha, id: 'alpha' as const },
    beta:  { ...teams.beta,  id: 'beta'  as const },
  } : null;

  const localTeamId = (() => {
    if (!localPlayerId || !teamData) return null;
    if (teamData.alpha.playerIds.includes(localPlayerId)) return 'alpha' as const;
    if (teamData.beta.playerIds.includes(localPlayerId)) return 'beta'  as const;
    return null;
  })();

  const activeTeamColor = localTeamId === 'alpha' ? '#3B82F6' : localTeamId === 'beta' ? '#EF4444' : null;

  // ── Winner team (for finished phase) ──────────────────────────────────────────
  const winnerTeamData = (() => {
    if (!game || mode !== 'teams' || !teamData) return null;
    const alphaScore = game.room.players.filter((p) => teamData.alpha.playerIds.includes(p.id)).reduce((s, p) => s + p.score, 0);
    const betaScore  = game.room.players.filter((p) => teamData.beta.playerIds.includes(p.id)).reduce((s, p) => s + p.score, 0);
    return {
      alpha: { ...teamData.alpha, score: alphaScore },
      beta:  { ...teamData.beta,  score: betaScore  },
    };
  })();

  // ── Guard ─────────────────────────────────────────────────────────────────────
  if (!game) {
    return (
      <HomeScreen
        onCreateRoom={(name, isTrial, cats, gm) => handleCreateRoom(name, isTrial, cats, gm)}
        onJoinRoom={(name) => handleJoinRoom(name)}
      />
    );
  }

  if (showPayment) {
    return (
      <>
        <div className="min-h-screen bg-jawwib-bg" />
        <PaymentModal onClose={() => setShowPayment(false)} onPurchase={handlePurchase} />
      </>
    );
  }

  // ── Phase: finished ───────────────────────────────────────────────────────────
  if (game.phase === 'finished') {
    return (
      <GameOverScreen
        players={game.room.players}
        hostMessage={game.hostMessage}
        onPlayAgain={rematch}
        teams={winnerTeamData}
        mode={mode}
      />
    );
  }

  // ── Phase: lobby ──────────────────────────────────────────────────────────────
  if (game.phase === 'lobby') {
    const qrUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/join/${game.room.code}`
      : `https://jawwib.netlify.app/join/${game.room.code}`;
    const isHost = game.room.hostId === localPlayerId;

    // Sub-view: team assignment
    if (subView === 'teams' && mode === 'teams') {
      return (
        <div className="min-h-screen p-4">
          <HostBubble message={game.hostMessage} compact />
          <div className="max-w-md mx-auto mt-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setSubView('lobby')} className="text-jawwib-text-dim text-sm hover:text-jawwib-text transition-colors">← رجوع</button>
              <h2 className="text-lg font-bold text-gold-gradient">توزيع الفرق</h2>
              <div />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {(['alpha', 'beta'] as const).map((tid) => {
                const t = teams[tid];
                const tc = tid === 'alpha';
                return (
                  <div key={tid} className={`game-card p-3 border ${tc ? 'border-blue-500/40 bg-blue-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
                    <p className={`font-bold text-sm mb-2 ${tc ? 'text-blue-400' : 'text-red-400'}`}>{tc ? '🛡️' : '⚔️'} {t.name}</p>
                    <div className="space-y-1.5 min-h-[40px]">
                      {t.playerIds.map((pid) => {
                        const p = game.room.players.find((pl) => pl.id === pid);
                        if (!p) return null;
                        return (
                          <div key={pid} className="flex items-center gap-2 bg-jawwib-surface/50 rounded-lg px-2 py-1">
                            <span>{p.avatar}</span>
                            <span className="text-xs font-bold truncate flex-1">{p.name}</span>
                            {pid === localPlayerId && <span className="text-[10px] text-jawwib-gold">أنت</span>}
                          </div>
                        );
                      })}
                    </div>
                    {localPlayerId && !t.playerIds.includes(localPlayerId) && (
                      <button onClick={() => assignTeam(localPlayerId, tid)} className={`mt-2 w-full text-xs py-1.5 rounded-lg border ${tc ? 'border-blue-500/40 text-blue-400 hover:bg-blue-500/20' : 'border-red-500/40 text-red-400 hover:bg-red-500/20'} transition-all`}>
                        انضم لهذا الفريق
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Unassigned */}
            {game.room.players.filter((p) => !teams.alpha.playerIds.includes(p.id) && !teams.beta.playerIds.includes(p.id)).length > 0 && (
              <div className="game-card p-3 mb-4">
                <p className="text-jawwib-text-dim text-xs mb-2">بدون فريق بعد</p>
                <div className="flex flex-wrap gap-2">
                  {game.room.players
                    .filter((p) => !teams.alpha.playerIds.includes(p.id) && !teams.beta.playerIds.includes(p.id))
                    .map((p) => (
                      <div key={p.id} className="flex items-center gap-1 bg-jawwib-surface px-2 py-1 rounded-lg">
                        <span>{p.avatar}</span>
                        <span className="text-xs">{p.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {isHost && (
                <button
                  onClick={() => {
                    game.room.players
                      .filter((p) => !teams.alpha.playerIds.includes(p.id) && !teams.beta.playerIds.includes(p.id))
                      .forEach((p) => autoAssign(p.id));
                  }}
                  className="w-full py-2.5 rounded-xl border border-jawwib-border text-sm text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
                >
                  توزيع تلقائي عشوائي
                </button>
              )}
              <button onClick={() => setSubView('lobby')} className="btn-gold w-full">تأكيد الفرق ✓</button>
            </div>
          </div>
        </div>
      );
    }

    // Sub-view: category draft
    if (subView === 'draft' && !game.room.isTrial) {
      return (
        <div className="min-h-screen p-4">
          <HostBubble message={game.hostMessage} compact />
          <div className="max-w-xl mx-auto mt-4">
            {draft.draft === null ? (
              // Not started yet
              <div className="text-center py-12">
                <p className="text-jawwib-text-dim mb-4 text-sm">
                  {mode === 'teams' ? 'كل فريق يختار فئاته بالتناوب (snake draft)' : 'اختر الفئات التي تريدها'}
                </p>
                {isHost ? (
                  <button onClick={() => draft.startDraft(mode === 'teams' ? 3 : 6)} className="btn-gold px-8 py-3">
                    ابدأ الـ Draft 🎯
                  </button>
                ) : (
                  <p className="text-jawwib-text-dim text-sm">بانتظار المضيف لبدء الـ Draft...</p>
                )}
                <button onClick={() => setSubView('lobby')} className="mt-4 block mx-auto text-jawwib-text-dim text-sm hover:text-jawwib-text transition-colors">
                  ← رجوع
                </button>
              </div>
            ) : (
              <CategoryDraftScreen
                draftState={{
                  picks: draft.draft.picks.map((p) => ({ teamId: p.teamId, categoryId: p.categoryId })),
                  currentTeam: draft.draft.currentTeam,
                  round: draft.draft.round,
                  complete: draft.draft.isComplete,
                  alphaCategories: draft.alphaCategories,
                  betaCategories: draft.betaCategories,
                }}
                localTeamId={localTeamId}
                isHost={isHost}
                availableCategories={ALL_CATS.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color }))}
                onPick={(catId) => draft.pick(catId as CategoryId)}
                onSkipDraft={() => { draft.skipDraft(); handleDraftComplete(); }}
                onStartGame={() => { handleDraftComplete(); startGame(); }}
              />
            )}
          </div>
        </div>
      );
    }

    // Main lobby
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-black text-gold-gradient">جاوب</h1>
        </div>
        <HostBubble message={game.hostMessage} />
        <Lobby
          roomCode={game.room.code}
          players={game.room.players}
          isTrial={game.room.isTrial}
          selectedCategories={game.room.categories}
          onStartGame={startGame}
          onShowPayment={() => setShowPayment(true)}
          onShowTeams={mode === 'teams' ? () => setSubView('teams') : undefined}
          onShowDraft={() => setSubView('draft')}
          isHost={isHost}
          qrUrl={qrUrl}
          mode={mode}
        />
      </div>
    );
  }

  // ── Phase: question ───────────────────────────────────────────────────────────
  if (game.phase === 'question' && game.currentQuestion) {
    const ap = game.activePlayer ? game.room.players.find((p) => p.id === game.activePlayer) : null;
    const apTeamColor = ap && teamData
      ? teamData.alpha.playerIds.includes(ap.id) ? '#3B82F6' : '#EF4444'
      : null;

    return (
      <div className="min-h-screen p-4 flex flex-col gap-3">
        <HostBubble message={game.hostMessage} compact />

        {ap && (
          <div
            className="flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-bold"
            style={{
              borderColor: apTeamColor ? `${apTeamColor}50` : '#D4A01740',
              background:  apTeamColor ? `${apTeamColor}0D` : 'transparent',
              color:       apTeamColor ?? '#D4A017',
            }}
          >
            <span>{ap.avatar}</span>
            <span>دور {ap.name}</span>
            {!qflow.isMyTurn && (
              <span className="text-jawwib-text-dim text-xs font-normal">(شاهد)</span>
            )}
          </div>
        )}

        <div className="flex-1 flex items-center justify-center">
          <QuestionCard
            question={game.currentQuestion}
            timer={game.timer}
            maxTimer={15}
            onAnswer={(idx) => {
              if (!qflow.canAnswer && qflow.isMyTurn) return; // guard during spectate
              if (localPlayerId) useGameStore.getState().answerQuestion(localPlayerId, idx);
            }}
            disabled={!qflow.canAnswer}
            hasBomb={hasBomb}
            hasDouble={hasDouble}
            scrambledOptions={scrambledOptions}
          />
        </div>

        <EffectToast lastResult={lastResult} />
      </div>
    );
  }

  // ── Phase: result ─────────────────────────────────────────────────────────────
  if (game.phase === 'result' && game.lastAnswer && game.currentQuestion) {
    const respPlayer = game.room.players.find((p) => p.id === game.lastAnswer?.playerId);
    const tColor = respPlayer && teamData
      ? teamData.alpha.playerIds.includes(respPlayer.id) ? '#3B82F6' : '#EF4444'
      : null;
    return (
      <>
        {scorePopup && <ScorePopup points={scorePopup.points} color={scorePopup.color} />}
        <div className="min-h-screen p-4 bg-jawwib-bg" />
        <ResultOverlay
          lastAnswer={game.lastAnswer}
          currentQuestion={game.currentQuestion}
          hostMessage={game.hostMessage}
          onContinue={returnToBoard}
          playerName={respPlayer?.name}
          teamColor={tColor ?? undefined}
        />
      </>
    );
  }

  // ── Phase: board ──────────────────────────────────────────────────────────────
  const opponents = game.room.players.filter((p) => p.id !== localPlayerId);
  const ap = game.activePlayer ? game.room.players.find((p) => p.id === game.activePlayer) : null;
  const apTeamColor = ap && teamData
    ? teamData.alpha.playerIds.includes(ap.id) ? '#3B82F6' : '#EF4444'
    : null;

  return (
    <div className="min-h-screen p-4">
      {scorePopup && <ScorePopup points={scorePopup.points} color={scorePopup.color} />}

      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-black text-gold-gradient">جاوب</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-jawwib-text-dim">كود:</span>
          <span className="text-sm font-bold text-jawwib-gold tracking-wider">{game.room.code}</span>
        </div>
      </div>

      <HostBubble message={game.hostMessage} compact />

      {ap && (
        <div
          className="mb-3 px-4 py-2 rounded-xl text-center text-sm border transition-all"
          style={{
            borderColor: apTeamColor ? `${apTeamColor}40` : '#D4A01730',
            background:  apTeamColor ? `${apTeamColor}0D` : '#D4A01708',
          }}
        >
          <span className="text-jawwib-text-dim">دور: </span>
          <span className="font-bold" style={{ color: apTeamColor ?? '#D4A017' }}>
            {ap.avatar} {ap.name}
          </span>
        </div>
      )}

      <div className="mb-4 overflow-x-auto">
        <GameBoard
          board={game.board}
          categories={game.room.categories}
          onSelectQuestion={selectQuestion}
          isTrial={game.room.isTrial}
          answeredCount={answeredCount}
          activeTeamColor={activeTeamColor}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <TeamScoreboard
          players={game.room.players}
          teams={teamData}
          activePlayerId={game.activePlayer}
          mode={mode}
        />
        {!game.room.isTrial && localPlayerId && opponents.length > 0 && (
          <SabotageControls
            localPlayerId={localPlayerId}
            opponents={opponents}
            phase={game.phase}
          />
        )}
      </div>

      {game.room.isTrial && answeredCount >= 6 && (
        <div className="mt-4 p-4 rounded-xl bg-jawwib-gold/10 border border-jawwib-gold/30 text-center">
          <p className="text-jawwib-gold font-bold mb-2">🔓 عجبتك؟ افتح النسخة الكاملة</p>
          <button onClick={() => setShowPayment(true)} className="btn-gold text-sm px-6 py-2">ترقية 4 د.ك</button>
        </div>
      )}
    </div>
  );
}
