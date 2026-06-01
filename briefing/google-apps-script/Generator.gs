// ─────────────────────────────────────────────────────────────────
// Generator.gs — Calls Anthropic Claude API to generate the brief
// ─────────────────────────────────────────────────────────────────

/**
 * Generate the full brief by calling Claude API.
 * @param {Object} sources  — result of fetchAllSources()
 * @returns {Object}        — brief content object with all 15 sections
 */
function generateBrief(sources) {
  Logger.log("Generating brief with Claude…");

  var apiKey = getAnthropicKey();
  var prompt = buildPrompt(sources);

  var payload = {
    model: CONFIG.anthropicModel,
    max_tokens: CONFIG.anthropicMaxTokens,
    messages: [{ role: "user", content: prompt }]
  };

  var response = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", {
    method: "post",
    muteHttpExceptions: true,
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    payload: JSON.stringify(payload)
  });

  if (response.getResponseCode() !== 200) {
    throw new Error("Anthropic API error " + response.getResponseCode() + ": " + response.getContentText().substring(0, 300));
  }

  var data = JSON.parse(response.getContentText());
  var raw = data.content && data.content[0] && data.content[0].text
            ? data.content[0].text.trim()
            : "";

  // Strip accidental markdown fences
  raw = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();

  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    Logger.log("ERROR: Failed to parse AI response. Preview: " + raw.substring(0, 500));
    throw new Error("AI response was not valid JSON");
  }

  var date = getKuwaitDateString();
  var brief = {
    date:               date,
    greeting:           parsed.greeting           || "",
    executiveSummary:   parsed.executiveSummary   || "",
    kuwaitCommandCenter:parsed.kuwaitCommandCenter|| "",
    oilEnergySnapshot:  parsed.oilEnergySnapshot  || "",
    worldGeopolitics:   parsed.worldGeopolitics   || "",
    aiTechWatch:        parsed.aiTechWatch         || "",
    economicSnapshot:   parsed.economicSnapshot   || "",
    knowledgeCapsule:   parsed.knowledgeCapsule   || "",
    thinkTankInsight:   parsed.thinkTankInsight   || "",
    thisDateInHistory:  parsed.thisDateInHistory  || "",
    smartFactoids:      parsed.smartFactoids      || "",
    personalMomentum:   parsed.personalMomentum   || "",
    threeQuestions:     parsed.threeQuestions     || "",
    tomorrowWatchlist:  parsed.tomorrowWatchlist  || "",
    ecommerceRadar:     parsed.ecommerceRadar     || "",
    wordCount:          0
  };

  // Rough word count
  var allText = Object.values(brief).filter(function(v){ return typeof v === "string"; }).join(" ");
  brief.wordCount = allText.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

  Logger.log("Brief generated. Word count: ~" + brief.wordCount);
  if (brief.wordCount > 1600) Logger.log("WARN: Brief exceeds 1,500 words.");

  return brief;
}

function getKuwaitDateString() {
  var now = new Date();
  // Google Apps Script supports timezone in Utilities.formatDate
  return Utilities.formatDate(now, "Asia/Kuwait", "EEEE, MMMM d, yyyy");
}

function buildPrompt(sources) {
  var dateStr = getKuwaitDateString();
  var sourcesText = formatSourcesForPrompt(sources);
  var failNote = sources.failedSources.length > 0
    ? "Note: The following sources failed to load: " + sources.failedSources.join(", ") + ". Work with what is available."
    : "";
  var priorities = CONFIG.relevancePriorities.join("\n- ");

  var ec = CONFIG.ecommerce;
  var seasonalCalendar = ec.kuwaitSeasonalCalendar.join("\n- ");
  var consumerProfile  = ec.kuwaitConsumerProfile.join("\n- ");
  var sourcingChannels = ec.sourcingChannels.join(", ");

  return "You are the elite Chief of Staff and personal intelligence briefing writer for Abdulmohsen Al-Shammari, a Kuwaiti professional with a Political Science and Master of Public Administration (MPA) background. He is deeply interested in:\n- " + priorities + "\n\nHe also runs a Kuwait-focused e-commerce business and needs forward-looking product sourcing intelligence every morning.\n\nToday is " + dateStr + " (Asia/Kuwait).\n\n" + failNote + "\n\nBelow are the latest news items fetched from trusted sources. Use them as your primary factual basis. For any item you include, cite the source URL exactly as provided. Do NOT fabricate URLs.\n\n" + sourcesText + "\n\n---\n\nKUWAIT E-COMMERCE CONTEXT (use this to calibrate the Opportunity Radar section):\nMarket: Kuwait\nSourcing channels available: " + sourcingChannels + "\nKuwait seasonal calendar:\n- " + seasonalCalendar + "\nKuwait consumer profile:\n- " + consumerProfile + "\n\n---\n\nGenerate \"Abdulmohsen's Daily Statesman Brief\" as a structured JSON object with EXACTLY these keys. Each value is an HTML string ready to embed in an email (use <p>, <ul>, <li>, <strong>, <em>, <a href=\"...\"> tags). Do NOT use markdown — use HTML only.\n\nCRITICAL: The entire brief must be 1,000–1,500 words total. Be concise. Every sentence earns its place.\n\nTONE: Presidential daily briefing style. Sharp, warm, sourced, analytical. Like a trusted elite executive assistant preparing a brief for a head of state. Never generic. Never newsletter-y.\n\nJSON keys and their required content:\n\n\"greeting\": A unique 2–3 sentence warm, professional, endearing greeting. Address Abdulmohsen by name. Vary the opening daily. Tone: trusted Chief of Staff greeting his principal.\n\n\"executiveSummary\": Maximum 5 bullet points (<ul><li>). Only what matters most globally and for Kuwait today. Format: what happened → why it matters → what to watch.\n\n\"kuwaitCommandCenter\": Maximum 3 items. Cover Kuwait government affairs, public administration, new laws/decrees, digital business regulations, home business licensing, MOCI/Kuwait Business Center, CITRA, oil/energy, economy, or heated public issues. Each item: what changed + why it matters + personal relevance score (★★★ Critical / ★★ Relevant / ★ Worth Knowing). Include \"KUWAIT REGULATORY ALERT 🚨\" label ONLY if there is a new law, decree, licensing change, compliance deadline, or business regulation affecting digital business, e-commerce, home business, SMEs, fintech, data, AI, or online selling. Otherwise include: \"No major Kuwait regulatory alert today.\" Must include source links.\n\n\"oilEnergySnapshot\": Brent crude price, WTI price, OPEC+ developments, Kuwait oil/energy news. One sentence on why it matters for Kuwait. Source links required.\n\n\"worldGeopolitics\": Maximum 3 items (US, China, Russia, EU, Middle East, GCC, or active conflicts — pick most relevant). Each: event + strategic significance + likely next move. Source links required.\n\n\"aiTechWatch\": Maximum 2 items. Only meaningful AI, automation, cybersecurity, digital government, or productivity tech updates. Each must answer: \"Why should Abdulmohsen care?\" Source links required.\n\n\"economicSnapshot\": Maximum 5 bullets. Cover oil, inflation, interest rates, markets, labor, fiscal policy, sovereign wealth funds, or development plans. Source links required.\n\n\"knowledgeCapsule\": Four mini-sections, one sentence each: 1) Political Science concept of the day 2) MPA/Public Administration concept 3) Economics concept 4) Historical lesson — all relevant to current events.\n\n\"thinkTankInsight\": One insight (max 100 words) from Brookings, Chatham House, CSIS, CFR, RAND, Carnegie, IMF, World Bank, OECD, or UN. Must be relevant to today's events. Cite source.\n\n\"thisDateInHistory\": One political, diplomatic, economic, leadership, or statecraft event from this date in history. Max 75 words.\n\n\"smartFactoids\": Exactly 3 one-sentence factoids. Fun but intelligent. Politics, history, economics, science, culture, diplomacy, or leadership.\n\n\"personalMomentum\": 2–3 sentences. Supportive, dignified, warm, confident. Trusted Chief of Staff reminding Abdulmohsen of his trajectory. NOT cheesy. Reference his background (Political Science, MPA, Kuwait public service lens, digital entrepreneurship).\n\n\"threeQuestions\": Three strategic questions: 1) Who gained leverage today? 2) Which institution is under pressure? 3) What should I monitor tomorrow? Each with a 1–2 sentence analytical answer based on today's news.\n\n\"tomorrowWatchlist\": Maximum 3 items — most important things to track in the next 24–48 hours. Each one sentence.\n\n\"ecommerceRadar\": KUWAIT E-COMMERCE OPPORTUNITY RADAR. Maximum 3 product opportunities. These must be forward-looking — trends gaining momentum NOW that Abdulmohsen should source BEFORE they peak in the Kuwait market. Each opportunity must include ALL of the following formatted in HTML:\n- <strong>Trend</strong>: What is gaining traction and why (cultural shift, seasonal trigger, viral moment, global trend hitting Kuwait)\n- <strong>Signal</strong>: What specific data point, event, or behavior pattern indicates this is real and timely (be specific — not vague)\n- <strong>Source Now</strong>: Exactly what product type or SKU to look for — specific enough to search on Alibaba or approach a distributor\n- <strong>Timing Window</strong>: How many weeks ahead is this opportunity and when does it peak in Kuwait\n- <strong>Sourcing Channel</strong>: Where to source it (Alibaba category, regional distributor type, local wholesale)\n- <strong>Kuwait Relevance</strong>: ★★★ Hot / ★★ Promising / ★ Watch\nPrioritize: upcoming Kuwait holidays/seasons, viral product categories on Kuwaiti TikTok/Instagram, Gulf consumer shifts, products that align with Kuwaiti gifting culture, home lifestyle trends, modest fashion, tech accessories, health/wellness, or premium everyday items. Be commercial and specific — this is actionable sourcing intelligence, not general advice.\n\nReturn ONLY valid JSON. No markdown fences. No explanation outside the JSON.";
}
