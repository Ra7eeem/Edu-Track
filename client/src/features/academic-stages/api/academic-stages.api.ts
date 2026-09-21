/**
 * Academic Stages feature — API layer.
 *
 * Follows the project's data-fetching pattern:
 *   Component → React Query hook → feature API → shared clientFetch → Backend
 *
 * The backend's /api/admin/students endpoint already accepts a ?grade= filter,
 * so we reuse it directly. For stages with multiple grades we fire parallel
 * requests and merge the results — this avoids inventing a new endpoint.
 */
import { clientFetch } from "@/shared/lib/api-client"
import { ApiUser, Grade, PaginatedResponse } from "@/shared/types/api"

// ─── Helper ───────────────────────────────────────────────────────────────────
function toArray<T>(raw: PaginatedResponse<T> | T[] | unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data))  return r.data  as T[]
  if (Array.isArray(r.docs))  return r.docs  as T[]
  if (Array.isArray(r.items)) return r.items as T[]
  return []
}

/**
 * Fetches all students across the given grades in parallel, then merges.
 * Uses the existing /api/admin/students?grade=GRADE_X endpoint.
 */
export async function fetchStudentsByGrades(grades: Grade[]): Promise<ApiUser[]> {
  if (grades.length === 0) return []

  const requests = grades.map((grade) =>
    clientFetch<PaginatedResponse<ApiUser> | ApiUser[]>(
      `/api/admin/students?grade=${grade}&limit=200&acceptedOnly=true`
    )
  )

  const results = await Promise.allSettled(requests)

  const merged: ApiUser[] = []
  for (const result of results) {
    if (result.status === "fulfilled") {
      merged.push(...toArray<ApiUser>(result.value))
    }
  }

  return merged
}
