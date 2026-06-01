# Abdulmohsen's Daily Statesman Brief — Google Apps Script

## YOUR JOB
Build a complete Google Apps Script project from scratch using the code below. When done, fire a test send and confirm the email arrives at `abdulmohsen.alshammari1999@gmail.com`.

## WHAT THIS IS
A daily personal intelligence brief — 15 sections, 1,000–1,500 words — delivered every morning at 10:00 AM Kuwait time. It fetches live news via RSS, generates the brief with Claude AI, and sends it via Gmail. Entirely free, no server required.

---

## BEFORE YOU START — COLLECT THESE
- Google account: `abdulmohsen.alshammari1999@gmail.com`
- Anthropic API key: `sk-ant-...` from console.anthropic.com

---

## STEP 1 — CREATE THE PROJECT
1. Go to script.google.com → **New project**
2. Name it: `Daily Statesman Brief`
3. **⚙️ Project Settings → Time zone → (UTC) Coordinated Universal Time** ← critical

---

## STEP 2 — REPLACE THE MANIFEST
View → Show manifest file (`appsscript.json`) → replace entirely with:

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

---

## STEP 3 — CREATE 6 SCRIPT FILES
Click **+** → Script for each. Name exactly as shown. Paste contents in full.

---

### FILE 1 — `Config`

```javascript
var CONFIG = {
  recipientName: "Abdulmohsen",
  recipientEmail: "abdulmohsen.alshammari1999@gmail.com",
  senderName: "The Statesman Brief",
  sendHourUTC: 7,
  timezone: "Asia/Kuwait",
  maxWordCount: 1500,
  minWordCount: 1000,
  anthropicModel: "claude-opus-4-8",
  anthropicMaxTokens: 7000,

  tone: {
    style: "presidential daily briefing",
    voice: "elite Chief of Staff meets brilliant essayist",
    qualities: ["sharp", "warm", "sourced", "analytical", "opinionated", "vivid", "concise"]
  },

  relevancePriorities: [
    "Kuwait government affairs and public administration",
    "Kuwait digital business, home business licensing, e-commerce regulations",
    "MOCI, Kuwait Business Center, CITRA updates",
    "Oil state economics and GCC geopolitics",
    "Political Science and MPA academic insights",
    "AI, automation, and productivity technology",
    "Strategic decision-making and leadership",
    "Entrepreneurship in Kuwait"
  ],

  ecommerce: {
    market: "Kuwait",
    model: "Quick-turn sell-out — buy in advance before demand peaks",
    alibabaLeadWeeks: "6–10 weeks minimum",
    sourcingChannels: ["Alibaba", "regional GCC distributors", "local wholesale", "Dubai traders"],
    kuwaitSeasonalCalendar: [
      "Ramadan & Eid Al-Fitr — gifting, home decor, modest fashion, food items surge",
      "Eid Al-Adha — premium gifting, home entertaining, travel accessories",
      "Hala February — shopping festival, lifestyle products, promotions",
      "National Day / Liberation Day (Feb 25–26) — patriotic merchandise, gatherings",
      "Back to School (Aug–Sep) — stationery, tech accessories, bags",
      "Summer (Jun–Aug) — travel accessories, outdoor, cooling products",
      "Winter (Nov–Feb) — fashion, home warmth, indoor lifestyle",
      "Kuwait Shopping Festival — electronics, fashion, home"
    ],
    kuwaitConsumerProfile: [
      "High gifting culture — packaging and presentation matter",
      "Strong modest fashion demand — abayas, thobes, covered swimwear",
      "Home lifestyle and interior decor",
      "Premium and branded preference — perceived quality over price",
      "Social media driven — TikTok and Instagram Kuwait trends move fast",
      "Tech-savvy early adopters",
      "Health, wellness, and fitness growing category",
      "Pet products growing segment",
      "Kids and baby products — family-centric culture"
    ]
  },

  rssSources: [
    { name: "KUNA",         url: "https://www.kuna.net.kw/rss.aspx?lang=en",      category: "kuwait"    },
    { name: "Kuwait Times", url: "https://www.kuwaittimes.com/feed/",             category: "kuwait"    },
    { name: "Arab Times",   url: "https://www.arabtimesonline.com/feed/",         category: "kuwait"    },
    { name: "Reuters Biz",  url: "https://feeds.reuters.com/reuters/businessNews", category: "energy"    },
    { name: "Reuters Top",  url: "https://feeds.reuters.com/reuters/topNews",      category: "world"     },
    { name: "BBC World",    url: "https://feeds.bbci.co.uk/news/world/rss.xml",    category: "world"     },
    { name: "AP News",      url: "https://feeds.apnews.com/rss/apf-topnews",       category: "world"     },
    { name: "MIT Tech",     url: "https://www.technologyreview.com/feed/",         category: "tech"      },
    { name: "The Verge",    url: "https://www.theverge.com/rss/index.xml",         category: "tech"      },
    { name: "IMF News",     url: "https://www.imf.org/en/News/rss?language=eng",   category: "economics" }
  ]
};

function getAnthropicKey() {
  var key = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY not set. Run setProperties() in Setup first.");
  return key;
}
```

---

### FILE 2 — `Sources`

```javascript
function fetchAllSources() {
  Logger.log("Fetching sources…");
  var byCategory = { kuwait: [], energy: [], world: [], tech: [], economics: [] };
  var failedSources = [];
  var cutoff = Date.now() - 48 * 60 * 60 * 1000;

  CONFIG.rssSources.forEach(function(src) {
    try {
      var items = fetchRssFeed(src.name, src.url, cutoff);
      if (byCategory[src.category]) byCategory[src.category] = byCategory[src.category].concat(items);
    } catch(e) {
      Logger.log("WARN: " + src.name + " failed — " + e.message);
      failedSources.push(src.name);
    }
  });

  Logger.log("Done. Kuwait:" + byCategory.kuwait.length + " Energy:" + byCategory.energy.length +
    " World:" + byCategory.world.length + " Tech:" + byCategory.tech.length +
    " Economics:" + byCategory.economics.length + " Failed:" + failedSources.length);

  return { items: byCategory, failedSources: failedSources, fetchedAt: new Date().toISOString() };
}

function fetchRssFeed(sourceName, url, cutoff) {
  var response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { "User-Agent": "DailyStatesmanBrief/1.0" },
    followRedirects: true,
    validateHttpsCertificates: false
  });
  if (response.getResponseCode() !== 200) throw new Error("HTTP " + response.getResponseCode());

  var doc = XmlService.parse(response.getContentText());
  var root = doc.getRootElement();
  var ns = root.getNamespace();
  var isAtom = root.getName() === "feed";
  var channelEl = isAtom ? root : root.getChild("channel", ns);
  if (!channelEl) return [];

  var itemEls = channelEl.getChildren(isAtom ? "entry" : "item", ns);
  var results = [];
  for (var i = 0; i < Math.min(itemEls.length, 8); i++) {
    var el = itemEls[i];
    var pubDate = getElText(el, isAtom ? "published" : "pubDate", ns);
    if (pubDate) { var d = new Date(pubDate); if (!isNaN(d.getTime()) && d.getTime() < cutoff) continue; }
    results.push({
      title:   (getElText(el, "title", ns) || "(no title)").trim(),
      summary: (getElText(el, isAtom ? "summary" : "description", ns)).replace(/<[^>]+>/g,"").trim().substring(0, 400),
      link:    isAtom ? getAtomLink(el) : getElText(el, "link", ns),
      pubDate: pubDate,
      source:  sourceName
    });
  }
  return results;
}

function getElText(el, tag, ns) {
  var c = el.getChild(tag, ns) || el.getChild(tag);
  return c ? c.getText() : "";
}

function getAtomLink(el) {
  var links = el.getChildren("link");
  for (var i = 0; i < links.length; i++) {
    var rel = links[i].getAttribute("rel");
    if (!rel || rel.getValue() === "alternate") { var h = links[i].getAttribute("href"); if (h) return h.getValue(); }
  }
  return "";
}

function formatSourcesForPrompt(sources) {
  return [
    fmtCat(sources.items.kuwait,    "Kuwait News"),
    fmtCat(sources.items.energy,    "Oil & Energy"),
    fmtCat(sources.items.world,     "World & Geopolitics"),
    fmtCat(sources.items.tech,      "AI & Technology"),
    fmtCat(sources.items.economics, "Economics & Markets")
  ].join("\n\n");
}

function fmtCat(items, label) {
  if (!items || !items.length) return "## " + label + "\n(No items fetched)";
  return "## " + label + "\n" + items.slice(0,6).map(function(n){
    return "- [" + n.source + "] " + n.title + "\n  " + n.summary + "\n  URL: " + (n.link||"N/A") + "\n  Date: " + n.pubDate;
  }).join("\n");
}
```

---

### FILE 3 — `Generator`

```javascript
function generateBrief(sources) {
  Logger.log("Generating brief with Claude…");
  var apiKey = getAnthropicKey();
  var prompt = buildPrompt(sources);

  var response = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", {
    method: "post",
    muteHttpExceptions: true,
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    payload: JSON.stringify({
      model: CONFIG.anthropicModel,
      max_tokens: CONFIG.anthropicMaxTokens,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (response.getResponseCode() !== 200)
    throw new Error("Anthropic API " + response.getResponseCode() + ": " + response.getContentText().substring(0,300));

  var data = JSON.parse(response.getContentText());
  var raw = (data.content && data.content[0] && data.content[0].text ? data.content[0].text : "").trim();
  raw = raw.replace(/^```json?\s*/i,"").replace(/\s*```$/i,"").trim();

  var parsed;
  try { parsed = JSON.parse(raw); }
  catch(e) {
    Logger.log("ERROR: bad JSON. Preview: " + raw.substring(0,500));
    throw new Error("AI response was not valid JSON");
  }

  var brief = {
    date:                getKuwaitDate(),
    greeting:            parsed.greeting            || "",
    executiveSummary:    parsed.executiveSummary    || "",
    kuwaitCommandCenter: parsed.kuwaitCommandCenter || "",
    oilEnergySnapshot:   parsed.oilEnergySnapshot   || "",
    worldGeopolitics:    parsed.worldGeopolitics    || "",
    aiTechWatch:         parsed.aiTechWatch         || "",
    economicSnapshot:    parsed.economicSnapshot    || "",
    knowledgeCapsule:    parsed.knowledgeCapsule    || "",
    thinkTankInsight:    parsed.thinkTankInsight    || "",
    thisDateInHistory:   parsed.thisDateInHistory   || "",
    smartFactoids:       parsed.smartFactoids       || "",
    personalMomentum:    parsed.personalMomentum    || "",
    threeQuestions:      parsed.threeQuestions      || "",
    tomorrowWatchlist:   parsed.tomorrowWatchlist   || "",
    ecommerceRadar:      parsed.ecommerceRadar      || "",
    wordCount: 0
  };

  var allText = Object.keys(brief).map(function(k){ return typeof brief[k]==="string"?brief[k]:""; }).join(" ");
  brief.wordCount = allText.replace(/<[^>]+>/g," ").split(/\s+/).filter(Boolean).length;
  Logger.log("Brief generated. ~" + brief.wordCount + " words.");
  if (brief.wordCount > 1600) Logger.log("WARN: over 1,500 words.");
  return brief;
}

function getKuwaitDate() {
  return Utilities.formatDate(new Date(), "Asia/Kuwait", "EEEE, MMMM d, yyyy");
}

function buildPrompt(sources) {
  var dateStr  = getKuwaitDate();
  var srcText  = formatSourcesForPrompt(sources);
  var failNote = sources.failedSources.length > 0
    ? "Note: These sources failed: " + sources.failedSources.join(", ") + ". Work with what is available."
    : "";
  var ec = CONFIG.ecommerce;
  var priorities = CONFIG.relevancePriorities.join("\n- ");
  var calendar   = ec.kuwaitSeasonalCalendar.join("\n- ");
  var consumer   = ec.kuwaitConsumerProfile.join("\n- ");
  var channels   = ec.sourcingChannels.join(", ");

  return "You are two things simultaneously:\n\n" +
    "1. Elite Chief of Staff to Abdulmohsen Al-Shammari — Kuwaiti, Political Science + MPA background, cares about:\n- " + priorities + "\n\n" +
    "2. A brilliant, opinionated writer. Think the best of The Economist, Fareed Zakaria, and a sharp Arabic essayist combined. " +
    "You write with wit, precision, and warmth. Every sentence earns its place. You have opinions. You make connections others miss. " +
    "You write in a way that makes the reader lean forward, not skim. This brief should never read like AI output — " +
    "it should read like the most informed, most eloquent person in the room sat down and wrote it for Abdulmohsen alone.\n\n" +
    "He also runs a Kuwait e-commerce business. Model: quick-turn sell-out items bought in advance before demand peaks. " +
    "Alibaba lead time is 6–10 weeks — all sourcing intel must account for this.\n\n" +
    "Today: " + dateStr + " (Asia/Kuwait)\n" + failNote + "\n\n" +
    "NEWS SOURCES (cite URLs exactly — do not fabricate):\n" + srcText + "\n\n---\n\n" +
    "KUWAIT E-COMMERCE CONTEXT:\n" +
    "Market: Kuwait only | Model: " + ec.model + " | Lead time: " + ec.alibabaLeadWeeks + "\n" +
    "Sourcing: " + channels + "\n" +
    "Seasonal calendar:\n- " + calendar + "\n" +
    "Consumer profile:\n- " + consumer + "\n\n---\n\n" +
    "WRITING RULES — NON-NEGOTIABLE:\n" +
    "- Write like a human who loves ideas and loves writing\n" +
    "- Vary sentence length. Short punches. Then a longer sentence that develops a thought and rewards the reader.\n" +
    "- Use specific names, numbers, places — never vague generalities\n" +
    "- Each section has a distinct voice (history = vivid; geopolitics = dry/strategic; momentum = warm/direct)\n" +
    "- Banned phrases: 'it is worth noting', 'in conclusion', 'it is important to', 'as we can see', 'delve into'\n" +
    "- The greeting must reference something real about today — not a generic good morning\n" +
    "- If something is interesting, let it be interesting\n\n" +
    "Generate the brief as a JSON object. Each value is an HTML string (use <p><ul><li><strong><em><a href> — no markdown). " +
    "Total: 1,000–1,500 words across all sections.\n\n" +

    "\"greeting\": 2–3 sentences. Warm, personal, never repeated. Reference something from today's world — woven naturally. " +
    "Sound like a trusted Chief of Staff who reads everything.\n\n" +

    "\"executiveSummary\": ≤5 bullets. What happened → why it matters → what to watch. Crisp, no padding.\n\n" +

    "\"kuwaitCommandCenter\": 3 items. Kuwait gov affairs, laws, MOCI/KBC/CITRA, oil, economy, public issues. " +
    "Each: what changed + why it matters + relevance score (★★★ Critical / ★★ Relevant / ★ Worth Knowing). " +
    "KUWAIT REGULATORY ALERT 🚨 ONLY for real compliance-affecting changes to digital/home/e-commerce/SME/fintech/AI rules. " +
    "Otherwise: 'No major Kuwait regulatory alert today.' Source links required.\n\n" +

    "\"oilEnergySnapshot\": Brent, WTI, OPEC+, Kuwait energy. Connect the numbers to Kuwait's fiscal reality. Source links.\n\n" +

    "\"worldGeopolitics\": 3 items. Most consequential global moves today. Event → strategic significance → likely next move. " +
    "Write with intelligence, not wire-service neutrality. Source links.\n\n" +

    "\"aiTechWatch\": 2 items. Genuinely significant. Answer specifically why this matters to Abdulmohsen personally. Source links.\n\n" +

    "\"economicSnapshot\": ≤5 bullets. Oil, inflation, rates, markets, SWFs, fiscal policy. Make numbers tell a story. Source links.\n\n" +

    "\"knowledgeCapsule\": 4 × 1–2 sentences. Political Science concept, MPA concept, Economics concept, Historical lesson. " +
    "Tied to what's actually happening today. Teach, don't just define.\n\n" +

    "\"thinkTankInsight\": ≤100 words from Brookings/Chatham House/CSIS/CFR/RAND/Carnegie/IMF/World Bank/OECD/UN. " +
    "Relevant to today. Cited.\n\n" +

    "\"thisDateInHistory\": One statecraft/diplomatic/economic event from this date. ≤75 words. " +
    "Make one sentence land like a fact you will remember.\n\n" +

    "\"smartFactoids\": 3 one-liners. Intelligent, surprising. Politics, history, economics, diplomacy, science, leadership. " +
    "Each should make the reader think: I never knew that.\n\n" +

    "\"personalMomentum\": 2–3 sentences. Dignified, warm, specific. A Chief of Staff who knows Abdulmohsen's arc — " +
    "Political Science, MPA, Kuwait's digital economy moment, the e-commerce business — " +
    "reminding him of what he is building. Not a motivational poster. A real observation from someone paying attention.\n\n" +

    "\"threeQuestions\": 1) Who gained leverage today? 2) Which institution is under pressure? " +
    "3) What to monitor tomorrow? Sharp 1–2 sentence answers grounded in today's actual news.\n\n" +

    "\"tomorrowWatchlist\": 3 items. Most important to track in 24–48 hours. One precise sentence each.\n\n" +

    "\"ecommerceRadar\": KUWAIT E-COMMERCE OPPORTUNITY RADAR. 3 advance sourcing signals — items to order NOW " +
    "so inventory arrives before demand peaks in Kuwait. Alibaba lead time is 6–10 weeks so each item must be " +
    "far enough ahead to act on today. Be ruthlessly specific and commercial. For each item:\n" +
    "- <strong>Opportunity</strong>: Product category + why it will move in Kuwait specifically\n" +
    "- <strong>Demand Signal</strong>: Exact trigger — upcoming event, viral content, seasonal shift, cultural moment — name it precisely\n" +
    "- <strong>What to Source</strong>: Specific SKU or product type — specific enough to paste into Alibaba search right now\n" +
    "- <strong>Order Window</strong>: Weeks until peak demand + when to place the Alibaba order\n" +
    "- <strong>Sell Profile</strong>: Fast sell-out (days) / Steady burn (weeks) / Seasonal window\n" +
    "- <strong>Kuwait Fit</strong>: ★★★ Source immediately / ★★ Strong opportunity / ★ Monitor\n" +
    "Focus: Kuwait seasonal calendar, gifting culture, modest fashion, home lifestyle, tech accessories, " +
    "health/wellness, viral product categories, high perceived value + fast Kuwait turnover.\n\n" +

    "Return ONLY valid JSON. No markdown fences. No text outside the JSON object.";
}
```

---

### FILE 4 — `Template`

```javascript
function buildEmailHtml(brief) {
  var primary = "#1a2744";
  var accent  = "#c8963e";
  var lightBg = "#f7f5f0";
  var brdr    = "#ddd8cc";

  function sec(title, content, emoji) {
    return '<tr><td style="padding:0 0 20px 0;">' +
      '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-left:1px solid ' + brdr + ';border-radius:4px;">' +
        '<tr><td style="padding:18px 22px 6px 22px;"><h2 style="margin:0 0 12px 0;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:' + primary + ';font-family:Georgia,serif;">' + (emoji?emoji+'&nbsp;&nbsp;':'') + title + '</h2></td></tr>' +
        '<tr><td style="padding:0 22px 18px 22px;font-size:14px;line-height:1.8;color:#2c2c2c;font-family:Georgia,serif;">' + content + '</td></tr>' +
      '</table></td></tr>';
  }

  function secHighlight(title, content, emoji) {
    return '<tr><td style="padding:0 0 20px 0;">' +
      '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffdf5;border-left:3px solid ' + accent + ';border-radius:4px;">' +
        '<tr><td style="padding:18px 22px 4px 22px;">' +
          '<h2 style="margin:0 0 2px 0;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:' + accent + ';font-family:Georgia,serif;">' + (emoji?emoji+'&nbsp;&nbsp;':'') + title + '</h2>' +
          '<p style="margin:0 0 12px 0;font-size:10px;color:#aaa;font-family:Georgia,serif;letter-spacing:0.5px;">KUWAIT MARKET &middot; ORDER NOW &middot; 6–10 WEEK ALIBABA LEAD TIME</p>' +
        '</td></tr>' +
        '<tr><td style="padding:0 22px 18px 22px;font-size:14px;line-height:1.8;color:#2c2c2c;font-family:Georgia,serif;">' + content + '</td></tr>' +
      '</table></td></tr>';
  }

  function div() {
    return '<tr><td style="padding:4px 0 12px 0;"><hr style="border:none;border-top:1px solid ' + brdr + ';margin:0;"/></td></tr>';
  }

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>' +
    '<title>Daily Statesman Brief — ' + brief.date + '</title></head>' +
    '<body style="margin:0;padding:0;background:#e8e8e8;font-family:Georgia,serif;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8e8e8;">' +
    '<tr><td align="center" style="padding:24px 16px;">' +
    '<table width="660" cellpadding="0" cellspacing="0" border="0" style="max-width:660px;width:100%;">' +

    '<tr><td style="background:' + primary + ';padding:28px 32px 22px 32px;border-radius:6px 6px 0 0;">' +
      '<p style="margin:0 0 4px 0;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:' + accent + ';font-family:Georgia,serif;">Abdulmohsen\'s</p>' +
      '<h1 style="margin:0;font-size:26px;font-weight:700;color:#fff;font-family:Georgia,serif;letter-spacing:0.5px;">Daily Statesman Brief</h1>' +
      '<p style="margin:8px 0 0 0;font-size:12px;color:#9aaac4;font-family:Georgia,serif;">' + brief.date + ' &nbsp;&middot;&nbsp; Kuwait &nbsp;&middot;&nbsp; ~' + brief.wordCount + ' words &nbsp;&middot;&nbsp; 15 sections</p>' +
    '</td></tr>' +

    '<tr><td style="background:' + lightBg + ';padding:28px 28px 8px 28px;border-radius:0 0 6px 6px;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +

    '<tr><td style="padding:0 0 20px 0;font-size:15px;line-height:1.85;color:' + primary + ';font-family:Georgia,serif;border-bottom:2px solid ' + accent + ';">' + brief.greeting + '</td></tr>' +
    '<tr><td style="padding:12px 0;"></td></tr>' +

    sec("Executive Summary",             brief.executiveSummary,    "📋") + div() +
    sec("Kuwait Command Center",         brief.kuwaitCommandCenter, "🇰🇼") + div() +
    sec("Oil & Energy Snapshot",         brief.oilEnergySnapshot,   "🛢️") + div() +
    sec("World & Geopolitics",           brief.worldGeopolitics,    "🌐") + div() +
    sec("AI & Technology Watch",         brief.aiTechWatch,         "🤖") + div() +
    sec("Economic Snapshot",             brief.economicSnapshot,    "📊") + div() +
    sec("Today's Knowledge Capsule",     brief.knowledgeCapsule,    "🎓") + div() +
    sec("Think-Tank Insight",            brief.thinkTankInsight,    "🏛️") + div() +
    sec("This Day in History",           brief.thisDateInHistory,   "📅") + div() +
    sec("Smart Factoids",                brief.smartFactoids,       "💡") + div() +
    sec("Personal Momentum",             brief.personalMomentum,    "⚡") + div() +
    sec("Three Strategic Questions",     brief.threeQuestions,      "❓") + div() +
    sec("Tomorrow's Watchlist",          brief.tomorrowWatchlist,   "👁️") + div() +
    secHighlight("E-Commerce Opportunity Radar — Kuwait", brief.ecommerceRadar, "🛒") +

    '<tr><td style="padding:20px 0 8px 0;text-align:center;font-size:11px;color:#999;font-family:Georgia,serif;border-top:1px solid ' + brdr + ';">' +
      'Prepared for Abdulmohsen Al-Shammari &nbsp;&middot;&nbsp; Delivered 10:00 AM Asia/Kuwait<br/>' +
      '15 sections &nbsp;&middot;&nbsp; Sources: KUNA · Reuters · BBC · FT · IMF · Brookings &amp; more' +
    '</td></tr>' +

    '</table></td></tr></table></td></tr></table></body></html>';
}
```

---

### FILE 5 — `Code`

```javascript
function runBriefPipeline() {
  Logger.log("═══ Starting Daily Statesman Brief ═══");

  var sources;
  try {
    sources = fetchAllSources();
  } catch(e) {
    Logger.log("ERROR: Source fetch failed: " + e.message);
    sources = { items:{kuwait:[],energy:[],world:[],tech:[],economics:[]}, failedSources:["all"], fetchedAt:new Date().toISOString() };
  }

  var brief;
  try {
    brief = generateBrief(sources);
  } catch(e) {
    Logger.log("ERROR: Generation failed: " + e.message);
    sendErrorEmail("Brief generation failed", e.message);
    return;
  }

  try {
    var subject = "Daily Statesman Brief — " + brief.date;
    var html = buildEmailHtml(brief);

    GmailApp.sendEmail(
      CONFIG.recipientEmail,
      subject,
      stripHtml(html),
      { htmlBody: html, name: CONFIG.senderName }
    );

    Logger.log("SUCCESS: Sent to " + CONFIG.recipientEmail + " | ~" + brief.wordCount + " words");
    writeLog(subject, brief.wordCount, sources.failedSources);

  } catch(e) {
    Logger.log("ERROR: Email failed: " + e.message);
    sendErrorEmail("Email delivery failed", e.message);
  }

  Logger.log("═══ Pipeline complete ═══");
}

function scheduledSend() { runBriefPipeline(); }

function sendBriefNow() {
  Logger.log("TEST MODE — sending brief immediately");
  runBriefPipeline();
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n").replace(/<\/li>/gi,"\n")
    .replace(/<li>/gi,"• ").replace(/<[^>]+>/g,"")
    .replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/\n{3,}/g,"\n\n").trim();
}

function sendErrorEmail(title, detail) {
  try {
    GmailApp.sendEmail(
      CONFIG.recipientEmail,
      "⚠️ Statesman Brief Error: " + title,
      "Pipeline error:\n\n" + detail + "\n\nCheck Apps Script logs: https://script.google.com",
      { name: CONFIG.senderName }
    );
  } catch(e) { Logger.log("Could not send error email: " + e.message); }
}

function writeLog(subject, wordCount, failedSources) {
  try {
    var ss;
    var sid = PropertiesService.getScriptProperties().getProperty("LOG_SHEET_ID");
    if (sid) { try { ss = SpreadsheetApp.openById(sid); } catch(e) { ss = null; } }
    if (!ss) {
      ss = SpreadsheetApp.create("Statesman Brief Delivery Log");
      PropertiesService.getScriptProperties().setProperty("LOG_SHEET_ID", ss.getId());
      var sh = ss.getActiveSheet();
      sh.setName("Deliveries");
      sh.appendRow(["Timestamp","Subject","Words","Source Status","Result"]);
      sh.setFrozenRows(1);
    }
    var sheet = ss.getSheetByName("Deliveries") || ss.getActiveSheet();
    sheet.appendRow([new Date(), subject, wordCount, failedSources.length===0?"All OK":"Failed: "+failedSources.join(", "), "SUCCESS"]);
  } catch(e) { Logger.log("WARN: Could not write log: " + e.message); }
}
```

---

### FILE 6 — `Setup`

```javascript
// STEP 1: Paste your Anthropic API key below, run this function ONCE, then delete the key.
function setProperties() {
  var ANTHROPIC_API_KEY = "sk-ant-YOUR_KEY_HERE"; // ← replace, run, delete

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "sk-ant-YOUR_KEY_HERE") {
    Logger.log("ERROR: Replace the placeholder with your real API key first.");
    return;
  }
  PropertiesService.getScriptProperties().setProperty("ANTHROPIC_API_KEY", ANTHROPIC_API_KEY);
  Logger.log("✓ API key saved. Now delete it from this function.");
}

// STEP 2: Run this to create the daily 10:00 AM Kuwait trigger.
function createTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "scheduledSend") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("scheduledSend").timeBased().everyDays(1).atHour(7).create();
  Logger.log("✓ Trigger created: scheduledSend fires at 07:00 UTC = 10:00 AM Kuwait daily.");
}

// Run this to confirm everything is configured correctly.
function checkSetup() {
  var props = PropertiesService.getScriptProperties().getProperties();
  Logger.log("=== Script Properties ===");
  Object.keys(props).forEach(function(k) {
    Logger.log("  " + k + ": " + (k==="ANTHROPIC_API_KEY" ? "(set ✓)" : props[k].substring(0,60)));
  });
  Logger.log("\n=== Triggers ===");
  ScriptApp.getProjectTriggers().forEach(function(t) {
    Logger.log("  " + t.getHandlerFunction() + " | " + t.getEventType());
  });
  Logger.log("\n=== Config ===");
  Logger.log("  Recipient: " + CONFIG.recipientEmail);
  Logger.log("  Send hour UTC: " + CONFIG.sendHourUTC + " = 10:00 AM Kuwait");
  Logger.log("  Sources: " + CONFIG.rssSources.length);
  Logger.log("  AI model: " + CONFIG.anthropicModel);
}

// Removes all triggers and properties. Use to start fresh.
function teardown() {
  ScriptApp.getProjectTriggers().forEach(function(t) { ScriptApp.deleteTrigger(t); });
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log("All triggers and properties cleared.");
}
```

---

## STEP 4 — SAVE API KEY
1. In `Setup`, replace `sk-ant-YOUR_KEY_HERE` with your real key
2. Select `setProperties` → **▶ Run**
3. Grant all permissions when prompted
4. Delete the key from the source code

## STEP 5 — CREATE TRIGGER
Select `createTrigger` → **▶ Run**
Verify in Triggers sidebar (clock icon): `scheduledSend` fires daily at hour 7.

## STEP 6 — TEST SEND
Select `sendBriefNow` → **▶ Run**
Email arrives at `abdulmohsen.alshammari1999@gmail.com` within ~90 seconds.

## STEP 7 — VERIFY
Select `checkSetup` → **▶ Run**
Confirm: API key set, trigger active, config correct.

---

## DONE WHEN
- [ ] Test email received — subject: `Daily Statesman Brief — [date]`
- [ ] 15 sections present including E-Commerce Opportunity Radar at the bottom
- [ ] 1,000–1,500 words
- [ ] E-Commerce section shows 3 items with Order Window and Sell Profile
- [ ] Trigger confirmed active at 07:00 UTC
- [ ] Delivery logged to Google Sheet in Drive

---

## DAILY MANAGEMENT
| Action | How |
|--------|-----|
| Stop sending | Run `teardown()` |
| Test send | Run `sendBriefNow()` |
| Check logs | Google Drive → "Statesman Brief Delivery Log" |
| Edit sources | Modify `rssSources` in `Config` |
| Edit priorities | Modify `relevancePriorities` in `Config` |
| Edit e-commerce context | Modify `ecommerce` object in `Config` |
