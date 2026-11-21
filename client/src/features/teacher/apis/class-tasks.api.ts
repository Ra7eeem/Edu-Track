import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import type {
  ApiResponse,
  ApiClassTask,
  ApiClassTaskProgressResponse,
  ApiDailyQuestion,
} from "@/shared/types/api"

async function getAuthHeader() {
  const token = await getNextAuthToken()
  return token?.token ? HEADERS.authorize(token.token) : {}
}

export async function createClassTaskApi(dto: {
  classroomId: string
  title: string
  dueDate?: string
  description?: string
}): Promise<ApiClassTask> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/class-tasks`, {
    method: "POST",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    body: JSON.stringify(dto),
  })

  const json: ApiResponse<ApiClassTask> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل إنشاء المهمة")
  }
  return json.data
}

export async function getClassTasksApi(
  classroomId: string
): Promise<{ tasks: ApiClassTask[]; totalStudents: number }> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/class-tasks/classroom/${classroomId}`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<{ tasks: ApiClassTask[]; totalStudents: number }> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل المهام")
  }
  return json.data
}

export async function getClassTaskProgressApi(
  taskId: string
): Promise<ApiClassTaskProgressResponse> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/class-tasks/${taskId}/progress`, {
    method: "GET",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    cache: "no-store",
  })

  const json: ApiResponse<ApiClassTaskProgressResponse> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحميل تفاصيل الإنجاز")
  }
  return json.data
}

export async function toggleClassTaskApi(
  taskId: string
): Promise<{ isCompleted: boolean; completedAt?: string }> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/class-tasks/${taskId}/toggle`, {
    method: "PATCH",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
  })

  const json: ApiResponse<{ isCompleted: boolean; completedAt?: string }> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تحديث حالة المهمة")
  }
  return json.data
}

export async function sendTaskReminderApi(
  taskId: string,
  studentIds?: string[]
): Promise<{ success: boolean; message: string; count: number }> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/class-tasks/${taskId}/remind`, {
    method: "POST",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    body: JSON.stringify({ studentIds }),
  })

  const json: ApiResponse<{ success: boolean; message: string; count: number }> =
    await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل إرسال التنبيه")
  }
  return json.data
}

export async function createDailyQuestionApi(dto: {
  classroomId: string
  question: string
  options: string[]
  correctOptionIndex: number
  explanation?: string
  rewardPoints?: number
  date?: string
}): Promise<ApiDailyQuestion> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/daily-questions`, {
    method: "POST",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    body: JSON.stringify(dto),
  })

  const json: ApiResponse<ApiDailyQuestion> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل حفظ سؤال اليوم")
  }
  return json.data
}

export async function getTeacherDailyQuestionsApi(
  classroomId: string
): Promise<any[]> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/daily-questions/classroom/${classroomId}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<any[]> = await res.json()
  if (!res.ok || !json.success) {
    return []
  }
  return json.data
}
