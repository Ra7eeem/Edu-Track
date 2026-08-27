import { Request } from "express";
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../config/constants";
import { PaginationMeta } from "../types";

// ─────────────────────────────────────────
// Parse pagination from query string
// ─────────────────────────────────────────

export function parsePagination(req: Request): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(String(req.query.page ?? DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(req.query.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// ─────────────────────────────────────────
// Build pagination meta
// ─────────────────────────────────────────

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
