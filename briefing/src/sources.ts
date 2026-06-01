import Parser from "rss-parser";
import { config } from "./config.js";
import { logger } from "./logger.js";

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "DailyStatesmanBrief/1.0" },
});

export interface NewsItem {
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
}

export interface FetchedSources {
  kuwait: NewsItem[];
  energy: NewsItem[];
  world: NewsItem[];
  tech: NewsItem[];
  economics: NewsItem[];
  fetchedAt: string;
  failedSources: string[];
}

async function fetchFeed(
  name: string,
  url: string,
  category: string
): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    const cutoff = Date.now() - 48 * 60 * 60 * 1000; // last 48h

    return (feed.items ?? [])
      .filter((item) => {
        if (!item.pubDate) return true;
        return new Date(item.pubDate).getTime() > cutoff;
      })
      .slice(0, 8)
      .map((item) => ({
        title: item.title?.trim() ?? "(no title)",
        summary: (item.contentSnippet ?? item.content ?? item.summary ?? "")
          .replace(/<[^>]+>/g, "")
          .trim()
          .slice(0, 400),
        link: item.link ?? "",
        pubDate: item.pubDate ?? "",
        source: name,
        category,
      }));
  } catch (err) {
    logger.warn(`Source fetch failed: ${name}`, { url, error: String(err) });
    return [];
  }
}

export async function fetchAllSources(): Promise<FetchedSources> {
  logger.info("Fetching all news sources…");

  const results = await Promise.allSettled(
    config.sources.rss.map((src) => fetchFeed(src.name, src.url, src.category))
  );

  const byCategory: Record<string, NewsItem[]> = {
    kuwait: [],
    energy: [],
    world: [],
    tech: [],
    economics: [],
  };

  const failedSources: string[] = [];

  results.forEach((result, i) => {
    const src = config.sources.rss[i];
    if (result.status === "fulfilled") {
      byCategory[src.category] = [
        ...(byCategory[src.category] ?? []),
        ...result.value,
      ];
    } else {
      failedSources.push(src.name);
    }
  });

  logger.info("Source fetch complete", {
    kuwait: byCategory.kuwait.length,
    energy: byCategory.energy.length,
    world: byCategory.world.length,
    tech: byCategory.tech.length,
    economics: byCategory.economics.length,
    failed: failedSources.length,
  });

  return {
    kuwait: byCategory.kuwait,
    energy: byCategory.energy,
    world: byCategory.world,
    tech: byCategory.tech,
    economics: byCategory.economics,
    fetchedAt: new Date().toISOString(),
    failedSources,
  };
}

export function formatSourcesForPrompt(sources: FetchedSources): string {
  function formatCategory(items: NewsItem[], label: string): string {
    if (!items.length) return `## ${label}\n(No items fetched)\n`;
    return (
      `## ${label}\n` +
      items
        .slice(0, 6)
        .map(
          (n) =>
            `- [${n.source}] ${n.title}\n  ${n.summary}\n  URL: ${n.link || "N/A"}\n  Date: ${n.pubDate}`
        )
        .join("\n")
    );
  }

  return [
    formatCategory(sources.kuwait, "Kuwait News"),
    formatCategory(sources.energy, "Oil & Energy News"),
    formatCategory(sources.world, "World & Geopolitics"),
    formatCategory(sources.tech, "AI & Technology"),
    formatCategory(sources.economics, "Economics & Markets"),
  ].join("\n\n");
}
