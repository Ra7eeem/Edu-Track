import morgan from "morgan";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// ─────────────────────────────────────────
// HTTP request logger using Morgan + Winston
// ─────────────────────────────────────────

const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Skip logging in test environment
const skip = () => env.NODE_ENV === "test";

export const requestLogger = morgan(
  env.NODE_ENV === "production" ? "combined" : "dev",
  { stream, skip }
);
