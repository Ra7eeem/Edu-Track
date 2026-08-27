import { env } from "./config/env";
import { connectDB, disconnectDB } from "./database/connection";
import { logger } from "./utils/logger";
import app from "./app";

// ─────────────────────────────────────────
// Vercel serverless export
// ─────────────────────────────────────────
// When imported by Vercel's runtime (api/index.ts),
// this file simply re-exports the app.  The DB middleware
// inside app.ts handles the per-request connection.

export default app;

// ─────────────────────────────────────────
// Local development bootstrap
// ─────────────────────────────────────────
// Only runs when executed directly (tsx src/server.ts),
// NOT when imported as a module by Vercel.

if (process.env.VERCEL !== "1" && require.main === module) {
  (async () => {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      logger.info(
        `🚀 EduSync API running on port ${env.PORT} [${env.NODE_ENV}]`
      );
      if (env.NODE_ENV !== "production") {
        logger.info(`📚 API Docs: http://localhost:${env.PORT}/api/docs`);
      }
    });

    // ── Graceful shutdown ──────────────────

    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await disconnectDB();
        logger.info("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled rejection:", reason);
      shutdown("UNHANDLED_REJECTION");
    });

    process.on("uncaughtException", (err) => {
      logger.error("Uncaught exception:", err);
      process.exit(1);
    });
  })();
}
