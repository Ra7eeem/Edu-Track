import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";

import { env } from "./config/env";
import { connectDB } from "./database/connection";
import { requestLogger } from "./middleware/requestLogger";
import { generalLimiter } from "./middleware/rateLimiter";
import { requestTimeout } from "./middleware/timeout";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import { authRouter } from "./modules/auth/auth.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { teacherRouter } from "./modules/teachers/teacher.routes";
import { groupRouter } from "./modules/groups/group.routes";
import { studentRouter } from "./modules/students/student.routes";
import { notificationRouter } from "./modules/notifications/notification.routes";
import { anonymousRouter } from "./modules/anonymous/anonymous.routes";
import { assignmentRouter } from "./modules/assignments/assignment.routes";
import { teamRouter } from "./modules/teams/team.routes";
import { studentTaskRouter } from "./modules/student-tasks/student-task.routes";
import { classTaskRouter } from "./modules/class-tasks/class-task.routes";
import { dailyQuestionRouter } from "./modules/daily-questions/daily-question.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

const app = express();

// ── Trust proxy ───────────────────────────
// Required on Vercel: all traffic passes through Vercel's load balancer.
// Without this, every user shares the same proxy IP and rate limiting breaks.
// "1" means trust the first hop (X-Forwarded-For header from Vercel).
app.set("trust proxy", 1);

// ── Security ──────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// ── Body parsers ──────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());

// ── Request logging ───────────────────────
app.use(requestLogger);

// ── Request timeout ───────────────────────
// Sends a clean 503 at 25 s — 5 s before Vercel's hard 30 s cutoff.
app.use(requestTimeout());

// ── Rate limiting ─────────────────────────
app.use(generalLimiter);

// ─────────────────────────────────────────
// Routes that do NOT need a DB connection
// (must be registered BEFORE the DB middleware)
// ─────────────────────────────────────────

// Basic health — no DB needed
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "healthy", env: env.NODE_ENV, timestamp: new Date().toISOString() },
  });
});

// Diagnostic — shows env var presence + DB connectivity
// ONLY available in non-production. Remove or protect before going live.
if (env.NODE_ENV !== "production") {
  app.get("/api/debug", async (_req, res) => {
    const checks: Record<string, string> = {
      NODE_ENV: env.NODE_ENV,
      MONGODB_URI: env.MONGODB_URI
        ? `set (${env.MONGODB_URI.substring(0, 20)}...)`
        : "❌ NOT SET",
      JWT_SECRET: env.JWT_SECRET ? "set" : "❌ NOT SET",
      CORS_ORIGIN: env.CORS_ORIGIN,
      UPLOAD_DIR: env.UPLOAD_DIR,
    };

    let dbStatus = "not tested";
    try {
      await connectDB();
      dbStatus = "✅ connected";
    } catch (e: unknown) {
      dbStatus = `❌ ${e instanceof Error ? e.message : String(e)}`;
    }

    res.json({ success: true, data: { checks, db: dbStatus } });
  });
}

// API docs — dev only
if (env.NODE_ENV !== "production") {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ─────────────────────────────────────────
// DB middleware — all routes below require a live connection
// ─────────────────────────────────────────

app.use((_req, _res, next) => {
  connectDB().then(() => next()).catch(next);
});

// ── Static uploads ────────────────────────
app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

// ── API routes ────────────────────────────
// /api/auth — public, authLimiter is applied inside auth.routes.ts
// All other routes: authenticate → userLimiter are applied inside each router
// so req.user.userId is available when userLimiter runs (per-user counting).
app.use("/api/auth",          authRouter);
app.use("/api/admin",         adminRouter);
app.use("/api/teacher",       teacherRouter);
app.use("/api/groups",        groupRouter);
app.use("/api/students",      studentRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/anonymous",     anonymousRouter);
app.use("/api/assignments",   assignmentRouter);
app.use("/api/teams",         teamRouter);
app.use("/api/v1/teams",      teamRouter);
app.use("/api/student/tasks", studentTaskRouter);
app.use("/api/v1/student/tasks", studentTaskRouter);
app.use("/api/class-tasks",   classTaskRouter);
app.use("/api/v1/class-tasks", classTaskRouter);
app.use("/api/daily-questions", dailyQuestionRouter);
app.use("/api/v1/daily-questions", dailyQuestionRouter);

// ── 404 ───────────────────────────────────
app.use(notFoundHandler);

// ── Error handler ─────────────────────────
app.use(errorHandler);

export default app;
