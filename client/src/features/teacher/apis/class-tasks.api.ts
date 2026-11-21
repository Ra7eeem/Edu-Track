import { clientFetch } from "@/shared/lib/api-client"
import type {
  ApiClassTask,
  ApiClassTaskProgressResponse,
  ApiDailyQuestion,
} from "@/shared/types/api"

export async function createClassTaskApi(dto: {
  classroomId: string
  title: string
  type?: "ONCE" | "DAILY"
  dueDate?: string
  description?: string
}): Promise<ApiClassTask> {
  const res = await clientFetch<ApiClassTask>("/api/v1/class-tasks", {
    method: "POST",
    data: dto,
  })
  return (res as any)?.data ?? res
}

export async function getClassTasksApi(
  classroomId: string,
  date?: string
): Promise<{ tasks: ApiClassTask[]; totalStudents: number; date?: string }> {
  const url = `/api/v1/class-tasks/classroom/${classroomId}${
    date ? `?date=${encodeURIComponent(date)}` : ""
  }`
  const res = await clientFetch<{ tasks: ApiClassTask[]; totalStudents: number; date?: string }>(url)
  return (res as any)?.data ?? res
}

export async function getClassTaskProgressApi(
  taskId: string,
  date?: string
): Promise<ApiClassTaskProgressResponse> {
  const url = `/api/v1/class-tasks/${taskId}/progress${
    date ? `?date=${encodeURIComponent(date)}` : ""
  }`
  const res = await clientFetch<ApiClassTaskProgressResponse>(url)
  return (res as any)?.data ?? res
}

export async function toggleClassTaskApi(
  taskId: string,
  isCompleted?: boolean
): Promise<{ isCompleted: boolean; completedAt?: string }> {
  const res = await clientFetch<{ isCompleted: boolean; completedAt?: string }>(
    `/api/v1/class-tasks/${taskId}/toggle`,
    {
      method: "PATCH",
      data: { isCompleted },
    }
  )
  return (res as any)?.data ?? res
}

export async function sendTaskReminderApi(
  taskId: string,
  studentIds?: string[],
  dateStr?: string
): Promise<{ success: boolean; message: string; count: number }> {
  const res = await clientFetch<{ success: boolean; message: string; count: number }>(
    `/api/v1/class-tasks/${taskId}/remind`,
    {
      method: "POST",
      data: { studentIds, dateStr },
    }
  )
  return (res as any)?.data ?? res
}

// ─── Teacher Daily Question APIs ───────────────────────────────────────────────

export async function createDailyQuestionApi(dto: {
  classroomId: string
  question: string
  options: string[]
  correctOptionIndex: number
  explanation?: string
  rewardPoints?: number
  date?: string
}): Promise<ApiDailyQuestion> {
  const res = await clientFetch<ApiDailyQuestion>("/api/v1/daily-questions", {
    method: "POST",
    data: dto,
  })
  return (res as any)?.data ?? res
}

export async function getTeacherDailyQuestionsApi(
  classroomId: string
): Promise<ApiDailyQuestion[]> {
  const res = await clientFetch<ApiDailyQuestion[]>(
    `/api/v1/daily-questions/classroom/${classroomId}/teacher`
  )
  return Array.isArray(res) ? res : ((res as any)?.data ?? [])
}
