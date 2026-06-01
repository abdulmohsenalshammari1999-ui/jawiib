// All editable settings for Abdulmohsen's Daily Statesman Brief

export const config = {
  // ─── Identity ────────────────────────────────────────────────
  recipientName: "Abdulmohsen",
  recipientEmail: process.env.RECIPIENT_EMAIL ?? "abdulmohsen.alshammari1999@gmail.com",
  senderName: "The Statesman Brief",
  senderEmail: process.env.SENDER_EMAIL ?? "abdulmohsen.alshammari1999@gmail.com",

  // ─── Scheduling ──────────────────────────────────────────────
  // Cron expression: 10:00 AM Asia/Kuwait (UTC+3 = 07:00 UTC)
  cronExpression: "0 7 * * *",
  timezone: "Asia/Kuwait",

  // ─── Content ─────────────────────────────────────────────────
  maxWordCount: 1500,
  minWordCount: 1000,
  targetReadMinutes: "5–8",

  // Tone keywords fed to the AI
  tone: {
    style: "presidential daily briefing",
    voice: "elite Chief of Staff / trusted executive assistant",
    qualities: ["sharp", "warm", "sourced", "analytical", "dignified", "concise"],
  },

  // Abdulmohsen's relevance priorities — AI uses these to rank information
  relevancePriorities: [
    "Kuwait government affairs and public administration",
    "Kuwait digital business, home business licensing, e-commerce regulations",
    "MOCI, Kuwait Business Center, CITRA updates",
    "Oil state economics and GCC geopolitics",
    "Political Science and MPA academic insights",
    "AI, automation, and productivity technology",
    "Strategic decision-making and leadership",
    "Entrepreneurship in Kuwait",
  ],

  // ─── Sources ─────────────────────────────────────────────────
  sources: {
    rss: [
      // Kuwait official & news
      { name: "KUNA", url: "https://www.kuna.net.kw/rss.aspx?lang=en", category: "kuwait" },
      { name: "Kuwait Times", url: "https://www.kuwaittimes.com/feed/", category: "kuwait" },
      { name: "Arab Times Kuwait", url: "https://www.arabtimesonline.com/feed/", category: "kuwait" },
      // Oil & energy
      { name: "Reuters Energy", url: "https://feeds.reuters.com/reuters/businessNews", category: "energy" },
      { name: "OPEC News", url: "https://www.opec.org/opec_web/en/press_room/rss.htm", category: "energy" },
      // World / geopolitics
      { name: "Reuters Top News", url: "https://feeds.reuters.com/reuters/topNews", category: "world" },
      { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "world" },
      { name: "AP News", url: "https://feeds.apnews.com/rss/apf-topnews", category: "world" },
      // AI & tech
      { name: "MIT Tech Review", url: "https://www.technologyreview.com/feed/", category: "tech" },
      { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "tech" },
      // Economics
      { name: "FT Economics", url: "https://www.ft.com/rss/home/uk", category: "economics" },
      { name: "IMF News", url: "https://www.imf.org/en/News/rss?language=eng", category: "economics" },
    ],
  },

  // ─── Email / SMTP ─────────────────────────────────────────────
  smtp: {
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER ?? process.env.SENDER_EMAIL ?? "",
    pass: process.env.SMTP_PASS ?? process.env.GMAIL_APP_PASSWORD ?? "",
  },

  // ─── AI / Anthropic ──────────────────────────────────────────
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: "claude-opus-4-8",
    maxTokens: 6000,
  },
};

export type Config = typeof config;
