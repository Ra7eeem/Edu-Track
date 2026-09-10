import { serverFetch } from "@/shared/lib/api-server"
import { ApiAnonymousMessage, PaginatedResponse } from "@/shared/types/api"

function toArray<T>(raw: unknown): T[] {
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

export async function loadTeacherMessages(): Promise<ApiAnonymousMessage[]> {
  try {
    const raw = await serverFetch<PaginatedResponse<ApiAnonymousMessage> | ApiAnonymousMessage[]>(
      "/api/anonymous/inbox?limit=100"
    )
    return toArray<ApiAnonymousMessage>(raw)
  } catch {
    return []
  }
}