"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiGroup, PaginatedResponse } from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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

export function useTeacherGroups(opts?: { initialData?: ApiGroup[] }) {
  return useQuery({
    queryKey:    ["teacher", "groups"],
    queryFn:     async () => {
      const raw = await clientFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>(
        "/api/teacher/groups?limit=50"
      )
      return extractArray<ApiGroup>(raw)
    },
    staleTime:   5 * 60 * 1000,
    initialData: opts?.initialData,
    retry:       3,
  })
}

export interface GroupDetails {
  group: ApiGroup
  teachers: unknown[]
  studentsCount: number
}

export function useGroupDetails(groupId: string, opts?: { initialData?: GroupDetails }) {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn:  async (): Promise<GroupDetails> => {
      const raw = await clientFetch<Record<string, unknown>>(`/api/groups/${groupId}`)
      if (raw && typeof raw === "object") {
        if ("group" in raw) return raw as unknown as GroupDetails
        const { teachers, membersCount, ...groupFields } = raw as Record<string, unknown>
        return {
          group:         groupFields as unknown as ApiGroup,
          teachers:      (teachers as unknown[]) ?? [],
          studentsCount: (membersCount as number) ?? 0,
        }
      }
      return { group: raw as unknown as ApiGroup, teachers: [], studentsCount: 0 }
    },
    enabled:              !!groupId,
    staleTime:            2 * 60 * 1000,
    initialData:          opts?.initialData,
    retry:                3,
    refetchOnWindowFocus: true,
  })
}

export function useTeacherCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; description?: string; grades?: string[] }) =>
      clientFetch<ApiGroup>("/api/groups", {
        method: "POST",
        data:   body,
      } as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher", "groups"] }),
  })
}
