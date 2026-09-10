import { PaginatedResponse } from "@/shared/types/api"

/**
 * Normalize backend responses that may be a plain array or a paginated wrapper.
 */
export function toArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  if (typeof raw === "object" && raw !== null) {
    const r = raw as Record<string, unknown>
    if (Array.isArray(r.data))  return r.data  as T[]
    if (Array.isArray(r.docs))  return r.docs  as T[]
    if (Array.isArray(r.items)) return r.items as T[]
  }
  return []
}

export function toPaginatedArray<T>(
  raw: PaginatedResponse<T> | T[] | null | undefined
): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.data)) return raw.data
  return []
}
