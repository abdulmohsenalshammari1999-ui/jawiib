// ─────────────────────────────────────────────────────────────────
// Code.gs — Main pipeline entry point
//
// Functions you can run manually from the editor:
//   sendBriefNow()   → full pipeline immediately (test)
//   scheduledSend()  → called by the daily time trigger
// ─────────────────────────────────────────────────────────────────

/**
 * Main pipeline: fetch → generate → send.
 * Called by the daily time-based trigger and by sendBriefNow().
 */
function runBriefPipeline() {
  Logger.log("═══ Starting Daily Statesman Brief pipeline ═══");

  // 1. Fetch news sources
  var sources;
  try {
    sources = fetchAllSources();
  } catch (e) {
    Logger.log("ERROR: Source fetch failed completely: " + e.message);
    // Continue with empty sources rather than aborting
    sources = { items: { kuwait:[], energy:[], world:[], tech:[], economics:[] }, failedSources: ["all"], fetchedAt: new Date().toISOString() };
  }

  // 2. Generate brief via Claude
  var brief;
  try {
    brief = generateBrief(sources);
  } catch (e) {
    Logger.log("ERROR: Brief generation failed: " + e.message);
    sendErrorNotification("Brief generation failed", e.message);
    return;
  }

  // 3. Send email
  try {
    var subject = "Daily Statesman Brief — " + brief.date;
    var html = buildEmailHtml(brief);

    GmailApp.sendEmail(
      CONFIG.recipientEmail,
      subject,
      stripHtmlToText(html),   // plain-text fallback
      {
        htmlBody: html,
        name: CONFIG.senderName,
        noReply: false
      }
    );

    Logger.log("SUCCESS: Brief delivered to " + CONFIG.recipientEmail +
               " | Subject: " + subject +
               " | Word count: ~" + brief.wordCount);

    logDelivery(subject, brief.wordCount, sources.failedSources);

  } catch (e) {
    Logger.log("ERROR: Email send failed: " + e.message);
    sendErrorNotification("Email delivery failed", e.message);
  }

  Logger.log("═══ Pipeline complete ═══");
}

/**
 * Alias called by the daily time-based trigger (set up in Setup.gs).
 */
function scheduledSend() {
  runBriefPipeline();
}

/**
 * Test function — run this manually to send a brief immediately.
 * Select this function in the editor and click ▶ Run.
 */
function sendBriefNow() {
  Logger.log("send-now: firing brief immediately (test mode)");
  runBriefPipeline();
}

// ─── Helpers ────────────────────────────────────────────────────

function stripHtmlToText(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sendErrorNotification(title, detail) {
  try {
    GmailApp.sendEmail(
      CONFIG.recipientEmail,
      "⚠️ Statesman Brief Error: " + title,
      "An error occurred during the Daily Statesman Brief pipeline.\n\n" +
      "Error: " + detail + "\n\nCheck Apps Script logs for details.\n" +
      "Logs: https://script.google.com",
      { name: CONFIG.senderName }
    );
  } catch (e) {
    Logger.log("Could not send error notification: " + e.message);
  }
}

function logDelivery(subject, wordCount, failedSources) {
  try {
    var sheet = getOrCreateLogSheet();
    sheet.appendRow([
      new Date(),
      subject,
      wordCount,
      failedSources.length === 0 ? "All sources OK" : "Failed: " + failedSources.join(", "),
      "SUCCESS"
    ]);
  } catch (e) {
    Logger.log("WARN: Could not write to log sheet: " + e.message);
  }
}

function getOrCreateLogSheet() {
  var ss;
  var sheetId = PropertiesService.getScriptProperties().getProperty("LOG_SHEET_ID");
  if (sheetId) {
    try { ss = SpreadsheetApp.openById(sheetId); } catch(e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create("Statesman Brief Delivery Log");
    PropertiesService.getScriptProperties().setProperty("LOG_SHEET_ID", ss.getId());
    var sheet = ss.getActiveSheet();
    sheet.setName("Deliveries");
    sheet.appendRow(["Timestamp", "Subject", "Word Count", "Source Status", "Result"]);
    sheet.setFrozenRows(1);
    return sheet;
  }
  return ss.getSheetByName("Deliveries") || ss.getActiveSheet();
}
