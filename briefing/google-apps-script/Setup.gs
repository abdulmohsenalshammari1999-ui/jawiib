// ─────────────────────────────────────────────────────────────────
// Setup.gs — One-time setup functions
//
// Step 1: Run setProperties()   → saves your API key
// Step 2: Run createTrigger()   → schedules daily send at 10 AM Kuwait
// Step 3: Run sendBriefNow()    → test the full pipeline immediately
// ─────────────────────────────────────────────────────────────────

/**
 * STEP 1 — Save your Anthropic API key to Script Properties.
 *
 * HOW TO USE:
 *   1. Replace "sk-ant-YOUR_KEY_HERE" below with your real key.
 *   2. Select this function in the editor and click ▶ Run.
 *   3. Then REMOVE your key from the source code (it's stored securely).
 *
 * Your key is stored in Script Properties (encrypted at rest by Google)
 * and is NOT visible in the code after you remove it here.
 */
function setProperties() {
  var props = PropertiesService.getScriptProperties();

  // ↓↓↓ PASTE YOUR KEY HERE, run once, then delete it from this line ↓↓↓
  var ANTHROPIC_API_KEY = "sk-ant-YOUR_KEY_HERE";
  // ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑ ↑↑↑

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "sk-ant-YOUR_KEY_HERE") {
    Logger.log("ERROR: Replace 'sk-ant-YOUR_KEY_HERE' with your real Anthropic API key first.");
    return;
  }

  props.setProperty("ANTHROPIC_API_KEY", ANTHROPIC_API_KEY);
  Logger.log("✓ ANTHROPIC_API_KEY saved to Script Properties.");
  Logger.log("  → Now delete the key from the source code.");
  Logger.log("  → Then run createTrigger() to schedule daily delivery.");
}

/**
 * STEP 2 — Create the daily time-based trigger.
 *
 * Fires scheduledSend() every day at 07:00 UTC = 10:00 AM Asia/Kuwait.
 * Google Apps Script triggers fire in the script timezone (set in Project Settings).
 *
 * Safe to run multiple times — removes old triggers first.
 */
function createTrigger() {
  // Remove any existing triggers for scheduledSend to avoid duplicates
  deleteTriggers("scheduledSend");

  // Google Apps Script ScriptApp triggers use the project's timezone.
  // Set your project timezone to UTC in:
  //   Apps Script → Project Settings → Time zone → (UTC) Coordinated Universal Time
  // Then this trigger fires at 07:00 UTC = 10:00 AM Kuwait (UTC+3).
  ScriptApp.newTrigger("scheduledSend")
    .timeBased()
    .everyDays(1)
    .atHour(CONFIG.sendHourUTC)   // 7 = 07:00 UTC = 10:00 AM Kuwait
    .create();

  Logger.log("✓ Daily trigger created: scheduledSend fires at " + CONFIG.sendHourUTC + ":00 UTC (10:00 AM Kuwait).");
  Logger.log("  → Verify in: Apps Script → Triggers (clock icon on the left sidebar).");
  Logger.log("  → IMPORTANT: Set project timezone to UTC in Project Settings.");
}

/**
 * Remove all triggers for a given function name.
 */
function deleteTriggers(functionName) {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

/**
 * Show all current Script Properties (keys only, not values for security).
 */
function checkSetup() {
  var props = PropertiesService.getScriptProperties().getProperties();
  Logger.log("=== Script Properties ===");
  Object.keys(props).forEach(function(k) {
    var preview = k === "ANTHROPIC_API_KEY" ? "(set, hidden)" : props[k].substring(0, 40);
    Logger.log("  " + k + ": " + preview);
  });

  Logger.log("\n=== Active Triggers ===");
  ScriptApp.getProjectTriggers().forEach(function(t) {
    Logger.log("  " + t.getHandlerFunction() + " → " + t.getEventType());
  });

  Logger.log("\n=== Config ===");
  Logger.log("  Recipient: " + CONFIG.recipientEmail);
  Logger.log("  Send hour UTC: " + CONFIG.sendHourUTC + ":00 (= 10:00 AM Kuwait)");
  Logger.log("  Sources configured: " + CONFIG.rssSources.length);
}

/**
 * Remove everything — useful if you want to start fresh.
 */
function teardown() {
  deleteTriggers("scheduledSend");
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log("All triggers and properties cleared.");
}
