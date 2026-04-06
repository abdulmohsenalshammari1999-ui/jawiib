import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  GameState,
  GameRoom,
  Player,
  CategoryId,
  GameBoardCell,
  SabotageType,
} from './types';
import { questions, getQuestionsByCategoryAndTier } from './questions';
import { getWelcomeMessage, getWinnerRoast, getLoserRoast, getStreakMessage, getSabotageMessage, getGameOverMessage } from './host';
import { v4 as uuid } from 'uuid';

const TIMER_DURATION = 15;
const SPEED_BONUS_THRESHOLD = 5;
const STREAK_MULTIPLIER = 1.5;
const STREAK_THRESHOLD = 3;
const TRIAL_QUESTION_LIMIT = 9;
const TRIAL_CATEGORY_COUNT = 2;

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function buildBoard(selectedCategories: CategoryId[]): GameBoardCell[][] {
  const board: GameBoardCell[][] = [];

  for (const cat of selectedCategories) {
    const row: GameBoardCell[] = [];
    for (const tier of [1, 2, 3] as const) {
      const tierQuestions = getQuestionsByCategoryAndTier(cat, tier);
      const shuffled = [...tierQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 2);
      for (const q of selected) {
        row.push({
          questionId: q.id,
          category: cat,
          tier,
          points: q.points,
          answered: false,
        });
      }
    }
    board.push(row);
  }
  return board;
}

function getTrialCategories(): CategoryId[] {
  const allCats: CategoryId[] = [
    'culture', 'sport', 'history', 'quran', 'gulf', 'science', 'geo', 'food',
    'drama', 'music', 'jokes', 'business', 'social', 'ramadan', 'travel', 'family',
  ];
  const shuffled = [...allCats].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TRIAL_CATEGORY_COUNT);
}

const avatars = ['🦁', '🦊', '🐺', '🦅', '🐉', '🦈', '🐅', '🦂'];

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredCountRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev || prev.timer <= 0) {
          clearTimer();
          if (prev && prev.phase === 'question') {
            return {
              ...prev,
              phase: 'result',
              timer: 0,
              hostMessage: getLoserRoast(),
              lastAnswer: {
                playerId: prev.activePlayer || '',
                correct: false,
                points: 0,
                timeBonus: 0,
                streakMultiplier: 1,
              },
            };
          }
          return prev;
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);
  }, [clearTimer]);

  const createRoom = useCallback(
    (playerName: string, isTrial: boolean, selectedCategories?: CategoryId[]) => {
      const playerId = uuid();
      const roomCode = generateRoomCode();
      const cats = isTrial
        ? getTrialCategories()
        : selectedCategories || [
            'culture', 'sport', 'history', 'quran', 'gulf', 'science', 'geo', 'food',
            'drama', 'music', 'jokes', 'business', 'social', 'ramadan', 'travel', 'family',
          ];

      const player: Player = {
        id: playerId,
        name: playerName,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        score: 0,
        streak: 0,
        isHost: true,
      };

      const room: GameRoom = {
        id: uuid(),
        code: roomCode,
        hostId: playerId,
        players: [player],
        status: 'waiting',
        categories: cats,
        currentQuestion: 0,
        answeredQuestions: [],
        isTrial,
        createdAt: Date.now(),
      };

      const board = buildBoard(cats);
      answeredCountRef.current = 0;

      const newState: GameState = {
        room,
        board,
        currentQuestion: null,
        activePlayer: playerId,
        timer: TIMER_DURATION,
        phase: 'lobby',
        hostMessage: getWelcomeMessage(),
        sabotages: { [playerId]: ['steal', 'block', 'halve'] },
        selectedSabotage: null,
        sabotageTarget: null,
        lastAnswer: null,
      };

      setState(newState);
      return { roomCode, playerId };
    },
    []
  );

  const addPlayer = useCallback((playerName: string) => {
    const playerId = uuid();
    setState((prev) => {
      if (!prev) return prev;
      const player: Player = {
        id: playerId,
        name: playerName,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        score: 0,
        streak: 0,
        isHost: false,
      };
      return {
        ...prev,
        room: {
          ...prev.room,
          players: [...prev.room.players, player],
        },
        sabotages: {
          ...prev.sabotages,
          [playerId]: ['steal', 'block', 'halve'],
        },
      };
    });
    return playerId;
  }, []);

  const startGame = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'board',
        room: { ...prev.room, status: 'playing' },
        hostMessage: 'يلا اختاروا سؤال! 🎯',
      };
    });
  }, []);

  const selectQuestion = useCallback(
    (rowIndex: number, colIndex: number) => {
      setState((prev) => {
        if (!prev) return prev;
        const cell = prev.board[rowIndex][colIndex];
        if (cell.answered) return prev;

        if (prev.room.isTrial && answeredCountRef.current >= TRIAL_QUESTION_LIMIT) {
          return {
            ...prev,
            hostMessage: 'خلصت التجربة المجانية! ادفع عشان تكمل 🔒',
          };
        }

        const question = questions.find((q) => q.id === cell.questionId) || null;
        return {
          ...prev,
          currentQuestion: question,
          phase: 'question',
          timer: TIMER_DURATION,
          hostMessage: 'يلا جاوب! الوقت يمشي ⏰',
          lastAnswer: null,
        };
      });
      startTimer();
    },
    [startTimer]
  );

  const answerQuestion = useCallback(
    (playerId: string, answerIndex: number) => {
      clearTimer();
      setState((prev) => {
        if (!prev || !prev.currentQuestion) return prev;

        const isCorrect = answerIndex === prev.currentQuestion.correctIndex;
        const timeLeft = prev.timer;
        const player = prev.room.players.find((p) => p.id === playerId);
        if (!player) return prev;

        const newStreak = isCorrect ? player.streak + 1 : 0;
        const streakMultiplier =
          isCorrect && newStreak >= STREAK_THRESHOLD ? STREAK_MULTIPLIER : 1;
        const timeBonus =
          isCorrect && timeLeft >= SPEED_BONUS_THRESHOLD
            ? Math.floor(timeLeft * 5)
            : 0;
        const basePoints = isCorrect ? prev.currentQuestion.points : 0;
        const totalPoints = Math.floor(
          (basePoints + timeBonus) * streakMultiplier
        );

        const updatedPlayers = prev.room.players.map((p) =>
          p.id === playerId
            ? { ...p, score: p.score + totalPoints, streak: newStreak }
            : p
        );

        // Mark cell as answered
        const newBoard = prev.board.map((row) =>
          row.map((cell) =>
            cell.questionId === prev.currentQuestion!.id
              ? { ...cell, answered: true, answeredBy: playerId }
              : cell
          )
        );

        answeredCountRef.current += 1;

        let hostMessage: string;
        if (isCorrect && newStreak >= STREAK_THRESHOLD) {
          hostMessage = getStreakMessage();
        } else if (isCorrect) {
          hostMessage = getWinnerRoast();
        } else {
          hostMessage = getLoserRoast();
        }

        // Check if game is over
        const totalCells = newBoard.reduce(
          (acc, row) => acc + row.length,
          0
        );
        const answeredCells = newBoard.reduce(
          (acc, row) => acc + row.filter((c) => c.answered).length,
          0
        );
        const isGameOver = answeredCells >= totalCells;

        if (isGameOver) {
          const sortedPlayers = [...updatedPlayers].sort(
            (a, b) => b.score - a.score
          );
          const winnerId = sortedPlayers[0]?.id;
          hostMessage = getGameOverMessage(playerId === winnerId);
        }

        // Rotate active player
        const currentIndex = prev.room.players.findIndex(
          (p) => p.id === prev.activePlayer
        );
        const nextIndex =
          (currentIndex + 1) % prev.room.players.length;

        return {
          ...prev,
          board: newBoard,
          phase: isGameOver ? 'finished' : 'result',
          timer: 0,
          room: {
            ...prev.room,
            players: updatedPlayers,
            status: isGameOver ? 'finished' : prev.room.status,
            answeredQuestions: [
              ...prev.room.answeredQuestions,
              prev.currentQuestion!.id,
            ],
          },
          activePlayer: prev.room.players[nextIndex]?.id || prev.activePlayer,
          hostMessage,
          lastAnswer: {
            playerId,
            correct: isCorrect,
            points: totalPoints,
            timeBonus,
            streakMultiplier,
          },
        };
      });
    },
    [clearTimer]
  );

  const useSabotage = useCallback(
    (playerId: string, type: SabotageType, targetId: string) => {
      setState((prev) => {
        if (!prev) return prev;
        const playerSabotages = prev.sabotages[playerId] || [];
        if (!playerSabotages.includes(type)) return prev;

        const newSabotages = {
          ...prev.sabotages,
          [playerId]: playerSabotages.filter((s) => s !== type),
        };

        let updatedPlayers = [...prev.room.players];
        const hostMessage = getSabotageMessage(type);

        if (type === 'steal') {
          const stolen = 100;
          updatedPlayers = updatedPlayers.map((p) => {
            if (p.id === targetId)
              return { ...p, score: Math.max(0, p.score - stolen) };
            if (p.id === playerId) return { ...p, score: p.score + stolen };
            return p;
          });
        } else if (type === 'halve') {
          updatedPlayers = updatedPlayers.map((p) =>
            p.id === targetId
              ? { ...p, score: Math.floor(p.score / 2) }
              : p
          );
        }

        return {
          ...prev,
          room: { ...prev.room, players: updatedPlayers },
          sabotages: newSabotages,
          hostMessage,
          phase: type === 'block' ? 'board' : prev.phase,
        };
      });
    },
    []
  );

  const returnToBoard = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'board',
        currentQuestion: null,
        lastAnswer: null,
        hostMessage: 'يلا اختاروا سؤال ثاني! 🎯',
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    clearTimer();
    setState(null);
    answeredCountRef.current = 0;
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    state,
    createRoom,
    addPlayer,
    startGame,
    selectQuestion,
    answerQuestion,
    useSabotage,
    returnToBoard,
    resetGame,
  };
}
