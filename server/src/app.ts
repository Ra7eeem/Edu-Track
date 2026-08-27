import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";

import { env } from "./config/env";
import { connectDB } from "./database/connection";
import { requestLogger } from "./middleware/requestLogger";
import { generalLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import { authRouter } from "./modules/auth/auth.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { teacherRouter } from "./modules/teachers/teacher.routes";
import { groupRouter } from "./modules/groups/group.routes";
import { studentRouter } from "./modules/students/student.routes";
import { notificationRouter } from "./modules/notifications/notification.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

// ─────────────────────────────────────────
// App
// ─────────────────────────────────────────

const app = express();

// ── Security ──────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight OPTIONS globally
app.options("*", cors());

// ── Body parsers ──────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());

// ── Request logging ───────────────────────
app.use(requestLogger);

// ── Rate limiting ─────────────────────────
app.use(generalLimiter);

// ── DB middleware: ensures connection is alive on every request ──
// This is a no-op on local dev (connection is already open via server.ts).
// On Vercel serverless it re-uses the cached connection or reconnects.
app.use((_req, _res, next) => {
  connectDB().then(() => next()).catch(next);
});

// ── Static files (uploaded images) ────────
// On Vercel, file uploads land in /tmp which is ephemeral.
// For production use a cloud bucket (S3, Cloudinary, etc.)
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

// ── API docs (dev only) ───────────────────
if (env.NODE_ENV !== "production") {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ── Health check ──────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      env: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// ── Routes ────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/groups", groupRouter);
app.use("/api/students", studentRouter);
app.use("/api/notifications", notificationRouter);

// ── 404 ───────────────────────────────────
app.use(notFoundHandler);

// ── Error handler (must be last) ──────────
app.use(errorHandler);

export default app;
