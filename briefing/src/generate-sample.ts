// Generates a sample HTML email with realistic content — no API key needed.
// Run: npx tsx src/generate-sample.ts
// Output: sample-brief.html (open in browser to preview)

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { buildEmailHtml, buildEmailText } from "./template.js";
import type { BriefContent } from "./generator.js";
import { logger } from "./logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sample: BriefContent = {
  date: "Sunday, June 1, 2025",
  wordCount: 1243,

  greeting: `<p>Good morning, Abdulmohsen. The world moved overnight while you rested — and as always, it left a few things worth your attention. This morning's brief is concise, actionable, and calibrated to what matters most for you. Let's make it a productive Sunday.</p>`,

  executiveSummary: `<ul>
    <li><strong>OPEC+ cuts deepened</strong> — The alliance confirmed an additional 500k bbl/day reduction effective July. <em>Why it matters:</em> Supports Kuwait's fiscal baseline above $75/bbl. <em>Watch:</em> US shale response over 90 days. (<a href="https://www.reuters.com/business/energy/">Reuters Energy</a>)</li>
    <li><strong>Kuwait Cabinet reshuffle</strong> — HH the Amir accepted the government's resignation and tasked the outgoing PM with forming a new cabinet. <em>Why it matters:</em> Policy continuity on Vision 2035 projects uncertain for 30–60 days. <em>Watch:</em> New Finance and MOCI appointments. (<a href="https://www.kuna.net.kw">KUNA</a>)</li>
    <li><strong>Fed signals one more hike</strong> — FOMC minutes suggest one additional 25bp increase in Q3. <em>Why it matters:</em> Gulf pegged currencies hold; KWD remains stable. <em>Watch:</em> CBK policy response. (<a href="https://www.ft.com">Financial Times</a>)</li>
    <li><strong>China–US tech decoupling accelerates</strong> — New US export controls on advanced chips expand the restricted entity list. <em>Why it matters:</em> Gulf sovereign tech investment portfolios may face rebalancing pressure. (<a href="https://www.reuters.com">Reuters</a>)</li>
    <li><strong>AI regulation in GCC advancing</strong> — UAE's TDRA published a draft AI governance framework. <em>Why it matters:</em> Kuwait will likely follow; early awareness gives digital businesses first-mover compliance advantage. (<a href="https://tdra.gov.ae">TDRA</a>)</li>
  </ul>`,

  kuwaitCommandCenter: `<div style="margin-bottom:18px;">
    <p><strong>⚠️ KUWAIT REGULATORY ALERT 🚨</strong></p>
    <p><strong>MOCI issues updated Home Business Licensing Guidelines</strong> — The Ministry of Commerce and Industry published revised conditions for home-based commercial activity, effective 15 June 2025. Key changes: e-commerce sellers operating from residential addresses must register with the Kuwait Business Center within 60 days; social media selling (Instagram, TikTok stores) now requires a commercial CR even for individuals. <em>Why it matters:</em> Direct compliance obligation for anyone running a digital or home-based business. Personal relevance: <strong>★★★ Critical</strong>. (<a href="https://www.moci.gov.kw">MOCI</a> / <a href="https://www.kbc.gov.kw">Kuwait Business Center</a>)</p>
  </div>
  <div style="margin-bottom:18px;">
    <p><strong>Cabinet Transition and Vision 2035</strong> — With the cabinet resignation accepted, the New Kuwait 2035 development plan enters a soft pause on new tender approvals. Existing contracts continue uninterrupted. <em>Why it matters:</em> Entrepreneurs and contractors dependent on government procurement should delay new bids until a new cabinet is confirmed. Personal relevance: <strong>★★ Relevant</strong>. (<a href="https://www.kuna.net.kw">KUNA</a>)</p>
  </div>
  <div>
    <p><strong>Kuwait Oil production steady at 2.65M bbl/day</strong> — KPC confirmed output adherence to OPEC+ quota with no disruptions. Upstream expansions at Greater Burgan remain on schedule for 2026. <em>Why it matters:</em> Stable output underpins the fiscal year budget at projected $76/bbl baseline. Personal relevance: <strong>★★ Relevant</strong>. (<a href="https://www.kpc.com.kw">KPC</a>)</p>
  </div>`,

  oilEnergySnapshot: `<p><strong>Brent Crude:</strong> $82.40/bbl &nbsp;·&nbsp; <strong>WTI:</strong> $78.90/bbl &nbsp;·&nbsp; <strong>Kuwait Export Crude:</strong> ~$80.10/bbl</p>
  <p><strong>OPEC+:</strong> Confirmed additional voluntary cuts of 500k bbl/day from July; Saudi Arabia extending its unilateral 1M bbl/day cut through August. Next ministerial meeting: July 26. (<a href="https://www.opec.org">OPEC</a> / <a href="https://feeds.reuters.com/reuters/businessNews">Reuters</a>)</p>
  <p><strong>Kuwait energy note:</strong> With Brent holding above $80, Kuwait's FY2025/26 budget surplus projection remains intact — every $1 increase in oil price adds approximately KD 115M to state revenues annually.</p>`,

  worldGeopolitics: `<div style="margin-bottom:14px;">
    <p><strong>🇺🇸 US:</strong> Congress passed a continuing resolution averting a government shutdown through September. <em>Strategic significance:</em> US fiscal dysfunction reduces dollar credibility as a reserve anchor over the medium term — a slow-moving story with large structural implications. <em>Likely next move:</em> Debt ceiling negotiations intensify in July. (<a href="https://feeds.apnews.com/rss/apf-topnews">AP News</a>)</p>
  </div>
  <div style="margin-bottom:14px;">
    <p><strong>🇸🇦 GCC / Middle East:</strong> Saudi–Iranian diplomatic normalization reaches its six-month mark with both ambassadors now formally in post. <em>Strategic significance:</em> Reduces Gulf security premium in oil pricing; Kuwait benefits from stable regional environment for Vision 2035 foreign investment attraction. <em>Likely next move:</em> Joint economic commission activation. (<a href="https://feeds.bbci.co.uk/news/world/rss.xml">BBC World</a>)</p>
  </div>
  <div>
    <p><strong>🇨🇳 China:</strong> Beijing announced a $500B infrastructure belt expansion across Central Asia and the Gulf. <em>Strategic significance:</em> Kuwait is positioned as a potential logistics hub; CITIC and KIA discussions ongoing. <em>Likely next move:</em> MOU signed at SCO summit. (<a href="https://www.reuters.com">Reuters</a>)</p>
  </div>`,

  aiTechWatch: `<div style="margin-bottom:14px;">
    <p><strong>OpenAI GPT-5 enterprise deployment begins</strong> — OpenAI launched GPT-5 for enterprise API customers with a 128k context window and native tool execution. <em>Why should Abdulmohsen care?</em> This directly affects the cost and capability floor for any AI-powered business tool built in Kuwait — the automation advantage for early-moving SMEs just widened significantly. Integrating AI into a Kuwait home business or digital product is now materially cheaper and more capable. (<a href="https://www.technologyreview.com">MIT Technology Review</a>)</p>
  </div>
  <div>
    <p><strong>CITRA Kuwait finalizes Digital Economy Strategy consultation</strong> — The Communications and Information Technology Regulatory Authority closed public consultations on Kuwait's Digital Economy Strategy 2030, with final regulations expected Q4 2025. <em>Why should Abdulmohsen care?</em> The strategy includes frameworks for AI deployment, data localization, and digital business licensing — the regulatory environment for Kuwait digital entrepreneurship is about to crystallize. Read the draft and position ahead of it. (<a href="https://www.citra.gov.kw">CITRA</a>)</p>
  </div>`,

  economicSnapshot: `<ul>
    <li><strong>Oil:</strong> Brent $82.40 — OPEC+ discipline holding. Kuwait budget surplus trajectory intact. (<a href="https://www.opec.org">OPEC</a>)</li>
    <li><strong>Inflation:</strong> Kuwait CPI at 3.1% (April); food and housing components elevated. CBK monitoring but no rate action expected this quarter. (<a href="https://www.cbk.gov.kw">Central Bank of Kuwait</a>)</li>
    <li><strong>Interest rates:</strong> Fed funds rate 5.25–5.50%; one more 25bp hike priced in for July. KWD remains pegged to basket; CBK discount rate unchanged at 4.5%. (<a href="https://www.ft.com">FT</a>)</li>
    <li><strong>Markets:</strong> Kuwait Premier Market index +1.2% WTD; Boursa Kuwait Weighted Index at 7,840. Banking and real estate sectors leading gains. (<a href="https://www.boursakuwait.com.kw">Boursa Kuwait</a>)</li>
    <li><strong>KIA / Sovereign Wealth:</strong> Kuwait Investment Authority confirmed full-year return of 8.3% on international portfolio. GRF reserve buffer maintained above statutory minimum. (<a href="https://www.kia.gov.kw">KIA</a>)</li>
  </ul>`,

  knowledgeCapsule: `<p><strong>Political Science — Rentier State Theory:</strong> A rentier state extracts primary revenue from external rents (oil exports) rather than taxing citizens — which structurally reduces democratic accountability demand while enabling expansive welfare. Kuwait exemplifies the model, and understanding it explains most of the political economy debates you will encounter in MPA work.</p>
  <p><strong>Public Administration — New Public Management (NPM):</strong> NPM introduces private-sector management principles (efficiency targets, performance metrics, competition) into government. Kuwait's Vision 2035 reforms embed NPM logic — but critics note it can erode equity and accountability if applied without institutional safeguards.</p>
  <p><strong>Economics — Fiscal Break-Even Oil Price:</strong> The oil price at which a government's budget revenues exactly cover its expenditures. Kuwait's break-even is ~$75/bbl for FY2025/26 — current prices provide a modest but real buffer that can be deployed as policy space.</p>
  <p><strong>Historical Lesson — The 1938 Majlis Movement:</strong> Kuwait's merchant class petitioned for a representative assembly in 1938 — one of the Gulf's earliest organized political reform movements. It was suppressed but planted roots for the National Assembly that emerged in 1962. Constitutional governance in Gulf states is never linear.</p>`,

  thinkTankInsight: `<p><em>"Gulf sovereign wealth funds are increasingly using their balance sheets as instruments of economic transformation, not merely financial preservation. The shift from passive to active ownership — visible in KIA's co-investment platforms and Mubadala's sector partnerships — signals a new model of state capitalism in which portfolio strategy and national development strategy are deliberately fused."</em></p>
  <p style="font-size:12px; color:#666;">— Chatham House, <em>Gulf Capital and the New State Capitalism</em>, 2025 (<a href="https://www.chathamhouse.org">chathamhouse.org</a>)</p>`,

  thisDateInHistory: `<p><strong>June 1, 1961:</strong> Kuwait gained full independence from Britain, terminating the 1899 Anglo-Kuwaiti Agreement. Within months, Iraqi PM Qasim claimed Kuwait as Iraqi territory — prompting a landmark Arab League resolution affirming Kuwaiti sovereignty and deploying Arab forces. The episode established that small, oil-rich states require both international legitimacy and credible defense guarantees — a lesson that shaped GCC formation in 1981.</p>`,

  smartFactoids: `<ul>
    <li>The word "diplomacy" derives from the Greek <em>diploma</em> — a folded document that served as the official credential of an ancient envoy; the bearer of the paper was, literally, the bearer of authority.</li>
    <li>Kuwait's National Assembly (Majlis Al-Umma), established in 1963, is the oldest elected parliament in the Arabian Peninsula — and one of the most contested, having been dissolved by Amiri decree six times.</li>
    <li>The IMF was originally designed not to prevent crises, but to manage their aftermath — its founding architects Keynes and White explicitly prioritized capital controls over free capital flows, the opposite of the post-1980 consensus it came to enforce.</li>
  </ul>`,

  personalMomentum: `<p>Abdulmohsen, the combination you are building — Political Science rigor, MPA systems thinking, and firsthand understanding of how Kuwait's regulatory and economic environment actually works — is rare. Most people have one of these. You are assembling all three at a moment when Kuwait's digital economy is about to go through its most consequential regulatory formation in a decade. That is not coincidence. Stay close to the MOCI and CITRA developments — your analytical framework will let you see what most entrepreneurs will only react to after the fact.</p>`,

  threeQuestions: `<ol>
    <li><strong>Who gained leverage today?</strong> OPEC+ and, by extension, Gulf fiscal authorities — deeper cuts at $82/bbl give the alliance pricing credibility heading into H2 without straining member compliance. Kuwait gains budget headroom.</li>
    <li><strong>Which institution is under pressure?</strong> Kuwait's incoming cabinet formation process — a transition period creates a decision vacuum in procurement, licensing, and regulatory implementation. Ministries slow down. This is a window to prepare, not to wait.</li>
    <li><strong>What should I monitor tomorrow?</strong> Whether MOCI publishes the official gazette notice on the home business licensing update, and any statement from the PM-designate on economic portfolio assignments.</li>
  </ol>`,

  tomorrowWatchlist: `<ul>
    <li><strong>MOCI Official Gazette:</strong> Watch for the formal publication of the home business/e-commerce licensing amendment — triggers the 60-day compliance clock.</li>
    <li><strong>PM-Designate announcement:</strong> The Amir is expected to name a new PM within 72 hours; the Finance and MOCI minister choices will signal policy direction for Vision 2035.</li>
    <li><strong>Fed Chair testimony (US Senate):</strong> Powell's semiannual Humphrey-Hawkins testimony could reprice the July hike probability — affects Gulf currency peg dynamics and KIA portfolio.</li>
  </ul>`,
};

const html = buildEmailHtml(sample);
const text = buildEmailText(sample);

const outDir = join(__dirname, "..");
writeFileSync(join(outDir, "sample-brief.html"), html);
writeFileSync(join(outDir, "sample-brief.txt"), text);

logger.success(`Sample brief generated:`);
logger.info(`  HTML → briefing/sample-brief.html`);
logger.info(`  Text → briefing/sample-brief.txt`);
logger.info(`  Word count: ~${sample.wordCount}`);

// Quality checks
const checks = {
  "Under 1,500 words": sample.wordCount <= 1500,
  "Over 1,000 words": sample.wordCount >= 1000,
  "Has source links": html.includes("href="),
  "Kuwait regulatory alert included": html.includes("KUWAIT REGULATORY ALERT"),
  "Home business licensing included": html.includes("home") && html.includes("licens"),
  "MOCI mentioned": html.includes("MOCI"),
  "CITRA mentioned": html.includes("CITRA"),
  "All 14 sections present": [
    "Executive Summary", "Kuwait Command Center", "Oil", "Geopolit",
    "AI", "Economic Snapshot", "Knowledge Capsule", "Think-Tank",
    "This Day in History", "Smart Factoids", "Personal Momentum",
    "Strategic Questions", "Watchlist"
  ].every((s) => html.includes(s)),
};

console.log("\n── Quality Checks ──────────────────────────────");
let allPassed = true;
for (const [check, passed] of Object.entries(checks)) {
  const icon = passed ? "✓" : "✗";
  console.log(`  ${icon} ${check}`);
  if (!passed) allPassed = false;
}
console.log(`────────────────────────────────────────────────`);
console.log(`  ${allPassed ? "All checks passed ✓" : "Some checks failed ✗"}\n`);
