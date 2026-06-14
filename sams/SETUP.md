# SAMS Setup Guide

## Step 1 — Create your Google Sheet
1. Go to sheets.google.com and create a blank spreadsheet
2. Rename the first tab to: `Master List`
3. Copy the header row from COLUMN_MAP.md and paste into Row 1
4. Copy the Sheet ID from the URL: `docs.google.com/spreadsheets/d/[COPY_THIS]/edit`
5. Paste the Sheet ID into `config.js` → `sheets.spreadsheetId`

## Step 2 — Get a Google API Key
1. Go to console.cloud.google.com
2. Create a new project (or select an existing one)
3. Go to APIs & Services → Enable APIs → search "Google Sheets API" → Enable
4. Go to APIs & Services → Credentials → Create Credentials → API Key
5. Click the key → under API restrictions, select "Google Sheets API" only
6. Copy the key and paste into `config.js` → `sheets.apiKey`

## Step 3 — Share the Sheet
- **Option A (recommended for internal use):** Share the Sheet → "Anyone in your organization with the link can edit"
- **Option B (external applicants):** Share → "Anyone with the link can edit"

The API key approach requires the sheet to be accessible without OAuth login.

## Step 4 — Configure the Vacancy
Open `config.js` and update:
- `org.name`, `org.logo`, `org.primaryColor`, `org.accentColor`
- `vacancy.title`, `vacancy.id`, `vacancy.deadline`, `vacancy.department`, `vacancy.estimatedTime`
- `roleQuestions[]` → add your role-specific questions
- `scoring{}` → adjust weights per role (the eight section weights must sum to 100)

## Step 5 — Deploy
- **Option A:** Open `index.html` directly in Chrome (local use)
- **Option B:** Drop the `/sams` folder onto Netlify Drop (netlify.com/drop) — free, instant, no account needed
- **Option C:** Upload to SharePoint or an internal web server
- **Option D:** Share the zipped folder — each user opens locally

## Step 6 — Test
1. Open `index.html`, fill all 14 sections, submit
2. Open your Google Sheet — a new row should appear within a few seconds
3. Open `admin.html` — your test submission should appear in the table
4. On `profile.html`, press Ctrl+P (or use the Print button) — verify it fits one page
