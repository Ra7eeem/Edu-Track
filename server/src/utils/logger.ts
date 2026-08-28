import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// ─────────────────────────────────────────
// Sanitise — never log passwords/tokens
// ─────────────────────────────────────────

const sensitiveKeys = ["password", "passwordHash", "token", "secret"];

function sanitize(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    sanitized[key] = sensitiveKeys.some((k) => key.toLowerCase().includes(k))
      ? "[REDACTED]"
      : sanitize(value);
  }
  return sanitized;
}

// ─────────────────────────────────────────
// Formats
// ─────────────────────────────────────────

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr =
      Object.keys(meta).length > 0
        ? "\n" + JSON.stringify(sanitize(meta), null, 2)
        : "";
    return `${timestamp} [${level}]: ${String(stack ?? message)}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

// ─────────────────────────────────────────
// Transports
// Vercel has a read-only filesystem — NEVER write log files in production.
// All output goes to stdout/stderr which Vercel captures automatically.
// ─────────────────────────────────────────

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

export const logger = winston.createLogger({
  levels: { ...winston.config.npm.levels, http: 5 },
  level: env.LOG_LEVEL,
  format: env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports,
});
