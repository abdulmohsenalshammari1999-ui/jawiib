// Core pipeline: fetch sources → generate brief → send email
import { fetchAllSources } from "./sources.js";
import { generateBrief } from "./generator.js";
import { sendBrief } from "./mailer.js";
import { logger } from "./logger.js";

export async function runBrief(): Promise<void> {
  logger.info("═══ Starting Daily Statesman Brief pipeline ═══");

  if (!process.env.ANTHROPIC_API_KEY) {
    logger.error("ANTHROPIC_API_KEY is not set. Cannot generate brief.");
    process.exit(1);
  }

  // 1. Fetch news sources (errors are isolated per-source)
  const sources = await fetchAllSources();

  // 2. Generate brief via Claude
  let brief;
  try {
    brief = await generateBrief(sources);
  } catch (err) {
    logger.error("Brief generation failed", { error: String(err) });
    process.exit(1);
  }

  // 3. Send email
  const result = await sendBrief(brief);

  if (result.success) {
    logger.info("═══ Pipeline complete — brief delivered ═══", {
      messageId: result.messageId,
      wordCount: brief.wordCount,
    });
  } else {
    logger.error("═══ Pipeline failed — brief not delivered ═══", {
      error: result.error,
    });
    process.exit(1);
  }
}
