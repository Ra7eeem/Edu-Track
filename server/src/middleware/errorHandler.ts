import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";

// ─────────────────────────────────────────
// Centralised error handler middleware
// ─────────────────────────────────────────

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // ── Zod validation errors ──────────────
  if (err instanceof ZodError) {
    const errors = err.flatten().fieldErrors;
    sendError(res, 400, "بيانات غير صالحة", "VALIDATION_ERROR", errors);
    return;
  }

  // ── Our own ApiError ──────────────────
  if (err instanceof ApiError) {
    if (!err.isOperational) {
      logger.error("Non-operational ApiError:", err);
    }
    sendError(res, err.statusCode, err.message, err.code);
    return;
  }

  // ── Mongoose validation error ─────────
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    sendError(res, 400, messages[0] ?? "بيانات غير صالحة", "VALIDATION_ERROR");
    return;
  }

  // ── Mongoose cast error (bad ObjectId) ─
  if (err instanceof mongoose.Error.CastError) {
    sendError(res, 400, "معرّف غير صالح", "INVALID_ID");
    return;
  }

  // ── MongoDB duplicate key ─────────────
  if (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: number }).code === 11000
  ) {
    const field = Object.keys(
      (err as { keyValue?: Record<string, unknown> }).keyValue ?? {}
    )[0];
    sendError(
      res,
      409,
      `القيمة المدخلة لـ "${field}" مستخدمة مسبقاً`,
      "DUPLICATE_KEY"
    );
    return;
  }

  // ── JWT errors (should be caught upstream, safety net) ───
  if (err instanceof Error && err.name === "JsonWebTokenError") {
    sendError(res, 401, "رمز المصادقة غير صالح", "INVALID_TOKEN");
    return;
  }

  // ── Unknown errors ────────────────────
  logger.error("Unhandled error:", err);
  sendError(res, 500, "خطأ داخلي في الخادم", "INTERNAL_ERROR");
}

// ─────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    404,
    `المسار ${req.originalUrl} غير موجود`,
    "ROUTE_NOT_FOUND"
  );
}
