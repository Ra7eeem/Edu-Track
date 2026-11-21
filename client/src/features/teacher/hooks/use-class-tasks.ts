"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiClassTask,
  ApiClassTaskProgressResponse,
  ApiDailyQuestion,
} from "@/shared/types/api"

export function useClassTasks(classroomId: string) {
  return useQuery({
    queryKey: ["class-tasks", classroomId],
    queryFn: async () => {
      return clientFetch<{ tasks: ApiClassTask[]; totalStudents: number }>(
        `/api/class-tasks/classroom/${classroomId}`
      )
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
    },
  })
}

export function useClassTaskProgress(taskId: string | null) {
  return useQuery({
    queryKey: ["class-tasks", "progress", taskId],
    queryFn: async () => {
      if (!taskId) return null
      return clientFetch<ApiClassTaskProgressResponse>(
        `/api/class-tasks/${taskId}/progress`
      )
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
    onSuccess: () => {
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
    }: {
      taskId: string
      studentIds?: string[]
    }) => {
      return clientFetch<{ success: boolean; message: string; count: number }>(
        `/api/class-tasks/${taskId}/remind`,
        {
          method: "POST",
          data: { studentIds },
        }
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["class-tasks", classroomId] })
    },
  })
}

export function useTeacherDailyQuestions(classroomId: string) {
  return useQuery({
    queryKey: ["teacher", "daily-questions", classroomId],
    queryFn: async () => {
      return clientFetch<any[]>(`/api/daily-questions/classroom/${classroomId}`)
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
      qc.invalidateQueries({ queryKey: ["teacher", "daily-questions", classroomId] })
    },
  })
}
