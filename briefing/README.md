# Abdulmohsen's Daily Statesman Brief

A daily presidential-style intelligence briefing delivered to your inbox every morning at **10:00 AM Kuwait time (Asia/Kuwait)**.

---

## Architecture

```
briefing/
├── src/
│   ├── config.ts       ← All editable settings (sources, timing, tone, word count)
│   ├── logger.ts       ← File + console logging (logs/ directory)
│   ├── sources.ts      ← RSS feed fetcher with per-source error isolation
│   ├── generator.ts    ← Claude AI brief generator (all 14 sections)
│   ├── template.ts     ← HTML + plain-text email template
│   ├── mailer.ts       ← Nodemailer/SMTP email delivery
│   ├── run-brief.ts    ← Core pipeline (fetch → generate → send)
│   ├── scheduler.ts    ← node-cron scheduler (main process)
│   └── send-now.ts     ← Test: fires one brief immediately
├── logs/               ← Delivery logs (auto-created)
├── .env.example        ← Environment variable template
├── package.json
└── tsconfig.json
```

---

## Setup

### 1. Install dependencies

```bash
cd briefing
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your real credentials
```

Required variables:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key from [console.anthropic.com](https://console.anthropic.com) |
| `GMAIL_APP_PASSWORD` | Gmail App Password (see below) |
| `SMTP_USER` | Your Gmail address |
| `RECIPIENT_EMAIL` | Where to deliver the brief |

**Getting a Gmail App Password:**
1. Enable 2-Step Verification on your Google Account
2. Visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create an App Password for "Mail"
4. Paste the 16-character password as `GMAIL_APP_PASSWORD`

### 3. Load env vars before running

```bash
# Option A: use dotenv CLI
npx dotenv -e .env -- npm test

# Option B: export manually
export ANTHROPIC_API_KEY=sk-ant-...
export GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
export SMTP_USER=abdulmohsen.alshammari1999@gmail.com
export RECIPIENT_EMAIL=abdulmohsen.alshammari1999@gmail.com
```

---

## Usage

### Send a test brief immediately

```bash
cd briefing
npm test
```

This runs the full pipeline right now: fetches sources, generates the brief, and sends the email.

### Start the daily scheduler

```bash
cd briefing
npm start
```

The process stays alive and fires every day at **07:00 UTC = 10:00 AM Asia/Kuwait**.

---

## Scheduling on a Server / VPS

### Using PM2 (recommended)

```bash
npm install -g pm2
cd briefing
pm2 start "npm start" --name statesman-brief
pm2 save
pm2 startup
```

### Using systemd

Create `/etc/systemd/system/statesman-brief.service`:

```ini
[Unit]
Description=Abdulmohsen's Daily Statesman Brief
After=network.target

[Service]
WorkingDirectory=/path/to/jawiib/briefing
ExecStart=/usr/bin/node --loader tsx/esm src/scheduler.ts
Restart=always
EnvironmentFile=/path/to/jawiib/briefing/.env

[Install]
WantedBy=multi-user.target
```

Then:
```bash
systemctl enable statesman-brief
systemctl start statesman-brief
```

### Alternative: GitHub Actions (free cloud scheduling)

Create `.github/workflows/daily-brief.yml` in the repo:

```yaml
name: Daily Statesman Brief
on:
  schedule:
    - cron: '0 7 * * *'  # 07:00 UTC = 10:00 AM Kuwait
  workflow_dispatch:      # allow manual trigger

jobs:
  send-brief:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install
        run: cd briefing && npm ci
      - name: Send Brief
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GMAIL_APP_PASSWORD: ${{ secrets.GMAIL_APP_PASSWORD }}
          SMTP_USER: ${{ secrets.SMTP_USER }}
          RECIPIENT_EMAIL: ${{ secrets.RECIPIENT_EMAIL }}
          SENDER_EMAIL: ${{ secrets.SENDER_EMAIL }}
        run: cd briefing && npm test
```

Add secrets in GitHub: **Settings → Secrets and variables → Actions**.

---

## Configuration

All settings live in `src/config.ts`. Key things you can edit:

| Setting | Location | Description |
|---------|----------|-------------|
| Send time | `cronExpression` | Cron expression in UTC (default: `0 7 * * *` = 10 AM Kuwait) |
| Max words | `maxWordCount` | Target ceiling (default: 1500) |
| Recipient | `recipientEmail` | Override with `RECIPIENT_EMAIL` env var |
| AI model | `anthropic.model` | Claude model to use |
| RSS sources | `sources.rss` | Add/remove feeds per category |
| Tone | `tone` | Style and voice descriptors |
| Priorities | `relevancePriorities` | What Abdulmohsen cares most about |

---

## Logs

Logs are written to `briefing/logs/briefing.log`. Each entry includes timestamp, level, message, and structured data (delivery confirmation, word count, failed sources, etc.).

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Single RSS source fails | Logged as WARN; pipeline continues with remaining sources |
| All sources fail | Brief generated with minimal news context; pipeline continues |
| AI generation fails | Logged as ERROR; process exits with code 1 |
| SMTP connection fails | Logged as ERROR; email not sent; process exits with code 1 |
| Email send fails | Logged as ERROR; process exits with code 1 |

---

## Brief Sections

1. Dynamic Greeting — unique daily, warm Chief of Staff voice
2. Executive Summary — 5 most important bullets of the day
3. Kuwait Command Center — 3 Kuwait-specific items with relevance scores
4. Oil & Energy Snapshot — Brent, WTI, OPEC+, Kuwait energy news
5. World & Geopolitics — 3 most relevant global events
6. AI & Technology Watch — 2 items with personal relevance answers
7. Economic Snapshot — 5 economic bullets
8. Today's Knowledge Capsule — PolSci, MPA, Economics, History concepts
9. Think-Tank / Academic Insight — Brookings/RAND/CFR/etc.
10. This Day in History — statecraft-relevant historical event
11. Smart Factoids — 3 intelligent one-liners
12. Personal Momentum Note — dignified, warm Chief of Staff note
13. Three Strategic Questions — leverage, pressure, watchlist
14. Tomorrow's Watchlist — 3 items to track next 24–48h

---

## Sources

Default RSS sources:
- **Kuwait**: KUNA, Kuwait Times, Arab Times Kuwait
- **Energy**: Reuters Business, OPEC
- **World**: Reuters Top News, BBC World, AP News
- **Tech/AI**: MIT Technology Review, The Verge
- **Economics**: Financial Times, IMF News

Add or remove sources in `src/config.ts` → `sources.rss`.
