import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { sendError } from "../utils/response";

// ─────────────────────────────────────────
// General rate limiter (all routes)
// ─────────────────────────────────────────

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "طلبات كثيرة جداً، حاول مرة أخرى لاحقاً", "TOO_MANY_REQUESTS");
  },
});

// ─────────────────────────────────────────
// Strict limiter for auth endpoints
// ─────────────────────────────────────────

export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (_req, res) => {
    sendError(
      res,
      429,
      "محاولات تسجيل دخول كثيرة، حاول مرة أخرى بعد 15 دقيقة",
      "AUTH_TOO_MANY_REQUESTS"
    );
  },
});
