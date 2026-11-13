import rateLimit from "express-rate-limit";
import type { Request } from "express";
import { env } from "../config/env";
import { sendError } from "../utils/response";

// ─────────────────────────────────────────
// Key generator
// ─────────────────────────────────────────
// Uses the real client IP (trust proxy must be enabled in app.ts).
// Falls back to socket address if header is missing.

function keyGenerator(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown"
  );
}

// ─────────────────────────────────────────
// General rate limiter (all routes)
// ─────────────────────────────────────────
// 500 req / 15 min per IP — generous enough for a classroom scenario
// where many students hit the app simultaneously via the same Wi-Fi.

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,  // default: 15 min
  max:      env.RATE_LIMIT_MAX,        // default: 500
  standardHeaders: "draft-7",          // RateLimit-* headers (RFC 9110)
  legacyHeaders: false,
  keyGenerator,
  handler: (_req, res) => {
    sendError(res, 429, "طلبات كثيرة جداً، حاول مرة أخرى لاحقاً", "TOO_MANY_REQUESTS");
  },
});

// ─────────────────────────────────────────
// Strict limiter for auth endpoints
// ─────────────────────────────────────────
// 20 attempts / 15 min per IP. Only counts *failed* attempts so a
// normal session (login → use app → logout → login) never hits the wall.

export const authLimiter = rateLimit({
  windowMs:              env.RATE_LIMIT_WINDOW_MS, // default: 15 min
  max:                   env.AUTH_RATE_LIMIT_MAX,  // default: 20
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,   // ✅ only failed logins count
  keyGenerator,
  handler: (_req, res) => {
    sendError(
      res,
      429,
      "محاولات تسجيل دخول كثيرة، حاول مرة أخرى بعد 15 دقيقة",
      "AUTH_TOO_MANY_REQUESTS"
    );
  },
});
