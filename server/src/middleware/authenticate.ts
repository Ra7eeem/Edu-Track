import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { JwtPayload, Role } from "../types";

// ─────────────────────────────────────────
// Verify JWT and attach user to req.user
// ─────────────────────────────────────────

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("لم يتم تقديم رمز المصادقة"));
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized("انتهت صلاحية رمز المصادقة", "TOKEN_EXPIRED"));
    }
    return next(ApiError.unauthorized("رمز المصادقة غير صالح", "INVALID_TOKEN"));
  }
}

// ─────────────────────────────────────────
// Require specific roles (RBAC)
// ─────────────────────────────────────────

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}
