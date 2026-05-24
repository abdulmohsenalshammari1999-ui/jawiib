import { useState, useCallback, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRoomStore } from '@/store/roomStore';
import { useSabotageStore } from '@/store/sabotageStore';
import { useHostMessage } from '@/hooks/useHostMessage';
import type { CategoryId } from '@/lib/types';
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

type SubView = 'lobby' | 'teams' | 'draft';

export function GameApp() {
  const game          = useGameStore((s) => s.game);
  const localPlayerId = useGameStore((s) => s.localPlayerId);
  const answeredCount = useGameStore((s) => s.answeredCount);
  const createRoom    = useGameStore((s) => s.createRoom);
  const addPlayer     = useGameStore((s) => s.addPlayer);
  const startGame     = useGameStore((s) => s.startGame);
  const selectQuestion = useGameStore((s) => s.selectQuestion);
  const answerQuestion = useGameStore((s) => s.answerQuestion);
  const returnToBoard = useGameStore((s) => s.returnToBoard);
  const resetGame     = useGameStore((s) => s.resetGame);

  // Room store (team mode)
  const mode         = useRoomStore((s) => s.mode);
  const teams        = useRoomStore((s) => s.teams);
  const setMode      = useRoomStore((s) => s.setMode);
  const initTeams    = useRoomStore((s) => s.initTeams);
  const assignTeam   = useRoomStore((s) => s.assignTeam);
  const autoAssign   = useRoomStore((s) => s.autoAssign);

  // Rich host commentary (BUILD_05)
  useHostMessage();

  // Sabotage (for effects in question screen)
  const hasBomb   = useSabotageStore((s) => localPlayerId ? s.activeEffects.some((e) => e.type === 'bomb' && e.targetPlayerId === localPlayerId) : false);
  const hasDouble = useSabotageStore((s) => localPlayerId ? s.activeEffects.some((e) => e.type === 'double' && e.fromPlayerId === localPlayerId) : false);
  const scrambles = useSabotageStore((s) => s.scrambles);
  const scrambled = localPlayerId ? scrambles[localPlayerId] : null;
  const scrambledOptions = scrambled && game?.currentQuestion
    ? Object.values(scrambled).map((idx) => game.currentQuestion!.options[idx])
    : null;

  const [subView, setSubView]     = useState<SubView>('lobby');
  const [showPayment, setShowPayment] = useState(false);

  // When a game starts (phase moves to board), reset subview
  useEffect(() => {
    if (game?.phase === 'board') setSubView('lobby');
  }, [game?.phase]);

  const handleCreateRoom = useCallback(
    (name: string, isTrial: boolean, cats?: CategoryId[], gameMode?: 'ffa' | 'teams') => {
      setMode(gameMode ?? 'ffa');
      const result = createRoom(name, isTrial, cats);
      if (gameMode === 'teams') {
        initTeams();
        assignTeam(result.playerId, 'alpha');
      }
      return result;
    },
    [createRoom, setMode, initTeams, assignTeam]
  );

  const handleJoinRoom = useCallback(
    (name: string, _code: string) => {
      const id = addPlayer(name);
      if (mode === 'teams' && game) {
        // Auto-balance teams on join
        const alphaCt = teams.alpha.playerIds.length;
        const betaCt  = teams.beta.playerIds.length;
        assignTeam(id, alphaCt <= betaCt ? 'alpha' : 'beta');
      }
    },
    [addPlayer, mode, teams, game, assignTeam]
  );

  const handleAnswer = useCallback(
    (idx: number) => { if (localPlayerId) answerQuestion(localPlayerId, idx); },
    [localPlayerId, answerQuestion]
  );

  const handlePurchase = useCallback(() => {
    setShowPayment(false);
    if (game && localPlayerId) {
      const hostPlayer = game.room.players.find((p) => p.id === localPlayerId);
      if (hostPlayer) {
        resetGame();
        createRoom(hostPlayer.name, false);
      }
    }
  }, [game, localPlayerId, resetGame, createRoom]);

  // Build team data for team-aware components
  const teamData = mode === 'teams' ? {
    alpha: { ...teams.alpha, id: 'alpha' as const },
    beta:  { ...teams.beta,  id: 'beta'  as const },
  } : null;

  const activeTeamColor = (() => {
    if (!localPlayerId || !teamData) return null;
    if (teamData.alpha.playerIds.includes(localPlayerId)) return '#3B82F6';
    if (teamData.beta.playerIds.includes(localPlayerId)) return '#EF4444';
    return null;
  })();

  // ── No game → home ──────────────────────────────────────────────────────────
  if (!game) {
    return (
      <HomeScreen
        onCreateRoom={(name, isTrial, cats, gameMode) => handleCreateRoom(name, isTrial, cats, gameMode)}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  // ── Payment modal ────────────────────────────────────────────────────────────
  if (showPayment) {
    return (
      <>
        <div className="min-h-screen bg-jawwib-bg" />
        <PaymentModal onClose={() => setShowPayment(false)} onPurchase={handlePurchase} />
      </>
    );
  }

  // ── Finished ─────────────────────────────────────────────────────────────────
  if (game.phase === 'finished') {
    return (
      <GameOverScreen
        players={game.room.players}
        hostMessage={game.hostMessage}
        onPlayAgain={resetGame}
        teams={teamData}
        mode={mode}
      />
    );
  }

  // ── Lobby phase ──────────────────────────────────────────────────────────────
  if (game.phase === 'lobby') {
    const qrUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/join/${game.room.code}`
        : `https://jawwib.netlify.app/join/${game.room.code}`;
    const isHost = game.room.hostId === localPlayerId;

    // Teams sub-view
    if (subView === 'teams' && mode === 'teams') {
      return (
        <div className="min-h-screen p-4">
          <HostBubble message={game.hostMessage} compact />
          <div className="max-w-md mx-auto mt-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSubView('lobby')}
                className="text-jawwib-text-dim text-sm hover:text-jawwib-text transition-colors"
              >
                ← رجوع
              </button>
              <h2 className="text-lg font-bold text-gold-gradient">توزيع الفرق</h2>
              <div />
            </div>

            {/* Simple team assignment */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(['alpha', 'beta'] as const).map((tid) => {
                const t = teams[tid];
                const color = tid === 'alpha' ? 'text-jawwib-blue border-blue-500/40 bg-blue-500/10' : 'text-jawwib-red border-red-500/40 bg-red-500/10';
                const emoji = tid === 'alpha' ? '🛡️' : '⚔️';
                return (
                  <div key={tid} className={`game-card p-3 border ${color}`}>
                    <p className={`font-bold text-sm mb-2 ${tid === 'alpha' ? 'text-jawwib-blue' : 'text-jawwib-red'}`}>
                      {emoji} {t.name}
                    </p>
                    <div className="space-y-1.5">
                      {t.playerIds.map((pid) => {
                        const p = game.room.players.find((pl) => pl.id === pid);
                        if (!p) return null;
                        return (
                          <div key={pid} className="flex items-center gap-2 bg-jawwib-surface/50 rounded-lg px-2 py-1">
                            <span className="text-base">{p.avatar}</span>
                            <span className="text-xs font-bold truncate">{p.name}</span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Assign self button */}
                    {localPlayerId && !t.playerIds.includes(localPlayerId) && (
                      <button
                        onClick={() => assignTeam(localPlayerId, tid)}
                        className={`mt-2 w-full text-xs py-1.5 rounded-lg border ${
                          tid === 'alpha'
                            ? 'border-blue-500/40 text-jawwib-blue hover:bg-blue-500/20'
                            : 'border-red-500/40 text-jawwib-red hover:bg-red-500/20'
                        } transition-all`}
                      >
                        انضم لهذا الفريق
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Unassigned players */}
            {game.room.players.filter(
              (p) => !teams.alpha.playerIds.includes(p.id) && !teams.beta.playerIds.includes(p.id)
            ).length > 0 && (
              <div className="game-card p-3 mb-4">
                <p className="text-jawwib-text-dim text-xs mb-2">بدون فريق</p>
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
              {game.room.hostId === localPlayerId && (
                <button
                  onClick={() => {
                    // auto-assign all unassigned players
                    game.room.players
                      .filter((p) => !teams.alpha.playerIds.includes(p.id) && !teams.beta.playerIds.includes(p.id))
                      .forEach((p) => autoAssign(p.id));
                    setSubView('lobby');
                  }}
                  className="w-full py-2.5 rounded-xl border border-jawwib-border text-sm text-jawwib-text-dim hover:border-jawwib-gold hover:text-jawwib-gold transition-all"
                >
                  توزيع تلقائي عشوائي
                </button>
              )}
              <button onClick={() => setSubView('lobby')} className="btn-gold w-full">
                تأكيد الفرق ✓
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center justify-between mb-4">
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
          onShowTeams={() => setSubView('teams')}
          isHost={isHost}
          qrUrl={qrUrl}
          mode={mode}
        />
      </div>
    );
  }

  // ── Question phase ───────────────────────────────────────────────────────────
  if (game.phase === 'question' && game.currentQuestion) {
    return (
      <div className="min-h-screen p-4 flex flex-col gap-4">
        <HostBubble message={game.hostMessage} compact />
        {/* Active player indicator */}
        {game.activePlayer && (() => {
          const ap = game.room.players.find((p) => p.id === game.activePlayer);
          if (!ap) return null;
          const teamColor = teamData
            ? teamData.alpha.playerIds.includes(ap.id) ? '#3B82F6' : '#EF4444'
            : null;
          return (
            <div className="flex items-center justify-center gap-2 py-2">
              <span className="text-lg">{ap.avatar}</span>
              <span className="font-bold" style={teamColor ? { color: teamColor } : undefined}>
                دور {ap.name}
              </span>
            </div>
          );
        })()}
        <div className="flex-1 flex items-center justify-center">
          <QuestionCard
            question={game.currentQuestion}
            timer={game.timer}
            maxTimer={15}
            onAnswer={handleAnswer}
            hasBomb={hasBomb}
            hasDouble={hasDouble}
            scrambledOptions={scrambledOptions}
          />
        </div>
      </div>
    );
  }

  // ── Result phase ─────────────────────────────────────────────────────────────
  if (game.phase === 'result' && game.lastAnswer && game.currentQuestion) {
    const respPlayer = game.room.players.find((p) => p.id === game.lastAnswer?.playerId);
    const teamColor = respPlayer && teamData
      ? teamData.alpha.playerIds.includes(respPlayer.id) ? '#3B82F6' : '#EF4444'
      : null;
    return (
      <>
        <div className="min-h-screen p-4 bg-jawwib-bg" />
        <ResultOverlay
          lastAnswer={game.lastAnswer}
          currentQuestion={game.currentQuestion}
          hostMessage={game.hostMessage}
          onContinue={returnToBoard}
          playerName={respPlayer?.name}
          teamColor={teamColor ?? undefined}
        />
      </>
    );
  }

  // ── Board phase ───────────────────────────────────────────────────────────────
  const opponents = game.room.players.filter((p) => p.id !== localPlayerId);

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-black text-gold-gradient">جاوب</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-jawwib-text-dim">كود:</span>
          <span className="text-sm font-bold text-jawwib-gold">{game.room.code}</span>
        </div>
      </div>

      <HostBubble message={game.hostMessage} compact />

      {/* Active player */}
      {game.activePlayer && (() => {
        const ap = game.room.players.find((p) => p.id === game.activePlayer);
        if (!ap) return null;
        const tc = teamData
          ? teamData.alpha.playerIds.includes(ap.id) ? '#3B82F6' : '#EF4444'
          : null;
        return (
          <div
            className="mb-3 px-4 py-2 rounded-xl text-center text-sm border"
            style={{
              borderColor: tc ? `${tc}40` : '#D4A01730',
              background: tc ? `${tc}10` : '#D4A01708',
            }}
          >
            <span className="text-jawwib-text-dim">دور: </span>
            <span className="font-bold" style={tc ? { color: tc } : { color: '#D4A017' }}>
              {ap.avatar} {ap.name}
            </span>
          </div>
        );
      })()}

      {/* Board */}
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

      {/* Scores + sabotage */}
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

      {/* Trial upgrade nudge */}
      {game.room.isTrial && answeredCount >= 6 && (
        <div className="mt-4 p-4 rounded-xl bg-jawwib-gold/10 border border-jawwib-gold/30 text-center">
          <p className="text-jawwib-gold font-bold mb-2">🔓 عجبتك؟ افتح النسخة الكاملة</p>
          <button onClick={() => setShowPayment(true)} className="btn-gold text-sm px-6 py-2">
            ترقية 4 د.ك
          </button>
        </div>
      )}
    </div>
  );
}
