"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { clientFetch } from "@/shared/lib/api-client"
import { ApiStudentTask, ApiStudentTasksResponse, ApiStudentTeamInfo } from "@/shared/types/api"

export function useStudentTasks(opts?: { initialData?: ApiStudentTasksResponse }) {
  return useQuery({
    queryKey: ["student", "tasks"],
    queryFn: async () => {
      return clientFetch<ApiStudentTasksResponse>("/api/student/tasks")
    },
    staleTime: 15 * 1000,
    initialData: opts?.initialData,
  })
}

export function useCreateStudentTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: { title: string; dueDate?: string }) => {
      return clientFetch<ApiStudentTask>("/api/student/tasks", {
        method: "POST",
        data: dto,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student", "tasks"] })
    },
  })
}

export function useToggleStudentTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      return clientFetch<ApiStudentTask>(`/api/student/tasks/${taskId}/toggle`, {
        method: "PATCH",
      })
    },
    // Optimistic UI updates
    onMutate: async (taskId: string) => {
      await qc.cancelQueries({ queryKey: ["student", "tasks"] })
      const previousData = qc.getQueryData<ApiStudentTasksResponse>(["student", "tasks"])

      if (previousData) {
        const nextTasks = previousData.tasks.map((t) =>
          (t._id || t.id) === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        )
        const total = nextTasks.length
        const completed = nextTasks.filter((t) => t.isCompleted).length
        const pending = total - completed
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

        qc.setQueryData<ApiStudentTasksResponse>(["student", "tasks"], {
          tasks: nextTasks,
          stats: { total, completed, pending, percentage },
        })
      }

      return { previousData }
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousData) {
        qc.setQueryData(["student", "tasks"], context.previousData)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["student", "tasks"] })
    },
  })
}

export function useDeleteStudentTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      return clientFetch<{ success: boolean }>(`/api/student/tasks/${taskId}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student", "tasks"] })
    },
  })
}

export function useStudentTeam(classroomId?: string | null) {
  return useQuery({
    queryKey: ["student", "team", classroomId],
    queryFn: async () => {
      if (!classroomId) return null
      return clientFetch<ApiStudentTeamInfo | null>(`/api/teams/classroom/${classroomId}/my-team`)
    },
    enabled: !!classroomId,
    staleTime: 30 * 1000,
  })
}
