import { clientFetch } from "@/shared/lib/api-client"
import type {
  ApiStudentTask,
  ApiStudentTasksResponse,
  ApiStudentTeamInfo,
} from "@/shared/types/api"

export async function getStudentTasksApi(): Promise<ApiStudentTasksResponse> {
  const res = await clientFetch<ApiStudentTasksResponse>("/api/v1/student/tasks")
  return (res as any)?.data ?? res
}

export async function createStudentTaskApi(dto: {
  title: string
  dueDate?: string
}): Promise<ApiStudentTask> {
  const res = await clientFetch<ApiStudentTask>("/api/v1/student/tasks", {
    method: "POST",
    data: dto,
  })
  return (res as any)?.data ?? res
}

export async function toggleStudentTaskApi(taskId: string): Promise<ApiStudentTask> {
  const res = await clientFetch<ApiStudentTask>(`/api/v1/student/tasks/${taskId}/toggle`, {
    method: "PATCH",
  })
  return (res as any)?.data ?? res
}

export async function deleteStudentTaskApi(taskId: string): Promise<{ success: boolean; message: string }> {
  const res = await clientFetch<{ success: boolean; message: string }>(`/api/v1/student/tasks/${taskId}`, {
    method: "DELETE",
  })
  return (res as any)?.data ?? res
}

export async function getStudentTeamApi(classroomId: string): Promise<ApiStudentTeamInfo | null> {
  try {
    const res = await clientFetch<ApiStudentTeamInfo | null>(`/api/v1/teams/classroom/${classroomId}/my-team`)
    return (res as any)?.data ?? res
  } catch {
    return null
  }
}
