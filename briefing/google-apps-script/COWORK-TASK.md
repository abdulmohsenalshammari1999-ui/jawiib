# TASK: Deploy Abdulmohsen's Daily Statesman Brief → Google Apps Script

## CONTEXT
All code is written. 6 `.gs` files exist in `briefing/google-apps-script/` in this repo.
Your job: create a new Google Apps Script project, paste all 6 files + the manifest, wire up the API key and trigger, and fire a test send.

---

## WHAT YOU ARE BUILDING
A daily email intelligence brief sent to `abdulmohsen.alshammari1999@gmail.com` at **10:00 AM Kuwait time** every day. It fetches live news via RSS, generates a 14-section presidential brief using the Claude API, and delivers it via Gmail — all inside Google's free infrastructure.

---

## FILE INVENTORY (already written — paste as-is)

Fetch from: `briefing/google-apps-script/` in the repo.

| File | Role |
|------|------|
| `Code.gs` | Pipeline entry — `runBriefPipeline()`, `sendBriefNow()`, Gmail send, Sheet logging |
| `Config.gs` | All settings — RSS sources, recipient, AI model, tone, Kuwait priorities |
| `Sources.gs` | RSS fetcher via `UrlFetchApp` + `XmlService` parser |
| `Generator.gs` | Calls `api.anthropic.com/v1/messages` → parses JSON → returns 14-section brief |
| `Template.gs` | `buildEmailHtml(brief)` → presidential HTML email |
| `Setup.gs` | `setProperties()`, `createTrigger()`, `checkSetup()`, `teardown()` |
| `appsscript.json` | Manifest: `timeZone: "Etc/GMT"`, V8, 4 OAuth scopes |

---

## EXECUTION STEPS

### 1 — Create the project
- Go to [script.google.com](https://script.google.com)
- New project → name it: **Daily Statesman Brief**

### 2 — Set timezone
- ⚙️ Project Settings → Time zone → **(UTC) Coordinated Universal Time**
- This makes the 07:00 trigger fire at exactly 10:00 AM Kuwait (UTC+3)

### 3 — Replace default `appsscript.json`
- In editor: View → Show manifest file
- Replace entire contents with `appsscript.json` from repo:
```json
{
  "timeZone": "Etc/GMT",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.scriptapp"
  ]
}
```

### 4 — Create 6 script files
For each: click **+** → Script → name it (no `.gs` extension) → paste file contents.

Order to create:
1. `Config`
2. `Sources`
3. `Generator`
4. `Template`
5. `Code`
6. `Setup`

Delete the default `Code.gs` content before pasting — replace it entirely.

### 5 — Save Anthropic API key
- In `Setup.gs`, find `setProperties()`, replace `"sk-ant-YOUR_KEY_HERE"` with the real key
- Select `setProperties` in the function dropdown → **▶ Run**
- Grant all permissions when prompted (first-time OAuth)
- **Delete the key from the source after running** — it is now stored in Script Properties

### 6 — Create the daily trigger
- Select `createTrigger` → **▶ Run**
- Verify: Triggers sidebar (clock icon) → should show `scheduledSend` firing daily at hour 7

### 7 — Send a test brief now
- Select `sendBriefNow` → **▶ Run**
- Expected: email arrives at `abdulmohsen.alshammari1999@gmail.com` within ~60–90 seconds
- Subject line: `Daily Statesman Brief — [today's date]`

### 8 — Verify everything
- Select `checkSetup` → **▶ Run**
- Check execution log confirms:
  - `ANTHROPIC_API_KEY` is set
  - Trigger exists for `scheduledSend` at hour 7 UTC
  - Recipient and config are correct

---

## SUCCESS CRITERIA
- [ ] Project exists at script.google.com named "Daily Statesman Brief"
- [ ] 6 script files + manifest present
- [ ] Timezone set to UTC in Project Settings
- [ ] `ANTHROPIC_API_KEY` stored in Script Properties (not in code)
- [ ] Trigger: `scheduledSend` → daily → hour 7 UTC
- [ ] Test email received at `abdulmohsen.alshammari1999@gmail.com`
- [ ] Email subject: `Daily Statesman Brief — [date]`
- [ ] Email contains all 14 sections (Executive Summary through Tomorrow's Watchlist)
- [ ] Word count 1,000–1,500 words
- [ ] Delivery logged to Google Sheet "Statesman Brief Delivery Log"

---

## ERROR HANDLING (built into the code — no action needed)
- Individual RSS source fails → logged, pipeline continues
- All sources fail → brief generates with minimal context, still sends
- Email send fails → error notification sent to recipient
- API key missing → clear error in execution log: "ANTHROPIC_API_KEY not set"

---

## CREDENTIALS NEEDED FROM USER
Before starting, confirm you have:
- [ ] Access to `abdulmohsen.alshammari1999@gmail.com` Google account (to create the script)
- [ ] Anthropic API key (`sk-ant-...`) from [console.anthropic.com](https://console.anthropic.com)

---

## WHAT NOT TO DO
- Do not modify the `.gs` file contents — they are production-ready
- Do not change the trigger hour — 7 UTC = 10 AM Kuwait exactly
- Do not skip the timezone step — wrong timezone = wrong send time
- Do not leave the API key in the source code after `setProperties()` runs
- Do not create a new trigger if one already exists — `createTrigger()` handles deduplication

---

## AFTER DEPLOYMENT
Brief fires automatically every morning. To manage it:
- **Stop sending:** run `teardown()` in Setup.gs
- **Test again:** run `sendBriefNow()` anytime
- **Check logs:** Google Sheet "Statesman Brief Delivery Log" in Drive
- **Edit sources/settings:** modify `Config.gs` directly in the editor
