"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiClassTask,
  ApiClassTaskProgressResponse,
  ApiDailyQuestion,
  resolveId,
} from "@/shared/types/api"

export function useClassTasks(classroomId: string, date?: string) {
  return useQuery({
    queryKey: ["class-tasks", classroomId, date || "today"],
    queryFn: async () => {
      const url = `/api/class-tasks/classroom/${classroomId}${
        date ? `?date=${encodeURIComponent(date)}` : ""
      }`
      return clientFetch<{ tasks: ApiClassTask[]; totalStudents: number; date?: string }>(url)
    },
    enabled: !!classroomId,
    staleTime: 20 * 1000,
  })
}

export function useCreateClassTask(classroomId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      title: string
      type?: "ONCE" | "DAILY"
      dueDate?: string
      description?: string
    }) => {
      return clientFetch<ApiClassTask>("/api/class-tasks", {
        method: "POST",
        data: { ...dto, classroomId },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["class-tasks", classroomId] })
      qc.invalidateQueries({ queryKey: ["student", "tasks"] })
    },
  })
}

export function useClassTaskProgress(taskId: string | null, date?: string) {
  return useQuery({
    queryKey: ["class-tasks", "progress", taskId, date || "today"],
    queryFn: async () => {
      if (!taskId) return null
      const url = `/api/class-tasks/${taskId}/progress${
        date ? `?date=${encodeURIComponent(date)}` : ""
      }`
      return clientFetch<ApiClassTaskProgressResponse>(url)
    },
    enabled: !!taskId,
    staleTime: 10 * 1000,
  })
}

export function useToggleClassTask(classroomId?: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      return clientFetch<{ isCompleted: boolean; completedAt?: string }>(
        `/api/class-tasks/${taskId}/toggle`,
        {
          method: "PATCH",
        }
      )
    },
    onMutate: async (taskId: string) => {
      if (!classroomId) return
      await qc.cancelQueries({ queryKey: ["class-tasks", classroomId] })
      const queryKey = ["class-tasks", classroomId, "today"]
      const previousData = qc.getQueryData<{
        tasks: ApiClassTask[]
        totalStudents: number
        date?: string
      }>(queryKey)

      if (previousData) {
        qc.setQueryData(queryKey, {
          ...previousData,
          tasks: previousData.tasks.map((t) => {
            if (resolveId(t) === taskId) {
              const nextCompleted = !t.isCompleted
              return {
                ...t,
                isCompleted: nextCompleted,
                completedAt: nextCompleted ? new Date().toISOString() : undefined,
                streak:
                  t.type === "DAILY"
                    ? nextCompleted
                      ? (t.streak ?? 0) + 1
                      : Math.max(0, (t.streak ?? 1) - 1)
                    : undefined,
                stats: t.stats
                  ? {
                      ...t.stats,
                      completedCount: Math.max(
                        0,
                        t.stats.completedCount + (nextCompleted ? 1 : -1)
                      ),
                      percentage: Math.round(
                        (Math.max(
                          0,
                          t.stats.completedCount + (nextCompleted ? 1 : -1)
                        ) /
                          (t.stats.totalStudents || 1)) *
                          100
                      ),
                    }
                  : undefined,
              }
            }
            return t
          }),
        })
      }

      return { previousData }
    },
    onError: (_err, _taskId, context) => {
      if (classroomId && context?.previousData) {
        qc.setQueryData(
          ["class-tasks", classroomId, "today"],
          context.previousData
        )
      }
    },
    onSettled: () => {
      if (classroomId) {
        qc.invalidateQueries({ queryKey: ["class-tasks", classroomId] })
      }
      qc.invalidateQueries({ queryKey: ["student", "tasks"] })
    },
  })
}

export function useSendTaskReminder(classroomId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      taskId,
      studentIds,
      dateStr,
    }: {
      taskId: string
      studentIds?: string[]
      dateStr?: string
    }) => {
      return clientFetch<{ success: boolean; message: string; count: number }>(
        `/api/class-tasks/${taskId}/remind`,
        {
          method: "POST",
          data: { studentIds, dateStr },
        }
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["class-tasks", "progress"] })
    },
  })
}

// ─────────────────────────────────────────
// Teacher Daily Question Hooks
// ─────────────────────────────────────────

export function useTeacherDailyQuestions(classroomId: string) {
  return useQuery({
    queryKey: ["daily-questions", "teacher", classroomId],
    queryFn: async () => {
      return clientFetch<ApiDailyQuestion[]>(
        `/api/daily-questions/classroom/${classroomId}/teacher`
      )
    },
    enabled: !!classroomId,
    staleTime: 30 * 1000,
  })
}

export function useCreateDailyQuestion(classroomId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: {
      question: string
      options: string[]
      correctOptionIndex: number
      explanation?: string
      rewardPoints?: number
      date?: string
    }) => {
      return clientFetch<ApiDailyQuestion>("/api/daily-questions", {
        method: "POST",
        data: { ...dto, classroomId },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily-questions", "teacher", classroomId] })
      qc.invalidateQueries({ queryKey: ["daily-questions", "today", classroomId] })
    },
  })
}
