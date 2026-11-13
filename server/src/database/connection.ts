import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// ─────────────────────────────────────────
// Global connection cache for serverless
// ─────────────────────────────────────────
// On Vercel each serverless function invocation may share the same
// Node.js process (warm lambda). Caching the connection avoids
// opening a new TCP socket on every request.

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.__mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.__mongooseCache) {
  global.__mongooseCache = cached;
}

// ─────────────────────────────────────────
// Connect
// ─────────────────────────────────────────

export async function connectDB(): Promise<typeof mongoose> {
  // Return cached connection immediately (warm lambda)
  if (cached.conn) {
    return cached.conn;
  }

  // Start a new connection if none is pending
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      // ── Serverless-safe settings ──────────────────────────────────────
      bufferCommands: false,        // fail fast — never queue ops while disconnected
      maxPoolSize: 5,               // serverless: each instance owns its pool, keep it small
      minPoolSize: 1,               // keep 1 connection alive on a warm lambda
      maxIdleTimeMS: 10_000,        // close idle connections after 10 s (Vercel idles fast)
      serverSelectionTimeoutMS: 5_000,  // give up quickly — surfaces real errors faster
      socketTimeoutMS: 30_000,      // slightly under Vercel's 30 s function timeout
      connectTimeoutMS: 10_000,     // TCP handshake timeout
      heartbeatFrequencyMS: 10_000, // detect stale connections sooner (default: 10 s)
      // ── Atlas-friendly ───────────────────────────────────────────────
      retryWrites: true,
      w: "majority",               // write concern: confirmed by majority of replica set
    };

    logger.info("Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(env.MONGODB_URI, opts)
      .then((mg) => {
        logger.info(`✅ MongoDB connected: ${mg.connection.host}`);
        return mg;
      })
      .catch((err) => {
        cached.promise = null; // allow retry on next invocation
        logger.error("❌ MongoDB connection failed:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ─────────────────────────────────────────
// Lifecycle events
// ─────────────────────────────────────────

mongoose.connection.on("disconnected", () => {
  cached.conn = null;
  cached.promise = null;
  logger.warn("⚠️  MongoDB disconnected — cache cleared");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB error:", err);
});

// ─────────────────────────────────────────
// Graceful shutdown (local dev only)
// ─────────────────────────────────────────

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  cached.conn = null;
  cached.promise = null;
  logger.info("MongoDB connection closed");
}
