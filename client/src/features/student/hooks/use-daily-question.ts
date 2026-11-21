"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { clientFetch } from "@/shared/lib/api-client"
import { ApiDailyQuestion, ApiDailyAnswerResult } from "@/shared/types/api"

export function useTodayQuestion(classroomId?: string | null) {
  return useQuery({
    queryKey: ["student", "daily-question", classroomId],
    queryFn: async () => {
      if (!classroomId) return null
      return clientFetch<ApiDailyQuestion | null>(
        `/api/daily-questions/today?classroomId=${classroomId}`
      )
    },
    enabled: !!classroomId,
    staleTime: 60 * 1000,
  })
}

export function useAnswerDailyQuestion(classroomId?: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      questionId,
      selectedOptionIndex,
    }: {
      questionId: string
      selectedOptionIndex: number
    }) => {
      return clientFetch<ApiDailyAnswerResult>(
        `/api/daily-questions/${questionId}/answer`,
        {
          method: "POST",
          data: { selectedOptionIndex },
        }
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student", "daily-question", classroomId] })
      qc.invalidateQueries({ queryKey: ["student", "dashboard"] })
      qc.invalidateQueries({ queryKey: ["student", "team"] })
    },
  })
}
