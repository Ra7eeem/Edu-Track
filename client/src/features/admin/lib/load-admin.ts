import { serverFetch } from "@/shared/lib/api-server"
import {
  ApiGroup,
  ApiPost,
  ApiRankingEntry,
  ApiUser,
  PaginatedResponse,
} from "@/shared/types/api"

export interface AdminGroupDetail {
  group:          ApiGroup
  teachers:       ApiUser[]
  studentsCount:  number
}

export interface AdminGroupRanking {
  month:    number
  year:     number
  groupId:  string
  ranking:  ApiRankingEntry[]
}

function toArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === "object" && raw !== null) {
    const r = raw as Record<string, unknown>
    if (Array.isArray(r.data))  return r.data  as T[]
    if (Array.isArray(r.docs))  return r.docs  as T[]
    if (Array.isArray(r.items)) return r.items as T[]
  }
  return []
}

export async function loadTeachers(search = "", page = 1): Promise<ApiUser[]> {
  try {
    const raw = await serverFetch<PaginatedResponse<ApiUser> | ApiUser[]>(
      `/api/admin/teachers?search=${encodeURIComponent(search)}&page=${page}&limit=20`
    )
    return toArray<ApiUser>(raw)
  } catch {
    return []
  }
}

export async function loadGroups(search = "", page = 1): Promise<ApiGroup[]> {
  try {
    const raw = await serverFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>(
      `/api/admin/groups?search=${encodeURIComponent(search)}&page=${page}&limit=20`
    )
    return toArray<ApiGroup>(raw)
  } catch {
    return []
  }
}

export async function loadGroupDetail(id: string): Promise<{
  group:       ApiGroup | null
  teachers:    ApiUser[]
  students:    ApiUser[]
  posts:       ApiPost[]
  ranking:     ApiRankingEntry[]
}> {
  const [detailRes, studentsRes, postsRes, rankingRes] = await Promise.allSettled([
    serverFetch<AdminGroupDetail>(`/api/admin/groups/${id}`),
    serverFetch<PaginatedResponse<ApiUser> | ApiUser[]>(`/api/admin/groups/${id}/students?limit=200`),
    serverFetch<PaginatedResponse<ApiPost> | ApiPost[]>(`/api/groups/${id}/posts?limit=50`),
    serverFetch<AdminGroupRanking>(`/api/groups/${id}/ranking`),
  ])

  return {
    group:    detailRes.status === "fulfilled" ? detailRes.value.group : null,
    teachers: detailRes.status === "fulfilled" ? (detailRes.value.teachers ?? []) : [],
    students: studentsRes.status === "fulfilled" ? toArray<ApiUser>(studentsRes.value) : [],
    posts:    postsRes.status === "fulfilled" ? toArray<ApiPost>(postsRes.value) : [],
    ranking:  rankingRes.status === "fulfilled" ? (rankingRes.value.ranking ?? []) : [],
  }
}