import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";
import { logger } from "./logger.js";
import type { FetchedSources } from "./sources.js";
import { formatSourcesForPrompt } from "./sources.js";

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

export interface BriefContent {
  date: string;
  greeting: string;
  executiveSummary: string;
  kuwaitCommandCenter: string;
  oilEnergySnapshot: string;
  worldGeopolitics: string;
  aiTechWatch: string;
  economicSnapshot: string;
  knowledgeCapsule: string;
  thinkTankInsight: string;
  thisDateInHistory: string;
  smartFactoids: string;
  personalMomentum: string;
  threeQuestions: string;
  tomorrowWatchlist: string;
  wordCount: number;
}

function getKuwaitDate(): string {
  return new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Kuwait",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildPrompt(sources: FetchedSources): string {
  const dateStr = getKuwaitDate();
  const sourcesText = formatSourcesForPrompt(sources);
  const failNote =
    sources.failedSources.length > 0
      ? `Note: The following sources failed to load: ${sources.failedSources.join(", ")}. Work with what is available.`
      : "";

  return `You are the elite Chief of Staff and personal intelligence briefing writer for Abdulmohsen Al-Shammari, a Kuwaiti professional with a Political Science and Master of Public Administration (MPA) background. He is deeply interested in Kuwait government affairs, public administration, oil-state economics, digital business and home business licensing in Kuwait, entrepreneurship, AI, and strategic decision-making.

Today is ${dateStr} (Asia/Kuwait).

${failNote}

Below are the latest news items fetched from trusted sources. Use them as your primary factual basis. For any item you include, you MUST cite the source URL exactly as provided. Do NOT fabricate URLs. If a source URL is missing or "N/A", cite the source name only.

${sourcesText}

---

Generate "Abdulmohsen's Daily Statesman Brief" as a structured JSON object with EXACTLY these keys. Each value is an HTML string ready to embed in an email (use <p>, <ul>, <li>, <strong>, <em>, <a href="..."> tags). Do NOT use markdown — use HTML only.

CRITICAL: The entire brief must be 1,000–1,500 words total. Be concise. Every sentence earns its place.

TONE: Presidential daily briefing style. Sharp, warm, sourced, analytical. Like a trusted elite executive assistant preparing a brief for a head of state. Never generic. Never newsletter-y.

JSON keys and their required content:

"greeting": A unique 2–3 sentence warm, professional, endearing greeting. Address Abdulmohsen by name. Tone: trusted Chief of Staff greeting his principal in the morning. Vary the opening daily. Never repeat within 60 days.

"executiveSummary": Maximum 5 bullet points (<ul><li>). Only what matters most globally and for Kuwait today. Format: what happened → why it matters → what to watch.

"kuwaitCommandCenter": Maximum 3 items. Each as a styled section. Cover Kuwait government affairs, public administration, new laws/decrees, digital business regulations, home business licensing, MOCI/Kuwait Business Center, oil/energy, economy, or heated public issues. Each item must include: what changed, why it matters, and a personal relevance score (★★★ Critical / ★★ Relevant / ★ Worth Knowing). Include "KUWAIT REGULATORY ALERT 🚨" label ONLY if there is a new law, decree, licensing change, compliance deadline, or business regulation affecting digital business, e-commerce, home business, SMEs, fintech, data, AI, or online selling. Otherwise say "No major Kuwait regulatory alert today." Must include source links.

"oilEnergySnapshot": Brent crude price (approximate/recent), WTI price, OPEC+ developments, Kuwait oil/energy news. One sentence on why it matters for Kuwait. Source links required.

"worldGeopolitics": Maximum 3 items (US, China, Russia, EU, Middle East, GCC, or active conflicts — pick most relevant). Each item: event + strategic significance + likely next move. Source links required.

"aiTechWatch": Maximum 2 items. Only meaningful AI, automation, cybersecurity, digital government, or productivity tech updates. Each must answer: "Why should Abdulmohsen care?" Source links required.

"economicSnapshot": Maximum 5 bullets. Cover oil, inflation, interest rates, markets, labor, fiscal policy, sovereign wealth funds, or development plans. Source links required.

"knowledgeCapsule": Four mini-sections, one sentence each:
1. Political Science concept of the day (relevant to current events)
2. MPA/Public Administration concept of the day
3. Economics concept of the day
4. Historical lesson of the day

"thinkTankInsight": One insight (max 100 words) from Brookings, Chatham House, CSIS, CFR, RAND, Carnegie, IMF, World Bank, OECD, UN, or university research. Must be relevant to today's events. Cite source.

"thisDateInHistory": One political, diplomatic, economic, leadership, or statecraft event from this date in history. Max 75 words.

"smartFactoids": Exactly 3 one-sentence factoids. Fun but intelligent. Politics, history, economics, science, culture, diplomacy, or leadership. No trivia padding — each must make the reader think.

"personalMomentum": 2–3 sentences. Supportive, dignified, warm, confident. Sound like a trusted Chief of Staff reminding Abdulmohsen of his trajectory and identity. NOT cheesy or motivational-poster. Reference his background (Political Science, MPA, Kuwait public service lens, digital entrepreneurship).

"threeQuestions": Three strategic questions formatted as:
1. Who gained leverage today?
2. Which institution is under pressure?
3. What should I monitor tomorrow?
Each with a 1–2 sentence analytical answer based on today's news.

"tomorrowWatchlist": Maximum 3 items — the most important things to track in the next 24–48 hours. Each one sentence.

Return ONLY valid JSON. No markdown fences. No explanation outside the JSON.`;
}

export async function generateBrief(
  sources: FetchedSources
): Promise<BriefContent> {
  logger.info("Generating brief with Claude…");

  const prompt = buildPrompt(sources);

  const message = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: config.anthropic.maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();

  // Strip any accidental markdown fences
  const jsonText = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");

  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    logger.error("Failed to parse AI response as JSON", { preview: raw.slice(0, 500) });
    throw new Error("AI response was not valid JSON");
  }

  const content: BriefContent = {
    date: getKuwaitDate(),
    greeting: parsed.greeting ?? "",
    executiveSummary: parsed.executiveSummary ?? "",
    kuwaitCommandCenter: parsed.kuwaitCommandCenter ?? "",
    oilEnergySnapshot: parsed.oilEnergySnapshot ?? "",
    worldGeopolitics: parsed.worldGeopolitics ?? "",
    aiTechWatch: parsed.aiTechWatch ?? "",
    economicSnapshot: parsed.economicSnapshot ?? "",
    knowledgeCapsule: parsed.knowledgeCapsule ?? "",
    thinkTankInsight: parsed.thinkTankInsight ?? "",
    thisDateInHistory: parsed.thisDateInHistory ?? "",
    smartFactoids: parsed.smartFactoids ?? "",
    personalMomentum: parsed.personalMomentum ?? "",
    threeQuestions: parsed.threeQuestions ?? "",
    tomorrowWatchlist: parsed.tomorrowWatchlist ?? "",
    wordCount: 0,
  };

  // Rough word count
  const allText = Object.values(content)
    .filter((v) => typeof v === "string")
    .join(" ")
    .replace(/<[^>]+>/g, " ");
  content.wordCount = allText.split(/\s+/).filter(Boolean).length;

  logger.info(`Brief generated. Word count: ~${content.wordCount}`);

  if (content.wordCount > 1600) {
    logger.warn("Brief exceeds 1,500 words — consider reducing maxTokens or tightening the prompt.");
  }

  return content;
}
