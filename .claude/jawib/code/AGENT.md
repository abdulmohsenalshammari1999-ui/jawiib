# Claude Code Agent — Jawib

## Role
You are the **code implementation agent** for Jawib (جاوب), an Arabic trivia game show app. You write, debug, and ship production-ready TypeScript/React code.

## Project Identity
- **App name:** Jawib (جاوب) — "Answer" in Arabic
- **Concept:** Kuwait-themed multiplayer trivia game show (دوانية style)
- **Target audience:** Arabic-speaking players, primarily mobile
- **Direction:** RTL (right-to-left), all UI text in Arabic

## Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 (custom theme in `src/styles.css`) |
| State | Zustand (stores in `src/store/`) |
| Multiplayer | PartyKit WebSockets |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify (auto-deploy from GitHub) |

## Architecture

### Screen Flow
```
EntryScreen → HomeScreen → Lobby → TeamSetup → CategoryDraft → GameLoading → Board → Question/Steal → Result → GameOver
```

### State Management
- `gameStore.ts` — game phase, players, scores, questions, timers
- `roomStore.ts` — room mode (ffa/teams), team assignments, sync
- `accountStore.ts` — player identity, avatar, preferences
- `sabotageStore.ts` — sabotage/weapon mechanics
- `uiStore.ts` — UI state (modals, toasts)

### Key Directories
```
src/components/          — Screen-level components (GameApp, HomeScreen, etc.)
src/components/game/     — In-game sub-components (scoreboard, timer, effects)
src/components/screens/  — Full-screen views (CategoryDraftScreen)
src/components/cards/    — Reusable card components
src/hooks/               — Custom hooks (useMultiplayer, useTimer, etc.)
src/lib/                 — Utilities, question data, categories, audio
src/store/               — Zustand stores
src/routes/              — TanStack Router file-based routes
```

### Game Phases
`lobby` → `board` → `question` → `steal` → `result` → `finished`

Within lobby: subViews `lobby` | `setup` | `teams` | `draft`

## Conventions
- Components: PascalCase
- Hooks/utils: camelCase
- All UI text: Arabic
- Import paths: `@/` alias for `src/`
- Styling: Tailwind utilities + custom CSS classes from `styles.css`
- No comments unless explaining a non-obvious constraint
- Type-only imports with `type` keyword

## Commands
```bash
npm run dev      # Dev server on port 3000
npm run build    # Production build (output: dist/client)
npx tsc --noEmit # Type check
```

## Critical Rules
1. Never break RTL layout — always use `dir="rtl"` on root containers
2. All user-facing text must be Arabic
3. Use existing design tokens from `styles.css` (jawwib-gold, jawwib-blue, jawwib-red, etc.)
4. Touch targets must be minimum 44px for mobile
5. Test with `npm run build` before pushing — Netlify auto-deploys
6. State resets must call both `resetGame()` and `resetRoom()` for full cleanup
