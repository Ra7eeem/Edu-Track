import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import type { ApiResponse, ApiTeam } from "@/shared/types/api"

async function getAuthHeader() {
  const token = await getNextAuthToken()
  return token?.token ? HEADERS.authorize(token.token) : {}
}

export interface TeamsResponseData {
  teams: ApiTeam[]
  totalTeams: number
}

export async function getClassroomTeamsApi(classroomId: string): Promise<TeamsResponseData> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/teams/classroom/${classroomId}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<TeamsResponseData> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل بيانات الفرق")
  }
  return json.data
}

export async function createTeamApi(dto: {
  name: string
  classroomId: string
  memberIds: string[]
}): Promise<ApiTeam> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/teams`, {
    method: "POST",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    body: JSON.stringify(dto),
  })

  const json: ApiResponse<ApiTeam> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل إنشاء الفريق")
  }
  return json.data
}

export async function updateTeamApi(
  teamId: string,
  dto: { name?: string; memberIds?: string[] }
): Promise<ApiTeam> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/teams/${teamId}`, {
    method: "PUT",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    body: JSON.stringify(dto),
  })

  const json: ApiResponse<ApiTeam> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحديث بيانات الفريق")
  }
  return json.data
}

export async function deleteTeamApi(teamId: string): Promise<{ success: boolean; message: string }> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/teams/${teamId}`, {
    method: "DELETE",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
  })

  const json: ApiResponse<{ success: boolean; message: string }> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل حذف الفريق")
  }
  return json.data
}

export async function adjustTeamPointsApi(
  teamId: string,
  dto: { points: number; reason: string; studentId?: string }
): Promise<{ team: ApiTeam }> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/teams/${teamId}/adjust-points`, {
    method: "PATCH",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    body: JSON.stringify(dto),
  })

  const json: ApiResponse<{ team: ApiTeam }> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تعديل النقاط")
  }
  return json.data
}

export async function resetLeaderboardApi(
  classroomId: string
): Promise<{ success: boolean; message: string }> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/teams/classroom/${classroomId}/reset-scores`, {
    method: "POST",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
  })

  const json: ApiResponse<{ success: boolean; message: string }> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تصفير دورة النقاط")
  }
  return json.data
}
