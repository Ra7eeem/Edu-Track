"use client"

import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiGroup,
  ApiGroupMembership,
  ApiPost,
  ApiRankingEntry,
  ApiUser,
  PaginatedResponse,
} from "@/shared/types/api"
import { useQuery } from "@tanstack/react-query"

function toArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  if (typeof raw === "object" && raw !== null) {
    // { data: [...] }  or  { docs: [...] }
    const r = raw as Record<string, unknown>
    if (Array.isArray(r.data))  return r.data  as T[]
    if (Array.isArray(r.docs))  return r.docs  as T[]
    if (Array.isArray(r.items)) return r.items as T[]
  }
  return []
}

// ── Group detail ──────────────────────────────────────────────────────────────
export function useAdminGroupDetail(groupId: string) {
  return useQuery({
    queryKey: ["admin", "group", groupId],
    queryFn:  async () => {
      const raw = await clientFetch<unknown>(`/api/admin/groups/${groupId}`)
      // Server may return { group: {...}, teachers: [], studentsCount }
      if (raw && typeof raw === "object" && "group" in (raw as object)) {
        return (raw as { group: ApiGroup }).group
      }
      return raw as ApiGroup
    },
    enabled: !!groupId,
  })
}

// ── Students in group ─────────────────────────────────────────────────────────
export function useAdminGroupStudents(groupId: string) {
  return useQuery({
    queryKey: ["admin", "group", groupId, "students"],
    queryFn:  async () => {
      // Correct endpoint: GET /api/admin/students?groupId=xxx
      const raw = await clientFetch<PaginatedResponse<ApiGroupMembership> | ApiGroupMembership[]>(
        `/api/admin/students?groupId=${groupId}&limit=200`
      )
      return toArray<ApiGroupMembership>(raw)
    },
    enabled: !!groupId,
  })
}

// ── Teachers of group ─────────────────────────────────────────────────────────
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
    enabled: !!groupId,
  })
}

// ── Posts in group ────────────────────────────────────────────────────────────
export function useAdminGroupPosts(groupId: string) {
  return useQuery({
    queryKey: ["admin", "group", groupId, "posts"],
    queryFn:  async () => {
      const raw = await clientFetch<PaginatedResponse<ApiPost> | ApiPost[]>(
        `/api/groups/${groupId}/posts?limit=50`
      )
      return toArray<ApiPost>(raw)
    },
    enabled: !!groupId,
  })
}

// ── Ranking (all members, all months available) ───────────────────────────────
export function useAdminGroupRanking(
  groupId:  string,
  month?:   number,
  year?:    number
) {
  const now = new Date()
  const m   = month ?? now.getMonth() + 1
  const y   = year  ?? now.getFullYear()

  return useQuery({
    queryKey: ["admin", "group", groupId, "ranking", m, y],
    queryFn:  async () => {
      const raw = await clientFetch<unknown>(
        `/api/groups/${groupId}/ranking?month=${m}&year=${y}`
      )
      // Server shape: { month, year, groupId, ranking: [...] }
      if (raw && typeof raw === "object" && "ranking" in (raw as object)) {
        return (raw as { ranking: ApiRankingEntry[] }).ranking
      }
      // Plain array
      if (Array.isArray(raw)) return raw as ApiRankingEntry[]
      return [] as ApiRankingEntry[]
    },
    enabled: !!groupId,
  })
}
