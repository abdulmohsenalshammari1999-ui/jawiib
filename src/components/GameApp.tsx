import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRoomStore } from '@/store/roomStore';
import { useSabotageStore } from '@/store/sabotageStore';
import { useUIStore } from '@/store/uiStore';
import { useHostMessage } from '@/hooks/useHostMessage';
import { useCategoryDraft } from '@/hooks/useCategoryDraft';
import { useQuestionFlow } from '@/hooks/useQuestionFlow';
import { audio } from '@/lib/audio';
import { globalPool } from '@/engine/questionPool';
import { initCsvContent } from '@/lib/contentRegistry';
import { applySeasonalBodyClass } from '@/lib/appConfig';
import type { CategoryId, TeamId } from '@/lib/types';
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
import { TeamSetupScreen } from './TeamSetupScreen';
import { FeedbackModal } from './FeedbackModal';
import type { GameContext } from './FeedbackModal';
import { EntryScreen } from './EntryScreen';
import { GameLoadingScreen } from './GameLoadingScreen';
import { MysteryBoxOverlay } from './game/MysteryBoxOverlay';
import { TeamWeaponInventory } from './game/TeamWeaponInventory';

type SubView = 'setup' | 'lobby' | 'teams' | 'draft';

export function GameApp() {
  // ── Store slices ──────────────────────────────────────────────────────────────
  const game             = useGameStore((s) => s.game);
  const localPlayerId    = useGameStore((s) => s.localPlayerId);
  const answeredCount    = useGameStore((s) => s.answeredCount);
  const createRoom       = useGameStore((s) => s.createRoom);
  const addPlayer        = useGameStore((s) => s.addPlayer);
  const startGame        = useGameStore((s) => s.startGame);
  const selectQuestion   = useGameStore((s) => s.selectQuestion);
  const answerQuestion   = useGameStore((s) => s.answerQuestion);
  const returnToBoard    = useGameStore((s) => s.returnToBoard);
  const resetGame        = useGameStore((s) => s.resetGame);
  const updateCategories = useGameStore((s) => s.updateCategories);
  const rematch          = useGameStore((s) => s.rematch);

  const setTeamMembership    = useGameStore((s) => s.setTeamMembership);
  const dismissPendingWeapon = useGameStore((s) => s.dismissPendingWeapon);
  const activateLastStand    = useGameStore((s) => s.activateLastStand);
  const activateWeaponFromBox = useGameStore((s) => s.activateWeaponFromBox);
  const skipSteal            = useGameStore((s) => s.skipSteal);

  const mode        = useRoomStore((s) => s.mode);
  const teams       = useRoomStore((s) => s.teams);
  const setMode     = useRoomStore((s) => s.setMode);
  const initTeams   = useRoomStore((s) => s.initTeams);
  const renameTeam  = useRoomStore((s) => s.renameTeam);
  const assignTeam  = useRoomStore((s) => s.assignTeam);
  const autoAssign  = useRoomStore((s) => s.autoAssign);

  const activeEffects = useSabotageStore((s) => s.activeEffects);
  const lastResult    = useSabotageStore((s) => s.lastResult);
  const scrambles     = useSabotageStore((s) => s.scrambles);

  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const musicEnabled = useUIStore((s) => s.musicEnabled);
  const toggleSound  = useUIStore((s) => s.toggleSound);
  const toggleMusic  = useUIStore((s) => s.toggleMusic);

  const hasBomb   = localPlayerId ? activeEffects.some((e) => e.type === 'bomb'   && e.targetPlayerId === localPlayerId) : false;
  const hasDouble = localPlayerId ? activeEffects.some((e) => e.type === 'double' && e.fromPlayerId   === localPlayerId) : false;
  const scrambled = localPlayerId ? scrambles[localPlayerId] : null;
  const scrambledOptions = scrambled && game?.currentQuestion
    ? Object.values(scrambled).map((idx) => game.currentQuestion!.options[idx as number])
    : null;

  // ── Hooks ─────────────────────────────────────────────────────────────────────
  useHostMessage();
  const qflow = useQuestionFlow();
  const draft  = useCategoryDraft();

  // ── Local state ───────────────────────────────────────────────────────────────
  const [subView, setSubView]           = useState<SubView>('lobby');
  const [showPayment, setShowPayment]   = useState(false);
  const [showIntro, setShowIntro]       = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [picksPerTeam, setPicksPerTeam] = useState(3);
  const [showEntry, setShowEntry]       = useState(true);
  const [scorePopup, setScorePopup]   = useState<{ points: number; color?: string } | null>(null);
  const [crowdVotes, setCrowdVotes]   = useState<{ correct: number; wrong: number }>({ correct: 0, wrong: 0 });
  const prevLastAnswer    = useRef(game?.lastAnswer);
  const prevPhase         = useRef(game?.phase);
  const prevTimer         = useRef(game?.timer ?? 0);
  const prevActiveTeamId  = useRef(game?.activeTeamId);

  // Load CSV questions + apply seasonal theme
  useEffect(() => {
    initCsvContent().catch(() => {});
    applySeasonalBodyClass();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset crowd votes on each new question
  useEffect(() => {
    if (game?.phase === 'question') setCrowdVotes({ correct: 0, wrong: 0 });
  }, [game?.currentQuestion?.id, game?.phase]);

  // Steal phase audio cue
  useEffect(() => {
    if (game?.phase === 'steal') audio.playStealPhase();
  }, [game?.phase]);

  // Reset sub-view when game starts
  useEffect(() => {
    if (game?.phase === 'board') setSubView('lobby');
  }, [game?.phase]);

  // Auto-start draft when entering draft subView
  useEffect(() => {
    if (subView === 'draft' && mode === 'teams' && draft.draft === null) {
      draft.startDraft(picksPerTeam);
    }
  }, [subView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Score popup + audio on answer result
  useEffect(() => {
    if (game?.lastAnswer && game.lastAnswer !== prevLastAnswer.current) {
      prevLastAnswer.current = game.lastAnswer;
      const pts = game.lastAnswer.points;
      if (pts !== 0) {
        const color = pts > 0 ? '#22C55E' : '#EF4444';
        setScorePopup({ points: pts, color });
        setTimeout(() => setScorePopup(null), 1800);
      }
      if (game.lastAnswer.correct) {
        audio.playCorrect();
        if (Math.abs(pts) >= 400) setTimeout(() => audio.playScore(true), 300);
        else audio.playScore(false);
      } else {
        audio.playWrong();
      }
    }
  }, [game?.lastAnswer]);

  // Timer ticking audio
  useEffect(() => {
    const t = game?.timer ?? 0;
    if ((game?.phase === 'question' || game?.phase === 'steal') && t < prevTimer.current && t > 0) {
      if (t <= 5) audio.playFinalTick();
      else if (t <= 9) audio.playTick();
    }
    prevTimer.current = t;
  }, [game?.timer, game?.phase]);

  // Winner fanfare + persist seen questions
  useEffect(() => {
    if (game?.phase === 'finished' && prevPhase.current !== 'finished') {
      setTimeout(() => audio.playWinner(), 400);
      // Persist drawn question IDs to localStorage so they're deprioritised next session
      globalPool.persistAndReset();
    }
    prevPhase.current = game?.phase;
  }, [game?.phase]);

  // Turn-change sound (only fires on actual team switch, not initial mount)
  useEffect(() => {
    const prev = prevActiveTeamId.current;
    if (prev && game?.activeTeamId && prev !== game.activeTeamId && game.phase === 'board') {
      audio.playTurnChange();
    }
    prevActiveTeamId.current = game?.activeTeamId;
  }, [game?.activeTeamId]);

  // ── Callbacks ─────────────────────────────────────────────────────────────────
  const handleCreateRoom = useCallback(
    (name: string, isTrial: boolean, cats?: CategoryId[], gameMode?: 'ffa' | 'teams') => {
      const m = gameMode ?? 'teams';
      setMode(m);
      const result = createRoom(name, isTrial, cats);
      if (m === 'teams') {
        initTeams();
        assignTeam(result.playerId, 'alpha');
        setSubView('setup');
      }
      return result;
    },
    [createRoom, setMode, initTeams, assignTeam]
  );

  const handleJoinRoom = useCallback(
    (name: string, _code?: string) => {
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

  const handleDraftComplete = useCallback(() => {
    const cats = draft.selectedCategories as CategoryId[];
    if (cats.length >= 2) updateCategories(cats);
    setSubView('lobby');
  }, [draft.selectedCategories, updateCategories]);

  const handleStartGame = useCallback(() => {
    setShowIntro(true);
  }, []);

  const handleIntroDone = useCallback(() => {
    setShowIntro(false);
    if (mode === 'teams') {
      setTeamMembership(teams.alpha.playerIds, teams.beta.playerIds);
    }
    startGame();
  }, [startGame, mode, teams, setTeamMembership]);

  const handleSelectQuestion = useCallback(
    (qid: string) => {
      audio.playTick();
      selectQuestion(qid);
    },
    [selectQuestion]
  );

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

  const activeTeamColor = mode === 'teams' && game?.activeTeamId
    ? game.activeTeamId === 'alpha' ? '#1D4ED8' : '#B91C1C'
    : localTeamId === 'alpha' ? '#1D4ED8' : localTeamId === 'beta' ? '#B91C1C' : null;

  const winnerTeamData = (() => {
    if (!game || mode !== 'teams' || !teamData) return null;
    const alphaScore = game.teamScores?.alpha
      ?? game.room.players.filter((p) => teamData.alpha.playerIds.includes(p.id)).reduce((s, p) => s + p.score, 0);
    const betaScore  = game.teamScores?.beta
      ?? game.room.players.filter((p) => teamData.beta.playerIds.includes(p.id)).reduce((s, p) => s + p.score, 0);
    return {
      alpha: { ...teamData.alpha, score: alphaScore },
      beta:  { ...teamData.beta,  score: betaScore  },
    };
  })();

  // ── Mystery Box overlay (mounted over result / board phases) ─────────────────
  const MysteryBox = game?.pendingWeapon && mode === 'teams' ? (
    <MysteryBoxOverlay
      teamId={game.pendingWeapon.teamId}
      teamName={teams[game.pendingWeapon.teamId]?.name ?? ''}
      teamColor={game.pendingWeapon.teamId === 'alpha' ? '#1D4ED8' : '#B91C1C'}
      teamEmoji={(teams[game.pendingWeapon.teamId] as any)?.emoji}
      weapon={game.pendingWeapon.weapon}
      onCollect={dismissPendingWeapon}
      onActivate={(w) => activateWeaponFromBox(game.pendingWeapon!.teamId, w)}
    />
  ) : null;

  // ── Entry screen ──────────────────────────────────────────────────────────────
  if (showEntry) {
    return (
      <EntryScreen
        onEnter={() => setShowEntry(false)}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        onToggleSound={toggleSound}
        onToggleMusic={toggleMusic}
      />
    );
  }

  // ── Game loading (countdown) overlay ─────────────────────────────────────────
  if (showIntro) {
    return (
      <GameLoadingScreen
        onDone={handleIntroDone}
        alphaTeam={mode === 'teams' ? { name: teams.alpha.name, color: '#1A5FA8', emoji: teams.alpha.emoji ?? '🔵' } : null}
        betaTeam={mode === 'teams' ? { name: teams.beta.name,  color: '#B82118', emoji: teams.beta.emoji  ?? '🔴' } : null}
        selectedCategories={(game?.room.categories ?? []) as CategoryId[]}
        hostMessage={game?.hostMessage ?? ''}
        mode={mode}
      />
    );
  }

  // ── Sound/Music toggle bar ────────────────────────────────────────────────────
  const AudioControls = () => (
    <div className="flex items-center gap-1">
      <button
        onClick={toggleSound}
        className={`text-sm px-2 py-1 rounded-lg border transition-all ${
          soundEnabled
            ? 'border-jawwib-gold/40 text-jawwib-gold bg-jawwib-gold/8'
            : 'border-jawwib-border text-jawwib-text-dim opacity-50'
        }`}
        title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
      <button
        onClick={toggleMusic}
        className={`text-sm px-2 py-1 rounded-lg border transition-all ${
          musicEnabled
            ? 'border-jawwib-gold/40 text-jawwib-gold bg-jawwib-gold/8'
            : 'border-jawwib-border text-jawwib-text-dim opacity-50'
        }`}
        title={musicEnabled ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
      >
        {musicEnabled ? '🎵' : '🔕'}
      </button>
    </div>
  );

  // ── Guard: no game ────────────────────────────────────────────────────────────
  if (!game) {
    return (
      <HomeScreen
        onCreateRoom={(name, isTrial, cats, gm) => handleCreateRoom(name, isTrial, cats, gm)}
        onJoinRoom={(name, code) => handleJoinRoom(name, code)}
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

  const isHostPlayer = game.room.hostId === localPlayerId;

  // ── Phase: finished ───────────────────────────────────────────────────────────
  if (game.phase === 'finished') {
    const finishedCtx: GameContext = {
      mode,
      isTrial: game.room.isTrial,
      alphaTeamName: teamData?.alpha.name,
      betaTeamName: teamData?.beta.name,
      alphaScore: winnerTeamData?.alpha.score,
      betaScore: winnerTeamData?.beta.score,
      questionsAnswered: game.room.answeredQuestions.length,
      categoriesPlayed: game.room.categories as string[],
    };
    return (
      <>
        <GameOverScreen
          players={game.room.players}
          hostMessage={game.hostMessage}
          onPlayAgain={rematch}
          onNewGame={resetGame}
          teams={winnerTeamData}
          mode={mode}
          onRateMatch={() => setShowFeedback(true)}
        />
        {showFeedback && (
          <FeedbackModal
            onClose={() => setShowFeedback(false)}
            gameContext={finishedCtx}
          />
        )}
      </>
    );
  }

  // ── Phase: lobby ──────────────────────────────────────────────────────────────
  if (game.phase === 'lobby') {
    const qrUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/join/${game.room.code}`
      : `https://jawwib.netlify.app/join/${game.room.code}`;
    const isHost = game.room.hostId === localPlayerId;

    // Team naming step (teams mode only)
    if (subView === 'setup' && mode === 'teams') {
      return (
        <TeamSetupScreen
          alphaName={teams.alpha.name}
          betaName={teams.beta.name}
          onConfirm={(a, b, picks) => {
            renameTeam('alpha', a);
            renameTeam('beta', b);
            setPicksPerTeam(picks);
            setSubView('draft');
          }}
        />
      );
    }

    if (subView === 'teams' && mode === 'teams') {
      return (
        <div className="min-h-screen p-4">
          <HostBubble message={game.hostMessage} compact />
          <div className="max-w-md mx-auto mt-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setSubView('lobby')} className="text-jawwib-text-dim text-sm hover:text-jawwib-text transition-colors">← رجوع</button>
              <h2 className="text-lg font-bold text-gold-gradient">توزيع الفرق</h2>
              <AudioControls />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {(['alpha', 'beta'] as const).map((tid) => {
                const t = teams[tid];
                const isBlue = tid === 'alpha';
                return (
                  <div key={tid} className={`game-card p-3 border-2 ${isBlue ? 'border-jawwib-blue/30 bg-blue-50/50' : 'border-jawwib-red/30 bg-red-50/50'}`}>
                    <p className={`font-bold text-sm mb-2 ${isBlue ? 'text-jawwib-blue' : 'text-jawwib-red'}`}>
                      {(t as any).emoji ?? (isBlue ? '🔵' : '🔴')} {t.name}
                    </p>
                    <div className="space-y-1.5 min-h-[40px]">
                      {t.playerIds.map((pid) => {
                        const p = game.room.players.find((pl) => pl.id === pid);
                        if (!p) return null;
                        return (
                          <div key={pid} className="flex items-center gap-2 bg-white/60 rounded-lg px-2 py-1">
                            <span>{p.avatar}</span>
                            <span className="text-xs font-bold truncate flex-1">{p.name}</span>
                            {pid === localPlayerId && <span className="text-[10px] text-jawwib-gold">أنت</span>}
                          </div>
                        );
                      })}
                    </div>
                    {localPlayerId && !t.playerIds.includes(localPlayerId) && (
                      <button
                        onClick={() => assignTeam(localPlayerId, tid)}
                        className={`mt-2 w-full text-xs py-1.5 rounded-lg border transition-all ${
                          isBlue ? 'border-jawwib-blue/40 text-jawwib-blue hover:bg-blue-100' : 'border-jawwib-red/40 text-jawwib-red hover:bg-red-100'
                        }`}
                      >
                        انضم لهذا الفريق
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

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

    if (subView === 'draft' && !game.room.isTrial) {
      if (draft.draft === null) {
        return (
          <div className="min-h-screen bg-diwaniya flex items-center justify-center">
            <p className="text-jawwib-text-dim text-sm animate-pulse-gold">جاري التحميل...</p>
          </div>
        );
      }
      return (
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
          requiredPerTeam={picksPerTeam}
          alphaTeamName={teams.alpha.name}
          betaTeamName={teams.beta.name}
          onPick={(catId) => draft.pick(catId as CategoryId)}
          onSkipDraft={() => {
            const cats = draft.skipDraft();
            if (cats.length >= 2) updateCategories(cats as CategoryId[]);
            setSubView('lobby');
          }}
          onStartGame={() => { handleDraftComplete(); handleStartGame(); }}
        />
      );
    }

    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-black text-gold-gradient">جاوب</h1>
          <AudioControls />
        </div>
        <HostBubble message={game.hostMessage} />
        <Lobby
          roomCode={game.room.code}
          players={game.room.players}
          isTrial={game.room.isTrial}
          selectedCategories={game.room.categories}
          onStartGame={handleStartGame}
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

  // ── Phase: question / steal ───────────────────────────────────────────────────
  if ((game.phase === 'question' || game.phase === 'steal') && game.currentQuestion) {
    const isSteal   = game.phase === 'steal';
    const stealTeam = isSteal && game.stealOpponentTeamId;

    // In steal phase, the "active player" is whichever local player belongs to the steal team
    const ap = isSteal
      ? (game.stealOpponentTeamId && game.teamMembership
          ? game.room.players.find((p) => game.teamMembership![game.stealOpponentTeamId!]?.includes(p.id))
          : null)
      : game.activePlayer ? game.room.players.find((p) => p.id === game.activePlayer) : null;

    const apTeamId = isSteal
      ? game.stealOpponentTeamId
      : game.activeTeamId ?? (ap && teamData
          ? teamData.alpha.playerIds.includes(ap.id) ? 'alpha' : 'beta'
          : null);
    const apTeamColor = apTeamId === 'alpha' ? '#1D4ED8' : apTeamId === 'beta' ? '#B91C1C' : null;

    const totalCells = game.board.reduce((a, r) => a + r.length, 0);
    const isFinalQ   = !isSteal && (game.room.isTrial
      ? game.room.answeredQuestions.length >= 8
      : answeredCount >= totalCells - 1);

    // In steal phase, any player on the device can answer — the store attributes
    // points to the correct steal-team player automatically (single-device model).
    const canAnswer = isSteal ? (localPlayerId != null) : qflow.canAnswer;

    const stealTeamName = stealTeam === 'alpha' ? (teamData?.alpha.name ?? 'الفريق الأزرق') : (teamData?.beta.name ?? 'الفريق الأحمر');
    const stealEmoji    = stealTeam === 'alpha' ? (teamData?.alpha.emoji ?? '🔵') : (teamData?.beta.emoji ?? '🔴');

    return (
      <div className="min-h-screen p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <HostBubble message={game.hostMessage} compact />
          <AudioControls />
        </div>

        {/* Phase indicator */}
        {isSteal ? (
          <div className="text-center animate-bounce-in">
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
            >
              🏴‍☠️ فرصة سرقة — {stealEmoji} {stealTeamName}
            </span>
          </div>
        ) : isFinalQ ? (
          <div className="text-center animate-final-flare">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg,#B07D1A,#D4A94A)' }}>
              ⚡ السؤال الأخير!
            </span>
          </div>
        ) : null}

        {ap && (
          <div
            className="flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-bold"
            style={{
              borderColor: apTeamColor ? `${apTeamColor}40` : '#C8880A30',
              background:  apTeamColor ? `${apTeamColor}0A` : 'transparent',
              color:       apTeamColor ?? '#C8880A',
            }}
          >
            <span>{ap.avatar}</span>
            <span>{isSteal ? `سرقة: ${ap.name}` : `دور ${ap.name}`}</span>
            {!canAnswer && (
              <span className="text-jawwib-text-dim text-xs font-normal">(شاهد)</span>
            )}
          </div>
        )}

        <div className="flex-1 flex items-center justify-center">
          <QuestionCard
            question={game.currentQuestion}
            timer={game.timer}
            maxTimer={30}
            onAnswer={(idx) => {
              if (!canAnswer) return;
              if (localPlayerId) answerQuestion(localPlayerId, idx);
            }}
            disabled={!canAnswer}
            hasBomb={hasBomb}
            hasDouble={hasDouble}
            scrambledOptions={isSteal ? null : scrambledOptions}
            teamColor={apTeamColor ?? undefined}
          />
        </div>

        {/* Crowd prediction — only on main question turn */}
        {!isSteal && (
          <div className="game-card p-3 animate-crowd-hype">
            <p className="text-center text-xs font-bold text-jawwib-text-dim mb-2">
              🙋 الجمهور يتوقع — ماذا سيجيب؟
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCrowdVotes((v) => ({ ...v, correct: v.correct + 1 }))}
                className="py-3 rounded-xl border-2 border-jawwib-green/40 bg-jawwib-green/8 text-jawwib-green font-black text-sm tap-target"
              >
                صح ✅ {crowdVotes.correct > 0 && <span className="text-xs opacity-70">({crowdVotes.correct})</span>}
              </button>
              <button
                onClick={() => setCrowdVotes((v) => ({ ...v, wrong: v.wrong + 1 }))}
                className="py-3 rounded-xl border-2 border-jawwib-red/40 bg-jawwib-red/8 text-jawwib-red font-black text-sm tap-target"
              >
                غلط ❌ {crowdVotes.wrong > 0 && <span className="text-xs opacity-70">({crowdVotes.wrong})</span>}
              </button>
            </div>
          </div>
        )}

        <EffectToast lastResult={lastResult} />

        {/* Host / referee skip button — during steal phase only */}
        {isSteal && isHostPlayer && (
          <button
            onClick={() => skipSteal()}
            className="w-full py-2.5 rounded-xl border border-jawwib-border text-jawwib-text-dim text-xs font-bold hover:border-jawwib-red/50 hover:text-jawwib-red transition-all tap-target"
          >
            ⏭️ تجاوز السرقة — انتقل للسؤال الجاي
          </button>
        )}
      </div>
    );
  }

  // ── Phase: result ─────────────────────────────────────────────────────────────
  if (game.phase === 'result' && game.lastAnswer && game.currentQuestion) {
    const respPlayer = game.room.players.find((p) => p.id === game.lastAnswer?.playerId);
    const respTeamId: TeamId | null = respPlayer && teamData
      ? teamData.alpha.playerIds.includes(respPlayer.id) ? 'alpha' : 'beta'
      : null;
    const tColor = respTeamId === 'alpha' ? '#1D4ED8' : respTeamId === 'beta' ? '#B91C1C' : null;
    const tEmoji = respTeamId === 'alpha' ? (teamData?.alpha.emoji ?? '🔵') : respTeamId === 'beta' ? (teamData?.beta.emoji ?? '🔴') : undefined;
    const totalCells = game.board.reduce((a, r) => a + r.length, 0);
    const isFinalQ   = game.room.isTrial
      ? game.room.answeredQuestions.length >= 9
      : answeredCount >= totalCells;
    const respStreak = respPlayer?.streak ?? 0;
    return (
      <>
        {MysteryBox}
        {scorePopup && <ScorePopup points={scorePopup.points} color={scorePopup.color} />}
        <div className="min-h-screen p-4 bg-jawwib-bg" />
        <ResultOverlay
          lastAnswer={game.lastAnswer}
          currentQuestion={game.currentQuestion}
          hostMessage={game.hostMessage}
          onContinue={returnToBoard}
          playerName={respPlayer?.name}
          teamColor={tColor ?? undefined}
          teamEmoji={tEmoji}
          isFinalQuestion={isFinalQ}
          crowdVotes={crowdVotes}
          playerStreak={respStreak}
        />
      </>
    );
  }

  // ── Phase: board ──────────────────────────────────────────────────────────────
  const opponents = game.room.players.filter((p) => p.id !== localPlayerId);
  const ap = game.activePlayer ? game.room.players.find((p) => p.id === game.activePlayer) : null;
  const boardActiveTeamId = mode === 'teams' ? game.activeTeamId : null;
  const apTeamColor = boardActiveTeamId
    ? boardActiveTeamId === 'alpha' ? '#1D4ED8' : '#B91C1C'
    : ap && teamData
    ? teamData.alpha.playerIds.includes(ap.id) ? '#1D4ED8' : '#B91C1C'
    : null;
  // In single-device teams mode the host manages both teams — always their turn
  const isMyTurn = mode === 'teams' ? true : ap?.id === localPlayerId;

  return (
    <div className="min-h-screen p-4">
      {MysteryBox}
      {scorePopup && <ScorePopup points={scorePopup.points} color={scorePopup.color} />}

      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-black text-gold-gradient">جاوب</h1>
        <div className="flex items-center gap-3">
          <AudioControls />
          <div className="flex items-center gap-1">
            <span className="text-xs text-jawwib-text-dim">كود:</span>
            <span className="text-sm font-bold text-jawwib-gold tracking-wider">{game.room.code}</span>
          </div>
        </div>
      </div>

      <HostBubble message={game.hostMessage} compact />

      {(boardActiveTeamId || ap) && (
        <div
          className="mb-3 px-4 py-2.5 rounded-xl text-center text-sm border-2 transition-all"
          style={{
            borderColor: apTeamColor ? `${apTeamColor}35` : '#C8880A25',
            background:  apTeamColor ? `${apTeamColor}08` : '#C8880A05',
          }}
        >
          <span className="text-jawwib-text-dim">دور: </span>
          {boardActiveTeamId && teamData ? (
            <span className="font-bold" style={{ color: apTeamColor ?? '#C8880A' }}>
              {(teamData[boardActiveTeamId] as any).emoji ?? (boardActiveTeamId === 'alpha' ? '🔵' : '🔴')}{' '}
              {teamData[boardActiveTeamId].name}
            </span>
          ) : ap ? (
            <span className="font-bold" style={{ color: apTeamColor ?? '#C8880A' }}>
              {ap.avatar} {ap.name}
            </span>
          ) : null}
          <span className="mr-2 text-xs" style={{ color: apTeamColor ?? '#C8880A' }}>
            (اختر سؤالًا)
          </span>
        </div>
      )}

      <div className="mb-4 overflow-x-auto">
        <GameBoard
          board={game.board}
          categories={game.room.categories}
          onSelectQuestion={handleSelectQuestion}
          isTrial={game.room.isTrial}
          answeredCount={answeredCount}
          activeTeamColor={activeTeamColor}
          isMyTurn={isMyTurn}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <TeamScoreboard
          players={game.room.players}
          teams={teamData}
          activePlayerId={game.activePlayer}
          activeTeamId={game.activeTeamId}
          teamScores={game.teamScores}
          mode={mode}
          lastStandUsed={game.lastStandUsed}
          onActivateLastStand={activateLastStand}
        />
        {!game.room.isTrial && localPlayerId && opponents.length > 0 && (
          <SabotageControls
            localPlayerId={localPlayerId}
            opponents={opponents}
            phase={game.phase}
          />
        )}
      </div>

      {mode === 'teams' && localTeamId && (
        <TeamWeaponInventory
          localTeamId={localTeamId}
          teamWeapons={game.teamWeapons}
          activeTeamId={game.activeTeamId}
          phase={game.phase}
          forcedCategory={game.forcedCategory}
          activeImmunity={game.activeImmunity}
          activeBomb={game.activeBomb}
        />
      )}

      {game.room.isTrial && answeredCount >= 6 && (
        <div className="mt-4 p-4 rounded-xl bg-jawwib-gold/10 border border-jawwib-gold/30 text-center">
          <p className="text-jawwib-gold font-bold mb-2">🔓 عجبتك؟ افتح النسخة الكاملة</p>
          <button onClick={() => setShowPayment(true)} className="btn-gold text-sm px-6 py-2">ترقية 4 د.ك</button>
        </div>
      )}
    </div>
  );
}
