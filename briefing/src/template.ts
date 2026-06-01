import type { BriefContent } from "./generator.js";

export function buildEmailHtml(brief: BriefContent): string {
  const primaryColor = "#1a2744";
  const accentColor = "#c8963e";
  const lightBg = "#f7f5f0";
  const borderColor = "#ddd8cc";

  function section(
    title: string,
    content: string,
    emoji: string = "",
    alert: boolean = false
  ): string {
    const bg = alert ? "#fff8e6" : "#ffffff";
    const border = alert ? `3px solid ${accentColor}` : `1px solid ${borderColor}`;
    return `
    <tr>
      <td style="padding: 0 0 20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg}; border-left:${border}; border-radius:4px;">
          <tr>
            <td style="padding: 18px 22px 6px 22px;">
              <h2 style="margin:0 0 12px 0; font-size:13px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:${primaryColor}; font-family:'Georgia',serif;">
                ${emoji ? emoji + "&nbsp;&nbsp;" : ""}${title}
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 22px 18px 22px; font-size:14px; line-height:1.75; color:#2c2c2c; font-family:'Georgia',serif;">
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }

  function divider(): string {
    return `<tr><td style="padding:4px 0 12px 0;"><hr style="border:none;border-top:1px solid ${borderColor};margin:0;" /></td></tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Daily Statesman Brief — ${brief.date}</title>
</head>
<body style="margin:0;padding:0;background:#ececec;font-family:'Georgia',serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ececec;">
  <tr>
    <td align="center" style="padding:24px 16px;">

      <!-- Outer container -->
      <table width="660" cellpadding="0" cellspacing="0" border="0" style="max-width:660px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${primaryColor}; padding:28px 32px 22px 32px; border-radius:6px 6px 0 0;">
            <p style="margin:0 0 4px 0; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:${accentColor}; font-family:'Georgia',serif;">Abdulmohsen's</p>
            <h1 style="margin:0; font-size:24px; font-weight:700; color:#ffffff; font-family:'Georgia',serif; letter-spacing:0.5px;">Daily Statesman Brief</h1>
            <p style="margin:8px 0 0 0; font-size:13px; color:#9aaac4; font-family:'Georgia',serif;">${brief.date} &nbsp;·&nbsp; Asia/Kuwait &nbsp;·&nbsp; ~${brief.wordCount} words</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:${lightBg}; padding:28px 28px 8px 28px; border-radius:0 0 6px 6px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">

              <!-- Greeting -->
              <tr>
                <td style="padding:0 0 20px 0; font-size:15px; line-height:1.8; color:${primaryColor}; font-family:'Georgia',serif; border-bottom:2px solid ${accentColor}; margin-bottom:20px;">
                  ${brief.greeting}
                </td>
              </tr>
              <tr><td style="padding:12px 0;"></td></tr>

              ${section("Executive Summary", brief.executiveSummary, "📋")}
              ${divider()}
              ${section("Kuwait Command Center", brief.kuwaitCommandCenter, "🇰🇼")}
              ${divider()}
              ${section("Oil &amp; Energy Snapshot", brief.oilEnergySnapshot, "🛢️")}
              ${divider()}
              ${section("World &amp; Geopolitics", brief.worldGeopolitics, "🌐")}
              ${divider()}
              ${section("AI &amp; Technology Watch", brief.aiTechWatch, "🤖")}
              ${divider()}
              ${section("Economic Snapshot", brief.economicSnapshot, "📊")}
              ${divider()}
              ${section("Today's Knowledge Capsule", brief.knowledgeCapsule, "🎓")}
              ${divider()}
              ${section("Think-Tank / Academic Insight", brief.thinkTankInsight, "🏛️")}
              ${divider()}
              ${section("This Day in History", brief.thisDateInHistory, "📅")}
              ${divider()}
              ${section("Smart Factoids", brief.smartFactoids, "💡")}
              ${divider()}
              ${section("Personal Momentum Note", brief.personalMomentum, "⚡")}
              ${divider()}
              ${section("Three Strategic Questions", brief.threeQuestions, "❓")}
              ${divider()}
              ${section("Tomorrow's Watchlist", brief.tomorrowWatchlist, "👁️")}

              <!-- Footer -->
              <tr>
                <td style="padding:24px 0 8px 0; text-align:center; font-size:11px; color:#888; font-family:'Georgia',serif; border-top:1px solid ${borderColor};">
                  Prepared for Abdulmohsen Al-Shammari &nbsp;·&nbsp; Abdulmohsen's Daily Statesman Brief<br/>
                  Delivered at 10:00 AM Asia/Kuwait &nbsp;·&nbsp; Sources: KUNA, Reuters, BBC, Bloomberg, FT, IMF &amp; more
                </td>
              </tr>

            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function buildEmailText(brief: BriefContent): string {
  function strip(html: string): string {
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

  return `ABDULMOHSEN'S DAILY STATESMAN BRIEF
${brief.date}
${"═".repeat(50)}

${strip(brief.greeting)}

${"─".repeat(50)}
📋 EXECUTIVE SUMMARY
${"─".repeat(50)}
${strip(brief.executiveSummary)}

${"─".repeat(50)}
🇰🇼 KUWAIT COMMAND CENTER
${"─".repeat(50)}
${strip(brief.kuwaitCommandCenter)}

${"─".repeat(50)}
🛢️ OIL & ENERGY SNAPSHOT
${"─".repeat(50)}
${strip(brief.oilEnergySnapshot)}

${"─".repeat(50)}
🌐 WORLD & GEOPOLITICS
${"─".repeat(50)}
${strip(brief.worldGeopolitics)}

${"─".repeat(50)}
🤖 AI & TECHNOLOGY WATCH
${"─".repeat(50)}
${strip(brief.aiTechWatch)}

${"─".repeat(50)}
📊 ECONOMIC SNAPSHOT
${"─".repeat(50)}
${strip(brief.economicSnapshot)}

${"─".repeat(50)}
🎓 TODAY'S KNOWLEDGE CAPSULE
${"─".repeat(50)}
${strip(brief.knowledgeCapsule)}

${"─".repeat(50)}
🏛️ THINK-TANK / ACADEMIC INSIGHT
${"─".repeat(50)}
${strip(brief.thinkTankInsight)}

${"─".repeat(50)}
📅 THIS DAY IN HISTORY
${"─".repeat(50)}
${strip(brief.thisDateInHistory)}

${"─".repeat(50)}
💡 SMART FACTOIDS
${"─".repeat(50)}
${strip(brief.smartFactoids)}

${"─".repeat(50)}
⚡ PERSONAL MOMENTUM NOTE
${"─".repeat(50)}
${strip(brief.personalMomentum)}

${"─".repeat(50)}
❓ THREE STRATEGIC QUESTIONS
${"─".repeat(50)}
${strip(brief.threeQuestions)}

${"─".repeat(50)}
👁️ TOMORROW'S WATCHLIST
${"─".repeat(50)}
${strip(brief.tomorrowWatchlist)}

${"═".repeat(50)}
Abdulmohsen's Daily Statesman Brief · Delivered 10:00 AM Asia/Kuwait
`;
}
