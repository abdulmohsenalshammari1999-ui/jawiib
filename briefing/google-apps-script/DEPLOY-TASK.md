# DEPLOY TASK — Daily Statesman Brief → Google Apps Script

## MISSION
Deploy 6 `.gs` files to a new Google Apps Script project using `clasp`, configure Script Properties, and verify deployment. All files exist at `briefing/google-apps-script/`.

## CODEMAP
- `GAS` = Google Apps Script
- `SP` = Script Properties (stores API key)
- `TBT` = Time-Based Trigger (10AM Kuwait = 07:00 UTC daily)
- `DSB` = Daily Statesman Brief (the project)
- `SBN` = sendBriefNow (test function)
- `AK` = ANTHROPIC_API_KEY (from env `$ANTHROPIC_API_KEY`)
- `DIR` = `briefing/google-apps-script/`
- `SS` = scheduledSend (trigger target function)

## ENV VARS REQUIRED
```
ANTHROPIC_API_KEY=sk-ant-...   # already set or user provides
CLASP_ACCESS_TOKEN=...          # from: clasp login OR user provides .clasprc.json
```

## STEPS

### 1. Install clasp
```bash
npm install -g @google/clasp
```

### 2. Auth check
```bash
clasp login --status 2>/dev/null || clasp login
# If CI/headless: user must provide ~/.clasprc.json content as env CLASP_RC
# Write it: echo "$CLASP_RC" > ~/.clasprc.json
```

### 3. Create GAS project
```bash
cd briefing/google-apps-script
clasp create --title "Daily Statesman Brief" --type standalone
# Captures scriptId from .clasp.json output
```

### 4. Set project timezone to UTC via manifest
Create/write `appsscript.json`:
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

### 5. Push all .gs files
```bash
clasp push --force
# Expected: pushes Code.gs Config.gs Generator.gs Template.gs Sources.gs Setup.gs + appsscript.json
```

### 6. Set ANTHROPIC_API_KEY as Script Property
```bash
# Use clasp run (requires API access enabled) OR inject via appsscript manifest isn't possible.
# Preferred: clasp run setProperties after enabling GAS API
clasp open  # Opens project; user runs setProperties() manually with key
# OR if clasp run available:
clasp run setProperties --params '[]'
# Note: user must first paste key into Setup.gs setProperties(), run once, delete key
```

### 7. Create TBT
```bash
clasp run createTrigger
# Sets SS to fire at 07:00 UTC daily = 10:00 AM AST/Kuwait
# If clasp run unavailable: instruct user to run createTrigger() in editor
```

### 8. Test fire
```bash
clasp run sendBriefNow
# Sends one brief immediately; confirm delivery to abdulmohsen.alshammari1999@gmail.com
```

### 9. Verify
```bash
clasp run checkSetup
# Logs: SP keys present, TBT active, CONFIG values
```

## SUCCESS CRITERIA
- [ ] `.clasp.json` exists with valid `scriptId`
- [ ] `clasp push` exits 0 with 7 files pushed
- [ ] `appsscript.json` has `timeZone: "Etc/GMT"` and 4 OAuth scopes
- [ ] Script Property `ANTHROPIC_API_KEY` set (verify via `checkSetup`)
- [ ] TBT exists for `SS` at hour 7 UTC
- [ ] Test email received at `abdulmohsen.alshammari1999@gmail.com`

## FALLBACK (if `clasp run` blocked by GAS API not enabled)
After `clasp push`, instruct user to do 3 manual clicks in GAS editor:
1. Run `setProperties` (paste key first, delete after)
2. Run `createTrigger`
3. Run `sendBriefNow`
All < 2 min total.

## ERROR HANDLING
- `clasp login` fails in headless: output auth URL, wait for user to paste token
- `clasp push` 403: GAS API not enabled → link: https://console.cloud.google.com/apis/library/script.googleapis.com
- `clasp run` 403: Apps Script API not enabled for project → `clasp open` + enable in GAS editor under Resources → Cloud Platform Project
- RSS fetch errors: non-fatal, pipeline continues
- If AK invalid: `generateBrief` throws → error email sent to recipient

## FILES AT DIR
```
Code.gs       — pipeline entry, GmailApp.sendEmail, Sheet logging
Config.gs     — CONFIG object, getAnthropicKey() reads SP
Sources.gs    — UrlFetchApp RSS parser, XmlService
Generator.gs  — UrlFetchApp → api.anthropic.com/v1/messages → JSON parse
Template.gs   — buildEmailHtml() string builder
Setup.gs      — setProperties(), createTrigger(), checkSetup(), teardown()
```

## TOKEN-OPTIMIZED SUMMARY FOR SUB-AGENT
```
Goal: deploy DSB to GAS via clasp.
Steps: install clasp → auth → create standalone project → write appsscript.json (TZ=Etc/GMT, 4 scopes) → clasp push → set SP[AK] → create TBT(SS,7UTC) → run SBN → verify.
Files: all exist at briefing/google-apps-script/*.gs
Output: deployed scriptId + test email confirmed.
Blockers: headless auth, GAS API enablement — handle gracefully.
```
