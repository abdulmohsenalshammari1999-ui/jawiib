# Daily Statesman Brief — Google Apps Script

Zero-server deployment. Runs entirely on Google's infrastructure using Gmail and time-based triggers.

---

## Why Google Apps Script?

| | Node.js version | Google Apps Script version |
|---|---|---|
| Hosting | Requires a server / VPS / GitHub Actions | **Free, Google-hosted** |
| Email | Nodemailer + SMTP credentials | **GmailApp — uses your account directly** |
| Scheduling | node-cron (process must stay alive) | **Native time-based triggers** |
| Secrets | `.env` file | **Script Properties (encrypted by Google)** |
| Logs | `briefing/logs/briefing.log` | **Apps Script log viewer + Google Sheet** |

---

## Files

| File | Purpose |
|------|---------|
| `Code.gs` | Main pipeline — `sendBriefNow()`, `scheduledSend()`, logging |
| `Config.gs` | All editable settings — sources, timing, tone, priorities |
| `Sources.gs` | RSS feed fetcher using `UrlFetchApp` |
| `Generator.gs` | Calls Anthropic Claude API via `UrlFetchApp` |
| `Template.gs` | Builds the HTML email |
| `Setup.gs` | One-time setup: save API key, create trigger |

---

## Setup (5 minutes)

### Step 1 — Create the Apps Script project

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. Name it: `Daily Statesman Brief`

### Step 2 — Add the files

For each `.gs` file, create a new script file in the editor:

1. Click **+** next to "Files" in the left sidebar
2. Choose **Script**
3. Name it exactly (without `.gs`): `Code`, `Config`, `Sources`, `Generator`, `Template`, `Setup`
4. Paste the contents of each `.gs` file

**File order in the editor doesn't matter** — all `.gs` files share the same global scope.

### Step 3 — Set the project timezone to UTC

1. Click **⚙️ Project Settings** (gear icon, left sidebar)
2. Set **Time zone** to: `(UTC) Coordinated Universal Time`
3. Save

This ensures the 07:00 trigger fires at 10:00 AM Kuwait time.

### Step 4 — Save your Anthropic API key

1. In `Setup.gs`, replace `sk-ant-YOUR_KEY_HERE` with your real key from [console.anthropic.com](https://console.anthropic.com)
2. Select `setProperties` in the function dropdown
3. Click **▶ Run**
4. Grant permissions when prompted (first run only)
5. **Delete your key from the source code** — it's now stored securely in Script Properties

### Step 5 — Create the daily trigger

1. Select `createTrigger` in the function dropdown
2. Click **▶ Run**
3. Verify: click the **clock icon** (Triggers) in the left sidebar — you should see `scheduledSend` firing daily at 07:00

### Step 6 — Send a test brief immediately

1. Select `sendBriefNow` in the function dropdown
2. Click **▶ Run**
3. Check your inbox at `abdulmohsen.alshammari1999@gmail.com`
4. Check logs: **View → Logs** or the **Execution log** tab

---

## Verifying setup

Run `checkSetup()` to see:
- Which Script Properties are set
- Active triggers
- Current config values

---

## Customisation

Edit `Config.gs` directly in the Apps Script editor:

| What to change | Where |
|---------------|-------|
| Recipient email | `CONFIG.recipientEmail` |
| Send time | `CONFIG.sendHourUTC` (UTC hours) + re-run `createTrigger()` |
| RSS sources | `CONFIG.rssSources` array |
| Max word count | `CONFIG.maxWordCount` |
| AI model | `CONFIG.anthropicModel` |
| Relevance priorities | `CONFIG.relevancePriorities` |
| Tone settings | `CONFIG.tone` |

---

## Delivery log

Every successful send is recorded in a Google Sheet named **"Statesman Brief Delivery Log"** — automatically created in your Drive on first run.

Columns: Timestamp · Subject · Word Count · Source Status · Result

---

## Troubleshooting

**"ANTHROPIC_API_KEY not set"**
→ Run `setProperties()` in Setup.gs

**"HTTP 403" or permission error on first run**
→ Click "Review permissions" and grant the required scopes (Gmail, UrlFetch, Spreadsheets)

**Email not arriving**
→ Check **View → Executions** in the script editor for errors
→ Check Gmail spam folder

**Trigger not firing**
→ Confirm project timezone is set to UTC (Step 3)
→ Re-run `createTrigger()`

**Brief over 1,500 words**
→ Reduce `CONFIG.anthropicMaxTokens` slightly (try 5000)

---

## Permissions required (granted on first run)

- `https://mail.google.com/` — send email via Gmail
- `https://www.googleapis.com/auth/script.external_request` — fetch RSS feeds and call Anthropic API
- `https://www.googleapis.com/auth/spreadsheets` — write delivery log
- `https://www.googleapis.com/auth/script.scriptapp` — create/manage time triggers
