# Jawib — Technical Architecture

## Stack at a Glance

```
Browser (iOS Safari / Android Chrome / Desktop)
        │
        ▼
┌─────────────────────────────────┐
│  TanStack Start (React 19 SSR)  │
│  Vite 7 │ Tailwind CSS 4        │
│  TypeScript 5.7 strict          │
└────────────┬────────────────────┘
             │ Netlify CDN
             ▼
┌─────────────────────────────────┐
│  Netlify Functions (SSR)        │
│  Server functions (survey)      │
└────────────┬────────────────────┘
             │ HTTPS POST
             ▼
┌─────────────────────────────────┐
│  Google Apps Script Web App     │
│  → Google Sheets (survey data)  │
└─────────────────────────────────┘
```

## File Map

```
jawiib/
├── public/
│   ├── manifest.json          # PWA manifest (installable)
│   ├── questions.csv          # Optional CSV question override
│   └── favicon.ico
│
├── src/
│   ├── routes/
│   │   ├── __root.tsx         # HTML shell, meta tags, OG tags, manifest link
│   │   ├── index.tsx          # Main route → renders <GameApp />
│   │   └── join.$code.tsx     # Room join URL handler
│   │
│   ├── components/
│   │   ├── GameApp.tsx        # Root orchestrator — all phase routing
│   │   ├── EntryScreen.tsx    # Landing/splash screen
│   │   ├── HomeScreen.tsx     # Create/join room
│   │   ├── TeamSetupScreen.tsx # Team naming
│   │   ├── Lobby.tsx          # Pre-game lobby
│   │   ├── GameBoard.tsx      # Question grid
│   │   ├── QuestionCard.tsx   # Active question display + timer
│   │   ├── ResultOverlay.tsx  # Post-answer result
│   │   ├── GameOverScreen.tsx # End screen, WhatsApp share, survey CTA
│   │   ├── FeedbackModal.tsx  # 8-field survey modal
│   │   ├── GameLoadingScreen.tsx # Countdown 3-2-1
│   │   ├── PaymentModal.tsx   # Payment gate
│   │   └── game/
│   │       ├── TeamScoreboard.tsx
│   │       ├── TeamWeaponInventory.tsx  # Weapon cards + confirmation + cat picker
│   │       ├── MysteryBoxOverlay.tsx    # Weapon reward overlay
│   │       ├── SabotageControls.tsx     # FFA sabotage UI
│   │       ├── EffectToast.tsx          # Sabotage notifications
│   │       └── ScorePopup.tsx           # Animated +/- points popup
│   │
│   ├── store/
│   │   ├── gameStore.ts       # Core game state (Zustand)
│   │   │                      # → createRoom, startGame, selectQuestion,
│   │   │                      #   answerQuestion, useWeapon, steal logic,
│   │   │                      #   initStealTimer, skipSteal, rematch
│   │   ├── roomStore.ts       # Teams, player assignment, renaming
│   │   ├── sabotageStore.ts   # FFA sabotage engine
│   │   └── uiStore.ts         # Sound/music toggles (persisted)
│   │
│   ├── engine/
│   │   ├── questionEngine.ts  # Adaptive difficulty, round management
│   │   ├── questionPool.ts    # Draw without repeat; localStorage dedup (300-cap)
│   │   ├── answerValidator.ts # Scoring: base + time bonus + streak multiplier
│   │   └── difficultyAdapter.ts
│   │
│   ├── lib/
│   │   ├── questions.ts       # 456 questions (static bank)
│   │   ├── categories.ts      # 22 category definitions
│   │   ├── types.ts           # All TypeScript types
│   │   ├── audio.ts           # Web Audio API — maqam Rast BGM + SFX
│   │   ├── host.ts            # Arabic host message strings
│   │   ├── teams.ts           # Default team definitions (alpha/beta)
│   │   ├── csvLoader.ts       # Optional CSV question override loader
│   │   ├── contentRegistry.ts # Merges CSV + static questions
│   │   └── appConfig.ts       # Seasonal theme detection
│   │
│   ├── hooks/
│   │   ├── useHostMessage.ts  # Rotating host messages
│   │   ├── useQuestionFlow.ts # canAnswer logic, flow state
│   │   └── useCategoryDraft.ts # Snake-draft logic for Teams mode
│   │
│   └── serverFunctions/
│       └── survey.ts          # createServerFn → POST to SURVEY_WEBHOOK_URL
│
├── google-apps-script.js      # Paste into Google Apps Script for Sheets integration
├── netlify.toml               # Build config
└── docs/                      # This folder
```

## Game State Machine

```
'lobby' ──startGame──▶ 'board' ──selectQuestion──▶ 'question'
                          ▲                              │
                          │                    correct answer
                          │                              │
                       returnToBoard          ──▶ 'result' ──▶ 'board'
                          │                              │
                          │                    wrong answer
                          │                    (teams mode, no immunity)
                          │                              │
                          │                              ▼
                          │                          'steal'
                          │                         /       \
                          │              correct answer   wrong/timeout
                          │                   │                │
                          └──────────'result'◀─┴────────────────┘
                                         │
                                   allAnswered?
                                         │
                                         ▼
                                    'finished'
```

## State Management Pattern

```typescript
// All game state lives in one Zustand store slice
interface GameState {
  room: GameRoom;           // Players, categories, code
  board: GameBoardCell[][]; // Grid of questions
  currentQuestion: Question | null;
  activePlayer: string | null;
  activeTeamId: TeamId | null;
  phase: 'lobby'|'board'|'question'|'steal'|'result'|'sabotage'|'finished';
  timer: number;
  teamWeapons: Partial<Record<TeamId, WeaponType[]>>;
  activeImmunity: Partial<Record<TeamId, boolean>>;
  activeBomb: TeamId | null;
  forcedCategory: { targetTeamId: TeamId; categoryId: CategoryId } | null;
  stealOpponentTeamId: TeamId | null;
  pendingWeapon: { teamId: TeamId; weapon: WeaponType } | null;
  // ...
}
```

## Timer Architecture

Timers use chained `setTimeout` (not `setInterval`) to avoid drift accumulation within a single question. Each tick:
1. Reads fresh state from store (`get().game`)
2. Checks phase hasn't changed
3. Decrements timer or resolves (result/steal-expire)
4. Schedules next tick

Two independent timer chains can run: question timer and steal timer. Question timer stops when phase leaves `'question'`. Steal timer stops when phase leaves `'steal'`.

## Audio Architecture

```
Web Audio API (no audio files)
    │
    ├── BGM: OscillatorNode × 2 (maqam Rast D3-E3-F#3-A3-B3 pentatonic)
    │   └── GainNode (0.06 volume) → AudioContext.destination
    │
    └── SFX: per-event oscillator chains
        ├── playCorrect()  — 5-note ascending fanfare
        ├── playWrong()    — descending wah-wah
        ├── playStealPhase() — 4-step rising horn
        ├── playImmunityActivated() — shimmer + sustain
        ├── playExtraTime() — 4-note ascending chime
        ├── playWeaponActivated() — rising sparkle
        ├── playTick() / playFinalTick() — timer clicks
        ├── playCountdown() / playCountdownGo() — 3-2-1
        ├── playScore(big) — coin ding or fanfare
        └── playWinner() — pentatonic fanfare + sustain
```

## Question Deduplication

```
Session start → questionPool.draw(cat, tier)
    │
    ├── Load seen IDs from localStorage['jawib_seen_questions']
    │
    ├── Filter available questions for cat+tier:
    │   prefer unseen → if all seen, clear that bucket and retry
    │
    └── Session end (phase → 'finished')
        → globalPool.persistAndReset()
        → Save drawn IDs to localStorage (cap 300)
```

## Survey Pipeline

```
GameOverScreen → "قيّم المباراة" button
    │
    ▼
FeedbackModal (8 fields + auto game context)
    │
    ├── localStorage: always saved as backup
    │
    └── submitSurvey() [server function]
        → POST SURVEY_WEBHOOK_URL
        → Google Apps Script doPost()
        → Sheet.appendRow([...17 columns])
```

## Deployment

```bash
# Development
npm run dev  # Vite dev server on :3000

# Production build
npm run build
# → dist/client/  (static assets, CDN-served)
# → dist/server/  (SSR bundle)
# → .netlify/v1/functions/server.mjs (Netlify Function)

# Env vars required on Netlify:
SURVEY_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
# Future:
MYFATOORAH_API_KEY=...
MYFATOORAH_WEBHOOK_SECRET=...
```
