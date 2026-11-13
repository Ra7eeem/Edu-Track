import rateLimit from "express-rate-limit";
import type { Options as RLOptions } from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import { env } from "../config/env";

// ─────────────────────────────────────────
// Redis store (Upstash) — shared across all Vercel instances
// ─────────────────────────────────────────
// Without a shared store every serverless instance has its own counter,
// making rate limiting both ineffective AND randomly unfair.
// If UPSTASH_REDIS_REST_URL is not set we fall back to in-memory
// (fine for local dev, NOT recommended for production).

let redisStore: RLOptions["store"] | undefined;

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  // Dynamic import so the app still boots when the env vars are absent
  import("@upstash/redis")
    .then(({ Redis }) =>
      import("rate-limit-redis").then(({ default: RedisStore }) => {
        const client = new Redis({
          url:   env.UPSTASH_REDIS_REST_URL!,
          token: env.UPSTASH_REDIS_REST_TOKEN!,
        });

        redisStore = new RedisStore({
          // @ts-expect-error — rate-limit-redis sendCommand type mismatch with Upstash client
          sendCommand: (...args: string[]) => client.sendCommand(args),
          prefix: "rl:",
        });
      })
    )
    .catch((err) => {
      console.warn("⚠️  Upstash Redis store failed to initialise — falling back to in-memory:", err);
    });
}

// ─────────────────────────────────────────
// Key generators
// ─────────────────────────────────────────

/** IP-based key — trust proxy must be enabled in app.ts */
function ipKey(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown"
  );
}

/** User-based key — only usable after authenticate() middleware */
function userKey(req: Request): string {
  // req.user is attached by the authenticate middleware
  const user = (req as Request & { user?: { userId: string } }).user;
  return user ? `user:${user.userId}` : ipKey(req);
}

// ─────────────────────────────────────────
// Helper — build a limiter, injecting the shared store when available
// ─────────────────────────────────────────

function makeLimiter(opts: Partial<RLOptions>) {
  return rateLimit({ ...opts, store: redisStore } as RLOptions);
}

// ─────────────────────────────────────────
// 1. Auth limiter — BEFORE authentication
// ─────────────────────────────────────────
// Protects /api/auth/* from brute-force attacks.
// Only failed requests count (skipSuccessfulRequests: true).
// Keyed by IP — the user is not authenticated yet.

export const authLimiter = makeLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,       // 15 min
  max:      env.AUTH_RATE_LIMIT_MAX,        // 20 failed attempts
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: ipKey,
  handler: (_req, res) => {
    sendError(
      res,
      429,
      "محاولات تسجيل دخول كثيرة، حاول مرة أخرى بعد 15 دقيقة",
      "AUTH_TOO_MANY_REQUESTS"
    );
  },
});

// ─────────────────────────────────────────
// 2. IP limiter — applied globally (bot protection)
// ─────────────────────────────────────────
// High ceiling — only meant to block scrapers / DDoS bots.
// Legitimate classrooms on shared Wi-Fi are covered by the user limiter below.

export const generalLimiter = makeLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,       // 15 min
  max:      env.RATE_LIMIT_MAX,             // 5000 req / IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: ipKey,
  handler: (_req, res) => {
    sendError(res, 429, "طلبات كثيرة جداً، حاول مرة أخرى لاحقاً", "TOO_MANY_REQUESTS");
  },
});

// ─────────────────────────────────────────
// 3. User limiter — applied AFTER authenticate() middleware
// ─────────────────────────────────────────
// Keyed by user ID → completely fair regardless of shared IP.
// 800 req / 15 min ≈ 53 req/min ≈ comfortable for heavy SPA navigation.

export const userLimiter = makeLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,       // 15 min
  max:      env.USER_RATE_LIMIT_MAX,        // 800 req / user
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: userKey,
  handler: (_req, res) => {
    sendError(res, 429, "طلبات كثيرة جداً، حاول مرة أخرى لاحقاً", "TOO_MANY_REQUESTS");
  },
});

// ─────────────────────────────────────────
// Convenience: combine both limiters for protected routes
// ─────────────────────────────────────────
// Use after authenticate(): app.use(authenticate, perUserLimiter)

export function perUserLimiter(req: Request, res: Response, next: NextFunction): void {
  userLimiter(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}
