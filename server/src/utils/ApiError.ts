// ─────────────────────────────────────────
// Centralised API Error class
// ─────────────────────────────────────────

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  // ─── Factory helpers ───────────────────

  static badRequest(message: string, code = "BAD_REQUEST"): ApiError {
    return new ApiError(400, message, code);
  }

  static unauthorized(
    message = "غير مصرح بالوصول",
    code = "UNAUTHORIZED"
  ): ApiError {
    return new ApiError(401, message, code);
  }

  static forbidden(
    message = "لا يمكنك تنفيذ هذا الإجراء",
    code = "FORBIDDEN"
  ): ApiError {
    return new ApiError(403, message, code);
  }

  static notFound(message = "المورد غير موجود", code = "NOT_FOUND"): ApiError {
    return new ApiError(404, message, code);
  }

  static conflict(message: string, code = "CONFLICT"): ApiError {
    return new ApiError(409, message, code);
  }

  static tooMany(
    message = "طلبات كثيرة، حاول لاحقاً",
    code = "TOO_MANY_REQUESTS"
  ): ApiError {
    return new ApiError(429, message, code);
  }

  static internal(
    message = "خطأ داخلي في الخادم",
    code = "INTERNAL_ERROR"
  ): ApiError {
    return new ApiError(500, message, code, false);
  }
}
