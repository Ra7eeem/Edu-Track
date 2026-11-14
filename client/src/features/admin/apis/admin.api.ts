/**
 * Admin API Service
 * Follows Rose-App architecture: pure, strongly-typed API functions using native fetch directly.
 * Zero wrapper functions. Each function writes fetch explicitly with BASE_API_URL and HEADERS.
 */
import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import type {
  ApiGroup,
  ApiPost,
  ApiRankingEntry,
  ApiResponse,
  ApiUser,
  PaginatedResponse,
} from "@/shared/types/api"
import type {
  AdminGroupDetail,
  AdminGroupRanking,
  AdminStudentProfileData,
  DashboardFull,
} from "../types/admin"

async function getAuthHeader() {
  const token = await getNextAuthToken()
  return token?.token ? HEADERS.authorize(token.token) : {}
}

/**
 * 1. Single-request admin dashboard
 */
export async function getAdminDashboardApi(): Promise<DashboardFull> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/admin/dashboard-full`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<DashboardFull> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل بيانات لوحة الإدارة")
  }
  return json.data
}

/**
 * 2. Teachers list for admin
 */
export async function getAdminTeachersApi(
  search = "",
  page = 1,
  limit = 20
): Promise<PaginatedResponse<ApiUser> | ApiUser[]> {
  const authHeader = await getAuthHeader()
  const query = new URLSearchParams()
  if (search) query.set("search", search)
  query.set("page", String(page))
  query.set("limit", String(limit))

  const res = await fetch(`${BASE_API_URL}/api/admin/teachers?${query.toString()}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<PaginatedResponse<ApiUser> | ApiUser[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل قائمة المدرسين")
  }
  return json.data
}

/**
 * 3. Groups list for admin
 */
export async function getAdminGroupsApi(
  search = "",
  page = 1,
  limit = 20
): Promise<PaginatedResponse<ApiGroup> | ApiGroup[]> {
  const authHeader = await getAuthHeader()
  const query = new URLSearchParams()
  if (search) query.set("search", search)
  query.set("page", String(page))
  query.set("limit", String(limit))

  const res = await fetch(`${BASE_API_URL}/api/admin/groups?${query.toString()}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<PaginatedResponse<ApiGroup> | ApiGroup[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل قائمة المجموعات")
  }
  return json.data
}

/**
 * 4. Group detail for admin
 */
export async function getAdminGroupDetailApi(
  id: string
): Promise<AdminGroupDetail> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/admin/groups/${id}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<AdminGroupDetail> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل تفاصيل المجموعة")
  }
  return json.data
}

/**
 * 5. Group students for admin
 */
export async function getAdminGroupStudentsApi(
  id: string,
  limit = 100
): Promise<PaginatedResponse<ApiUser> | ApiUser[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/admin/groups/${id}/students?limit=${limit}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<PaginatedResponse<ApiUser> | ApiUser[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل طلاب المجموعة")
  }
  return json.data
}

/**
 * 6. Admin profile
 */
export async function getAdminProfileApi(): Promise<ApiUser> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/admin/profile`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<ApiUser> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل الملف الشخصي للإدارة")
  }
  return json.data
}

/**
 * 7. Student profile for admin
 */
export async function getAdminStudentProfileApi(
  studentId: string
): Promise<AdminStudentProfileData> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/admin/students/${studentId}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<AdminStudentProfileData> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل ملف الطالب")
  }
  return json.data
}

