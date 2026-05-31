import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type {
  GameState,
  GameRoom,
  Player,
  CategoryId,
  GameBoardCell,
  SabotageType,
  TeamId,
  WeaponType,
} from '@/lib/types';
import { getQuestionById } from '@/lib/questions';
import { useSabotageStore } from './sabotageStore';
import {
  getWelcomeMessage,
  getWinnerRoast,
  getLoserRoast,
  getStreakMessage,
  getSabotageMessage,
  getGameOverMessage,
  getBombExplosionMessage,
  getDoubleWinMessage,
  getDoubleLossMessage,
  getMysteryBoxMessage,
  getWeaponEarnedMessage,
  getWeaponUsedTimerBomb,
  getWeaponUsedImmunity,
  getWeaponUsedForcedCategory,
  getWeaponUsedAskFriend,
  getImmunityProtectedMessage,
  getLastStandMessage,
  getStreakHypeMessage,
  getWeaponUsedExtraTime,
  getStealPhaseMessage,
  getStealSuccessMessage,
  getStealFailMessage,
} from '@/lib/host';
import { getCategoryById } from '@/lib/categories';
import { ATTACK_TYPES } from '@/lib/sabotages';
import { engine }           from '@/engine/questionEngine';
import { validateAnswer }   from '@/engine/answerValidator';
import { globalPool }       from '@/engine/questionPool';

const TRIAL_QUESTION_LIMIT  = 9;
const TRIAL_CATEGORY_COUNT  = 2;
const DEFAULT_TIMER         = 30;
const STEAL_TIMER           = 30;

// Timer seconds by question point value — all 30s, bomb halves to 15s
const TIMER_BY_POINTS: Record<number, number> = {
  100: 30, 200: 30, 300: 30, 400: 30, 500: 30, 600: 30,
};

const AVATARS = ['🦁', '🦊', '🐺', '🦅', '🐉', '🦈', '🐅', '🦂'];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function buildBoard(selectedCategories: CategoryId[]): GameBoardCell[][] {
  globalPool.reset();
  return selectedCategories.map((cat) => {
    const row: GameBoardCell[] = [];
    for (const tier of [1, 2, 3, 4, 5, 6] as const) {
      const q = globalPool.draw(cat, tier);
      if (q) row.push({ questionId: q.id, category: cat, tier, points: q.points as 100|200|300|400|500|600, answered: false });
    }
    return row;
  });
}

function getTrialCategories(): CategoryId[] {
  const all: CategoryId[] = [
    'culture', 'sport', 'history', 'quran', 'gulf', 'science', 'geo', 'food',
    'drama', 'music', 'jokes', 'business', 'social', 'ramadan', 'travel', 'family',
  ];
  return [...all].sort(() => Math.random() - 0.5).slice(0, TRIAL_CATEGORY_COUNT);
}

function initSabotages(playerIds: string[]): Record<string, SabotageType[]> {
  return Object.fromEntries(
    playerIds.map((id) => [id, ['steal', 'block', 'halve'] as SabotageType[]])
  );
}

export interface GameSlice extends GameState {
  // Derived
  answeredCount: number;
  // Actions
  createRoom: (name: string, isTrial: boolean, cats?: CategoryId[]) => { roomId: string; playerId: string };
  addPlayer: (name: string) => string;
  startGame: () => void;
  selectQuestion: (questionId: string) => void;
  answerQuestion: (playerId: string, answerIndex: number) => void;
  useSabotage: (playerId: string, type: SabotageType, targetId: string) => void;
  returnToBoard: () => void;
  resetGame: () => void;
  setHostMessage: (msg: string) => void;
  tickTimer: () => void;
  updateCategories: (cats: CategoryId[]) => void;
  rematch: () => void;
}

export interface GameStoreState {
  game: GameState | null;
  localPlayerId: string | null;
  answeredCount: number;
  // Actions
  createRoom: (name: string, isTrial: boolean, cats?: CategoryId[]) => { roomId: string; playerId: string };
  addPlayer: (name: string) => string;
  startGame: () => void;
  selectQuestion: (questionId: string) => void;
  answerQuestion: (playerId: string, answerIndex: number) => void;
  useSabotage: (playerId: string, type: SabotageType, targetId: string) => void;
  returnToBoard: () => void;
  resetGame: () => void;
  setHostMessage: (msg: string) => void;
  updateCategories: (cats: CategoryId[]) => void;
  rematch: () => void;
  // Weapon system
  setTeamMembership: (alpha: string[], beta: string[]) => void;
  dismissPendingWeapon: () => void;
  useWeapon: (teamId: TeamId, weapon: WeaponType, opts?: { targetTeamId?: TeamId; categoryId?: CategoryId }) => void;
  activateLastStand: (teamId: TeamId) => void;
  initStealTimer: (opponentTeamId: TeamId, teamName: string) => void;
  activateWeaponFromBox: (teamId: TeamId, weapon: WeaponType, opts?: { targetTeamId?: TeamId; categoryId?: CategoryId }) => void;
  skipSteal: () => void;
}

export const useGameStore = create<GameStoreState>()(
  subscribeWithSelector((set, get) => ({
    game: null,
    localPlayerId: null,
    answeredCount: 0,

    createRoom: (name, isTrial, cats) => {
      const playerId = uuid();
      const roomId = uuid();
      const categories = isTrial ? getTrialCategories() : (cats ?? getTrialCategories());
      const player: Player = {
        id: playerId,
        name: name.trim() || 'لاعب',
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        score: 0,
        streak: 0,
        isHost: true,
      };
      const room: GameRoom = {
        id: roomId,
        code: generateRoomCode(),
        hostId: playerId,
        players: [player],
        status: 'waiting',
        categories,
        currentQuestion: 0,
        answeredQuestions: [],
        isTrial,
        createdAt: Date.now(),
      };
      const board = buildBoard(categories);

      // Bootstrap the engine for adaptive difficulty + round management
      engine.newGame(
        [{ id: playerId, teamId: null, streak: 0, coldStreak: 0, score: 0 }],
        'ffa',
        categories,
      );

      // Init sabotage store for FFA (per-player inventory)
      useSabotageStore.getState().initGame('ffa', [playerId]);

      const game: GameState = {
        room,
        board,
        currentQuestion: null,
        activePlayer: playerId,
        timer: DEFAULT_TIMER,
        phase: 'lobby',
        hostMessage: getWelcomeMessage(),
        sabotages: initSabotages([playerId]),
        selectedSabotage: null,
        sabotageTarget: null,
        lastAnswer: null,
        teamMembership: null,
        activeTeamId: null,
        teamStreaks: {},
        teamWeapons: {},
        pendingWeapon: null,
        activeBomb: null,
        activeImmunity: {},
        forcedCategory: null,
        lastStandActive: null,
        lastStandUsed: {},
        stealOpponentTeamId: null,
        teamScores: {},
      };
      set({ game, localPlayerId: playerId, answeredCount: 0 });
      return { roomId, playerId };
    },

    addPlayer: (name) => {
      const playerId = uuid();
      const { game } = get();
      if (!game) return playerId;
      const player: Player = {
        id: playerId,
        name: name.trim() || 'لاعب',
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        score: 0,
        streak: 0,
        isHost: false,
      };
      const allTypes: SabotageType[] = ['steal', 'block', 'halve', 'bomb', 'freeze', 'scramble', 'double', 'mystery'];
      const updatedSabotages = { ...game.sabotages, [playerId]: allTypes };
      // Register new player in sabotage engine
      useSabotageStore.getState().earnSabotage(playerId, 'steal'); // will no-op if already inited
      set({
        game: {
          ...game,
          room: { ...game.room, players: [...game.room.players, player] },
          sabotages: updatedSabotages,
        },
        localPlayerId: playerId,
      });
      return playerId;
    },

    startGame: () => {
      const { game } = get();
      if (!game) return;
      set({
        game: { ...game, phase: 'board', room: { ...game.room, status: 'playing' } },
      });
    },

    selectQuestion: (questionId) => {
      const { game } = get();
      if (!game || game.phase !== 'board') return;
      const question = getQuestionById(questionId);
      if (!question) return;

      const sabStore = useSabotageStore.getState();

      // Check freeze effect for the active player
      const frozenDuration = game.activePlayer ? sabStore.getFreezeFor(game.activePlayer) : null;
      let timeLimit = frozenDuration ?? TIMER_BY_POINTS[question.points] ?? DEFAULT_TIMER;

      // Apply timer bomb: halve the time for the targeted team
      let activeBomb = game.activeBomb;
      if (activeBomb && activeBomb === game.activeTeamId) {
        timeLimit = Math.max(5, Math.ceil(timeLimit / 2));
        activeBomb = null;
      }

      // Bind scramble to this specific question if one is pending
      if (game.activePlayer) {
        const scramble = sabStore.getScrambleFor(game.activePlayer);
        if (scramble) {
          // Attach the question ID so the hook can match options
          // (options will be reordered by useQuestionFlow)
        }
      }

      set({
        game: {
          ...game,
          phase: 'question',
          currentQuestion: question,
          timer: timeLimit,
          activeBomb,
        },
      });

      // Tick timer — stop if phase changes
      const tick = () => {
        const current = get().game;
        if (!current || current.phase !== 'question') return;
        if (current.timer <= 0) {
          // Delegate to answerQuestion so steal logic fires and board cell is marked answered.
          // Any answerIndex works — timeRemaining=0 forces timedOut=true in validateAnswer.
          get().answerQuestion(current.activePlayer ?? '', 0);
          return;
        }
        set({ game: { ...current, timer: current.timer - 1 } });
        setTimeout(tick, 1000);
      };
      setTimeout(tick, 1000);
    },

    answerQuestion: (playerId, answerIndex) => {
      const { game } = get();
      if (!game || !game.currentQuestion) return;

      // ── Steal phase answer ────────────────────────────────────────────────────
      if (game.phase === 'steal') {
        const question  = game.currentQuestion;
        const stealTeamId = game.stealOpponentTeamId;
        if (!stealTeamId) return;

        // In single-device mode the host physically answers for the steal team.
        // Attribute points to the first player of the steal team regardless of
        // who called this action.
        const stealPlayerIds = game.teamMembership?.[stealTeamId] ?? [];
        const targetPlayerId = stealPlayerIds.includes(playerId)
          ? playerId
          : (stealPlayerIds[0] ?? playerId);

        const targetPlayer = game.room.players.find((p) => p.id === targetPlayerId);
        if (!targetPlayer) return;

        const correct      = answerIndex === question.correctIndex;
        const pointsEarned = correct ? question.points : 0;

        const updatedPlayers = game.room.players.map((p) =>
          p.id === targetPlayerId && correct
            ? { ...p, score: p.score + pointsEarned, streak: p.streak + 1 }
            : p.id === targetPlayerId
            ? { ...p, streak: 0 }
            : p
        );

        const updatedBoard = game.board.map((row) =>
          row.map((cell) =>
            cell.questionId === question.id
              ? { ...cell, answered: true, answeredBy: correct ? targetPlayerId : undefined }
              : cell
          )
        );

        // answeredQuestions was already updated when steal was triggered — don't add again
        const answeredQuestions = game.room.answeredQuestions;
        const answeredCount     = updatedBoard.reduce((a, r) => a + r.filter((c) => c.answered).length, 0);
        const allAnswered       = game.room.isTrial
          ? answeredQuestions.length >= TRIAL_QUESTION_LIMIT
          : answeredCount >= game.board.reduce((a, r) => a + r.length, 0);

        const nextIdx          = (game.room.players.findIndex((p) => p.id === targetPlayerId) + 1) % game.room.players.length;
        const nextActivePlayer = game.room.players[nextIdx].id;
        const nextTeamId: TeamId | null = game.activeTeamId === 'alpha' ? 'beta'
          : game.activeTeamId === 'beta' ? 'alpha' : null;

        const stealTeamScores: Partial<Record<TeamId, number>> = stealTeamId
          ? { ...(game.teamScores ?? {}), [stealTeamId]: (game.teamScores?.[stealTeamId] ?? 0) + pointsEarned }
          : (game.teamScores ?? {});

        set({
          game: {
            ...game,
            board: updatedBoard,
            phase: allAnswered ? 'finished' : 'result',
            room: {
              ...game.room,
              players: updatedPlayers,
              answeredQuestions,
              status: allAnswered ? 'finished' : 'playing',
            },
            activePlayer: nextActivePlayer,
            activeTeamId: nextTeamId ?? game.activeTeamId,
            teamScores: stealTeamScores,
            hostMessage: allAnswered
              ? getGameOverMessage([...updatedPlayers].sort((a, b) => b.score - a.score)[0].id === targetPlayerId)
              : correct ? getStealSuccessMessage(targetPlayer.name) : getStealFailMessage(),
            lastAnswer: {
              playerId: targetPlayerId,
              teamId: stealTeamId,
              correct,
              points: pointsEarned,
              timeBonus: 0,
              streakMultiplier: 1,
            },
            stealOpponentTeamId: null,
          },
          answeredCount,
        });
        return;
      }

      if (game.phase !== 'question') return;

      const question = game.currentQuestion;
      const player   = game.room.players.find((p) => p.id === playerId);
      if (!player) return;

      const sabStore = useSabotageStore.getState();

      // Determine team membership early (needed for lastStand check)
      // Use activeTeamId as source of truth — beta.playerIds is empty in single-device mode
      const membership = game.teamMembership;
      const answeringTeamId: TeamId | null = game.activeTeamId ?? (
        membership
          ? membership.alpha.includes(playerId) ? 'alpha'
          : membership.beta.includes(playerId)  ? 'beta'
          : null
          : null
      );

      // Apply double multiplier if active
      const doubleMultiplier = sabStore.getDoubleMultiplierFor(playerId) ?? 1;

      // Last Stand: 3x multiplier for the challenging team
      const lastStandMultiplier = (game.lastStandActive && game.lastStandActive === answeringTeamId) ? 3 : 1;

      // Validate answer
      const result = validateAnswer({
        question,
        answerIndex,
        timeRemaining:   game.timer,
        timerDuration:   DEFAULT_TIMER,
        playerStreak:    player.streak,
        pointMultiplier: doubleMultiplier * lastStandMultiplier,
      });

      // Resolve pending effects (bomb, double penalty)
      const resolution = sabStore.resolveAnswer(playerId, result.correct);
      sabStore.clearScramble(playerId);

      // Double bonus is already in result.totalPoints (via pointMultiplier)
      // Double penalty is in resolution.additionalDelta
      const doublelossMsg = !result.correct && doubleMultiplier > 1 ? getDoubleLossMessage() : null;
      const doubleWinMsg  =  result.correct && doubleMultiplier > 1 ? getDoubleWinMessage()  : null;
      const bombMsg       = resolution.hostMessage?.includes('قنبلة') ? getBombExplosionMessage() : null;

      const finalPoints     = result.totalPoints + Math.max(resolution.additionalDelta, -player.score);
      const finalScore      = Math.max(0, player.score + finalPoints);

      let updatedPlayers = game.room.players.map((p) =>
        p.id === playerId
          ? { ...p, score: finalScore, streak: result.newStreak }
          : p
      );

      // Apply any score deltas from sabotage resolution (e.g. mystery steal)
      // (resolution.additionalDelta already applied above via finalPoints)

      const updatedBoard = game.board.map((row) =>
        row.map((cell) =>
          cell.questionId === question.id
            ? { ...cell, answered: true, answeredBy: playerId }
            : cell
        )
      );

      const answeredQuestions = [...game.room.answeredQuestions, question.id];
      const answeredCount     = updatedBoard.reduce((a, r) => a + r.filter((c) => c.answered).length, 0);
      const allAnswered       = game.room.isTrial
        ? answeredQuestions.length >= TRIAL_QUESTION_LIMIT
        : answeredCount >= game.board.reduce((a, r) => a + r.length, 0);

      const nextIdx          = (game.room.players.findIndex((p) => p.id === playerId) + 1) % game.room.players.length;
      const nextActivePlayer = game.room.players[nextIdx].id;

      // Earn sabotage on streak
      if (result.newStreak === 3) {
        const earned = ATTACK_TYPES[Math.floor(Math.random() * 3)]; // bomb/freeze/scramble
        sabStore.earnSabotage(playerId, earned);
      }
      // Earn block when trailing by 400+
      const topScore = Math.max(...updatedPlayers.map((p) => p.score));
      if (finalScore < topScore - 400) {
        sabStore.earnSabotage(playerId, 'block');
      }

      sabStore.advanceTurn();

      // ── Team weapon system ──────────────────────────────────────────────────

      let teamStreaks   = { ...game.teamStreaks };
      let teamWeapons  = { ...game.teamWeapons };
      let pendingWeapon = game.pendingWeapon;
      let activeImmunity = { ...game.activeImmunity };
      let immunityMsg: string | null = null;

      if (answeringTeamId) {
        const currentStreak = teamStreaks[answeringTeamId] ?? 0;
        if (result.correct) {
          const newTeamStreak = currentStreak + 1;
          teamStreaks[answeringTeamId] = newTeamStreak;
          // Trigger mystery box every 3 consecutive correct answers
          if (newTeamStreak >= 3 && !pendingWeapon) {
            teamStreaks[answeringTeamId] = 0;
            const weapons: WeaponType[] = ['timer_bomb', 'immunity', 'forced_category', 'ask_friend', 'extra_time'];
            const weapon = weapons[Math.floor(Math.random() * weapons.length)];
            pendingWeapon = { teamId: answeringTeamId, weapon };
          }
        } else {
          // Immunity check: if wrong and immunity active, pass without penalty
          if (activeImmunity[answeringTeamId]) {
            activeImmunity[answeringTeamId] = false;
            immunityMsg = getImmunityProtectedMessage();
          }
          teamStreaks[answeringTeamId] = 0;
        }
      }

      // Toggle which team picks next
      const nextTeamId: TeamId | null = game.activeTeamId === 'alpha' ? 'beta'
        : game.activeTeamId === 'beta' ? 'alpha'
        : null;

      // If immunity was active and wrong answer, override points to 0
      let adjustedFinalPoints = finalPoints;
      if (immunityMsg && !result.correct && answeringTeamId && game.activeImmunity[answeringTeamId]) {
        adjustedFinalPoints = 0;
      }

      const updatedTeamScores: Partial<Record<TeamId, number>> = answeringTeamId
        ? {
            ...(game.teamScores ?? {}),
            [answeringTeamId]: Math.max(0, (game.teamScores?.[answeringTeamId] ?? 0) + adjustedFinalPoints),
          }
        : (game.teamScores ?? {});

      const lastStandUsed = { ...game.lastStandUsed };
      if (game.lastStandActive === answeringTeamId) lastStandUsed[answeringTeamId!] = true;

      const hostMessage = immunityMsg ?? doubleWinMsg ?? doublelossMsg ?? bombMsg
        ?? (pendingWeapon && !game.pendingWeapon ? getMysteryBoxMessage() : null)
        ?? (result.correct
          ? result.newStreak >= 4 ? getStreakHypeMessage(result.newStreak)
          : result.newStreak >= 3 ? getStreakMessage()
          : getWinnerRoast()
          : getLoserRoast());

      // ── Steal phase: wrong answer with no immunity in teams mode ─────────────
      const opponentTeamId: TeamId | null = answeringTeamId === 'alpha' ? 'beta'
        : answeringTeamId === 'beta' ? 'alpha' : null;
      const shouldSteal = !result.correct && !immunityMsg && answeringTeamId && opponentTeamId && !allAnswered;

      if (shouldSteal && opponentTeamId) {
        const opponentName = 'الفريق المنافس';
        // Determine steal timer (bomb applies to opponent's steal too)
        let stealTime = STEAL_TIMER;
        if (game.activeBomb === opponentTeamId) stealTime = Math.max(5, Math.ceil(stealTime / 2));

        set({
          game: {
            ...game,
            board: updatedBoard,
            phase: 'steal',
            room: { ...game.room, players: updatedPlayers, answeredQuestions },
            timer: stealTime,
            hostMessage: getStealPhaseMessage(opponentName),
            lastAnswer: {
              playerId,
              teamId: answeringTeamId,
              correct: false,
              points: 0,
              timeBonus: 0,
              streakMultiplier: 1,
            },
            teamScores: game.teamScores ?? {},
            teamStreaks,
            teamWeapons,
            pendingWeapon,
            activeImmunity,
            forcedCategory: game.forcedCategory?.targetTeamId === answeringTeamId ? null : game.forcedCategory,
            lastStandActive: null,
            lastStandUsed,
            stealOpponentTeamId: opponentTeamId,
          },
          answeredCount,
        });
        // Start steal countdown
        get().initStealTimer(opponentTeamId, opponentName);
        return;
      }

      set({
        game: {
          ...game,
          board: updatedBoard,
          phase: allAnswered ? 'finished' : 'result',
          room: {
            ...game.room,
            players: updatedPlayers,
            answeredQuestions,
            status: allAnswered ? 'finished' : 'playing',
          },
          activePlayer: nextActivePlayer,
          activeTeamId: nextTeamId ?? game.activeTeamId,
          hostMessage: allAnswered
            ? getGameOverMessage(
                [...updatedPlayers].sort((a, b) => b.score - a.score)[0].id === playerId
              )
            : hostMessage,
          lastAnswer: {
            playerId,
            teamId: answeringTeamId,
            correct:          result.correct,
            points:           adjustedFinalPoints,
            timeBonus:        result.timeBonus,
            streakMultiplier: result.streakMultiplier * doubleMultiplier,
          },
          teamScores: updatedTeamScores,
          teamStreaks,
          teamWeapons,
          pendingWeapon,
          activeImmunity,
          forcedCategory: game.forcedCategory?.targetTeamId === answeringTeamId ? null : game.forcedCategory,
          lastStandActive: null,
          lastStandUsed,
          stealOpponentTeamId: null,
        },
        answeredCount,
      });
    },

    useSabotage: (playerId, type, targetId) => {
      const { game } = get();
      if (!game) return;

      const targetPlayer = game.room.players.find((p) => p.id === targetId);
      const sabStore     = useSabotageStore.getState();

      const activation = sabStore.activate({
        fromPlayerId:   playerId,
        fromTeamId:     null,
        type,
        targetPlayerId: targetId,
        targetTeamId:   null,
        targetScore:    targetPlayer?.score ?? 0,
        questionOptions: game.currentQuestion?.options,
      });

      if (!activation.success && activation.failReason !== 'blocked') return;

      // Apply immediate score changes from the engine
      let updatedPlayers = game.room.players;
      for (const delta of activation.scoreDeltas) {
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === delta.playerId
            ? { ...p, score: Math.max(0, p.score + delta.delta) }
            : p
        );
      }

      // Sync inventory back to game.sabotages (for legacy UI compatibility)
      const inv = sabStore.inventories[playerId];
      const updatedSabotages = {
        ...game.sabotages,
        [playerId]: inv ? (Object.keys(inv.available) as SabotageType[]).filter(
          (t) => (inv.available[t] ?? 0) > 0
        ) : [],
      };

      const msg = activation.blockConsumed
        ? activation.hostMessage
        : activation.hostMessage || getSabotageMessage(type as Parameters<typeof getSabotageMessage>[0]);

      set({
        game: {
          ...game,
          room: { ...game.room, players: updatedPlayers },
          sabotages: updatedSabotages,
          hostMessage: msg,
          selectedSabotage: null,
          sabotageTarget: null,
        },
      });
    },

    returnToBoard: () => {
      const { game } = get();
      if (!game) return;
      set({ game: { ...game, phase: 'board', currentQuestion: null, lastAnswer: null } });
    },

    resetGame: () => {
      useSabotageStore.getState().resetSabotagees();
      set({ game: null, localPlayerId: null, answeredCount: 0 });
    },

    setHostMessage: (msg) => {
      const { game } = get();
      if (!game) return;
      set({ game: { ...game, hostMessage: msg } });
    },

    updateCategories: (cats) => {
      const { game } = get();
      if (!game) return;
      globalPool.reset();
      const board = buildBoard(cats);
      const playerIds = game.room.players.map((p) => p.id);
      engine.newGame(
        playerIds.map((id) => ({ id, teamId: null, streak: 0, coldStreak: 0, score: 0 })),
        'ffa',
        cats,
      );
      useSabotageStore.getState().initGame('ffa', playerIds);
      set({
        game: {
          ...game,
          board,
          room: { ...game.room, categories: cats },
          sabotages: initSabotages(playerIds),
        },
      });
    },

    rematch: () => {
      const { game } = get();
      if (!game) return;
      const players = game.room.players.map((p) => ({ ...p, score: 0, streak: 0 }));
      const cats = game.room.categories;
      const playerIds = players.map((p) => p.id);
      globalPool.reset();
      const board = buildBoard(cats);
      engine.newGame(
        playerIds.map((id) => ({ id, teamId: null, streak: 0, coldStreak: 0, score: 0 })),
        'ffa',
        cats,
      );
      useSabotageStore.getState().initGame('ffa', playerIds);
      set({
        game: {
          ...game,
          board,
          room: {
            ...game.room,
            players,
            answeredQuestions: [],
            status: 'waiting',
          },
          currentQuestion: null,
          activePlayer: playerIds[0],
          timer: DEFAULT_TIMER,
          phase: 'lobby',
          hostMessage: getWelcomeMessage(),
          sabotages: initSabotages(playerIds),
          selectedSabotage: null,
          sabotageTarget: null,
          lastAnswer: null,
          teamScores: game.teamMembership ? { alpha: 0, beta: 0 } : {},
          teamStreaks: {},
          teamWeapons: game.teamMembership ? { alpha: [], beta: [] } : {},
          pendingWeapon: null,
          activeBomb: null,
          activeImmunity: {},
          forcedCategory: null,
          lastStandActive: null,
          lastStandUsed: {},
          activeTeamId: game.teamMembership ? 'alpha' : null,
          stealOpponentTeamId: null,
        },
        answeredCount: 0,
      });
    },

    setTeamMembership: (alpha, beta) => {
      const { game } = get();
      if (!game) return;
      set({
        game: {
          ...game,
          teamMembership: { alpha, beta },
          activeTeamId: 'alpha',
          teamScores: { alpha: 0, beta: 0 },
          teamStreaks: { alpha: 0, beta: 0 },
          teamWeapons: { alpha: [], beta: [] },
          pendingWeapon: null,
          activeBomb: null,
          activeImmunity: { alpha: false, beta: false },
          forcedCategory: null,
        },
      });
    },

    dismissPendingWeapon: () => {
      const { game } = get();
      if (!game || !game.pendingWeapon) return;
      const { teamId, weapon } = game.pendingWeapon;
      const teamWeapons = { ...game.teamWeapons };
      teamWeapons[teamId] = [...(teamWeapons[teamId] ?? []), weapon];
      set({
        game: {
          ...game,
          pendingWeapon: null,
          teamWeapons,
          hostMessage: getWeaponEarnedMessage(weapon),
        },
      });
    },

    useWeapon: (teamId, weapon, opts) => {
      const { game } = get();
      if (!game) return;

      // Remove first instance of weapon from inventory
      const teamWeapons = { ...game.teamWeapons };
      const inv = [...(teamWeapons[teamId] ?? [])];
      const idx = inv.indexOf(weapon);
      if (idx === -1) return;
      inv.splice(idx, 1);
      teamWeapons[teamId] = inv;

      switch (weapon) {
        case 'timer_bomb': {
          const targetTeam = opts?.targetTeamId ?? (teamId === 'alpha' ? 'beta' : 'alpha');
          set({
            game: {
              ...game,
              teamWeapons,
              activeBomb: targetTeam,
              hostMessage: getWeaponUsedTimerBomb(),
            },
          });
          break;
        }
        case 'immunity': {
          const activeImmunity = { ...game.activeImmunity, [teamId]: true };
          set({
            game: {
              ...game,
              teamWeapons,
              activeImmunity,
              hostMessage: getWeaponUsedImmunity(),
            },
          });
          break;
        }
        case 'forced_category': {
          const targetTeam  = opts?.targetTeamId ?? (teamId === 'alpha' ? 'beta' : 'alpha');
          const categoryId  = opts?.categoryId;
          const catName     = categoryId ? getCategoryById(categoryId)?.name ?? categoryId : '';
          set({
            game: {
              ...game,
              teamWeapons,
              forcedCategory: categoryId ? { targetTeamId: targetTeam, categoryId } : null,
              hostMessage: getWeaponUsedForcedCategory(catName),
            },
          });
          break;
        }
        case 'ask_friend': {
          const extraTimer = (game.phase === 'question' || game.phase === 'steal') ? 25 : 0;
          set({
            game: {
              ...game,
              teamWeapons,
              timer: game.timer + extraTimer,
              hostMessage: getWeaponUsedAskFriend(),
            },
          });
          break;
        }
        case 'extra_time': {
          const extraTimer = (game.phase === 'question' || game.phase === 'steal') ? 15 : 0;
          set({
            game: {
              ...game,
              teamWeapons,
              timer: game.timer + extraTimer,
              hostMessage: getWeaponUsedExtraTime(),
            },
          });
          break;
        }
      }
    },

    activateWeaponFromBox: (teamId, weapon, opts) => {
      const { game } = get();
      if (!game || !game.pendingWeapon) return;
      // Clear pending weapon (don't add to inventory — it's being used now)
      set({ game: { ...game, pendingWeapon: null } });
      // Now use it
      const teamWeapons = { ...game.teamWeapons };
      // Temporarily add then immediately consume via useWeapon
      teamWeapons[teamId] = [...(teamWeapons[teamId] ?? []), weapon];
      set({ game: { ...game, pendingWeapon: null, teamWeapons } });
      get().useWeapon(teamId, weapon, opts);
    },

    skipSteal: () => {
      const { game } = get();
      if (!game || game.phase !== 'steal') return;

      const updatedBoard = game.board.map((row) =>
        row.map((cell) =>
          cell.questionId === game.currentQuestion?.id
            ? { ...cell, answered: true }
            : cell
        )
      );
      // answeredQuestions was already updated at steal trigger — don't add again
      const answeredQuestions = game.room.answeredQuestions;
      const answeredCount = updatedBoard.reduce((a, r) => a + r.filter((c) => c.answered).length, 0);
      const allAnswered   = game.room.isTrial
        ? answeredQuestions.length >= TRIAL_QUESTION_LIMIT
        : answeredCount >= game.board.reduce((a, r) => a + r.length, 0);

      const playerIds  = game.room.players.map((p) => p.id);
      const nextIdx    = (game.room.players.findIndex((p) => p.id === game.activePlayer) + 1) % playerIds.length;
      const nextPlayer = playerIds[nextIdx];
      const nextTeamId: TeamId | null = game.activeTeamId === 'alpha' ? 'beta'
        : game.activeTeamId === 'beta' ? 'alpha' : null;

      set({
        game: {
          ...game,
          board: updatedBoard,
          phase: allAnswered ? 'finished' : 'result',
          room: { ...game.room, answeredQuestions, status: allAnswered ? 'finished' : 'playing' },
          activePlayer: nextPlayer,
          activeTeamId: nextTeamId ?? game.activeTeamId,
          timer: 0,
          hostMessage: getStealFailMessage(),
          lastAnswer: {
            playerId: game.activePlayer ?? '',
            correct: false,
            points: 0,
            timeBonus: 0,
            streakMultiplier: 1,
          },
          stealOpponentTeamId: null,
        },
        answeredCount,
      });
    },

    initStealTimer: (_opponentTeamId, _teamName) => {
      const tick = () => {
        const current = get().game;
        if (!current || current.phase !== 'steal') return;
        if (current.timer <= 0) {
          // Steal time expired — question passes with no points
          const updatedBoard = current.board.map((row) =>
            row.map((cell) =>
              cell.questionId === current.currentQuestion?.id
                ? { ...cell, answered: true }
                : cell
            )
          );
          // answeredQuestions was already updated at steal trigger — don't add again
          const answeredQuestions = current.room.answeredQuestions;
          const answeredCount = updatedBoard.reduce((a, r) => a + r.filter((c) => c.answered).length, 0);
          const allAnswered = current.room.isTrial
            ? answeredQuestions.length >= TRIAL_QUESTION_LIMIT
            : answeredCount >= current.board.reduce((a, r) => a + r.length, 0);

          const playerIds = current.room.players.map((p) => p.id);
          const nextIdx   = (current.room.players.findIndex((p) => p.id === current.activePlayer) + 1) % playerIds.length;
          const nextPlayer = playerIds[nextIdx];
          const nextTeamId: TeamId | null = current.activeTeamId === 'alpha' ? 'beta'
            : current.activeTeamId === 'beta' ? 'alpha' : null;

          set({
            game: {
              ...current,
              board: updatedBoard,
              phase: allAnswered ? 'finished' : 'result',
              room: { ...current.room, answeredQuestions, status: allAnswered ? 'finished' : 'playing' },
              activePlayer: nextPlayer,
              activeTeamId: nextTeamId ?? current.activeTeamId,
              timer: 0,
              hostMessage: getStealFailMessage(),
              lastAnswer: {
                playerId: current.activePlayer ?? '',
                correct: false,
                points: 0,
                timeBonus: 0,
                streakMultiplier: 1,
              },
              stealOpponentTeamId: null,
            },
            answeredCount,
          });
          return;
        }
        set({ game: { ...current, timer: current.timer - 1 } });
        setTimeout(tick, 1000);
      };
      setTimeout(tick, 1000);
    },

    activateLastStand: (teamId) => {
      const { game } = get();
      if (!game) return;
      if (game.lastStandUsed[teamId]) return;
      set({
        game: {
          ...game,
          lastStandActive: teamId,
          lastStandUsed: { ...game.lastStandUsed, [teamId]: true },
          hostMessage: getLastStandMessage(),
        },
      });
    },
  }))
);
