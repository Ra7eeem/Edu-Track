import { Response } from "express";
import { PaginationMeta } from "../types";

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): Response {
  const body: Record<string, unknown> = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  statusCode = 200
): Response {
  return res.status(statusCode).json({ success: true, data, pagination });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  code: string,
  errors?: unknown
): Response {
  const body: Record<string, unknown> = { success: false, message, code };
  if (errors !== undefined) body.errors = errors;
  return res.status(statusCode).json(body);
}
