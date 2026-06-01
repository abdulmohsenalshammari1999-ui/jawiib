// ─────────────────────────────────────────────────────────────────
// Sources.gs — RSS feed fetching via UrlFetchApp
// Each source fails independently; the pipeline always continues.
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch all configured RSS sources and return categorised news items.
 * @returns {{ items: Object, failedSources: string[], fetchedAt: string }}
 */
function fetchAllSources() {
  Logger.log("Fetching all news sources…");

  var byCategory = { kuwait: [], energy: [], world: [], tech: [], economics: [] };
  var failedSources = [];
  var cutoff = Date.now() - 48 * 60 * 60 * 1000; // last 48 hours

  CONFIG.rssSources.forEach(function(src) {
    try {
      var items = fetchRssFeed(src.name, src.url, cutoff);
      if (byCategory[src.category]) {
        byCategory[src.category] = byCategory[src.category].concat(items);
      }
    } catch (e) {
      Logger.log("WARN: Source failed: " + src.name + " — " + e.message);
      failedSources.push(src.name);
    }
  });

  Logger.log("Source fetch complete. Kuwait:" + byCategory.kuwait.length +
    " Energy:" + byCategory.energy.length +
    " World:" + byCategory.world.length +
    " Tech:" + byCategory.tech.length +
    " Economics:" + byCategory.economics.length +
    " Failed:" + failedSources.length);

  return {
    items: byCategory,
    failedSources: failedSources,
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Fetch and parse a single RSS feed URL.
 * @param {string} sourceName
 * @param {string} url
 * @param {number} cutoff  — timestamp ms; skip older items
 * @returns {Array}
 */
function fetchRssFeed(sourceName, url, cutoff) {
  var response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { "User-Agent": "DailyStatesmanBrief/1.0" },
    followRedirects: true,
    validateHttpsCertificates: false
  });

  if (response.getResponseCode() !== 200) {
    throw new Error("HTTP " + response.getResponseCode());
  }

  var xml = response.getContentText();
  var doc = XmlService.parse(xml);
  var root = doc.getRootElement();
  var ns = root.getNamespace();

  // Support both RSS <item> and Atom <entry>
  var isAtom = root.getName() === "feed";
  var itemTag = isAtom ? "entry" : "item";

  var channelEl = isAtom ? root : root.getChild("channel", ns);
  if (!channelEl) return [];

  var itemEls = channelEl.getChildren(itemTag, ns);
  var results = [];

  for (var i = 0; i < Math.min(itemEls.length, 8); i++) {
    var el = itemEls[i];

    var title   = getElText(el, isAtom ? "title"   : "title",   ns);
    var link    = isAtom
                  ? getAtomLink(el)
                  : getElText(el, "link", ns);
    var pubDate = getElText(el, isAtom ? "published" : "pubDate", ns);
    var summary = getElText(el, isAtom ? "summary" : "description", ns)
                    .replace(/<[^>]+>/g, "")
                    .substring(0, 400);

    // Skip items older than cutoff
    if (pubDate) {
      var d = new Date(pubDate);
      if (!isNaN(d.getTime()) && d.getTime() < cutoff) continue;
    }

    results.push({
      title:   title.trim() || "(no title)",
      summary: summary.trim(),
      link:    link.trim(),
      pubDate: pubDate,
      source:  sourceName
    });
  }

  return results;
}

function getElText(el, tag, ns) {
  var child = el.getChild(tag, ns) || el.getChild(tag);
  return child ? child.getText() : "";
}

function getAtomLink(el) {
  var links = el.getChildren("link");
  for (var i = 0; i < links.length; i++) {
    var rel = links[i].getAttribute("rel");
    if (!rel || rel.getValue() === "alternate") {
      var href = links[i].getAttribute("href");
      if (href) return href.getValue();
    }
  }
  return "";
}

/**
 * Format all fetched sources into a plain-text block for the AI prompt.
 */
function formatSourcesForPrompt(sources) {
  var sections = [
    formatCategory(sources.items.kuwait,    "Kuwait News"),
    formatCategory(sources.items.energy,    "Oil & Energy News"),
    formatCategory(sources.items.world,     "World & Geopolitics"),
    formatCategory(sources.items.tech,      "AI & Technology"),
    formatCategory(sources.items.economics, "Economics & Markets")
  ];
  return sections.join("\n\n");
}

function formatCategory(items, label) {
  if (!items || !items.length) return "## " + label + "\n(No items fetched)\n";
  var lines = items.slice(0, 6).map(function(n) {
    return "- [" + n.source + "] " + n.title + "\n" +
           "  " + n.summary + "\n" +
           "  URL: " + (n.link || "N/A") + "\n" +
           "  Date: " + n.pubDate;
  });
  return "## " + label + "\n" + lines.join("\n");
}
