"use client"

import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiGroup,
  ApiPost,
  ApiRankingEntry,
  ApiUser,
  PaginatedResponse,
} from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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

export function useAdminGroupDetail(groupId: string) {
  return useQuery({
    queryKey: ["admin", "group", groupId],
    queryFn:  async () => {
      const raw = await clientFetch<unknown>(`/api/admin/groups/${groupId}`)
      if (raw && typeof raw === "object" && "group" in (raw as object)) {
        return (raw as { group: ApiGroup }).group
      }
      return raw as ApiGroup
    },
    enabled:   !!groupId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAdminGroupStudents(groupId: string) {
  return useQuery({
    queryKey: ["admin", "group", groupId, "students"],
    queryFn:  async () => {
      // Correct endpoint: only members of this specific group
      const raw = await clientFetch<PaginatedResponse<ApiUser> | ApiUser[]>(
        `/api/admin/groups/${groupId}/students?limit=200`
      )
      return toArray<ApiUser>(raw)
    },
    enabled:   !!groupId,
    staleTime: 30 * 1000,
  })
}

export function useRemoveStudentFromGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, studentId }: { groupId: string; studentId: string }) =>
      clientFetch<void>(`/api/admin/groups/${groupId}/students/${studentId}`, {
        method: "DELETE",
      } as never),
    onSuccess: (_data, { groupId }) => {
      qc.invalidateQueries({ queryKey: ["admin", "group", groupId, "students"], refetchType: "active" })
      qc.invalidateQueries({ queryKey: ["admin", "group", groupId, "ranking"],  exact: false, refetchType: "active" })
    },
  })
}

export function useAdminGroupTeachers(groupId: string) {
  return useQuery({
    queryKey: ["admin", "group", groupId, "teachers"],
    queryFn:  async () => {
      const raw = await clientFetch<unknown>(`/api/admin/groups/${groupId}`)
      if (raw && typeof raw === "object" && "teachers" in (raw as object)) {
        return (raw as { teachers: ApiUser[] }).teachers ?? []
      }
      return [] as ApiUser[]
    },
    enabled:   !!groupId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAdminGroupPosts(groupId: string) {
  return useQuery({
    queryKey: ["admin", "group", groupId, "posts"],
    queryFn:  async () => {
      const raw = await clientFetch<PaginatedResponse<ApiPost> | ApiPost[]>(
        `/api/groups/${groupId}/posts?limit=50`
      )
      return toArray<ApiPost>(raw)
    },
    enabled:   !!groupId,
    staleTime: 60 * 1000,
  })
}

export function useAdminGroupRanking(groupId: string, month?: number, year?: number) {
  const now = new Date()
  const m   = month ?? now.getMonth() + 1
  const y   = year  ?? now.getFullYear()

  return useQuery({
    queryKey: ["admin", "group", groupId, "ranking", m, y],
    queryFn:  async () => {
      const raw = await clientFetch<unknown>(
        `/api/groups/${groupId}/ranking?month=${m}&year=${y}`
      )
      if (raw && typeof raw === "object" && "ranking" in (raw as object)) {
        return (raw as { ranking: ApiRankingEntry[] }).ranking
      }
      if (Array.isArray(raw)) return raw as ApiRankingEntry[]
      return [] as ApiRankingEntry[]
    },
    enabled:   !!groupId,
    staleTime: 2 * 60 * 1000,
  })
}
