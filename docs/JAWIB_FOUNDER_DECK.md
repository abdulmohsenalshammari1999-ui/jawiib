# جاوب — Jawib
## Founder Reference Document
### Game · Technology · Business Model · Monetization

> **Version:** 2.0 — Sprint 2 complete  
> **Status:** Live on Netlify, PR #2 open  
> **Confidential — Founder Use Only**

---

## 1. What is Jawib?

**جاوب** (Jawib — Arabic: "Answer!") is a Kuwait-first, Gulf-wide social trivia game for groups of 2–10+ players on a single shared device. It is the deepest Arabic trivia experience on any platform: 456 questions, 22 categories, 6 difficulty tiers, a 5-weapon combat system, and a steal mechanic that turns every wrong answer into a dramatic moment.

It is designed specifically for the **diwaniya** (ديوانية) — the living-room gathering that defines Kuwaiti and broader Gulf social life — where one phone is passed around the room, music plays, and every correct answer is celebrated loudly.

### One-sentence pitch
> "سين جيم بس أعمق، أحلى، وأرخص." — *"Seen Jeem but deeper, better, and cheaper."*

---

## 2. The Problem

The GCC social gaming market is largely unserved. The main competitor, **Seen Jeem (سين جيم)**, has 1M+ downloads but:
- Only **6 categories** and **36 questions per session**
- Rated **2.5/5 on Android**, **3.3/5 on iOS** — driven by complaints about repetition, limited content, forced landscape, pay-per-package pricing
- No depth: 3 basic lifelines, no strategy, no comeback mechanics
- Question repetition kills replayability

Groups want more: more categories, more depth, more drama, more sessions before seeing the same question again.

---

## 3. The Solution — Jawib's Differentiators

| Dimension | Seen Jeem | Jawib |
|-----------|-----------|-------|
| Categories | 6 | **22** |
| Questions per session | 36 | Up to 132 |
| Total question bank | ~200 est. | **456** |
| Difficulty tiers | 3 | **6** (100–600 pts) |
| Game modes | Teams only | **Teams + FFA** |
| Mechanics | 3 basic lifelines | **5 weapons + steal mechanic + sabotage** |
| Orientation | Forced landscape (complaint) | **Portrait-first** |
| Free trial | 1 full game | **9 questions free** |
| Pricing | Per-package (~30 SAR) | **4 KWD flat (full game)** |
| Sharing | None | **WhatsApp share card** |
| Install | Native app | **PWA (add to homescreen)** |
| Post-game data | None | **Survey → Google Sheets** |
| App store rating | 2.5–3.3/5 | N/A (web) |

---

## 4. Game Overview

### 4.1 Modes

**Teams Mode (فريق ضد فريق)**
- Two teams name themselves anything they want
- Category Draft: each team picks 3–4 categories from the full 22 (snake-draft order)
- 5 weapon types earned through correct-answer streaks
- Steal mechanic: wrong answer → opponent gets 30 seconds to steal points
- Turn alternates between teams each question

**FFA Mode (الكل ضد الكل)**
- Every player for themselves
- No weapons, no steal — pure trivia speed
- Good for quick sessions

### 4.2 The Board
- Grid of selected categories × 6 tiers (100–600 points)
- Active team picks any uncovered cell
- Board shrinks as questions are answered

### 4.3 The 5 Weapons

Earned when a team answers 3 questions correctly in a row (mystery box):

| Weapon | Arabic | Effect |
|--------|--------|--------|
| ⏱️ Extra Time | وقت إضافي | +15 seconds on the current/next question |
| 🛡️ Immunity | درع الحصانة | Next wrong answer: no points lost, no steal triggered |
| 💣 Timer Bomb | قنبلة الوقت | Opponent's next question timer is halved |
| 🎯 Forced Category | فرض الفئة | You choose which category opponent must answer from |
| 📞 Call a Friend | اتصل بصديق | +25 seconds for real-world consultation |

Mystery Box: activate immediately OR save for later.

### 4.4 The Steal Mechanic (Signature Feature)

1. Team A answers wrong (no immunity active)
2. "فرصة سرقة! 🏴‍☠️" screen appears — 30-second countdown
3. Team B takes the device and attempts to answer the same question
4. Correct → Team B earns full points for that question
5. Wrong or time expires → question passes with no points

**Modifiers:**
- Timer bomb on steal team → steal timer halved (15s max)
- Extra time weapon → +15s on steal timer
- Host/referee can skip the steal with one tap

### 4.5 Question Tiers & Scoring

| Tier | Points | Speed Bonus | Streak Multiplier |
|------|--------|-------------|-------------------|
| 1 | 100 | +10 if fast | 1.5× at 3-streak |
| 2 | 200 | +10 if fast | 1.5× at 3-streak |
| 3 | 300 | +10 if fast | 1.5× at 3-streak |
| 4 | 400 | +10 if fast | 1.5× at 3-streak |
| 5 | 500 | +10 if fast | 1.5× at 3-streak |
| 6 | 600 | +10 if fast | 1.5× at 3-streak |

### 4.6 The 22 Categories

| # | ID | Arabic | Group |
|---|----|--------|-------|
| 1 | culture | ثقافة عامة | General |
| 2 | sport | رياضة | General |
| 3 | history | تاريخ | General |
| 4 | quran | قرآن وسنة | Gulf |
| 5 | gulf | خليج عربي | Gulf |
| 6 | science | علوم | General |
| 7 | geo | جغرافيا | General |
| 8 | food | طعام ومطبخ | General |
| 9 | drama | دراما وأفلام | General |
| 10 | music | موسيقى وفن | General |
| 11 | jokes | نكت وطرائف | General |
| 12 | business | أعمال | General |
| 13 | social | مواقف اجتماعية | General |
| 14 | ramadan | رمضان | Seasonal |
| 15 | travel | سفر وسياحة | General |
| 16 | family | عائلة | General |
| 17 | kuwait_history | تاريخ الكويت | Kuwait |
| 18 | kuwait_dialect | لهجة كويتية | Kuwait |
| 19 | gcc_football | كرة القدم الخليجية | Gulf |
| 20 | diwaniya | ديوانية وعادات | Kuwait |
| 21 | kuwait_food | مطبخ كويتي | Kuwait |
| 22 | kuwait_celebs | مشاهير الكويت | Kuwait |

---

## 5. Technology Stack

### 5.1 Frontend
- **Framework:** TanStack Start v1.166 (React 19, file-based SSR routing)
- **UI:** React 19, Tailwind CSS 4, custom Kuwait aesthetic (diwaniya dark theme, gold accents, maqam Rast audio)
- **State:** Zustand v5 with subscribeWithSelector — 4 stores:
  - `gameStore` — core game state, timer, weapons, steal mechanic
  - `roomStore` — teams, player assignment
  - `sabotageStore` — FFA sabotage effects
  - `uiStore` — sound/music toggles
- **Audio:** Web Audio API (no audio files) — maqam Rast pentatonic BGM, family-friendly SFX
- **Language:** TypeScript 5.7 strict mode

### 5.2 Hosting & Deployment
- **Host:** Netlify (serverless, CDN, edge functions via `@netlify/plugin-tanstack-router`)
- **Build:** Vite 7, output to `dist/client` (client) + `dist/server` (SSR)
- **SSR:** TanStack Start SSR → Netlify Functions (auto-generated `.netlify/v1/functions/server.mjs`)
- **PWA:** `public/manifest.json` — installable on iOS/Android homescreen

### 5.3 Backend / Server Functions
- **Pattern:** TanStack Start `createServerFn` — runs server-side on Netlify Functions
- **Survey endpoint:** `src/serverFunctions/survey.ts` → POSTs to `SURVEY_WEBHOOK_URL` (Google Apps Script web app)
- **No database** — all game state is client-side Zustand. Persistence via localStorage only.
- **Env vars managed by Netlify:** `SURVEY_WEBHOOK_URL`

### 5.4 Question System
- 456 questions hard-coded in `src/lib/questions.ts`
- Optional CSV override: `public/questions.csv` parsed client-side by `src/lib/csvLoader.ts`
- `questionPool.ts` — draws without repetition within a session; persists seen IDs to localStorage across sessions (cap 300) to prevent question repetition
- Adaptive difficulty engine (`src/engine/`) — tracks player streaks and cold streaks, adjusts suggested question difficulty

### 5.5 Survey → Google Sheets Pipeline
```
Player fills survey → FeedbackModal → submitSurvey() server function
→ POST /survey-webhook → Google Apps Script doPost()
→ appendRow() to Google Sheet → Founder reviews live data
```
Fields captured automatically: game mode, team names, scores, questions answered, categories played, timestamp.
Fields from player: rating (1–5), difficulty (easy/medium/hard), fun score (1–5), age group, play-again, recommend, optional name, optional comment.

---

## 6. Business Model

### 6.1 Current Model — Pay-Per-Session

| Tier | Price | What you get |
|------|-------|--------------|
| Trial (free) | 0 KWD | 9 questions, no weapons, no steal |
| Full Game | **4 KWD** | Unlimited questions, all 22 categories, weapons, steal, sabotage |

**Why 4 KWD:**
- Below Seen Jeem's per-package price (~8–12 KWD for comparable content)
- Single gathering cost (split between attendees = less than a coffee each)
- Low enough for impulse purchase during a diwaniya session
- High enough to fund content creation

**Current conversion funnel:**
```
Entry screen → Create game → Play 9 trial questions → 
"عجبتك؟ افتح النسخة الكاملة" → 4 KWD payment → Full game
```

### 6.2 Revenue Streams (Current + Planned)

#### Stream 1: Direct Game Sales ✅ Live
- 4 KWD per full game session
- Session is unlimited (rematch, same categories)
- Target: 500 sessions/month = 2,000 KWD/month (~$6,500 USD)

#### Stream 2: Seasonal Packages 🔜 Planned
- Ramadan Pack: 22 Ramadan-themed questions unlocked — 1.5 KWD add-on
- National Day Pack: Kuwait heritage deep-dive — 1 KWD add-on
- GCC Pack: Saudi/UAE/Bahrain categories — 2 KWD add-on

#### Stream 3: Corporate / Event Licensing 🔜 Planned
- Branded version for corporate events, team-building, weddings
- Host dashboard with custom questions
- Per-event pricing: 25–50 KWD
- Target: hotels, event companies, corporate HR

#### Stream 4: Subscription (Diwaniya Pass) 🔜 Planned
- 8 KWD/month — unlimited sessions, priority new categories
- Designed for regulars who play weekly
- Addresses Seen Jeem's top complaint: "why pay per game?"

#### Stream 5: Advertising (Sponsorship Tier) 🔜 Planned
- Branded question packs ("مقدّم من بنك X")
- Loading screen sponsorship during Ramadan
- Category naming rights for brands

### 6.3 Unit Economics (Conservative Estimates)

| Metric | Value |
|--------|-------|
| Session price | 4 KWD |
| Avg players per session | 6 |
| Cost per player | 0.67 KWD |
| Content cost (456 Qs amortized) | ~0.008 KWD/session |
| Hosting cost | ~0.01 KWD/session (Netlify free tier up to ~10K sessions) |
| Net margin | ~99% (no servers, no staff to run) |

### 6.4 Growth Model

**Phase 1 — Organic (months 1–3)**
- WhatsApp share card on every game over screen → viral coefficient
- Every winning team shares: "فريق الذئاب فاز بـ 1200 نقطة! تحداهم على جاوب"
- Target: 100 sessions → 600 WhatsApp shares → 60 new games (60% conversion at gatherings)

**Phase 2 — Ramadan Push (month 4–6)**
- Activate ramadan category, seasonal theme auto-activates
- Ramadan Pack launch (special pricing: 1 KWD for 2 weeks)
- Influencer seeding: 3 Kuwaiti diwaniya accounts

**Phase 3 — Regional Expansion (month 6–12)**
- Saudi-specific categories (Vision 2030, Saudi history, Saudi dialect)
- UAE, Bahrain, Qatar packs
- Pricing stays 4 KWD (purchasing parity across GCC)

---

## 7. Monetization & Fin-Tech Roadmap

### 7.1 Current Payment (Gap)
The 4 KWD payment gate is currently shown as a modal (`PaymentModal.tsx`) but has **no payment processor integrated**. Payment must be handled out-of-band (manual transfer, WhatsApp confirmation).

This is intentional for MVP — validate demand before integrating a payment gateway.

### 7.2 Payment Gateway Options (GCC-Ready)

| Gateway | Fit | Notes |
|---------|-----|-------|
| **MyFatoorah** | ⭐⭐⭐⭐⭐ | Kuwait-native, KNET + Visa + Apple Pay. Easy API. |
| **Tap Payments** | ⭐⭐⭐⭐ | Kuwait + Saudi + UAE. KNET, mada, Apple Pay. |
| **PayTabs** | ⭐⭐⭐ | GCC-wide, more complex integration |
| **Stripe** | ⭐⭐ | No KNET, not Kuwait-native |

**Recommendation: MyFatoorah** — Kuwaiti company, supports KNET (dominant payment in Kuwait), Apple Pay, Visa, MasterCard. REST API, webhook-friendly.

### 7.3 Integration Plan (MyFatoorah)

```
1. Register at portal.myfatoorah.com → get API key
2. Create server function: src/serverFunctions/createPayment.ts
   → calls MyFatoorah /v2/InitiatePayment
   → returns payment URL
3. PaymentModal.tsx: redirect to MyFatoorah hosted payment page
4. On return: webhook → server function validates payment
   → set game.room.isTrial = false in store
5. Store payment proof in localStorage + backend log
```

Required env vars: `MYFATOORAH_API_KEY`, `MYFATOORAH_WEBHOOK_SECRET`

### 7.4 Subscription Implementation

```typescript
// Future: Netlify Identity for user accounts
// + MyFatoorah recurring billing
// + Store subscription status in Netlify KV or Supabase

interface SubscriptionStatus {
  active: boolean;
  plan: 'monthly' | 'annual' | null;
  expiresAt: number | null;
  customerId: string | null;
}
```

### 7.5 Revenue Projection (12 months)

| Month | Sessions | Revenue (KWD) |
|-------|----------|---------------|
| 1–2 | 50/mo | 200 |
| 3–4 | 150/mo | 600 |
| 5–6 (Ramadan) | 400/mo | 1,600 |
| 7–9 | 300/mo | 1,200 |
| 10–12 (subscriptions live) | 500/mo + 50 subs | 2,400 |
| **Year 1 Total** | ~3,200 | **~13,000 KWD** |

This is a **solo-founder, zero-overhead product**. 13,000 KWD on zero server costs and no employees = high-quality side income / lifestyle business, or launchpad for scale.

---

## 8. Competitive Moat

### Why Jawib is hard to copy

1. **Content depth** — 456 questions in authentic Kuwaiti Arabic took significant time to write. Growing faster than competitors can copy.

2. **Gameplay depth** — The steal mechanic + weapon system creates emergent drama that casual competitors can't replicate quickly. It's a design, not just content.

3. **Survey data flywheel** — Every session feeds the Google Sheet. You learn which categories players want, which questions are too hard/easy, which age groups play. Competitors have no feedback loop.

4. **Cultural authenticity** — Questions about Kuwait history, diwaniya culture, Kuwaiti dialect, Kuwaiti food, Kuwaiti celebrities. This isn't generic Arab trivia — it's specifically Kuwait. That requires local knowledge that can't be outsourced.

5. **Community** — The WhatsApp share mechanic means Jawib spreads through actual friendship networks. Each share is a trusted endorsement.

---

## 9. Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Seen Jeem copies weapon/steal mechanic | Medium | Already ahead on content depth; focus on questions |
| Small question bank exhausted by power users | Medium | Deduplication live; 456 → 1000 questions roadmap |
| No payment integration = no revenue | High (current) | MyFatoorah integration (Phase 2 priority) |
| Web-only = no App Store discovery | High | PWA install prompt live; WhatsApp is primary discovery channel in GCC |
| Regulatory (gambling/gaming laws in Kuwait) | Low | Pure trivia, no gambling mechanic, no random-win element |
| Content controversy (Quran category) | Low | Questions are factual (verse counts, names, dates) — not interpretation |

---

## 10. Next Milestones

### Immediate (Week 1–2)
- [ ] Merge PR #2 to main → deploy to production
- [ ] Set up Google Sheet + Apps Script for survey collection
- [ ] Test full game flow end-to-end on production URL
- [ ] Share with 3 diwaniya groups for feedback

### Month 1
- [ ] Integrate MyFatoorah payment (replace manual payment modal)
- [ ] Add 100 more questions (bring bank to 556)
- [ ] Launch on WhatsApp: share production link with personal contacts

### Month 2–3
- [ ] Ramadan category content expansion (50 questions)
- [ ] Saudi-focused category (Vision 2030, Saudi history)
- [ ] First corporate event test (branded version)

### Month 4–6 (Ramadan)
- [ ] Ramadan Pack live
- [ ] Seasonal auto-theme
- [ ] Target: 400+ sessions/month

---

## 11. File Index (This Folder)

| File | Contents |
|------|----------|
| `JAWIB_FOUNDER_DECK.md` | This document — full business overview |
| `jawib-questions.csv` | All 456 questions (id, category, tier, points, Arabic text, 4 options, correct answer) |
| `jawib-survey-results.csv` | Survey responses from players (from Google Sheets export) |
| `TECH_ARCHITECTURE.md` | Detailed technical diagram and file map |
| `MONETIZATION_DETAIL.md` | Payment integration code samples and gateway comparison |

---

*جاوب — لعبة الثقافة العامة الخليجية*  
*Jawib — The Gulf General Knowledge Game*
