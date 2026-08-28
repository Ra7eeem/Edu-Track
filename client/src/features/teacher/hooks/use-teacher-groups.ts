"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiGroup, PaginatedResponse } from "@/shared/types/api"
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

export function useTeacherGroups() {
  return useQuery({
    queryKey: ["teacher", "groups"],
    queryFn:  async () => {
      const raw = await clientFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>(
        "/api/teacher/groups?limit=50"
      )
      return extractArray<ApiGroup>(raw)
    },
  })
}

export function useGroupDetails(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn:  () =>
      clientFetch<{ group: ApiGroup; teachers: unknown[]; studentsCount: number }>(
        `/api/groups/${groupId}`
      ),
    enabled: !!groupId,
  })
}
