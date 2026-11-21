import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import type {
  ApiResponse,
  ApiStudentTask,
  ApiStudentTasksResponse,
  ApiStudentTeamInfo,
} from "@/shared/types/api"

async function getAuthHeader() {
  const token = await getNextAuthToken()
  return token?.token ? HEADERS.authorize(token.token) : {}
}

export async function getStudentTasksApi(): Promise<ApiStudentTasksResponse> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/student/tasks`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<ApiStudentTasksResponse> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل المهام")
  }
  return json.data
}

export async function createStudentTaskApi(dto: {
  title: string
  dueDate?: string
}): Promise<ApiStudentTask> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/student/tasks`, {
    method: "POST",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    body: JSON.stringify(dto),
  })

  const json: ApiResponse<ApiStudentTask> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل إضافة المهمة")
  }
  return json.data
}

export async function toggleStudentTaskApi(taskId: string): Promise<ApiStudentTask> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/student/tasks/${taskId}/toggle`, {
    method: "PATCH",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
  })

  const json: ApiResponse<ApiStudentTask> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحديث حالة المهمة")
  }
  return json.data
}

export async function deleteStudentTaskApi(taskId: string): Promise<{ success: boolean; message: string }> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/student/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
  })

  const json: ApiResponse<{ success: boolean; message: string }> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل حذف المهمة")
  }
  return json.data
}

export async function getStudentTeamApi(classroomId: string): Promise<ApiStudentTeamInfo | null> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/teams/classroom/${classroomId}/my-team`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<ApiStudentTeamInfo | null> = await res.json()
  if (!res.ok || !json.success) {
    return null
  }
  return json.data
}
