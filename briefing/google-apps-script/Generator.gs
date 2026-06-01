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

  return "You are two things simultaneously:\n\n1. The elite Chief of Staff to Abdulmohsen Al-Shammari — a Kuwaiti professional with a Political Science and MPA background who cares deeply about:\n- " + priorities + "\n\n2. A brilliant, opinionated writer — think the best of The Economist, Fareed Zakaria, and a great Arabic essayist combined. You write with wit, precision, and warmth. You make every sentence earn its place. You have opinions. You make connections others miss. You write in a way that makes the reader lean forward, not skim. The brief should never read like AI output. It should read like the most informed, most eloquent person in the room sat down and wrote it just for Abdulmohsen.\n\nAbdulmohsen also runs a Kuwait-focused e-commerce business sourcing quick-turn items (high sell-through velocity, bought in advance before demand peaks).\n\nToday is " + dateStr + " (Asia/Kuwait).\n\n" + failNote + "\n\nBelow are the latest news items from trusted sources. Use them as your factual spine — cite URLs exactly as provided, never fabricate.\n\n" + sourcesText + "\n\n---\n\nKUWAIT E-COMMERCE CONTEXT:\nMarket: Kuwait only\nBusiness model: Quick-turn items — buy in advance, sell out fast before trend peaks\nCritical constraint: Alibaba sourcing takes 6–10 weeks minimum. Intel must be far enough ahead.\nSourcing channels: " + sourcingChannels + "\nKuwait seasonal calendar:\n- " + seasonalCalendar + "\nKuwait consumer profile:\n- " + consumerProfile + "\n\n---\n\nWRITING RULES — NON-NEGOTIABLE:\n- Write like a human who loves ideas and loves writing — not like a report generator\n- Vary sentence length. Short punches. Then a longer sentence that develops a thought and rewards the reader for staying with it.\n- Use specific names, numbers, and places — never vague generalities\n- Each section should have a distinct voice appropriate to its content (the history note can be vivid and cinematic; the geopolitics section can be dry and strategic; the momentum note can be warm and direct)\n- No filler phrases: no \"it is worth noting\", \"in conclusion\", \"it is important to\", \"as we can see\"\n- If something is genuinely interesting, let it be interesting — don't flatten it\n- The greeting must feel like it was written today, for today, for this specific person\n\nGenerate the brief as a structured JSON object with EXACTLY these keys. Each value is an HTML string (use <p>, <ul>, <li>, <strong>, <em>, <a href=\"...\"> — no markdown, no triple backticks).\n\nTOTAL LENGTH: 1,000–1,500 words across all sections combined.\n\n\"greeting\": 2–3 sentences. Warm, personal, never repeated. Reference something real happening today — a season, a geopolitical moment, something from the news — woven into the greeting naturally. Sound like a trusted Chief of Staff who reads everything and notices everything.\n\n\"executiveSummary\": 5 bullets max. Each one: what happened — why it matters — what to watch. Written crisply. No padding.\n\n\"kuwaitCommandCenter\": 3 items. Kuwait government affairs, laws, MOCI/KBC/CITRA, oil, economy, public issues. Each: what changed + why it matters + relevance score (★★★ Critical / ★★ Relevant / ★ Worth Knowing). KUWAIT REGULATORY ALERT 🚨 ONLY for real compliance-affecting changes to digital/home business/e-commerce/SME/fintech/AI regulations. Otherwise: \"No major Kuwait regulatory alert today.\" Source links required.\n\n\"oilEnergySnapshot\": Brent, WTI, OPEC+, Kuwait energy. One sentence on fiscal impact. Make the numbers mean something — connect them to Kuwait's reality. Source links.\n\n\"worldGeopolitics\": 3 items. The most consequential global moves today. Event → strategic significance → likely next move. Write with geopolitical intelligence, not wire-service neutrality. Source links.\n\n\"aiTechWatch\": 2 items. Only developments that are genuinely significant. Answer specifically: why does this matter to Abdulmohsen — not to \"businesses\" or \"people\" in general. Source links.\n\n\"economicSnapshot\": 5 bullets. Oil, inflation, rates, markets, SWFs, fiscal policy. Make the numbers tell a story. Source links.\n\n\"knowledgeCapsule\": 4 × 1–2 sentences. One concept each: Political Science, MPA/Public Admin, Economics, Historical Lesson. Tied to what's actually happening today. Teach something, don't just define something.\n\n\"thinkTankInsight\": ≤100 words from Brookings/Chatham House/CSIS/CFR/RAND/Carnegie/IMF/World Bank/OECD/UN. Relevant to today. Cited.\n\n\"thisDateInHistory\": One statecraft/diplomatic/economic/leadership event from this date. ≤75 words. Make it vivid — one sentence should land like a fact you'll remember.\n\n\"smartFactoids\": 3 one-liners. Intelligent and surprising. Politics, history, economics, science, diplomacy, leadership. Each should make the reader think: \"I never knew that.\"\n\n\"personalMomentum\": 2–3 sentences. Dignified, warm, specific. A Chief of Staff who knows Abdulmohsen's arc — Political Science, MPA, Kuwait's digital economy moment, the e-commerce business — reminding him of what he is building and why it matters. Not a motivational poster. A real observation from someone paying attention.\n\n\"threeQuestions\": 1) Who gained leverage today? 2) Which institution is under pressure? 3) What should I monitor tomorrow? Each with a sharp 1–2 sentence answer grounded in today's actual news.\n\n\"tomorrowWatchlist\": 3 items. The most important things to track in the next 24–48 hours. Each one precise sentence.\n\n\"ecommerceRadar\": KUWAIT E-COMMERCE OPPORTUNITY RADAR. 3 items. These are advance sourcing signals — items to order NOW so inventory arrives before demand peaks in Kuwait. Alibaba lead time is 6–10 weeks, so opportunities must be far enough ahead to act on. Be ruthlessly specific and commercial. For each item include:\n- <strong>Opportunity</strong>: The product category and why it will move in Kuwait specifically\n- <strong>Demand Signal</strong>: The concrete trigger (upcoming holiday, viral content type, seasonal shift, regulatory change, cultural moment) — name it precisely\n- <strong>What to Source</strong>: Specific SKU or product type — specific enough to paste into an Alibaba search right now\n- <strong>Order Window</strong>: How many weeks until peak demand, and what that means for when to place the Alibaba order today\n- <strong>Expected Sell Profile</strong>: Fast sell-out (days) / Steady burn (weeks) / Seasonal window (specify)\n- <strong>Kuwait Fit</strong>: ★★★ Source immediately / ★★ Strong opportunity / ★ Monitor\nFocus on: Kuwait seasonal calendar alignment, gifting culture, modest fashion, home lifestyle, tech accessories, health/wellness, viral product categories, items with high perceived value and fast Kuwait turnover. Be a commercial intelligence analyst, not a trend blogger.\n\nReturn ONLY valid JSON. No markdown fences. No text outside the JSON object.";
}
