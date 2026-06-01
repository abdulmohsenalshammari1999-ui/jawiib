import nodemailer from "nodemailer";
import { config } from "./config.js";
import { logger } from "./logger.js";
import type { BriefContent } from "./generator.js";
import { buildEmailHtml, buildEmailText } from "./template.js";

export interface DeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

function getSubject(brief: BriefContent): string {
  return `Daily Statesman Brief — ${brief.date}`;
}

export async function sendBrief(brief: BriefContent): Promise<DeliveryResult> {
  const timestamp = new Date().toISOString();

  if (!config.smtp.user || !config.smtp.pass) {
    const error = "SMTP credentials not configured. Set SMTP_USER and SMTP_PASS (or GMAIL_APP_PASSWORD) env vars.";
    logger.error(error);
    return { success: false, error, timestamp };
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  try {
    await transporter.verify();
  } catch (err) {
    const error = `SMTP connection failed: ${String(err)}`;
    logger.error(error);
    return { success: false, error, timestamp };
  }

  const subject = getSubject(brief);
  const html = buildEmailHtml(brief);
  const text = buildEmailText(brief);

  try {
    const info = await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: `"${config.recipientName}" <${config.recipientEmail}>`,
      subject,
      text,
      html,
    });

    logger.success("Brief delivered successfully", {
      messageId: info.messageId,
      to: config.recipientEmail,
      subject,
      wordCount: brief.wordCount,
    });

    return { success: true, messageId: info.messageId, timestamp };
  } catch (err) {
    const error = `Email send failed: ${String(err)}`;
    logger.error(error);
    return { success: false, error, timestamp };
  }
}
