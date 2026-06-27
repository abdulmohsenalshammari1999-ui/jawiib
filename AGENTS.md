# AGENTS.md — Jawib (جاوب)

## Project Overview

Jawib is a Kuwait-themed Arabic multiplayer trivia game show app. Players compete in teams (البحر vs البر) or free-for-all, picking categories and answering questions across point tiers (100–600). Built as a mobile-first dark-mode web app with real-time multiplayer.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 (custom dark theme) |
| State | Zustand |
| Multiplayer | PartyKit WebSockets |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify (auto-deploy from GitHub) |

## Agent Configuration

Three specialized agents are configured in `.claude/jawib/`:

| Agent | Path | Purpose |
|-------|------|---------|
| **Code** | `.claude/jawib/code/AGENT.md` | Implementation — writes TypeScript/React, manages state, ships features |
| **Cowork** | `.claude/jawib/cowork/AGENT.md` | Coordination — bridges design ↔ code, maintains token consistency |
| **Design** | `.claude/jawib/design/AGENT.md` | Visual design — UI/UX specs, color system, component patterns, animations |

## Directory Structure

```
src/
├── components/              # Screen-level components
│   ├── GameApp.tsx           # Main controller — all screen routing & state
│   ├── EntryScreen.tsx       # Onboarding — name, avatar, gender
│   ├── HomeScreen.tsx        # Landing — mode select, create/join game
│   ├── Lobby.tsx             # Room code, player list, waiting
│   ├── TeamSetupScreen.tsx   # Team naming, game length
│   ├── GameBoard.tsx         # Category grid with point tiles
│   ├── QuestionCard.tsx      # Question display, answers, timer
│   ├── ResultOverlay.tsx     # Correct/wrong feedback overlay
│   ├── GameOverScreen.tsx    # Final scores, winner celebration
│   ├── GameLoadingScreen.tsx # Pre-game countdown
│   ├── ConfirmModal.tsx      # Reusable confirmation dialog
│   ├── FeedbackModal.tsx     # Post-game rating
│   ├── HowToPlayModal.tsx    # Tutorial
│   ├── PaymentModal.tsx      # Payment gate
│   ├── ShareCard.tsx         # Invite sharing
│   ├── HostBubble.tsx        # Host message display
│   ├── ErrorBoundary.tsx     # Error catch
│   ├── game/                 # In-game sub-components
│   │   ├── TeamScoreboard.tsx
│   │   ├── TimerBar.tsx
│   │   ├── ScorePopup.tsx
│   │   ├── EffectToast.tsx
│   │   ├── EvidenceCard.tsx
│   │   ├── MediaRenderer.tsx
│   │   ├── MysteryBoxOverlay.tsx
│   │   ├── SabotageControls.tsx
│   │   └── TeamWeaponInventory.tsx
│   ├── screens/
│   │   └── CategoryDraftScreen.tsx
│   └── cards/
│       ├── InviteCard.tsx
│       └── ResultCard.tsx
├── hooks/                   # Custom React hooks
│   ├── useMultiplayer.ts     # PartyKit WebSocket connection
│   ├── useTimer.ts           # Question/steal timers
│   ├── useCategoryDraft.ts   # Draft pick logic
│   ├── useQuestionFlow.ts    # Question → answer → result flow
│   ├── useTeam.ts            # Team assignment
│   ├── useSabotage.ts        # Sabotage/weapon mechanics
│   ├── useRoom.ts            # Room management
│   ├── useHostMessage.ts     # Dynamic host commentary
│   ├── useRoundProgress.ts   # Round tracking
│   └── useAdaptiveDifficulty.ts
├── lib/                     # Utilities & data
│   ├── types.ts              # Shared TypeScript types
│   ├── categories.ts         # Category definitions
│   ├── categoryMedia.ts      # Category tile images
│   ├── questions.ts          # Question bank
│   ├── questionsExpanded*.ts # Extended question data (p1–p6)
│   ├── csvLoader.ts          # CSV question import
│   ├── audio.ts              # Sound effects
│   ├── haptics.ts            # Vibration feedback
│   ├── host.ts               # Host AI messages
│   ├── hostEngine.ts         # Host message generation
│   ├── teams.ts              # Team utilities
│   ├── sabotages.ts          # Sabotage definitions
│   ├── appConfig.ts          # Platform config
│   └── iap.ts                # In-app purchases
├── store/                   # Zustand state stores
│   ├── gameStore.ts          # Game phase, players, scores
│   ├── roomStore.ts          # Room mode, teams, sync
│   ├── accountStore.ts       # Player identity
│   ├── sabotageStore.ts      # Sabotage state
│   ├── uiStore.ts            # UI modals/toasts
│   └── index.ts              # Store exports
├── routes/                  # TanStack Router (file-based)
│   ├── __root.tsx
│   └── index.tsx
└── styles.css               # Design system — tokens, animations, patterns
```

## Game Flow

```
Entry → Home → Lobby → [TeamSetup → CategoryDraft] → Loading → Board ⇄ Question/Steal → Result → GameOver
```

### Phases
- `lobby` — room setup (subviews: `lobby`, `setup`, `teams`, `draft`)
- `board` — selecting questions from the grid
- `question` — answering a question with timer
- `steal` — opponent team can steal on wrong answer
- `result` — correct/wrong feedback (auto-advances)
- `finished` — final scores, winner

## Development Commands

```bash
npm run dev      # Dev server (port 3000)
npm run build    # Production build
npx tsc --noEmit # Type check
```

## Conventions

- **Components:** PascalCase
- **Hooks/utils:** camelCase
- **Routes:** kebab-case
- **All UI text:** Arabic
- **Direction:** RTL
- **Imports:** `@/` alias for `src/`
- **Styling:** Tailwind + custom `.game-card`, `.btn-gold`, `.sadu-accent` classes
- **State:** Zustand stores, React hooks for local state
- **Types:** Strict mode, `type` keyword for type-only imports
