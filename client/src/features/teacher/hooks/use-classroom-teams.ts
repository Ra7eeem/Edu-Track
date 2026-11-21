"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { clientFetch } from "@/shared/lib/api-client"
import { ApiTeam } from "@/shared/types/api"
import { TeamsResponseData } from "../apis/teams.api"

export function useClassroomTeams(classroomId: string, opts?: { initialData?: TeamsResponseData }) {
  return useQuery({
    queryKey: ["teacher", "classroom", classroomId, "teams"],
    queryFn: async () => {
      const data = await clientFetch<TeamsResponseData>(`/api/teams/classroom/${classroomId}`)
      return data
    },
    enabled: !!classroomId,
    staleTime: 20 * 1000,
    initialData: opts?.initialData,
  })
}

export function useCreateTeam(classroomId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: { name: string; memberIds: string[] }) => {
      return clientFetch<ApiTeam>("/api/teams", {
        method: "POST",
        data: { ...dto, classroomId },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "classroom", classroomId, "teams"] })
      qc.invalidateQueries({ queryKey: ["teacher", "groups", classroomId, "students"] })
    },
  })
}

export function useAdjustPoints(classroomId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      teamId,
      points,
      reason,
      studentId,
    }: {
      teamId: string
      points: number
      reason: string
      studentId?: string
    }) => {
      return clientFetch<{ team: ApiTeam }>(`/api/teams/${teamId}/adjust-points`, {
        method: "PATCH",
        data: { points, reason, studentId },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "classroom", classroomId, "teams"] })
      qc.invalidateQueries({ queryKey: ["groups", classroomId, "ranking"] })
    },
  })
}

export function useResetLeaderboard(classroomId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      return clientFetch<{ success: boolean; message: string }>(
        `/api/teams/classroom/${classroomId}/reset-scores`,
        {
          method: "POST",
        }
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "classroom", classroomId, "teams"] })
    },
  })
}

export function useDeleteTeam(classroomId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (teamId: string) => {
      return clientFetch<{ success: boolean }>(`/api/teams/${teamId}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "classroom", classroomId, "teams"] })
      qc.invalidateQueries({ queryKey: ["teacher", "groups", classroomId, "students"] })
    },
  })
}
