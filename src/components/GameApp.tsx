import { useState, useCallback } from 'react';
import { useGameState } from '@/lib/gameState';
import type { CategoryId, SabotageType } from '@/lib/types';
import { HomeScreen } from './HomeScreen';
import { Lobby } from './Lobby';
import { GameBoard } from './GameBoard';
import { QuestionCard } from './QuestionCard';
import { ResultOverlay } from './ResultOverlay';
import { Scoreboard } from './Scoreboard';
import { SabotagePanel } from './SabotagePanel';
import { HostBubble } from './HostBubble';
import { GameOverScreen } from './GameOverScreen';
import { PaymentModal } from './PaymentModal';

export function GameApp() {
  const {
    state,
    createRoom,
    addPlayer,
    startGame,
    selectQuestion,
    answerQuestion,
    useSabotage,
    returnToBoard,
    resetGame,
  } = useGameState();

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleCreateRoom = useCallback(
    (name: string, isTrial: boolean, cats?: CategoryId[]) => {
      const result = createRoom(name, isTrial, cats);
      setPlayerId(result.playerId);
    },
    [createRoom]
  );

  const handleJoinRoom = useCallback(
    (name: string, _code: string) => {
      // In a real app, this would connect to a WebSocket server
      // For now, we add the player locally
      const id = addPlayer(name);
      setPlayerId(id);
    },
    [addPlayer]
  );

  const handleAnswer = useCallback(
    (answerIndex: number) => {
      if (playerId) {
        answerQuestion(playerId, answerIndex);
      }
    },
    [playerId, answerQuestion]
  );

  const handleSabotage = useCallback(
    (type: SabotageType, targetId: string) => {
      if (playerId) {
        useSabotage(playerId, type, targetId);
      }
    },
    [playerId, useSabotage]
  );

  const handlePurchase = useCallback(() => {
    // In production, this would integrate with actual payment system
    // For now, simulate purchase by creating a full game
    setShowPayment(false);
    if (state && playerId) {
      const hostPlayer = state.room.players.find((p) => p.id === playerId);
      if (hostPlayer) {
        resetGame();
        const result = createRoom(hostPlayer.name, false);
        setPlayerId(result.playerId);
      }
    }
  }, [state, playerId, resetGame, createRoom]);

  // Calculate answered count
  const answeredCount = state
    ? state.board.reduce(
        (acc, row) => acc + row.filter((c) => c.answered).length,
        0
      )
    : 0;

  // No game state - show home screen
  if (!state) {
    return (
      <HomeScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  // Payment modal
  if (showPayment) {
    return (
      <>
        <div className="min-h-screen bg-jawwib-bg" />
        <PaymentModal
          onClose={() => setShowPayment(false)}
          onPurchase={handlePurchase}
        />
      </>
    );
  }

  // Game over
  if (state.phase === 'finished') {
    return (
      <GameOverScreen
        players={state.room.players}
        hostMessage={state.hostMessage}
        onPlayAgain={resetGame}
      />
    );
  }

  // Lobby
  if (state.phase === 'lobby') {
    const qrUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/join/${state.room.code}`
      : `https://jawwib.netlify.app/join/${state.room.code}`;
    return (
      <div className="min-h-screen p-4">
        <HostBubble message={state.hostMessage} />
        <Lobby
          roomCode={state.room.code}
          players={state.room.players}
          isTrial={state.room.isTrial}
          selectedCategories={state.room.categories}
          onStartGame={startGame}
          onShowPayment={() => setShowPayment(true)}
          isHost={state.room.hostId === playerId}
          qrUrl={qrUrl}
        />
      </div>
    );
  }

  // Question view
  if (state.phase === 'question' && state.currentQuestion) {
    return (
      <div className="min-h-screen p-4">
        <HostBubble message={state.hostMessage} />
        <QuestionCard
          question={state.currentQuestion}
          timer={state.timer}
          onAnswer={handleAnswer}
        />
      </div>
    );
  }

  // Result overlay
  if (state.phase === 'result' && state.lastAnswer && state.currentQuestion) {
    return (
      <>
        <div className="min-h-screen p-4">
          <HostBubble message={state.hostMessage} />
        </div>
        <ResultOverlay
          lastAnswer={state.lastAnswer}
          currentQuestion={state.currentQuestion}
          hostMessage={state.hostMessage}
          onContinue={returnToBoard}
        />
      </>
    );
  }

  // Game board (default playing state)
  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gold-gradient">جاوب</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-jawwib-text-dim">كود:</span>
          <span className="text-sm font-bold text-jawwib-gold">{state.room.code}</span>
        </div>
      </div>

      <HostBubble message={state.hostMessage} />

      {/* Active player indicator */}
      {state.activePlayer && (
        <div className="mb-4 p-3 rounded-xl bg-jawwib-gold/5 border border-jawwib-gold/20 text-center">
          <span className="text-sm text-jawwib-text-dim">دور: </span>
          <span className="text-jawwib-gold font-bold">
            {state.room.players.find((p) => p.id === state.activePlayer)?.name || ''}
          </span>
          {state.room.players.find((p) => p.id === state.activePlayer)?.avatar && (
            <span className="mr-1">
              {state.room.players.find((p) => p.id === state.activePlayer)?.avatar}
            </span>
          )}
        </div>
      )}

      {/* Board */}
      <div className="mb-4 overflow-x-auto">
        <GameBoard
          board={state.board}
          categories={state.room.categories}
          onSelectQuestion={selectQuestion}
          isTrial={state.room.isTrial}
          answeredCount={answeredCount}
        />
      </div>

      {/* Sidebar - Scores and Sabotage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Scoreboard
          players={state.room.players}
          activePlayerId={state.activePlayer}
        />
        {!state.room.isTrial && playerId && (
          <SabotagePanel
            currentPlayerId={playerId}
            players={state.room.players}
            availableSabotages={state.sabotages[playerId] || []}
            onUseSabotage={handleSabotage}
          />
        )}
      </div>

      {/* Trial upgrade prompt */}
      {state.room.isTrial && answeredCount >= 6 && (
        <div className="mt-4 p-4 rounded-xl bg-jawwib-gold/10 border border-jawwib-gold/30 text-center">
          <p className="text-jawwib-gold font-bold mb-2">
            🔓 عجبتك اللعبة؟ افتح النسخة الكاملة!
          </p>
          <button
            onClick={() => setShowPayment(true)}
            className="btn-gold text-sm px-6 py-2"
          >
            ترقية مقابل 4 د.ك
          </button>
        </div>
      )}
    </div>
  );
}
