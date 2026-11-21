/**
 * Student API Service
 * Follows Rose-App architecture: pure, strongly-typed API functions using native fetch directly.
 * Zero wrapper functions. Each function writes fetch explicitly with BASE_API_URL and HEADERS.
 */
import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import type {
  ApiAnonymousMessage,
  ApiAssignment,
  ApiComment,
  ApiExamSubmission,
  ApiGroup,
  ApiNotification,
  ApiPost,
  ApiRankingEntry,
  ApiResponse,
  ApiUser,
  PaginatedResponse,
} from "@/shared/types/api"
import type {
  StudentAttendanceRecord,
  StudentDashboardData,
  StudentRankEntry,
} from "../types/student"

/** Helper to get auth headers with current token */
async function getAuthHeader() {
  const token = await getNextAuthToken()
  return token?.token ? HEADERS.authorize(token.token) : {}
}

/**
 * 1. Single-request student dashboard
 * User-scoped: returns student profile, groups, unread count, posts, and ranking in 1 request.
 */
export async function getStudentDashboardApi(): Promise<StudentDashboardData> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/students/me/dashboard`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<StudentDashboardData> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل لوحة تحكم الطالب")
  }
  return json.data
}

/**
 * 2. Student profile data
 */
export async function getStudentProfileApi(): Promise<ApiUser> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/students/me`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<ApiUser> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل الملف الشخصي")
  }
  return json.data
}

/**
 * 3. Student enrolled groups
 */
export async function getStudentGroupsApi(
  limit = 20
): Promise<PaginatedResponse<ApiGroup> | ApiGroup[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/students/me/groups?limit=${limit}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<PaginatedResponse<ApiGroup> | ApiGroup[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل مجموعات الطالب")
  }
  return json.data
}

/**
 * 4. Student attendance in a group
 */
export async function getStudentAttendanceApi(
  groupId: string
): Promise<StudentAttendanceRecord[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/students/me/groups/${groupId}/attendance`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<StudentAttendanceRecord[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل سجل الحضور")
  }
  return json.data ?? []
}

/**
 * 5. Student monthly score history
 */
export async function getStudentScoresApi(): Promise<unknown[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/students/me/scores`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<unknown[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل درجات الطالب")
  }
  return json.data ?? []
}

/**
 * 6. Student personal rank in a group
 */
export async function getStudentRankApi(
  groupId: string,
  month: number,
  year: number
): Promise<StudentRankEntry> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/groups/${groupId}/ranking/students/me?month=${month}&year=${year}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<StudentRankEntry> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل الترتيب الشخصي")
  }
  return json.data
}

/**
 * 7. Group general ranking board
 */
export async function getGroupRankingApi(
  groupId: string,
  month: number,
  year: number
): Promise<ApiRankingEntry[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/groups/${groupId}/ranking?month=${month}&year=${year}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<ApiRankingEntry[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل ترتيب المجموعة")
  }
  const rawData: any = json.data
  if (Array.isArray(rawData)) return rawData
  if (rawData && Array.isArray(rawData.ranking)) return rawData.ranking
  return []
}

/**
 * 8. Group assignments (homeworks and exams)
 */
export async function getGroupAssignmentsApi(
  groupId: string,
  limit = 50
): Promise<ApiAssignment[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/assignments/group/${groupId}?limit=${limit}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      next: { tags: [`student-assignments-${groupId}`] },
    }
  )

  const json: ApiResponse<ApiAssignment[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل الواجبات والامتحانات")
  }
  return json.data ?? []
}

/**
 * 9. Assignment / Exam details by ID
 */
export async function getAssignmentByIdApi(id: string): Promise<ApiAssignment> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/assignments/${id}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<ApiAssignment> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل تفاصيل الواجب")
  }
  return json.data
}

/**
 * 10. Student submission for an exam
 */
export async function getAssignmentSubmissionApi(
  id: string
): Promise<ApiExamSubmission | null> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/assignments/${id}/my-submission`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  if (res.status === 404) return null

  const json: ApiResponse<ApiExamSubmission> = await res.json()
  if (!res.ok || !json.success) {
    return null
  }
  return json.data ?? null
}

/**
 * 11. Teachers belonging to a group
 */
export async function getGroupTeachersApi(groupId: string): Promise<ApiUser[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/groups/${groupId}/teachers`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<ApiUser[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل مدرسي المجموعة")
  }
  return json.data ?? []
}

/**
 * 12. Student anonymous messages
 */
export async function getStudentAnonymousMessagesApi(
  limit = 50
): Promise<PaginatedResponse<ApiAnonymousMessage>> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/anonymous/me?limit=${limit}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<PaginatedResponse<ApiAnonymousMessage>> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل الرسائل المجهولة")
  }
  return json.data
}

/**
 * 13. Group posts feed
 */
export async function getGroupPostsApi(
  groupId: string,
  limit = 50
): Promise<PaginatedResponse<ApiPost> | ApiPost[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/groups/${groupId}/posts?limit=${limit}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<PaginatedResponse<ApiPost> | ApiPost[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل منشورات المجموعة")
  }
  return json.data
}

/**
 * 14. Comments for a post
 */
export async function getPostCommentsApi(
  groupId: string,
  postId: string,
  limit = 50
): Promise<PaginatedResponse<ApiComment> | ApiComment[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/groups/${groupId}/posts/${postId}/comments?limit=${limit}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<PaginatedResponse<ApiComment> | ApiComment[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل التعليقات")
  }
  return json.data
}

/**
 * 15. Comment replies
 */
export async function getCommentRepliesApi(
  groupId: string,
  postId: string,
  commentId: string,
  limit = 50
): Promise<PaginatedResponse<ApiComment> | { data: ApiComment[] }> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/groups/${groupId}/posts/${postId}/comments/${commentId}/replies?limit=${limit}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<PaginatedResponse<ApiComment> | { data: ApiComment[] }> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل الردود")
  }
  return json.data
}

/**
 * 16. Student notifications list
 */
export async function getNotificationsApi(
  limit = 50
): Promise<PaginatedResponse<ApiNotification>> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/notifications?limit=${limit}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: any = await res.json()
  if (!res.ok || !json.success) {
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } }
  }
  return {
    data: Array.isArray(json.data) ? json.data : [],
    pagination: json.pagination || { page: 1, limit, total: 0, totalPages: 0 },
    unreadCount: json.unreadCount,
  }
}

