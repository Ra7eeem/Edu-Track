import {
  getAdminGroupDetailApi,
  getAdminGroupStudentsApi,
  getAdminGroupsApi,
  getAdminTeachersApi,
} from "@/features/admin/apis/admin.api"
import { getGroupPostsApi, getGroupRankingApi } from "@/features/student/apis/student.api"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { ApiGroup, ApiPost, ApiRankingEntry, ApiUser } from "@/shared/types/api"

export async function loadTeachers(search = "", page = 1): Promise<ApiUser[]> {
  try {
    const raw = await getAdminTeachersApi(search, page, 20)
    return toPaginatedArray(raw)
  } catch {
    return []
  }
}

export async function loadGroups(search = "", page = 1): Promise<ApiGroup[]> {
  try {
    const raw = await getAdminGroupsApi(search, page, 20)
    return toPaginatedArray(raw)
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
    getAdminGroupDetailApi(id),
    getAdminGroupStudentsApi(id, 100),
    getGroupPostsApi(id, 50),
    getGroupRankingApi(id, new Date().getMonth() + 1, new Date().getFullYear()),
  ])

  return {
    group:    detailRes.status === "fulfilled" ? detailRes.value.group : null,
    teachers: detailRes.status === "fulfilled" ? (detailRes.value.teachers ?? []) : [],
    students: studentsRes.status === "fulfilled" ? toPaginatedArray(studentsRes.value) : [],
    posts:    postsRes.status === "fulfilled" ? toPaginatedArray(postsRes.value) : [],
    ranking:  rankingRes.status === "fulfilled" ? rankingRes.value : [],
  }
}
