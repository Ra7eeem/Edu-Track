/**
 * Teacher API Service
 * Follows Rose-App architecture: pure, strongly-typed API functions using native fetch directly.
 * Zero wrapper functions. Each function explicitly uses BASE_API_URL and HEADERS.
 */
import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import type {
  ApiAnonymousMessage,
  ApiAssignment,
  ApiExamSubmission,
  ApiGroup,
  ApiGroupMembership,
  ApiJoinRequest,
  ApiNotification,
  ApiPost,
  ApiResponse,
  ApiStudentNote,
  ApiUser,
  AttendanceRegister,
  PaginatedResponse,
} from "@/shared/types/api"
import type {
  GroupDetails,
  GroupStudent,
  StudentProfileData,
  TeacherDashboardData,
} from "../types/teacher"

async function getAuthHeader() {
  const token = await getNextAuthToken()
  return token?.token ? HEADERS.authorize(token.token) : {}
}

/**
 * 1. Single-request teacher dashboard
 */
export async function getTeacherDashboardApi(): Promise<TeacherDashboardData> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/teacher/dashboard`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<TeacherDashboardData> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل بيانات لوحة التحكم للمعلم")
  }
  return json.data
}

/**
 * 2. Teacher groups
 */
export async function getTeacherGroupsApi(
  limit = 50
): Promise<PaginatedResponse<ApiGroup> | ApiGroup[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/teacher/groups?limit=${limit}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<PaginatedResponse<ApiGroup> | ApiGroup[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل مجموعات المعلم")
  }
  return json.data
}

/**
 * 3. Group details by ID
 */
export async function getTeacherGroupByIdApi(
  groupId: string
): Promise<GroupDetails | ApiGroup> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/groups/${groupId}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json = await res.json()
  if (!res.ok || (json.success === false)) {
    throw new Error(json.message || "فشل تحميل تفاصيل المجموعة")
  }
  return json.data ?? json
}

/**
 * 4. Students belonging to a group
 */
export async function getGroupStudentsApi(
  groupId: string,
  limit = 100
): Promise<PaginatedResponse<GroupStudent> | GroupStudent[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/groups/${groupId}/students?limit=${limit}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<PaginatedResponse<GroupStudent> | GroupStudent[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل طلاب المجموعة")
  }
  return json.data
}

/**
 * 5. Group attendance register for a specific month/year
 */
export async function getGroupAttendanceRegisterApi(
  groupId: string,
  month: number,
  year: number
): Promise<AttendanceRegister> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/teacher/groups/${groupId}/attendance/register?month=${month}&year=${year}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<AttendanceRegister> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل كشف الحضور")
  }
  return json.data
}

/**
 * 6. Group attendance records
 */
export async function getGroupAttendanceApi(
  groupId: string,
  date?: string
): Promise<ApiGroupMembership[] | unknown> {
  const authHeader = await getAuthHeader()
  const query = date ? `?date=${encodeURIComponent(date)}` : ""
  const res = await fetch(
    `${BASE_API_URL}/api/groups/${groupId}/attendance${query}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json = await res.json()
  if (!res.ok || json.success === false) {
    throw new Error(json.message || "فشل تحميل سجل الحضور")
  }
  return json.data ?? json
}

/**
 * 7. Group posts
 */
export async function getGroupPostsForTeacherApi(
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
 * 8. Assignments in a group
 */
export async function getTeacherAssignmentsApi(
  groupId: string,
  limit = 50
): Promise<PaginatedResponse<ApiAssignment> | ApiAssignment[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/assignments/group/${groupId}?limit=${limit}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<PaginatedResponse<ApiAssignment> | ApiAssignment[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل الواجبات")
  }
  return json.data
}

/**
 * 9. Single assignment details
 */
export async function getTeacherAssignmentByIdApi(
  id: string
): Promise<ApiAssignment> {
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
    throw new Error(json.message || "فشل تحميل الواجب")
  }
  return json.data
}

/**
 * 10. Submissions for an assignment
 */
export async function getTeacherAssignmentSubmissionsApi(
  id: string
): Promise<ApiExamSubmission[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/assignments/${id}/submissions`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json = await res.json()
  if (!res.ok || json.success === false) {
    throw new Error(json.message || "فشل تحميل التسليمات")
  }
  if (Array.isArray(json)) return json
  if (json.data && Array.isArray(json.data)) return json.data
  return []
}

/**
 * 11. Join requests for teacher's groups
 */
export async function getTeacherJoinRequestsApi(
  limit = 50
): Promise<PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/join-requests?limit=${limit}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل طلبات الانضمام")
  }
  return json.data
}

/**
 * 12. Anonymous messages received by teacher
 */
export async function getTeacherMessagesApi(
  limit = 50
): Promise<PaginatedResponse<ApiAnonymousMessage> | ApiAnonymousMessage[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/anonymous/teacher?limit=${limit}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<PaginatedResponse<ApiAnonymousMessage> | ApiAnonymousMessage[]> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل الرسائل")
  }
  return json.data
}

/**
 * 13. Notifications for teacher
 */
export async function getTeacherNotificationsApi(
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

  const json: ApiResponse<PaginatedResponse<ApiNotification>> = await res.json()
  if (!res.ok || !json.success) {
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } }
  }
  return json.data
}

/**
 * 14. Teacher profile
 */
export async function getTeacherProfileApi(): Promise<ApiUser> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/teacher/profile`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<ApiUser> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل الملف الشخصي للمعلم")
  }
  return json.data
}

/**
 * 15. Student profile viewed by teacher
 */
export async function getStudentProfileForTeacherApi(
  groupId: string,
  studentId: string
): Promise<StudentProfileData> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/teacher/groups/${groupId}/students/${studentId}/profile`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<StudentProfileData> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل ملف الطالب")
  }
  return json.data
}

/**
 * 16. Student notes
 */
export async function getStudentNotesApi(
  groupId: string,
  studentId: string
): Promise<ApiStudentNote[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/teacher/groups/${groupId}/students/${studentId}/notes`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<ApiStudentNote[]> = await res.json()
  if (!res.ok || !json.success) {
    return []
  }
  return json.data ?? []
}

