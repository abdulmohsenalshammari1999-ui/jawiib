// Test command: sends a sample briefing immediately
// Usage: cd briefing && npm test
import { runBrief } from "./run-brief.js";
import { logger } from "./logger.js";

logger.info("send-now: firing brief immediately (test mode)");
runBrief().catch((err) => {
  logger.error("send-now failed", { error: String(err) });
  process.exit(1);
});
