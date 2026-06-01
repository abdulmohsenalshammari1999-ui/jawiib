// ─────────────────────────────────────────────────────────────────
// Config.gs — All editable settings for the Daily Statesman Brief
// Edit these values directly, or set them via Setup.gs > setProperties()
// ─────────────────────────────────────────────────────────────────

var CONFIG = {
  recipientName: "Abdulmohsen",
  recipientEmail: "abdulmohsen.alshammari1999@gmail.com",
  senderName: "The Statesman Brief",

  // Send time: 10:00 AM Asia/Kuwait = 07:00 UTC
  // Controlled via the time-based trigger created in Setup.gs
  sendHourUTC: 7,
  timezone: "Asia/Kuwait",

  maxWordCount: 1500,
  minWordCount: 1000,

  tone: {
    style: "presidential daily briefing",
    voice: "elite Chief of Staff / trusted executive assistant",
    qualities: ["sharp", "warm", "sourced", "analytical", "dignified", "concise"]
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

  // E-Commerce Opportunity Radar — Kuwait market context
  ecommerce: {
    market: "Kuwait",
    targetAudience: "Kuwaiti consumers",
    sourcingChannels: ["Alibaba", "regional distributors", "local wholesale", "GCC suppliers"],
    // Kuwait seasonal calendar — AI uses this to flag timing windows
    kuwaitSeasonalCalendar: [
      "Ramadan & Eid Al-Fitr — gifting, home decor, modest fashion, food items surge",
      "Eid Al-Adha — premium gifting, home entertaining, travel accessories",
      "Hala February — shopping festival, promotions, lifestyle products",
      "National Day / Liberation Day (Feb 25–26) — patriotic merchandise, gatherings",
      "Back to School (Aug–Sep) — stationery, tech accessories, bags",
      "Summer (Jun–Aug) — travel accessories, outdoor, cooling products",
      "Winter (Nov–Feb) — fashion, home warmth, indoor lifestyle",
      "Kuwait Shopping Festival (if active) — electronics, fashion, home"
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

  // RSS sources — add/remove as needed
  rssSources: [
    // Kuwait
    { name: "KUNA",          url: "https://www.kuna.net.kw/rss.aspx?lang=en",      category: "kuwait" },
    { name: "Kuwait Times",  url: "https://www.kuwaittimes.com/feed/",              category: "kuwait" },
    { name: "Arab Times",    url: "https://www.arabtimesonline.com/feed/",          category: "kuwait" },
    // Oil & Energy
    { name: "Reuters Biz",   url: "https://feeds.reuters.com/reuters/businessNews", category: "energy" },
    // World
    { name: "Reuters Top",   url: "https://feeds.reuters.com/reuters/topNews",      category: "world" },
    { name: "BBC World",     url: "https://feeds.bbci.co.uk/news/world/rss.xml",    category: "world" },
    { name: "AP News",       url: "https://feeds.apnews.com/rss/apf-topnews",       category: "world" },
    // AI & Tech
    { name: "MIT Tech",      url: "https://www.technologyreview.com/feed/",         category: "tech" },
    { name: "The Verge",     url: "https://www.theverge.com/rss/index.xml",         category: "tech" },
    // Economics
    { name: "IMF News",      url: "https://www.imf.org/en/News/rss?language=eng",   category: "economics" }
  ],

  // Claude model — use latest capable model
  anthropicModel: "claude-opus-4-8",
  anthropicMaxTokens: 7000
};

/**
 * Get the Anthropic API key from Script Properties.
 * Set it once via Setup.gs > setProperties() or manually in
 * Script Editor → Project Settings → Script Properties.
 */
function getAnthropicKey() {
  var key = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY not set. Run Setup.gs > setProperties() first.");
  return key;
}
