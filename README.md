# جاوب — Arabic Multiplayer Trivia Game

RTL Arabic trivia game with team vs team gameplay, a Kuwaiti-dialect AI host, and a sabotage system. Built with TanStack Start, React 19, Zustand, and Tailwind CSS 4. Deployable on Netlify.

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

### Production build

```bash
npm run build      # outputs to dist/client (client) and dist/server (SSR)
```

### Netlify deploy

Connect the repo to Netlify. Settings are pre-configured in `netlify.toml`:

| Setting | Value |
|---|---|
| Build command | `vite build` |
| Publish directory | `dist/client` |
| Node version | 18+ |

No environment variables are required for the current local/offline MVP.

---

## Playable MVP Flow

1. **Home** → enter name → choose mode (FFA or Team vs Team) → Create Room or Trial
2. **Lobby** → share room code → other players join → host configures teams (optional)
3. **Category Draft** → each team picks categories in snake order (3 picks each)
4. **Board** → active team picks a question tile (4 categories × 3 tiers)
5. **Question** → 15-second timer → answer → score update → sabotage available between rounds
6. **Result** → host commentary → return to board
7. **Finished** → winner screen → rematch (same players, new board) or new game (full reset)

### Trial mode
- 6 questions, then paywall prompt
- No category draft in trial
- No sabotage in trial

---

## Architecture

```
src/
├── engine/          # Pure logic (no React)
│   ├── questionEngine.ts     # Board construction, tier/point mapping
│   ├── sabotageEngine.ts     # Sabotage inventory, activation, effect resolution
│   ├── categoryDraft.ts      # Snake draft manager
│   ├── difficultyAdapter.ts  # Adjusts question tier based on streak
│   ├── answerValidator.ts    # Scoring: base, bomb, double, steal
│   └── roundManager.ts       # Turn rotation, board exhaustion detection
├── store/           # Zustand stores (subscribeWithSelector)
│   ├── gameStore.ts           # Primary game state machine
│   ├── roomStore.ts           # Room/team/answer-phase state
│   └── sabotageStore.ts       # Sabotage wrapper around engine
├── hooks/
│   ├── useQuestionFlow.ts     # canAnswer, submitAnswer, isMyTurn
│   ├── useSabotage.ts         # Per-player sabotage interface
│   ├── useCategoryDraft.ts    # Draft flow orchestration
│   └── useHostMessage.ts      # AI host reaction triggers
├── lib/
│   ├── hostEngine.ts          # Kuwaiti-dialect dialogue banks + anti-repeat
│   ├── questions.ts           # Question bank (Arabic, 4 categories, 3 tiers)
│   ├── categories.ts          # Category definitions
│   ├── teams.ts               # TeamId helpers
│   └── types.ts               # Shared interfaces
├── components/
│   ├── GameApp.tsx            # Top-level phase router
│   ├── GameBoard.tsx          # 4×3 question tile grid
│   ├── QuestionCard.tsx       # Question + answer options + reveal
│   ├── ResultOverlay.tsx      # Post-answer result modal
│   ├── GameOverScreen.tsx     # Winner + leaderboard + rematch/new game
│   ├── HomeScreen.tsx         # Create/join room entry
│   ├── Lobby.tsx              # Pre-game player list
│   ├── HostBubble.tsx         # AI host speech bubble
│   └── game/
│       ├── TeamScoreboard.tsx  # Live team scores
│       ├── SabotageControls.tsx
│       ├── EffectToast.tsx     # Sabotage activation toasts
│       ├── ScorePopup.tsx      # Floating +/- score animation
│       └── TimerBar.tsx
└── mock/
    ├── players.ts
    └── rooms.ts
```

---

## Known Limitations (MVP)

| Area | Limitation |
|---|---|
| Multiplayer | Local/offline only — all players share one browser or session. No WebSocket/real-time sync. |
| Question bank | ~60 questions across 4 categories. No AI generation yet. |
| Room codes | Codes are generated but join-by-code is local (no server lookup). |
| Auth | No user accounts or persistent sessions. |
| Voice | AI host is text-only. Voice output is planned but not implemented. |
| Sabotage balance | Mystery box outcomes are random; not weighted for game state. |
| Mobile | Responsive layout tested at design time; no automated mobile regression. |
| Rematch | Reuses same player list — no player-drop handling between rematches. |

---

## Next Sprint Priorities

1. **Real-time multiplayer** — WebSocket server or Supabase Realtime; sync `gameStore` state across clients
2. **Expand question bank** — Add 200+ questions; integrate AI generation via Claude API
3. **Voice host** — Stream TTS for `game.hostMessage` using ElevenLabs or browser Speech Synthesis
4. **Persistent rooms** — Server-side room state so players can join by code from different devices
5. **Animated board transitions** — Flip/reveal animation on answered cells
6. **Difficulty adapt** — Wire `DifficultyAdapter` streak output back into `QuestionEngine` tier selection
7. **Analytics** — Track question correctness rates, sabotage use, and session length
8. **PWA / install prompt** — Add manifest + service worker for mobile home screen install
9. **Payment integration** — Replace mock `PaymentModal` with Stripe or local gateway
10. **Category expansion** — Add 4 more categories (Sports, Movies, Science, History)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start v1 |
| Frontend | React 19, TanStack Router v1 |
| State | Zustand v5 (subscribeWithSelector) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 (RTL, custom theme tokens) |
| Font | Tajawal (Arabic, Google Fonts) |
| Deployment | Netlify (SSR via Netlify Functions) |
| Language | TypeScript 5.7 strict |
