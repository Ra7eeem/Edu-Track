"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiUser, PaginatedResponse } from "@/shared/types/api"
import { useQuery } from "@tanstack/react-query"

function extractArray<T>(raw: unknown): T[] {
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

export type GroupStudent = Pick<ApiUser, "_id" | "id" | "name" | "email" | "avatarUrl" | "grade" | "phone">

export function useGroupStudents(
  groupId: string,
  search = "",
  opts?: { initialData?: GroupStudent[] }
) {
  return useQuery({
    queryKey: ["teacher", "groups", groupId, "students", search],
    queryFn:  async () => {
      const raw = await clientFetch<PaginatedResponse<GroupStudent> | GroupStudent[]>(
        `/api/teacher/groups/${groupId}/students?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`
      )
      return extractArray<GroupStudent>(raw)
    },
    enabled:     !!groupId,
    staleTime:   30 * 1000,
    initialData: search || !opts?.initialData?.length ? undefined : opts?.initialData,
  })
}
