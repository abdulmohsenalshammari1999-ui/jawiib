// ─────────────────────────────────────────────────────────────────
// Template.gs — HTML email template builder
// ─────────────────────────────────────────────────────────────────

function buildEmailHtml(brief) {
  var primary = "#1a2744";
  var accent  = "#c8963e";
  var lightBg = "#f7f5f0";
  var border  = "#ddd8cc";

  function section(title, content, emoji) {
    emoji = emoji || "";
    return '<tr><td style="padding:0 0 20px 0;">' +
      '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-left:1px solid ' + border + ';border-radius:4px;">' +
        '<tr><td style="padding:18px 22px 6px 22px;">' +
          '<h2 style="margin:0 0 12px 0;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:' + primary + ';font-family:Georgia,serif;">' +
            (emoji ? emoji + '&nbsp;&nbsp;' : '') + title +
          '</h2>' +
        '</td></tr>' +
        '<tr><td style="padding:0 22px 18px 22px;font-size:14px;line-height:1.75;color:#2c2c2c;font-family:Georgia,serif;">' +
          content +
        '</td></tr>' +
      '</table>' +
    '</td></tr>';
  }

  function divider() {
    return '<tr><td style="padding:4px 0 12px 0;"><hr style="border:none;border-top:1px solid ' + border + ';margin:0;" /></td></tr>';
  }

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1.0"/>' +
    '<title>Daily Statesman Brief — ' + brief.date + '</title></head>' +
    '<body style="margin:0;padding:0;background:#ececec;font-family:Georgia,serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ececec;">' +
    '<tr><td align="center" style="padding:24px 16px;">' +
    '<table width="660" cellpadding="0" cellspacing="0" border="0" style="max-width:660px;width:100%;">' +

    // Header
    '<tr><td style="background:' + primary + ';padding:28px 32px 22px 32px;border-radius:6px 6px 0 0;">' +
      '<p style="margin:0 0 4px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:' + accent + ';font-family:Georgia,serif;">Abdulmohsen\'s</p>' +
      '<h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;font-family:Georgia,serif;letter-spacing:0.5px;">Daily Statesman Brief</h1>' +
      '<p style="margin:8px 0 0 0;font-size:13px;color:#9aaac4;font-family:Georgia,serif;">' + brief.date + ' &nbsp;&middot;&nbsp; Asia/Kuwait &nbsp;&middot;&nbsp; ~' + brief.wordCount + ' words</p>' +
    '</td></tr>' +

    // Body
    '<tr><td style="background:' + lightBg + ';padding:28px 28px 8px 28px;border-radius:0 0 6px 6px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +

    // Greeting
    '<tr><td style="padding:0 0 20px 0;font-size:15px;line-height:1.8;color:' + primary + ';font-family:Georgia,serif;border-bottom:2px solid ' + accent + ';">' +
      brief.greeting +
    '</td></tr>' +
    '<tr><td style="padding:12px 0;"></td></tr>' +

    section("Executive Summary",          brief.executiveSummary,    "📋") + divider() +
    section("Kuwait Command Center",       brief.kuwaitCommandCenter, "🇰🇼") + divider() +
    section("Oil &amp; Energy Snapshot",  brief.oilEnergySnapshot,   "🛢️") + divider() +
    section("World &amp; Geopolitics",    brief.worldGeopolitics,    "🌐") + divider() +
    section("AI &amp; Technology Watch",  brief.aiTechWatch,         "🤖") + divider() +
    section("Economic Snapshot",          brief.economicSnapshot,    "📊") + divider() +
    section("Today's Knowledge Capsule",  brief.knowledgeCapsule,    "🎓") + divider() +
    section("Think-Tank / Academic Insight", brief.thinkTankInsight, "🏛️") + divider() +
    section("This Day in History",         brief.thisDateInHistory,   "📅") + divider() +
    section("Smart Factoids",              brief.smartFactoids,       "💡") + divider() +
    section("Personal Momentum Note",      brief.personalMomentum,    "⚡") + divider() +
    section("Three Strategic Questions",   brief.threeQuestions,      "❓") + divider() +
    section("Tomorrow's Watchlist",        brief.tomorrowWatchlist,   "👁️") +

    // Footer
    '<tr><td style="padding:24px 0 8px 0;text-align:center;font-size:11px;color:#888;font-family:Georgia,serif;border-top:1px solid ' + border + ';">' +
      'Prepared for Abdulmohsen Al-Shammari &nbsp;&middot;&nbsp; Abdulmohsen\'s Daily Statesman Brief<br/>' +
      'Delivered at 10:00 AM Asia/Kuwait &nbsp;&middot;&nbsp; Sources: KUNA, Reuters, BBC, FT, IMF &amp; more' +
    '</td></tr>' +

    '</table></td></tr>' +
    '</table></td></tr></table></body></html>';
}
