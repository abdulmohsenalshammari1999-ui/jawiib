# Jawib QA Checklist

Based on the Cliq Techno project quotation. Run before every release.

---

## 1. Functional Flow

- [ ] Entry screen loads and animates correctly
- [ ] Sound/music toggles on entry screen work
- [ ] "ابدأ اللعبة" transitions smoothly to home screen
- [ ] Home screen shows correct stats (456 questions, 22 categories)
- [ ] "فريق ضد فريق" mode creates a teams game
- [ ] "الكل ضد الكل" mode creates an FFA game
- [ ] "لعبة كاملة" starts a full non-trial game
- [ ] "جرّب مجانًا" starts a 9-question trial

### Team Setup
- [ ] Team names can be entered (alpha + beta)
- [ ] Game length selector works (سريع = 3 cats, عادي = 4 cats)
- [ ] Names appear correctly on draft screen
- [ ] Names appear correctly on board / scoreboard
- [ ] Names appear correctly on winner screen

### Category Draft
- [ ] Draft starts automatically when entering draft screen
- [ ] Category cards are clickable for the current team's turn
- [ ] Picked categories show team badge (🛡️ / ⚔️)
- [ ] Picked categories are disabled for the other team
- [ ] Progress dots update after each pick
- [ ] Pick counter (e.g. "2/3") updates correctly
- [ ] ✓ "اكتمل" badge appears when team reaches required picks
- [ ] "اختيار عشوائي" button auto-completes remaining picks
- [ ] Start button hidden until both teams finish
- [ ] Start button visible once bothDone = true

### Game Board
- [ ] Only draft-selected categories appear on board
- [ ] All 6 point tiers (100–600) shown per category
- [ ] Correct number of categories on board (3 or 4 per team = 6 or 8 total)
- [ ] Turn indicator shows active player/team
- [ ] Clicking a cell opens the question

### Questions
- [ ] Question text displays correctly in Arabic
- [ ] 4 answer options shown
- [ ] Timer counts down (correct duration per point tier)
- [ ] Correct answer = green flash + score increase
- [ ] Wrong answer = red flash + score unchanged / decreases
- [ ] Time-out = treated as wrong answer
- [ ] Answered cells marked ✓ (dimmed)

### Scoring
- [ ] Player score increases on correct answer
- [ ] Team score updates in scoreboard
- [ ] Streak bonus applies after 3 consecutive correct answers
- [ ] Sabotage earned on streak

### Sabotage
- [ ] Sabotage controls appear during board phase
- [ ] Can select a sabotage type
- [ ] Can target an opponent
- [ ] Sabotage effect visible on target's turn

### Game Over
- [ ] Winner screen shows correct team name
- [ ] Loser team shown with correct name and score
- [ ] MVP player highlighted
- [ ] "العب مرة ثانية" rematch works
- [ ] "لعبة جديدة" resets and returns to home
- [ ] "قيّم المباراة" opens feedback modal

---

## 2. GUI / Visual

- [ ] Arabic RTL layout correct throughout
- [ ] Tajawal font loaded
- [ ] Kuwait desert palette (sand bg, pearl white cards, gahwa gold, gulf blue)
- [ ] Sadu accent stripe visible on entry and draft screens
- [ ] Gold gradient on logo and headers
- [ ] Buttons have hover/active states
- [ ] Animations play (fadeIn, slideUp, bounceIn, countdown-pop)
- [ ] No layout overflow on mobile viewport (375px)
- [ ] No text clipping or truncation in Arabic

---

## 3. Mobile / PWA

- [ ] App loads on iOS Safari (15+)
- [ ] App loads on Android Chrome
- [ ] Touch targets ≥ 44px
- [ ] No horizontal scroll on mobile
- [ ] Pinch zoom disabled (viewport meta tag)
- [ ] Keyboard doesn't break layout on name input screens
- [ ] App functions offline after first load (PWA cache — future)

---

## 4. Cross-Browser

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Web Audio API working in all browsers (muted until user interaction)

---

## 5. Audio

- [ ] Sound toggle mutes all SFX
- [ ] Music toggle works
- [ ] Countdown beeps play
- [ ] Correct-answer sound plays
- [ ] Wrong-answer sound plays
- [ ] Timer tick plays in final 5 seconds
- [ ] Winner fanfare plays at game end
- [ ] No audio errors in console

---

## 6. Timer

- [ ] 100pt question: 16s timer
- [ ] 200pt question: 15s timer
- [ ] 300pt question: 13s timer
- [ ] 400pt question: 11s timer
- [ ] 500pt question: 9s timer
- [ ] 600pt question: 7s timer
- [ ] Timer auto-submits wrong answer on expiry

---

## 7. Feedback Form

- [ ] Star rating clickable (1–5)
- [ ] Fair/unfair toggle works
- [ ] Optional comment field accepts text
- [ ] Submit closes modal
- [ ] Bug report link present

---

## 8. Full End-to-End Smoke Test

Run this before every deploy:

1. Open app → entry screen
2. Tap "ابدأ اللعبة"
3. Select "فريق ضد فريق" → "لعبة كاملة"
4. Enter player name → create room
5. Enter team names → choose سريع
6. Pick 3 categories per team in draft
7. Tap "ابدأ اللعبة" → countdown appears with team names + categories
8. Game starts → board shows 6 categories
9. Answer 3 questions (mix of correct/wrong/timeout)
10. Verify scoreboard updates
11. Complete all questions → winner screen shows
12. Verify team names on winner screen
13. Tap "العب مرة ثانية" → board resets
14. Tap "لعبة جديدة" → returns to home

**Pass criteria:** No JS errors, all screens render, names persist.

---

## 9. Build

```bash
npm run build
```

Expected: ✓ client build < 5s, ✓ SSR build, no TypeScript errors.
