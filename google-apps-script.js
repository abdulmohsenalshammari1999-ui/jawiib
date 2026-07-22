/**
 * JAWIB Survey Collector — Google Apps Script
 *
 * SETUP (one-time, ~5 minutes):
 * 1. Go to https://sheets.google.com and create a new spreadsheet.
 *    Name it "Jawib Survey Results" (or anything you like).
 * 2. Open Apps Script: Extensions → Apps Script
 * 3. Delete the default code, paste this entire file, and click Save.
 * 4. Click Deploy → New deployment → Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    Click Deploy and copy the Web app URL.
 * 5. In Netlify: Site settings → Environment variables → Add:
 *    Key:   SURVEY_WEBHOOK_URL
 *    Value: <the URL you just copied>
 * 6. Redeploy the Netlify site (Deploys → Trigger deploy → Deploy site).
 * 7. Play a game, submit the survey — it will appear as a new row within seconds.
 */

const SHEET_NAME = 'Responses';

const COLUMNS = [
  'Timestamp',
  'Mode',
  'Trial',
  'Team Alpha',
  'Team Beta',
  'Score Alpha',
  'Score Beta',
  'Questions Answered',
  'Categories',
  'Rating (1-5)',
  'Difficulty',
  'Fun Score (1-5)',
  'Age Group',
  'Play Again',
  'Recommend',
  'Player Name',
  'Comment',
];

function getOrCreateSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length)
      .setBackground('#1A5FA8')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
  }
  return sheet;
}

// eslint-disable-next-line no-unused-vars
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreateSheet(ss);

    const row = [
      payload.timestamp || new Date().toISOString(),
      payload.mode || '',
      payload.isTrial ? 'Yes' : 'No',
      payload.alphaTeamName || '',
      payload.betaTeamName || '',
      payload.alphaScore ?? '',
      payload.betaScore ?? '',
      payload.questionsAnswered ?? '',
      (payload.categoriesPlayed || []).join(', '),
      payload.rating || '',
      payload.difficulty || '',
      payload.funScore || '',
      payload.ageGroup || '',
      payload.playAgain ? 'Yes' : 'No',
      payload.recommend ? 'Yes' : 'No',
      payload.playerName || '',
      payload.comment || '',
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
