import cron from "node-cron";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { runBrief } from "./run-brief.js";

logger.info("Daily Statesman Brief scheduler starting…", {
  schedule: config.cronExpression,
  timezone: config.timezone,
  recipient: config.recipientEmail,
});

// 10:00 AM Asia/Kuwait = 07:00 UTC (UTC+3)
// config.cronExpression is "0 7 * * *" by default
const task = cron.schedule(
  config.cronExpression,
  async () => {
    logger.info("Cron fired — running brief pipeline");
    try {
      await runBrief();
    } catch (err) {
      logger.error("Unhandled error in brief pipeline", { error: String(err) });
    }
  },
  {
    timezone: "UTC",
    scheduled: true,
  }
);

logger.info(`Scheduler active. Next run at 07:00 UTC (10:00 AM Kuwait).`);

// Keep process alive
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — stopping scheduler");
  task.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received — stopping scheduler");
  task.stop();
  process.exit(0);
});
