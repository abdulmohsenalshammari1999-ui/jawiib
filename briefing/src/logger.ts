import { appendFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const logDir = join(__dirname, "..", "logs");

try {
  mkdirSync(logDir, { recursive: true });
} catch {}

function timestamp(): string {
  return new Date().toISOString();
}

function writeLog(level: string, message: string, data?: unknown): void {
  const line = `[${timestamp()}] [${level}] ${message}${data ? " " + JSON.stringify(data) : ""}\n`;
  try {
    appendFileSync(join(logDir, "briefing.log"), line);
  } catch {}
  if (level === "ERROR") {
    console.error(line.trimEnd());
  } else {
    console.log(line.trimEnd());
  }
}

export const logger = {
  info: (msg: string, data?: unknown) => writeLog("INFO", msg, data),
  warn: (msg: string, data?: unknown) => writeLog("WARN", msg, data),
  error: (msg: string, data?: unknown) => writeLog("ERROR", msg, data),
  success: (msg: string, data?: unknown) => writeLog("SUCCESS", msg, data),
};
