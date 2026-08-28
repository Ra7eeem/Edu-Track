import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";

// ─────────────────────────────────────────
// Centralised error handler
// ─────────────────────────────────────────

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // ── Zod validation ─────────────────────
  if (err instanceof ZodError) {
    sendError(res, 400, "بيانات غير صالحة", "VALIDATION_ERROR", err.flatten().fieldErrors);
    return;
  }

  // ── ApiError ───────────────────────────
  if (err instanceof ApiError) {
    if (!err.isOperational) logger.error("Non-operational ApiError:", err);
    sendError(res, err.statusCode, err.message, err.code);
    return;
  }

  // ── Mongoose validation ────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const msg = Object.values(err.errors).map((e) => e.message)[0] ?? "بيانات غير صالحة";
    sendError(res, 400, msg, "VALIDATION_ERROR");
    return;
  }

  // ── Mongoose cast (bad ObjectId) ───────
  if (err instanceof mongoose.Error.CastError) {
    sendError(res, 400, "معرّف غير صالح", "INVALID_ID");
    return;
  }

  // ── MongoDB duplicate key ──────────────
  if (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: number }).code === 11000
  ) {
    const field = Object.keys(
      (err as { keyValue?: Record<string, unknown> }).keyValue ?? {}
    )[0];
    sendError(res, 409, `القيمة المدخلة لـ "${field}" مستخدمة مسبقاً`, "DUPLICATE_KEY");
    return;
  }

  // ── JWT ────────────────────────────────
  if (err instanceof Error && err.name === "JsonWebTokenError") {
    sendError(res, 401, "رمز المصادقة غير صالح", "INVALID_TOKEN");
    return;
  }

  // ── Unknown / unexpected ───────────────
  logger.error(`Unhandled error [${req.method} ${req.path}]:`, err);

  // In non-production expose the real message so you can diagnose on Vercel
  const isDev = process.env.NODE_ENV !== "production";
  const message = isDev && err instanceof Error
    ? err.message
    : "خطأ داخلي في الخادم";
  const detail = isDev && err instanceof Error ? err.stack : undefined;

  res.status(500).json({
    success: false,
    message,
    code: "INTERNAL_ERROR",
    ...(detail ? { detail } : {}),
  });
}

// ─────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 404, `المسار ${req.originalUrl} غير موجود`, "ROUTE_NOT_FOUND");
}
